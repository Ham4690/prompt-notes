import { marked } from "marked";
import DOMPurify from "dompurify";

marked.use({
  gfm: true,
  breaks: true,
});

/** Markdown本文をサニタイズ済みHTMLに変換する。外部通信は発生しない。 */
export function renderMarkdown(body: string): string {
  const html = marked.parse(body, { async: false }) as string;
  return DOMPurify.sanitize(html);
}
