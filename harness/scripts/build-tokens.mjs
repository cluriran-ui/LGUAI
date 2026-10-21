// 3단계: docs/tokens.json → app/tokens.css 기계 변환
// 사용: node harness/scripts/build-tokens.mjs          (파일 생성)
//       node harness/scripts/build-tokens.mjs --check  (차이만 검사, 파일 안 씀)
import fs from "node:fs";
import { P, abs, readJson, readText, exists, isMain } from "./lib/common.mjs";

// 토큰 키의 '/' 뒤 이름 → CSS 변수 이름 조각
const tail = (key) => key.split("/").slice(1).join("-");
const slug = (key) => key.replace(/\//g, "-");

export function tokenVars(tokens = readJson(P.tokensJson)) {
  const vars = [];
  for (const [key, def] of Object.entries(tokens.semantic)) {
    vars.push({ group: "color", key, name: `--color-${slug(key)}`, value: def.value });
  }
  for (const [key, value] of Object.entries(tokens.typography)) {
    if (key.startsWith("font-family/")) {
      vars.push({ group: "font", key, name: "--font-sans", value: `"${value}", sans-serif` });
    } else {
      vars.push({ group: "text", key, name: `--text-${tail(key)}`, value: `${value}px` });
    }
  }
  for (const [key, value] of Object.entries(tokens.spacing)) {
    vars.push({ group: "spacing", key, name: `--spacing-${tail(key)}`, value: `${value}px` });
  }
  for (const [key, value] of Object.entries(tokens.radius)) {
    vars.push({ group: "radius", key, name: `--radius-${tail(key)}`, value: `${value}px` });
  }
  return vars;
}

// 화면에서 쓸 수 있는 유틸리티 접미사 목록 (G5 판정 근거)
export function allowedNames(vars = tokenVars()) {
  const pick = (g, prefix) =>
    new Set(vars.filter((v) => v.group === g).map((v) => v.name.slice(prefix.length)));
  return {
    colors: pick("color", "--color-"),
    text: pick("text", "--text-"),
    spacing: pick("spacing", "--spacing-"),
    radius: pick("radius", "--radius-"),
  };
}

export function generate(tokens = readJson(P.tokensJson)) {
  const vars = tokenVars(tokens);
  const lines = [
    "/* 자동 생성 파일 — 직접 고치지 않음. 원본: docs/tokens.json */",
    "/* 다시 만들기: node harness/scripts/build-tokens.mjs */",
    "@theme {",
    "  /* Tailwind 기본 색·글자 크기·간격·모서리 끄기 → 토큰 밖 값 사용 불가 */",
    "  --color-*: initial;",
    "  --text-*: initial;",
    "  --spacing-*: initial;",
    "  --radius-*: initial;",
  ];
  let group = "";
  for (const v of vars) {
    if (v.group !== group) {
      group = v.group;
      lines.push("", `  /* ${group} */`);
    }
    lines.push(`  ${v.name}: ${v.value}; /* ${v.key} */`);
  }
  lines.push("}", "");
  return { css: lines.join("\n"), count: vars.length };
}

export function tokenCount(tokens = readJson(P.tokensJson)) {
  return (
    Object.keys(tokens.semantic).length +
    Object.keys(tokens.typography).length +
    Object.keys(tokens.spacing).length +
    Object.keys(tokens.radius).length
  );
}

function main() {
  const { css, count } = generate();
  if (process.argv.includes("--check")) {
    const same = exists(P.tokensCss) && readText(P.tokensCss) === css;
    console.log(same ? `일치 (${count}개 변수)` : `${P.tokensCss}가 tokens.json과 다름`);
    process.exit(same ? 0 : 1);
  }
  fs.writeFileSync(abs(P.tokensCss), css, "utf8");
  console.log(`${P.tokensCss} 생성 (${count}개 변수)`);
}

if (isMain(import.meta.url)) main();
