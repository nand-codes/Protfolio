import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Search, SquarePen, Trash2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

const STORAGE_KEY = "nk_notes";
const DAY = 86_400_000;

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const isEmpty = (note: Note) => !note.title.trim() && !note.body.trim();

function groupLabel(ts: number, now: Date) {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  if (ts >= startOfToday) return "Today";
  if (ts >= startOfToday - DAY) return "Yesterday";
  if (ts >= startOfToday - 7 * DAY) return "Previous 7 Days";
  if (ts >= startOfToday - 30 * DAY) return "Previous 30 Days";
  const date = new Date(ts);
  return date.getFullYear() === now.getFullYear()
    ? date.toLocaleString(undefined, { month: "long" })
    : String(date.getFullYear());
}

function listDate(ts: number, now: Date) {
  const date = new Date(ts);
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (now.getTime() - ts < 7 * DAY) {
    return date.toLocaleDateString(undefined, { weekday: "long" });
  }
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  });
}

function previewText(body: string) {
  return body.split("\n").find((line) => line.trim())?.trim() ?? "";
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [selectedId, setSelectedId] = useState<string | null>(
    () =>
      [...notes].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id ?? null,
  );
  const [query, setQuery] = useState("");
  const [showEditorOnMobile, setShowEditorOnMobile] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    document.title = "Notes";
    return () => {
      document.title = "Nanda Kishor | Software Engineer";
    };
  }, []);

  const sorted = useMemo(
    () => [...notes].sort((a, b) => b.updatedAt - a.updatedAt),
    [notes],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((n) =>
      `${n.title}\n${n.body}`.toLowerCase().includes(q),
    );
  }, [sorted, query]);

  const groups = useMemo(() => {
    const now = new Date();
    const map = new Map<string, Note[]>();
    for (const note of filtered) {
      const label = groupLabel(note.updatedAt, now);
      const list = map.get(label);
      if (list) list.push(note);
      else map.set(label, [note]);
    }
    return [...map.entries()];
  }, [filtered]);

  const selected = notes.find((n) => n.id === selectedId) ?? null;
  const now = new Date();

  const createNote = () => {
    const note: Note = {
      id: crypto.randomUUID(),
      title: "",
      body: "",
      updatedAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev.filter((n) => !isEmpty(n))]);
    setSelectedId(note.id);
    setQuery("");
    setShowEditorOnMobile(true);
    requestAnimationFrame(() => titleRef.current?.focus());
  };

  const selectNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id === id || !isEmpty(n)));
    setSelectedId(id);
    setShowEditorOnMobile(true);
  };

  const updateSelected = (patch: Partial<Pick<Note, "title" | "body">>) => {
    if (!selectedId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId ? { ...n, ...patch, updatedAt: Date.now() } : n,
      ),
    );
  };

  const deleteSelected = () => {
    if (!selected) return;
    if (!isEmpty(selected) && !confirm("Delete this note?")) return;
    const next = sorted.find((n) => n.id !== selected.id);
    setNotes((prev) => prev.filter((n) => n.id !== selected.id));
    setSelectedId(next?.id ?? null);
    setShowEditorOnMobile(false);
  };

  const accent = "text-[#d9a400] dark:text-[#ffd60a]";
  const iconButton = `p-2 rounded-md ${accent} hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 transition-colors`;

  return (
    <div className="font-apple h-dvh flex bg-white text-[#1d1d1f] dark:bg-[#1e1e1e] dark:text-[#f5f5f7] selection:bg-[#ffd60a]/40 antialiased">
      <aside
        className={`${showEditorOnMobile ? "hidden" : "flex"} md:flex w-full md:w-80 shrink-0 flex-col border-r border-black/10 dark:border-white/10 bg-[#f5f5f5] dark:bg-[#262626]`}
      >
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <Link
              to="/"
              className={`flex items-center -ml-1.5 text-[15px] ${accent} hover:opacity-80`}
            >
              <ChevronLeft size={20} />
              Portfolio
            </Link>
            <button
              onClick={createNote}
              className={iconButton}
              aria-label="New note"
              title="New note"
            >
              <SquarePen size={20} />
            </button>
          </div>
          <h1 className="text-[28px] font-bold tracking-tight mb-3">Notes</h1>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/[0.06] dark:bg-white/10">
            <Search size={15} className="text-[#86868b] shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#86868b]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {groups.length === 0 && (
            <p className="text-center text-[13px] text-[#86868b] mt-10">
              {query ? "No results" : "No notes"}
            </p>
          )}
          {groups.map(([label, items]) => (
            <div key={label} className="mt-4">
              <h2 className="px-3 mb-1 text-[13px] font-semibold text-[#86868b]">
                {label}
              </h2>
              {items.map((note) => {
                const active = note.id === selectedId;
                return (
                  <button
                    key={note.id}
                    onClick={() => selectNote(note.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      active
                        ? "bg-[#ffe17a] dark:bg-[#7a6514]"
                        : "hover:bg-black/[0.04] dark:hover:bg-white/5"
                    }`}
                  >
                    <p className="text-[14px] font-semibold truncate">
                      {note.title.trim() || "New Note"}
                    </p>
                    <p className="text-[13px] truncate">
                      <span
                        className={
                          active
                            ? "text-[#1d1d1f]/80 dark:text-white/80"
                            : "text-[#1d1d1f]/80 dark:text-white/70"
                        }
                      >
                        {listDate(note.updatedAt, now)}
                      </span>
                      <span className="ml-2 text-[#86868b] dark:text-white/50">
                        {previewText(note.body) || "No additional text"}
                      </span>
                    </p>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <p className="py-2 text-center text-[12px] text-[#86868b] border-t border-black/5 dark:border-white/5">
          {notes.length} {notes.length === 1 ? "Note" : "Notes"}
        </p>
      </aside>

      <section
        className={`${showEditorOnMobile ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0`}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-black/5 dark:border-white/5">
          <button
            onClick={() => setShowEditorOnMobile(false)}
            className={`md:invisible flex items-center text-[15px] ${accent}`}
          >
            <ChevronLeft size={20} />
            Notes
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={deleteSelected}
              disabled={!selected}
              className={iconButton}
              aria-label="Delete note"
              title="Delete note"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={createNote}
              className={`md:hidden ${iconButton}`}
              aria-label="New note"
            >
              <SquarePen size={18} />
            </button>
          </div>
        </div>

        {selected ? (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col px-6 md:px-10 py-4">
              <p className="text-center text-[12px] text-[#86868b] mb-4">
                {new Date(selected.updatedAt).toLocaleString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <input
                ref={titleRef}
                value={selected.title}
                onChange={(e) => updateSelected({ title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    bodyRef.current?.focus();
                  }
                }}
                placeholder="Title"
                className="w-full bg-transparent text-[26px] font-bold tracking-tight outline-none caret-[#d9a400] placeholder:text-[#c7c7cc] dark:placeholder:text-white/25"
              />
              <textarea
                ref={bodyRef}
                value={selected.body}
                onChange={(e) => updateSelected({ body: e.target.value })}
                placeholder="Start writing…"
                className="flex-1 min-h-[60vh] mt-2 w-full bg-transparent resize-none text-[16px] leading-[1.6] outline-none caret-[#d9a400] placeholder:text-[#c7c7cc] dark:placeholder:text-white/25"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[15px] text-[#86868b]">
            No Note Selected
          </div>
        )}
      </section>
    </div>
  );
}
