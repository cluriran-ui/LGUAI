// G7(어기면 안 되는 것 A·B)·G8(PRD 규칙 1·2·6·7): 빌드된 앱을 띄워 Edge로 직접 셈
// 사용: node harness/scripts/ui-check.mjs   (먼저 npm run build 필요)
import { spawn, spawnSync } from "node:child_process";
import { ROOT, exists, readRules, result, isMain } from "./lib/common.mjs";

const PORT = 3123;
const BASE = `http://localhost:${PORT}`;
// 판정용 가짜 입력값 (실제 사람 정보 아님)
const TEST_INPUT = { name: "테스트", phone: "0".repeat(11) };

const digits = (s) => String(s ?? "").replace(/\D/g, "");
const fill = (tpl, id) => tpl.replace("{id}", id);

async function startServer() {
  if (!exists(".next/BUILD_ID")) throw new Error("빌드 결과 없음 — npm run build(G6)를 먼저 통과해야 함");
  const proc = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: ROOT, shell: true, stdio: "ignore" });
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE);
      if (res.status < 500) return proc;
    } catch {
      // 아직 준비 안 됨
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  stopServer(proc);
  throw new Error("next start가 60초 안에 응답하지 않음");
}

function stopServer(proc) {
  if (!proc?.pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(proc.pid), "/T", "/F"]);
  else proc.kill("SIGTERM");
}

async function launchBrowser() {
  const { chromium } = await import("playwright-core");
  for (const channel of ["msedge", "chrome"]) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch {
      // 다음 브라우저 시도
    }
  }
  throw new Error("Edge·Chrome 실행 실패 — PC에 설치된 브라우저가 필요함");
}

// 범위(카드 1장 또는 페이지 전체) 안의 금액·속도 문구·취소선 세기
async function measure(scope, amountPattern, throttlePatterns) {
  return scope.evaluate(
    (root, [amountSrc, throttleSrcs]) => {
      const el = root ?? document.body;
      const text = el.innerText;
      const amounts = [...new Set(text.match(new RegExp(amountSrc, "g")) ?? [])];
      const throttle = throttleSrcs.reduce((n, src) => n + (text.match(new RegExp(src, "g")) ?? []).length, 0);
      const strike = [el, ...el.querySelectorAll("*")].filter(
        (n) => ["S", "DEL", "STRIKE"].includes(n.tagName) || getComputedStyle(n).textDecorationLine.includes("line-through"),
      ).length;
      return { amounts, throttle, strike };
    },
    [amountPattern, throttlePatterns],
  );
}

function judgeUnit(where, plan, m, params, out) {
  const allowed = [plan.monthly_price, plan.price_after_discount].filter((x) => x != null).map(digits);
  const shown = m.amounts.map(digits);
  if (shown.length > params.max_amounts_per_unit) {
    out.push({ file: where, rule: "A / 규칙 3", match: `${plan.id} 금액 ${shown.length}개 표시 (최대 ${params.max_amounts_per_unit})` });
  }
  for (const a of shown) {
    if (!allowed.includes(a)) out.push({ file: where, rule: "A / 규칙 3", match: `${plan.id} 허용되지 않은 금액 ${a}원` });
  }
  if (!shown.includes(digits(plan.monthly_price))) {
    out.push({ file: where, rule: "A / 규칙 3", match: `${plan.id} 매달 내는 금액 없음` });
  }
  const afterAllowed = params.price_after_only.includes(plan.id);
  const afterShown = plan.price_after_discount != null && shown.includes(digits(plan.price_after_discount));
  if (afterAllowed && !afterShown) out.push({ file: where, rule: "A / 규칙 4", match: `${plan.id} 할인 종료 후 금액 없음` });
  if (!afterAllowed && shown.length > 1) out.push({ file: where, rule: "A / 규칙 4", match: `${plan.id}에 할인 종료 후 금액 표시` });
  if (m.strike > 0) out.push({ file: where, rule: "A / 취소선", match: `${plan.id} 취소선 ${m.strike}개` });
  if (params.throttle_required.includes(plan.id) && m.throttle !== 1) {
    out.push({ file: where, rule: "B / 규칙 5", match: `${plan.id} 속도 문구 ${m.throttle}개 (정확히 1개)` });
  }
}

