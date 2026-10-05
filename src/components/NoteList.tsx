import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { db, type Note } from "../db/db";
import { searchNotes } from "../lib/search";

interface Props {
  onOpen: (id: string) => void;
  onCreate: () => void;
  refreshKey: number;
  focusSearchSignal: number;
}

function collectTagsByFrequency(notes: Note[]): string[] {
  const counts = new Map<string, number>();
  for (const note of notes) {
    for (const tag of note.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
    .map(([tag]) => tag);
}

export function NoteList({ onOpen, onCreate, refreshKey, focusSearchSignal }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    db.notes
      .orderBy("updatedAt")
      .reverse()
      .toArray()
      .then((list) => {
        if (active) setNotes(list);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (focusSearchSignal > 0) {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }
  }, [focusSearchSignal]);

  const tags = useMemo(() => collectTagsByFrequency(notes), [notes]);

  const visibleNotes = useMemo(() => {
    const byTag = selectedTag ? notes.filter((note) => note.tags.includes(selectedTag)) : notes;
    return searchNotes(byTag, query);
  }, [notes, selectedTag, query]);

  return (
    <div class="note-list">
      <div class="note-list-header">
        <h1>メモ</h1>
        <button type="button" class="btn btn-primary" onClick={onCreate}>
          + 新規
        </button>
      </div>

      <div class="search-row">
        <input
          ref={searchInputRef}
          type="search"
          class="search-input"
          placeholder="検索（タイトル・本文）"
          value={query}
          onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
        />
      </div>

      {tags.length > 0 && (
        <div class="tag-filter">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              class={`tag-chip${selectedTag === tag ? " tag-chip-active" : ""}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {visibleNotes.length === 0 ? (
        <p class="empty">
          {notes.length === 0 ? "メモがまだありません" : "該当するメモがありません"}
        </p>
      ) : (
        <ul class="notes">
          {visibleNotes.map((note) => (
            <li key={note.id} onClick={() => onOpen(note.id)}>
              <div class="note-title">{note.title}</div>
              <div class="note-meta">
                {new Date(note.updatedAt).toLocaleString("ja-JP")}
                {note.tags.length > 0 && (
                  <span class="note-tags"> {note.tags.map((tag) => `#${tag}`).join(" ")}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
