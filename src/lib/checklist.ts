import { getCodeBlockLineIndexes } from "./codeBlocks";

const CHECKLIST_LINE_RE = /^(\s*[-*]\s+\[)([ xX])(\]\s*)(.*)$/;

export interface ChecklistItem {
  lineIndex: number;
  checked: boolean;
  text: string;
}

/** 本文からチェックリスト項目（`- [ ]` / `- [x]`）を出現順に抽出する。コードブロック内は対象外。 */
export function extractChecklistItems(body: string): ChecklistItem[] {
  const codeLines = getCodeBlockLineIndexes(body);
  const items: ChecklistItem[] = [];

  body.split("\n").forEach((line, lineIndex) => {
    if (codeLines.has(lineIndex)) return;
    const match = CHECKLIST_LINE_RE.exec(line);
    if (match) {
      items.push({
        lineIndex,
        checked: match[2].toLowerCase() === "x",
        text: match[4],
      });
    }
  });

  return items;
}

/** 指定行のチェック状態を反転した本文を返す。対象行がチェックリスト行でなければ変更しない。 */
export function toggleChecklistLine(body: string, lineIndex: number): string {
  const lines = body.split("\n");
  const line = lines[lineIndex];
  if (line === undefined) return body;

  const match = CHECKLIST_LINE_RE.exec(line);
  if (!match) return body;

  const nextMark = match[2].toLowerCase() === "x" ? " " : "x";
  lines[lineIndex] = `${match[1]}${nextMark}${match[3]}${match[4]}`;
  return lines.join("\n");
}
