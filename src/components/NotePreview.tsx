import { useEffect, useRef } from "preact/hooks";
import { renderMarkdown } from "../lib/markdown";
import { extractChecklistItems, toggleChecklistLine } from "../lib/checklist";

interface Props {
  body: string;
  onChangeBody: (nextBody: string) => void;
}

export function NotePreview({ body, onChangeBody }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const html = renderMarkdown(body);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.disabled = false;
      });

    container.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".copy-code-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-code-btn";
      btn.textContent = "コピー";
      pre.appendChild(btn);
    });
  }, [html]);

  function handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const copyBtn = target.closest<HTMLButtonElement>(".copy-code-btn");
    if (copyBtn) {
      const code = copyBtn.parentElement?.querySelector("code");
      if (code?.textContent) {
        void navigator.clipboard.writeText(code.textContent);
        const original = "コピー";
        copyBtn.textContent = "コピーしました";
        window.setTimeout(() => {
          copyBtn.textContent = original;
        }, 1200);
      }
      return;
    }

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      const container = containerRef.current;
      if (!container) return;
      const checkboxes = Array.from(
        container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
      );
      const index = checkboxes.indexOf(target);
      const item = extractChecklistItems(body)[index];
      if (item) {
        onChangeBody(toggleChecklistLine(body, item.lineIndex));
      }
    }
  }

  return (
    <div
      ref={containerRef}
      class="preview markdown-body"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
