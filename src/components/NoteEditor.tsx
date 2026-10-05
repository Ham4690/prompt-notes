import { useEffect, useRef, useState } from "preact/hooks";
import { db, type Note } from "../db/db";
import { deriveTitle } from "../lib/note";
import { extractTags } from "../lib/tags";
import { continueListOnEnter, indentSelection, type EditState } from "../lib/listEditing";
import { NotePreview } from "./NotePreview";

interface Props {
  noteId: string | null;
  onBack: () => void;
}

const AUTOSAVE_DELAY_MS = 400;

type Mode = "edit" | "preview" | "split-v" | "split-h";

const MODE_LABELS: Record<Mode, string> = {
  edit: "編集",
  preview: "プレビュー",
  "split-v": "分割（上下）",
  "split-h": "分割（左右）",
};

export function NoteEditor({ noteId, onBack }: Props) {
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<Mode>("edit");
  const [copied, setCopied] = useState(false);
  const idRef = useRef<string | null>(noteId);
  const createdAtRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => {
    let active = true;
    idRef.current = noteId;
    setMode("edit");
    if (noteId) {
      db.notes.get(noteId).then((note) => {
        if (active && note) {
          setBody(note.body);
          createdAtRef.current = note.createdAt;
        }
      });
    } else {
      setBody("");
      createdAtRef.current = null;
    }
    return () => {
      active = false;
    };
  }, [noteId]);

  useEffect(() => {
    if (mode === "edit" || mode === "split-v" || mode === "split-h") {
      textareaRef.current?.focus();
    }
  }, [noteId, mode]);

  useEffect(() => {
    if (pendingSelectionRef.current && textareaRef.current) {
      const { start, end } = pendingSelectionRef.current;
      textareaRef.current.selectionStart = start;
      textareaRef.current.selectionEnd = end;
      pendingSelectionRef.current = null;
    }
  }, [body]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function scheduleSave(nextBody: string) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      void persist(nextBody);
    }, AUTOSAVE_DELAY_MS);
  }

  async function persist(nextBody: string) {
    if (nextBody.trim().length === 0) {
      return;
    }
    const now = Date.now();
    const id = idRef.current ?? crypto.randomUUID();
    const note: Note = {
      id,
      title: deriveTitle(nextBody),
      body: nextBody,
      tags: extractTags(nextBody),
      createdAt: createdAtRef.current ?? now,
      updatedAt: now,
    };
    await db.notes.put(note);
    idRef.current = id;
    createdAtRef.current = note.createdAt;
  }

  function applyEditResult(result: EditState) {
    pendingSelectionRef.current = { start: result.selectionStart, end: result.selectionEnd };
    setBody(result.value);
    scheduleSave(result.value);
  }

  function handleInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    setBody(value);
    scheduleSave(value);
  }

  function handleKeyDown(event: KeyboardEvent) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const state: EditState = {
      value: textarea.value,
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
    };

    if (event.key === "Enter" && !event.isComposing) {
      const result = continueListOnEnter(state);
      if (result) {
        event.preventDefault();
        applyEditResult(result);
      }
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const result = indentSelection(state, event.shiftKey ? "outdent" : "indent");
      applyEditResult(result);
    }
  }

  function handlePreviewChange(nextBody: string) {
    setBody(nextBody);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    void persist(nextBody);
  }

  async function handleCopyAll() {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  const showTextarea = mode === "edit" || mode === "split-v" || mode === "split-h";
  const showPreview = mode === "preview" || mode === "split-v" || mode === "split-h";

  return (
    <div class="editor">
      <div class="editor-toolbar">
        <button type="button" class="btn" onClick={onBack}>
          ← 一覧へ
        </button>
        <select
          class="mode-select"
          value={mode}
          onChange={(event) => setMode((event.target as HTMLSelectElement).value as Mode)}
        >
          {(Object.keys(MODE_LABELS) as Mode[]).map((key) => (
            <option key={key} value={key}>
              {MODE_LABELS[key]}
            </option>
          ))}
        </select>
        <button type="button" class="btn" onClick={handleCopyAll}>
          {copied ? "コピーしました" : "コピー"}
        </button>
      </div>
      <div class={`editor-body editor-body-${mode}`}>
        {showTextarea && (
          <textarea
            ref={textareaRef}
            class="editor-textarea"
            value={body}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="ここにメモを書く…"
          />
        )}
        {showPreview && <NotePreview body={body} onChangeBody={handlePreviewChange} />}
      </div>
    </div>
  );
}
