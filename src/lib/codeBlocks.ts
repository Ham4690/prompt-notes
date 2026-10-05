/** コードブロック（```で囲まれた範囲、フェンス行自体を含む）に含まれる行インデックスの集合を返す */
export function getCodeBlockLineIndexes(body: string): Set<number> {
  const lines = body.split("\n");
  const indexes = new Set<number>();
  let inBlock = false;

  lines.forEach((line, index) => {
    const isFence = /^\s*```/.test(line);
    if (isFence) {
      indexes.add(index);
      inBlock = !inBlock;
      return;
    }
    if (inBlock) {
      indexes.add(index);
    }
  });

  return indexes;
}
