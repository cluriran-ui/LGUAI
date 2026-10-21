// 정적 게이트 G1 ~ G6, G9 (화면을 띄우는 G7·G8은 ui-check.mjs)
import { spawnSync } from "node:child_process";
import { P, ROOT, exists, readText, readRules, walk, lineOf, result } from "./common.mjs";
import { scanText } from "./token-scan.mjs";
import { generate, tokenCount } from "../build-tokens.mjs";

const REQUIRED_TESTIDS = [
  "plan_card", "tag_recommend", "throttle", "price_monthly", "price_after", "btn_detail", "btn_go_apply",
  "input_name", "input_phone", "check_agree", "btn_submit", "complete_plan_name", "complete_monthly_price",
];
const REQUIRED_PARAMS = [
  "card_count", "recommend_tag_count", "max_amounts_per_unit", "price_after_only", "throttle_required",
  "throttle_patterns", "amount_pattern", "detail_route", "apply_route", "complete_route", "apply_test_plan",
];

// PRD에서 '라우트' 열이 있는 첫 표의 라우트 목록
function prdRoutes(prd) {
  const lines = prd.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const head = lines[i];
    if (!head.startsWith("|") || !head.includes("라우트")) continue;
    const col = head.split("|").map((s) => s.trim()).indexOf("라우트");
    const routes = [];
    for (let j = i + 2; j < lines.length && lines[j].startsWith("|"); j++) {
      const cell = lines[j].split("|")[col] ?? "";
      routes.push(cell.replace(/`/g, "").trim());
    }
    return routes;
  }
  return [];
}

// PRD '어기면 안 되는 것' 절의 번호 목록 개수
function prdRuleCount(prd) {
  const lines = prd.split("\n");
  const start = lines.findIndex((l) => /^#+ .*어기면 안 되는 것/.test(l));
  if (start < 0) return 0;
  let n = 0;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#+ /.test(lines[i]) || lines[i].trim() === "---") break;
    if (/^\d+\.\s/.test(lines[i])) n++;
  }
  return n;
}

export function G1() {
  const v = [];
  let rules;
  try {
    rules = readRules();
  } catch (e) {
    return result("G1", "규칙 파일", [{ file: P.rules, rule: "파일 없음", match: e.message }]);
  }
  const prd = readText(P.prd);
  const routes = prdRoutes(prd);
  const screens = rules.screens ?? [];
  if (screens.length !== routes.length) {
    v.push({ file: P.rules, rule: "화면 수", match: `rules ${screens.length}개 ≠ PRD 표 ${routes.length}개` });
  }
  for (const r of routes) {
    if (!screens.some((s) => s.route === r)) v.push({ file: P.rules, rule: "라우트 누락", match: r });
  }
  const want = prdRuleCount(prd);
  if ((rules.rules ?? []).length !== want) {
    v.push({ file: P.rules, rule: "규칙 수", match: `rules ${(rules.rules ?? []).length}개 ≠ PRD ${want}개` });
  }
  for (const k of ["A", "B"]) {
    const m = rules.must_not?.[k];
    if (!m || m.gate !== "G7" || !(m.rules ?? []).length) {
      v.push({ file: P.rules, rule: "어기면 안 되는 것", match: `${k} 항목 없음 또는 형식 오류` });
    }
  }
  for (const k of REQUIRED_PARAMS) {
    if (rules.params?.[k] === undefined) v.push({ file: P.rules, rule: "params 누락", match: k });
  }
  for (const k of REQUIRED_TESTIDS) {
    if (!rules.testids?.[k]) v.push({ file: P.rules, rule: "testids 누락", match: k });
  }
  if ((rules.plans ?? []).length !== rules.params?.card_count) {
    v.push({ file: P.rules, rule: "요금제 수", match: `plans ${(rules.plans ?? []).length}개 ≠ card_count` });
  }
  return result("G1", "규칙 파일", v, { expected: { screens: routes.length, rules: want } });
}

export function G2() {
  const v = [];
  if (!exists(P.screenSpec)) {
    return result("G2", "화면 명세", [{ file: P.screenSpec, rule: "파일 없음", match: "2단계 필요" }]);
  }
  const rules = readRules();
  const text = readText(P.screenSpec);
  const parts = ["라우트", "구성 요소", "상태", "이동"];
  let filled = 0;
  for (const s of rules.screens) {
    const re = new RegExp(`^## \\d+\\. ${s.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
    const m = text.match(re);
    if (!m) {
      v.push({ file: P.screenSpec, rule: "화면 절 누락", match: s.name });
      continue;
    }
    const rest = text.slice(m.index + m[0].length);
    const next = rest.search(/^## /m);
    const section = next < 0 ? rest : rest.slice(0, next);
    for (const part of parts) {
      const pm = section.match(new RegExp(`^### ${part}\\s*$([\\s\\S]*?)(?=^### |(?![\\s\\S]))`, "m"));
      if (pm && pm[1].trim()) filled++;
      else v.push({ file: P.screenSpec, line: lineOf(text, m.index), rule: "칸 비어 있음", match: `${s.name} / ${part}` });
    }
  }
  return result("G2", "화면 명세", v, { filled, expected: rules.screens.length * parts.length });
}

export function G3() {
  const { css, count } = generate();
  const v = [];
  const want = tokenCount();
  if (count !== want) v.push({ file: P.tokensCss, rule: "토큰 수", match: `변수 ${count}개 ≠ tokens.json ${want}개` });
  if (!exists(P.tokensCss)) {
    v.push({ file: P.tokensCss, rule: "파일 없음", match: "node harness/scripts/build-tokens.mjs 실행 필요" });
  } else {
    const now = readText(P.tokensCss).split("\n");
    const fresh = css.split("\n");
    const n = Math.max(now.length, fresh.length);
    for (let i = 0; i < n; i++) {
      if (now[i] !== fresh[i]) v.push({ file: P.tokensCss, line: i + 1, rule: "tokens.json과 다름", match: now[i] ?? "(없음)" });
    }
  }
  return result("G3", "토큰 파일", v, { token_count: want });
}

// app/**/page.tsx → 라우트 ('/' 제외, (그룹)·_비공개 폴더 처리)
export function appRoutes() {
  return walk("app", (rel) => /\/page\.(tsx|jsx|ts|js)$/.test(rel))
    .filter((rel) => !rel.split("/").some((seg) => seg.startsWith("_")))
    .map((rel) => {
      const segs = rel.split("/").slice(1, -1).filter((seg) => !/^\(.*\)$/.test(seg));
      return { route: "/" + segs.join("/"), file: rel };
    })
    .filter((r) => r.route !== "/");
}

export function G4() {
  const rules = readRules();
  const want = rules.screens.map((s) => s.route);
  const have = appRoutes();
  const v = [];
  for (const r of want) {
    if (!have.some((h) => h.route === r)) v.push({ file: "app/", rule: "빠진 라우트", match: r });
  }
  for (const h of have) {
    if (!want.includes(h.route)) v.push({ file: h.file, rule: "남는 라우트", match: h.route });
  }
  return result("G4", "라우트 수", v, { expected: want.length, actual: have.length });
}

export function G5() {
  const v = [];
  for (const rel of walk("app")) {
    for (const hit of scanText(readText(rel), rel)) v.push({ file: rel, ...hit });
  }
  if (exists("app/globals.css") && !/@import\s+["']\.\/tokens\.css["']/.test(readText("app/globals.css"))) {
    v.push({ file: "app/globals.css", rule: "토큰 연결 없음", match: '@import "./tokens.css"; 필요' });
  }
  return result("G5", "토큰 밖 값", v);
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, shell: true, encoding: "utf8" });
  const tail = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").slice(-15).join("\n");
  return { code: r.status, tail };
}

export function G6() {
  const v = [];
  const cmds = [];
  for (const script of ["build", "lint"]) {
    const r = run("npm", ["run", script]);
    cmds.push({ cmd: `npm run ${script}`, exit_code: r.code });
    if (r.code !== 0) v.push({ file: "package.json", rule: `npm run ${script} 실패`, match: r.tail });
  }
  return result("G6", "build·lint", v, { commands: cmds });
}

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE = /(?<!\d)(?:01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}|\d{10,11})(?!\d)/g;

export function G9() {
  const v = [];
  for (const rel of walk("app", (r) => /\.(tsx|ts|jsx|js|css|json|md)$/.test(r))) {
    const text = readText(rel);
    for (const m of text.matchAll(EMAIL)) v.push({ file: rel, line: lineOf(text, m.index), rule: "이메일 모양", match: "(개인정보 모양 값)" });
    for (const m of text.matchAll(PHONE)) v.push({ file: rel, line: lineOf(text, m.index), rule: "전화번호 모양", match: "(개인정보 모양 값)" });
  }
  return result("G9", "개인정보", v);
}
