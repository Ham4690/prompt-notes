import type { Note } from "../db/db";

/** 日本語の表記ゆれ（全角半角・大文字小文字）を吸収するための正規化。 */
export function normalizeForSearch(text: string): string {
  return text.normalize("NFKC").toLowerCase();
}

export type SearchMatcher = (haystack: string, query: string) => boolean;

/** 正規化した文字列同士の部分一致。将来n-gram索引等に差し替える際はこの関数だけ入れ替える。 */
export const substringMatcher: SearchMatcher = (haystack, query) => {
  return normalizeForSearch(haystack).includes(normalizeForSearch(query));
};

/** タイトル・本文を対象にメモを検索する。queryが空なら全件を返す。 */
export function searchNotes(
  notes: Note[],
  query: string,
  matcher: SearchMatcher = substringMatcher,
): Note[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) return notes;
  return notes.filter((note) => matcher(note.title, trimmed) || matcher(note.body, trimmed));
}
