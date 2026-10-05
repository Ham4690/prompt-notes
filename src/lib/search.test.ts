import { describe, expect, it } from "vitest";
import { normalizeForSearch, searchNotes, substringMatcher } from "./search";
import type { Note } from "../db/db";

function makeNote(overrides: Partial<Note>): Note {
  return {
    id: "id",
    title: "",
    body: "",
    tags: [],
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe("normalizeForSearch", () => {
  it("全角英数字を半角化し、大文字を小文字化する", () => {
    expect(normalizeForSearch("ＡＢＣ")).toBe("abc");
    expect(normalizeForSearch("ABC")).toBe("abc");
  });

  it("半角カナを全角カナに正規化する", () => {
    expect(normalizeForSearch("ｶﾀｶﾅ")).toBe(normalizeForSearch("カタカナ"));
  });
});

describe("substringMatcher", () => {
  it("正規化後に部分一致すればtrueを返す", () => {
    expect(substringMatcher("ＡＢＣ検索テスト", "abc")).toBe(true);
    expect(substringMatcher("プロンプトの下書き", "下書き")).toBe(true);
  });

  it("一致しなければfalseを返す", () => {
    expect(substringMatcher("プロンプトの下書き", "存在しない語")).toBe(false);
  });
});

describe("searchNotes", () => {
  const notes = [
    makeNote({ id: "1", title: "買い物メモ", body: "牛乳と卵を買う" }),
    makeNote({ id: "2", title: "会議メモ", body: "ロードマップについて議論" }),
    makeNote({ id: "3", title: "ＡＢＣテスト", body: "大文字小文字のテスト" }),
  ];

  it("タイトルに一致するメモを返す", () => {
    expect(searchNotes(notes, "会議").map((n) => n.id)).toEqual(["2"]);
  });

  it("本文に一致するメモを返す", () => {
    expect(searchNotes(notes, "牛乳").map((n) => n.id)).toEqual(["1"]);
  });

  it("全角半角・大文字小文字を無視して検索できる", () => {
    expect(searchNotes(notes, "abc").map((n) => n.id)).toEqual(["3"]);
  });

  it("空クエリなら全件を返す", () => {
    expect(searchNotes(notes, "  ").map((n) => n.id)).toEqual(["1", "2", "3"]);
  });

  it("一致しなければ空配列を返す", () => {
    expect(searchNotes(notes, "存在しない")).toEqual([]);
  });

  it("matcherを差し替えられる", () => {
    const alwaysTrue = () => true;
    expect(searchNotes(notes, "何でも", alwaysTrue).map((n) => n.id)).toEqual(["1", "2", "3"]);
  });
});
