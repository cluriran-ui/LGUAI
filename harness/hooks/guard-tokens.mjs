// G5 훅: app/에 토큰 밖 값을 쓰려는 순간 거부, app/tokens.css 손편집 거부
import { readHookInput, deny } from "./read-input.mjs";
import { scanText } from "../scripts/lib/token-scan.mjs";

const { file, texts } = await readHookInput();
if (file?.startsWith("app/")) {
  if (file === "app/tokens.css") {
    deny("app/tokens.css는 자동 생성 파일임. docs/tokens.json → node harness/scripts/build-tokens.mjs로만 만듦");
  }
  const hits = texts.flatMap((t) => scanText(t, file));
  if (hits.length) {
    const list = hits.slice(0, 10).map((h) => `  - ${h.line}번째 줄 · ${h.rule} · ${h.match}`).join("\n");
    deny(
      `${file}에 토큰 밖 값 ${hits.length}건 (G5)\n${list}\n` +
        "app/tokens.css에 있는 토큰 이름만 쓸 것. 필요한 토큰이 없으면 멈추고 보고할 것",
    );
  }
}
process.exit(0);