export async function runUiChecks() {
  const g7 = [];
  const g8 = [];
  const sel = (id) => `[data-testid="${id}"]`;
  let server;
  let browser;
  try {
    const rules = readRules();
    const { params, testids: t, plans } = rules;
    server = await startServer();
    browser = await launchBrowser();
    const page = await browser.newPage();

    // 목록: 카드별 A·B, 규칙 1·2
    const listRoute = rules.entry_route;
    await page.goto(BASE + listRoute, { waitUntil: "networkidle" });
    const cards = await page.$$(sel(t.plan_card));
    if (cards.length !== params.card_count) {
      g8.push({ file: listRoute, rule: "규칙 1", match: `카드 ${cards.length}개 (기준 ${params.card_count}개)` });
    }
    const tags = await page.$$(sel(t.tag_recommend));
    if (tags.length !== params.recommend_tag_count) {
      g8.push({ file: listRoute, rule: "규칙 2", match: `추천 Tag ${tags.length}개 (기준 ${params.recommend_tag_count}개)` });
    }
    for (const card of cards) {
      const id = await card.getAttribute("data-plan-id");
      const plan = plans.find((p) => p.id === id);
      if (!plan) {
        g7.push({ file: listRoute, rule: "data-plan-id", match: `카드의 요금제 id '${id}'가 규칙 파일에 없음` });
        continue;
      }
      judgeUnit(`${listRoute} 카드 ${id}`, plan, await measure(card, params.amount_pattern, params.throttle_patterns), params, g7);
    }
    const listStrike = await measure(await page.$("body"), params.amount_pattern, params.throttle_patterns);
    if (listStrike.strike > 0) g7.push({ file: listRoute, rule: "A / 취소선", match: `목록 화면 취소선 ${listStrike.strike}개` });

    // 상세: 요금제마다 A·B
    for (const plan of plans) {
      const route = fill(params.detail_route, plan.id);
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      judgeUnit(route, plan, await measure(await page.$("body"), params.amount_pattern, params.throttle_patterns), params, g7);
    }

    // 신청: 규칙 6 (빈 입력·동의 없음이면 눌리지 않음)
    const plan = plans.find((p) => p.id === params.apply_test_plan);
    const applyRoute = fill(params.apply_route, plan.id);
    await page.goto(BASE + fill(params.detail_route, plan.id), { waitUntil: "networkidle" });
    await page.click(sel(t.btn_go_apply));
    await page.waitForLoadState("networkidle");
    const applyPath = applyRoute.split("?")[0];
    if (!new URL(page.url()).pathname.startsWith(applyPath)) {
      g8.push({ file: applyRoute, rule: "규칙 6", match: `신청 버튼이 ${applyPath}로 이동하지 않음` });
    }
    const blocked = async () => {
      const btn = await page.$(sel(t.btn_submit));
      if (!btn) return null;
      const disabled = (await btn.isDisabled()) || (await btn.getAttribute("aria-disabled")) === "true";
      const before = page.url();
      await btn.click({ force: true, timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(500);
      return disabled && page.url() === before;
    };
    const steps = [
      ["빈 입력", async () => {}],
      ["이름만 입력", async () => page.fill(sel(t.input_name), TEST_INPUT.name)],
      ["동의 없음", async () => page.fill(sel(t.input_phone), TEST_INPUT.phone)],
    ];
    for (const [label, act] of steps) {
      await act();
      const ok = await blocked();
      if (ok === null) g8.push({ file: applyRoute, rule: "규칙 6", match: "신청 버튼(btn-submit) 없음" });
      else if (!ok) g8.push({ file: applyRoute, rule: "규칙 6", match: `${label} 상태에서 신청 버튼이 눌림` });
    }

    // 완료: 규칙 7 (완료 화면 값 = 신청한 요금제)
    await page.check(sel(t.check_agree));
    await page.click(sel(t.btn_submit));
    await page.waitForURL((u) => u.pathname.startsWith(params.complete_route), { timeout: 10000 }).catch(() => {});
    if (!new URL(page.url()).pathname.startsWith(params.complete_route)) {
      g8.push({ file: applyRoute, rule: "규칙 7", match: `조건을 채워도 ${params.complete_route}로 이동하지 않음` });
    } else {
      const name = await page.textContent(sel(t.complete_plan_name)).catch(() => null);
      const price = await page.textContent(sel(t.complete_monthly_price)).catch(() => null);
      if (!name?.includes(plan.name)) g8.push({ file: params.complete_route, rule: "규칙 7", match: "요금제 이름이 신청한 요금제와 다름" });
      if (digits(price) !== digits(plan.monthly_price)) {
        g8.push({ file: params.complete_route, rule: "규칙 7", match: "매달 내는 금액이 신청한 요금제와 다름" });
      }
    }
  } catch (e) {
    const err = { file: "(실행)", rule: "실행 오류", match: e.message.split("\n")[0] };
    return [
      result("G7", "어기면 안 되는 것 A·B", [err], { status: "skipped" }),
      result("G8", "PRD 규칙 1·2·6·7", [err], { status: "skipped" }),
    ];
  } finally {
    await browser?.close();
    stopServer(server);
  }
  return [result("G7", "어기면 안 되는 것 A·B", g7), result("G8", "PRD 규칙 1·2·6·7", g8)];
}

if (isMain(import.meta.url)) {
  const res = await runUiChecks();
  console.log(JSON.stringify(res, null, 2));
  process.exit(res.every((r) => r.status === "pass") ? 0 : 1);
}
