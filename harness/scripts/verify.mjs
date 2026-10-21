// 5단계 검증: G4 ~ G9를 모두 실행하고 harness/out/05-verify.json에 기록
// 사용: node harness/scripts/verify.mjs   (전체 통과 시 종료 코드 0)
import fs from "node:fs";
import path from "node:path";
import { P, abs, result } from "./lib/common.mjs";
import { G4, G5, G6, G9 } from "./lib/gates.mjs";
import { runUiChecks } from "./ui-check.mjs";

const safe = (id, fn) => {
  try {
    return fn();
  } catch (e) {
    return result(id, "실행 오류", [{ rule: "실행 오류", match: e.message }], { status: "skipped" });
  }
};

const results = [safe("G4", G4), safe("G5", G5), safe("G9", G9), safe("G6", G6)];
const built = results.find((r) => r.gate === "G6").status === "pass";
if (built) {
  results.push(...(await runUiChecks()));
} else {
  const why = [{ rule: "선행 게이트 실패", match: "G6(build·lint) 통과 후 실행" }];
  results.push(
    result("G7", "어기면 안 되는 것 A·B", why, { status: "skipped" }),
    result("G8", "PRD 규칙 1·2·6·7", why, { status: "skipped" }),
  );
}
results.sort((a, b) => a.gate.localeCompare(b.gate));

const report = {
  ran_at: new Date().toISOString(),
  command: "node harness/scripts/verify.mjs",
  all_pass: results.every((r) => r.status === "pass"),
  summary: Object.fromEntries(results.map((r) => [r.gate, r.status])),
  results,
};
fs.mkdirSync(path.dirname(abs(P.verify)), { recursive: true });
fs.writeFileSync(abs(P.verify), JSON.stringify(report, null, 2) + "\n", "utf8");

const label = { pass: "통과", fail: "실패", skipped: "확인 못 함" };
for (const r of results) console.log(`${r.gate} ${label[r.status]} (위반 ${r.violation_count}건) — ${r.title}`);
console.log(`\n결과 파일: ${P.verify}`);
process.exit(report.all_pass ? 0 : 1);
