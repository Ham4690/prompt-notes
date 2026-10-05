/** 本文の1行目をタイトルとして採用する。空の場合は「無題のメモ」とする。 */
export function deriveTitle(body: string): string {
  const firstLine = body.split("\n", 1)[0]?.trim() ?? "";
  return firstLine.length > 0 ? firstLine : "無題のメモ";
}
