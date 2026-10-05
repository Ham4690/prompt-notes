import { useEffect, useState } from "preact/hooks";
import { NoteList } from "./components/NoteList";
import { NoteEditor } from "./components/NoteEditor";

type View = { kind: "list" } | { kind: "editor"; noteId: string | null };

export function App() {
  const [view, setView] = useState<View>({ kind: "editor", noteId: null });
  const [refreshKey, setRefreshKey] = useState(0);
  const [focusSearchSignal, setFocusSearchSignal] = useState(0);

  function goList() {
    setRefreshKey((key) => key + 1);
    setView({ kind: "list" });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setView({ kind: "editor", noteId: null });
      } else if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        goList();
        setFocusSearchSignal((key) => key + 1);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div class="app">
      {view.kind === "list" ? (
        <NoteList
          refreshKey={refreshKey}
          focusSearchSignal={focusSearchSignal}
          onOpen={(id) => setView({ kind: "editor", noteId: id })}
          onCreate={() => setView({ kind: "editor", noteId: null })}
        />
      ) : (
        <NoteEditor noteId={view.noteId} onBack={goList} />
      )}
    </div>
  );
}
