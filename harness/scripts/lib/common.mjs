// 하네스 공통 도구: 경로·파일 순회·규칙 파일 읽기
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

export const P = {
  prd: "docs/PRD.md",
  screenSpec: "docs/screen-spec.md",
  tokensJson: "docs/tokens.json",
  tokensCss: "app/tokens.css",
  rules: "harness/out/01-rules.json",
  verify: "harness/out/05-verify.json",
};

export const abs = (rel) => path.join(ROOT, rel);

// node로 직접 실행한 파일인지 (import된 경우 false)
export const isMain = (metaUrl) =>
  Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(metaUrl);

// 프로젝트 기준 상대 경로(슬래시 구분). 프로젝트 밖이면 null
export function toRel(p, base = ROOT) {
  const full = path.resolve(base, p);
  const rel = path.relative(ROOT, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join("/");
}

export function exists(rel) {
  return fs.existsSync(abs(rel));
}

export function readText(rel) {
  return fs.readFileSync(abs(rel), "utf8").replace(/\r\n/g, "\n");
}

export function readJson(rel) {
  return JSON.parse(readText(rel));
}

export function readRules() {
  if (!exists(P.rules)) throw new Error(`${P.rules} 없음 — 1단계(rules-reader)를 먼저 실행해야 함`);
  return readJson(P.rules);
}

// dir 아래 파일을 상대 경로로 나열
export function walk(relDir, filter = () => true) {
  const out = [];
  const start = abs(relDir);
  if (!fs.existsSync(start)) return out;
  const stack = [start];
  while (stack.length) {
    const cur = stack.pop();
    for (const ent of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else {
        const rel = toRel(full);
        if (filter(rel)) out.push(rel);
      }
    }
  }
  return out.sort();
}

export function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

// 게이트 결과 한 건
export function result(gate, title, violations, extra = {}) {
  return {
    gate,
    title,
    status: extra.status ?? (violations.length === 0 ? "pass" : "fail"),
    violation_count: violations.length,
    violations,
    ...extra,
  };
}
