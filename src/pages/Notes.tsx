import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  Lock,
  Search,
  SquarePen,
  Trash2,
} from "lucide-react";
import { clearToken, getToken, requestToken } from "../lib/session";

interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

type SaveState = "idle" | "saving" | "saved" | "error";
type StorageMode = "cloud" | "device";

// Holds notes that haven't reached the server yet (or all notes when no cloud storage is configured).
const BACKUP_KEY = "nk_notes";
const DAY = 86_400_000;
const SAVE_DELAY_MS = 700;

const accent = "text-[#d9a400] dark:text-[#ffd60a]";
const fullScreen =
  "font-apple h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center bg-white text-[#1d1d1f] dark:bg-[#1e1e1e] dark:text-[#f5f5f7] antialiased";

function loadBackup(): Note[] {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function mergeNotes(server: Note[], local: Note[]) {
  const byId = new Map(server.map((n) => [n.id, n]));
  let changed = false;
  for (const note of local) {
    const existing = byId.get(note.id);
    if (!existing || note.updatedAt > existing.updatedAt) {
      byId.set(note.id, note);
      changed = true;
    }
  }
  return { notes: [...byId.values()], changed };
}

const newestId = (notes: Note[]) =>
  [...notes].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id ?? null;

const isEmpty = (note: Note) => !note.title.trim() && !note.body.trim();

function NotesLock({ onUnlock }: { onUnlock: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password || checking) return;
    setChecking(true);
    setError(null);
    try {
      onUnlock(await requestToken(password));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setChecking(false);
    }
  };

  return (
    <div className={fullScreen}>
      <Lock size={40} className={accent} />
      <div>
        <h1 className="text-[22px] font-semibold">Notes are locked</h1>
        <p className="mt-1 text-[14px] text-[#86868b]">
          Enter the password to view your notes.
        </p>
      </div>
      <form onSubmit={submit} className="w-full max-w-xs flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          autoComplete="current-password"
          className="px-3 py-2 rounded-lg bg-black/[0.06] dark:bg-white/10 text-[15px] outline-none focus:ring-2 focus:ring-[#ffd60a]"
        />
        {error && <p className="text-[13px] text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={!password || checking}
          className="flex items-center justify-center gap-2 py-2 rounded-lg bg-[#ffd60a] text-[#1d1d1f] text-[15px] font-semibold disabled:opacity-40 hover:brightness-95 transition"
        >
          {checking && <Loader2 size={16} className="animate-spin" />}
          Unlock
        </button>
      </form>
      <Link to="/" className={`text-[14px] ${accent} hover:opacity-80`}>
        Back to portfolio
      </Link>
    </div>
  );
}

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
  const [token, setToken] = useState<string | null>(getToken);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [mode, setMode] = useState<StorageMode>("cloud");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [query, setQuery] = useState("");
  const [showEditorOnMobile, setShowEditorOnMobile] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const notesRef = useRef(notes);
  const skipSaveRef = useRef(true);
  const pendingRef = useRef(false);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const lockOut = useCallback(() => {
    clearToken();
    setToken(null);
    setLoaded(false);
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoadError(null);

    (async () => {
      try {
        const res = await fetch("/api/notes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.status === 401) {
          lockOut();
          return;
        }

        let serverNotes: Note[] = [];
        let nextMode: StorageMode = "cloud";
        if (res.status === 503 && data.code === "storage_unconfigured") {
          nextMode = "device";
        } else if (!res.ok) {
          throw new Error(data.error || `Couldn't load notes (${res.status})`);
        } else {
          serverNotes = data.notes ?? [];
        }

        const { notes: merged, changed } = mergeNotes(serverNotes, loadBackup());
        skipSaveRef.current = nextMode === "device" || !changed;
        setMode(nextMode);
        setNotes(merged);
        setSelectedId(newestId(merged));
        setLoaded(true);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Couldn't load notes",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey, lockOut]);

  const persist = useCallback(
    async (toSave: Note[], keepalive = false) => {
      pendingRef.current = false;
      const payload = toSave.filter((n) => !isEmpty(n));
      const backup = () =>
        localStorage.setItem(BACKUP_KEY, JSON.stringify(payload));

      if (mode === "device") {
        backup();
        setSaveState("saved");
        return;
      }

      try {
        const res = await fetch("/api/notes", {
          method: "PUT",
          keepalive,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes: payload }),
        });
        if (res.status === 401) {
          backup();
          lockOut();
          return;
        }
        if (!res.ok) throw new Error(`Save failed (${res.status})`);
        localStorage.removeItem(BACKUP_KEY);
        setSaveState("saved");
      } catch {
        pendingRef.current = true;
        backup();
        setSaveState("error");
      }
    },
    [mode, token, lockOut],
  );

  useEffect(() => {
    if (!loaded) return;
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    pendingRef.current = true;
    setSaveState("saving");
    const timer = window.setTimeout(() => void persist(notes), SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [notes, loaded, persist]);

  useEffect(() => {
    const flush = () => {
      if (pendingRef.current) void persist(notesRef.current, true);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      flush();
    };
  }, [persist]);

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

  const iconButton = `p-2 rounded-md ${accent} hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 transition-colors`;

  if (!token) return <NotesLock onUnlock={setToken} />;

  if (loadError) {
    return (
      <div className={fullScreen}>
        <p className="text-[15px] text-[#86868b]">{loadError}</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className={`text-[15px] font-medium ${accent} hover:opacity-80`}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className={fullScreen}>
        <Loader2 size={24} className="animate-spin text-[#86868b]" />
      </div>
    );
  }

  const statusText =
    mode === "device"
      ? "Saved on this device only"
      : saveState === "saving"
        ? "Saving…"
        : saveState === "error"
          ? "Couldn't save — kept on this device"
          : "Saved to cloud";

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
          {" · "}
          <span className={saveState === "error" ? "text-red-500" : ""}>
            {statusText}
          </span>
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
