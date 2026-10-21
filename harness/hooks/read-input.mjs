// 훅 공통: 표준 입력의 도구 호출 정보 읽기, 거부 응답
import { toRel } from "../scripts/lib/common.mjs";

export async function readHookInput() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  const input = raw.trim() ? JSON.parse(raw) : {};
  const ti = input.tool_input ?? {};
  const file = ti.file_path ? toRel(ti.file_path, input.cwd ?? process.cwd()) : undefined;
  // 이번 호출로 새로 들어가는 글 (Write: 전체, Edit: 바꿀 글, MultiEdit: 바꿀 글 모음)
  const texts = [ti.content, ti.new_string, ...(ti.edits ?? []).map((e) => e.new_string)].filter(
    (s) => typeof s === "string",
  );
  return { input, file, rawPath: ti.file_path, texts };
}

// 종료 코드 2 = Claude Code가 도구 실행을 막고 stderr를 에이전트에게 전달함
export function deny(message) {
  process.stderr.write(`[하네스 훅] ${message}\n`);
  process.exit(2);
}
