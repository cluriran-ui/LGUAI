// G5 토큰 밖 값 검사 — 훅(guard-tokens)과 게이트(gate G5)가 함께 씀
import { P, lineOf } from "./common.mjs";
import { allowedNames } from "../build-tokens.mjs";

const CODE_EXT = /\.(tsx|ts|jsx|js|mjs)$/;
const STYLE_EXT = /\.(css|scss)$/;

const HEX = /(?<![\w&/])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color-mix)\(/g;
const ARBITRARY = /(?:^|[\s"'`{(])!?-?[a-z][\w-]*-\[[^\]\s]+\]/g;
const ARBITRARY_PROP = /(?:^|[\s"'`])\[[a-z-]+:[^\]\s]+\]/g;
const CSS_VAR_SHORTHAND = /(?:^|[\s"'`])!?-?[a-z][\w-]*-\(--[\w-]+\)/g;
const INLINE_STYLE_NUM = /style=\{\{[^}]*\d/g;
const CSS_LENGTH = /(?<![\w-])\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%)(?![\w-])/g;

const SPACING_PREFIX =
  /^(?:gap-x|gap-y|space-x|space-y|inset-x|inset-y|scroll-mx|scroll-my|scroll-px|scroll-py|scroll-m|scroll-p|px|py|pt|pr|pb|pl|ps|pe|mx|my|mt|mr|mb|ml|ms|me|p|m|gap|inset|top|right|bottom|left|start|end)-(.+)$/;
const ROUNDED = /^rounded(?:-(?:tl|tr|br|bl|ss|se|es|ee|t|r|b|l|s|e))?(?:-(.+))?$/;
const BORDER = /^border(?:-(?:x|y|t|r|b|l|s|e))?(?:-(.+))?$/;
const COLOR_ONLY = /^(?:bg|ring|outline|fill|stroke|divide|accent|caret|decoration|placeholder|from|via|to)-(.+)$/;
const TEXT = /^text-(.+)$/;

const TEXT_KEYWORDS = new Set(["left", "center", "right", "justify", "start", "end", "wrap", "nowrap", "balance", "pretty", "ellipsis", "clip"]);
const BG_KEYWORDS = new Set(["none", "cover", "contain", "center", "no-repeat", "repeat", "fixed", "local", "scroll"]);
const BORDER_KEYWORDS = new Set(["0", "2", "4", "8", "solid", "dashed", "dotted", "double", "hidden", "none", "collapse", "separate"]);
const LINE_KEYWORDS = new Set(["0", "1", "2", "4", "8", "none", "hidden", "solid", "dashed", "dotted", "double", "current", "x", "y", "inset"]);

let cached;
const allowed = () => (cached ??= allowedNames());

// 클래스 한 개 판정. 문제 없으면 null, 있으면 사유
export function checkClass(raw, names = allowed()) {
  if (!raw || raw.includes("${")) return null;
  let cls = raw.slice(raw.lastIndexOf(":") + 1).replace(/^!/, "").replace(/^-/, "");
  if (cls.includes("/")) {
    if (/^(?:bg|text|border|ring|outline|fill|stroke|divide|from|via|to)-/.test(cls)) {
      return `투명도·분수 값 금지: ${raw}`;
    }
    return null;
  }
  let m;
  if ((m = cls.match(SPACING_PREFIX))) {
    return names.spacing.has(m[1]) || m[1] === "auto" ? null : `간격 토큰 아님: ${raw} (spacing/ 토큰 숫자만)`;
  }
  if ((m = cls.match(ROUNDED))) {
    if (!m[1]) return `모서리 토큰 이름 필요: ${raw} (예: rounded-16)`;
    return names.radius.has(m[1]) || m[1] === "none" ? null : `모서리 토큰 아님: ${raw}`;
  }
  if ((m = cls.match(BORDER))) {
    if (!m[1]) return null;
    return names.colors.has(m[1]) || BORDER_KEYWORDS.has(m[1]) ? null : `테두리 토큰 아님: ${raw}`;
  }
  if ((m = cls.match(TEXT))) {
    return names.colors.has(m[1]) || names.text.has(m[1]) || TEXT_KEYWORDS.has(m[1]) ? null : `글자 토큰 아님: ${raw}`;
  }
  if ((m = cls.match(COLOR_ONLY))) {
    const kw = cls.startsWith("bg-") ? BG_KEYWORDS : LINE_KEYWORDS;
    return names.colors.has(m[1]) || kw.has(m[1]) ? null : `색 토큰 아님: ${raw}`;
  }
  return null;
}

function regexHits(text, re, rule, out) {
  for (const m of text.matchAll(re)) {
    out.push({ line: lineOf(text, m.index), rule, match: m[0].trim() });
  }
}

// 파일 내용 한 개 검사. relPath는 프로젝트 기준 상대 경로
export function scanText(text, relPath) {
  const out = [];
  if (relPath === P.tokensCss) return out;
  const isCode = CODE_EXT.test(relPath);
  const isStyle = STYLE_EXT.test(relPath);
  if (!isCode && !isStyle) return out;

  regexHits(text, HEX, "색 직접 입력(#값)", out);
  regexHits(text, COLOR_FN, "색 함수 직접 입력", out);

  if (isStyle) {
    regexHits(text, CSS_LENGTH, "CSS 길이 직접 입력", out);
    return out;
  }

  regexHits(text, ARBITRARY, "Tailwind 임의값 [...]", out);
  regexHits(text, ARBITRARY_PROP, "Tailwind 임의 속성 [...]", out);
  regexHits(text, CSS_VAR_SHORTHAND, "Tailwind 변수 직접 지정 (--x)", out);
  regexHits(text, INLINE_STYLE_NUM, "style={{}} 숫자 직접 입력", out);

  // 문자열 안의 유틸리티 클래스 판정 (import 경로·URL은 제외)
  const STR = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g;
  for (const m of text.matchAll(STR)) {
    const body = m[2];
    if (/^[.@/]/.test(body) || body.includes("://") || /\.\w{2,4}$/.test(body)) continue;
    const lineStart = text.lastIndexOf("\n", m.index) + 1;
    if (/^\s*(import|export .* from)\b/.test(text.slice(lineStart, m.index))) continue;
    for (const cls of body.split(/\s+/)) {
      const why = checkClass(cls);
      if (why) out.push({ line: lineOf(text, m.index), rule: "토큰 밖 클래스", match: why });
    }
  }
  return out;
}
