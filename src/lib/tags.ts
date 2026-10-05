import { getCodeBlockLineIndexes } from "./codeBlocks";

const TAG_CHAR_CLASS = "A-Za-z0-9_\\u4E00-\\u9FFF\\u3040-\\u309F\\u30A0-\\u30FFー";
const TAG_RE = new RegExp(`#([${TAG_CHAR_CLASS}]+)`, "g");

/**
 * 本文から `#タグ` を抽出する。`#` の直後に空白がある場合（`# 見出し`）とコードブロック内は対象外。
 * 出現順に重複なく返す。
 */
export function extractTags(body: string): string[] {
  const codeLines = getCodeBlockLineIndexes(body);
  const tags: string[] = [];
  const seen = new Set<string>();

  body.split("\n").forEach((line, index) => {
    if (codeLines.has(index)) return;
    for (const match of line.matchAll(TAG_RE)) {
      const tag = match[1];
      if (!seen.has(tag)) {
        seen.add(tag);
        tags.push(tag);
      }
    }
  });

  return tags;
}
