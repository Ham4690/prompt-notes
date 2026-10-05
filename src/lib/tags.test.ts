import { describe, expect, it } from "vitest";
import { extractTags } from "./tags";

describe("extractTags", () => {
  it("本文中の#タグを抽出する", () => {
    expect(extractTags("今日の作業 #重要 #TODO")).toEqual(["重要", "TODO"]);
  });

  it("#の直後に空白がある見出しは除外する", () => {
    expect(extractTags("# 見出し\n本文 #タグ")).toEqual(["タグ"]);
  });

  it("コードブロック内の#は除外する", () => {
    const body = ["通常行 #タグ1", "```", "# コメント #タグ2", "```", "#タグ3"].join("\n");
    expect(extractTags(body)).toEqual(["タグ1", "タグ3"]);
  });

  it("句読点や記号でタグを区切る", () => {
    expect(extractTags("これは#重要なことです。#TODOです！")).toEqual(["重要なことです", "TODOです"]);
  });

  it("重複するタグは1つにまとめ、出現順を保つ", () => {
    expect(extractTags("#a #b #a")).toEqual(["a", "b"]);
  });

  it("タグがなければ空配列を返す", () => {
    expect(extractTags("タグのない本文です")).toEqual([]);
  });

  it("日本語・英数字・アンダースコア・長音符を含むタグを扱える", () => {
    expect(extractTags("#プロンプト_v2 #サーバー")).toEqual(["プロンプト_v2", "サーバー"]);
  });
});
