// 원본 보호 훅: docs/·reference/ 편집 거부 (예외: docs/screen-spec.md), 판정 결과 손편집 거부
import { readHookInput, deny } from "./read-input.mjs";

const ALLOW = new Set(["docs/screen-spec.md"]);
const SCRIPT_ONLY = new Set(["harness/out/05-verify.json"]);

const { file } = await readHookInput();
if (file) {
  if ((file.startsWith("docs/") || file.startsWith("reference/")) && !ALLOW.has(file)) {
    deny(`${file}은 원본 자료라 읽기만 가능함. 하네스는 docs/·reference/를 고치지 않음`);
  }
  if (SCRIPT_ONLY.has(file)) {
    deny(`${file}은 검사 스크립트만 씀. node harness/scripts/verify.mjs로 다시 만들 것`);
  }
}
process.exit(0);
