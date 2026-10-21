// 게이트 1개 실행. 통과하면 종료 코드 0, 실패·확인 못 함이면 1
// 사용: node harness/scripts/gate.mjs G1   (G1 ~ G9)
import { G1, G2, G3, G4, G5, G6, G9 } from "./lib/gates.mjs";
import { runUiChecks } from "./ui-check.mjs";

const STATIC = { G1, G2, G3, G4, G5, G6, G9 };
const id = (process.argv[2] ?? "").toUpperCase();

let res;
if (STATIC[id]) {
  try {
    res = STATIC[id]();
  } catch (e) {
    res = { gate: id, status: "skipped", violation_count: 1, violations: [{ rule: "실행 오류", match: e.message }] };
  }
} else if (id === "G7" || id === "G8") {
  res = (await runUiChecks()).find((r) => r.gate === id);
} else {
  console.error("사용: node harness/scripts/gate.mjs G1 ~ G9");
  process.exit(2);
}

console.log(JSON.stringify(res, null, 2));
const label = { pass: "통과", fail: "실패", skipped: "확인 못 함" }[res.status];
console.log(`\n${res.gate} ${label} (위반 ${res.violation_count}건)`);
process.exit(res.status === "pass" ? 0 : 1);
