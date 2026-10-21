// 에이전트별 편집 범위 훅: 허용 경로 밖 Write·Edit 거부
// 사용(에이전트 정의의 hooks): node guard-folder.mjs app/ "!app/tokens.css"
//   - 'app/'처럼 /로 끝나면 폴더, 아니면 파일 1개. '!'로 시작하면 제외
import { readHookInput, deny } from "./read-input.mjs";

const args = process.argv.slice(2);
const allow = args.filter((a) => !a.startsWith("!"));
const block = args.filter((a) => a.startsWith("!")).map((a) => a.slice(1));
const hit = (file, p) => (p.endsWith("/") ? file.startsWith(p) : file === p);

const { file, rawPath } = await readHookInput();
if (rawPath !== undefined) {
  if (!file) deny(`프로젝트 밖 경로는 편집 불가: ${rawPath}`);
  if (block.some((p) => hit(file, p)) || !allow.some((p) => hit(file, p))) {
    deny(`이 에이전트의 편집 범위는 ${args.join(", ")} 뿐임. 거부한 경로: ${file}`);
  }
}
process.exit(0);
