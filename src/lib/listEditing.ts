export interface EditState {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

const CHECKBOX_RE = /^(\s*)([-*+])(\s+)\[[ xX]\](\s+)(.*)$/;
const ORDERED_RE = /^(\s*)(\d+)([.)])(\s+)(.*)$/;
const BULLET_RE = /^(\s*)([-*+])(\s+)(.*)$/;

const INDENT_UNIT = "  ";

/**
 * Enterキー押下時、カーソル行が箇条書き・番号付き・チェックリストなら次行へマーカーを引き継ぐ。
 * マーカーのみで本文が空の行では、マーカーを取り除いてリストを終了する。
 * 対象行でなければnullを返し、呼び出し側は通常のEnter処理に委ねる。
 */
export function continueListOnEnter(state: EditState): EditState | null {
  const { value, selectionStart, selectionEnd } = state;
  if (selectionStart !== selectionEnd) return null;

  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  let lineEnd = value.indexOf("\n", selectionStart);
  if (lineEnd === -1) lineEnd = value.length;
  const line = value.slice(lineStart, lineEnd);

  let indent: string;
  let marker: string;
  let content: string;

  const checkboxMatch = CHECKBOX_RE.exec(line);
  const orderedMatch = !checkboxMatch ? ORDERED_RE.exec(line) : null;
  const bulletMatch = !checkboxMatch && !orderedMatch ? BULLET_RE.exec(line) : null;

  if (checkboxMatch) {
    const [, ind, bullet, space1, space2, text] = checkboxMatch;
    indent = ind;
    marker = `${bullet}${space1}[ ]${space2}`;
    content = text;
  } else if (orderedMatch) {
    const [, ind, num, delim, space, text] = orderedMatch;
    indent = ind;
    marker = `${Number(num) + 1}${delim}${space}`;
    content = text;
  } else if (bulletMatch) {
    const [, ind, bullet, space, text] = bulletMatch;
    indent = ind;
    marker = `${bullet}${space}`;
    content = text;
  } else {
    return null;
  }

  if (content.trim().length === 0) {
    const nextValue = value.slice(0, lineStart) + indent + value.slice(lineEnd);
    const cursor = lineStart + indent.length;
    return { value: nextValue, selectionStart: cursor, selectionEnd: cursor };
  }

  const insertion = `\n${indent}${marker}`;
  const nextValue = value.slice(0, selectionStart) + insertion + value.slice(selectionStart);
  const cursor = selectionStart + insertion.length;
  return { value: nextValue, selectionStart: cursor, selectionEnd: cursor };
}

/** 選択範囲にかかる行をまとめてインデント／アウトデントする（スペース2つ単位）。 */
export function indentSelection(
  state: EditState,
  direction: "indent" | "outdent",
): EditState {
  const { value, selectionStart, selectionEnd } = state;
  const blockStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  let blockEnd = value.indexOf("\n", selectionEnd - 1);
  if (blockEnd === -1) blockEnd = value.length;

  const before = value.slice(0, blockStart);
  const block = value.slice(blockStart, blockEnd);
  const after = value.slice(blockEnd);
  const lines = block.split("\n");

  let startDelta = 0;
  let totalDelta = 0;

  const nextLines = lines.map((line, index) => {
    if (direction === "indent") {
      if (index === 0) startDelta = INDENT_UNIT.length;
      totalDelta += INDENT_UNIT.length;
      return INDENT_UNIT + line;
    }
    const removeLen = line.startsWith(INDENT_UNIT) ? INDENT_UNIT.length : line.startsWith(" ") ? 1 : 0;
    if (index === 0) startDelta = -removeLen;
    totalDelta += -removeLen;
    return line.slice(removeLen);
  });

  const nextValue = before + nextLines.join("\n") + after;
  const nextStart = Math.max(blockStart, selectionStart + startDelta);
  const nextEnd = Math.max(blockStart, selectionEnd + totalDelta);
  return { value: nextValue, selectionStart: nextStart, selectionEnd: nextEnd };
}
