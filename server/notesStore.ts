import { verifyToken } from "./auth.js";

interface StoredNote {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

type NotesResult = { status: number; body: unknown };

const NOTES_KEY = "nk:notes";
const MAX_BYTES = 900_000;

function redisConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redis(command: string[]): Promise<unknown> {
  const config = redisConfig();
  if (!config) throw new Error("Notes storage is not configured");

  const res = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  const data = (await res.json().catch(() => ({}))) as {
    result?: unknown;
    error?: string;
  };
  if (!res.ok || data.error) {
    throw new Error(data.error || `Storage error (${res.status})`);
  }
  return data.result;
}

function isNote(value: unknown): value is StoredNote {
  const note = value as StoredNote;
  return (
    typeof note === "object" &&
    note !== null &&
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    typeof note.body === "string" &&
    typeof note.updatedAt === "number"
  );
}

export async function notesResponse(
  method: string | undefined,
  authorization: string | undefined,
  payload: unknown,
): Promise<NotesResult> {
  if (!verifyToken(authorization)) {
    return { status: 401, body: { error: "Unauthorized" } };
  }
  if (!redisConfig()) {
    return {
      status: 503,
      body: {
        error: "Notes storage is not configured.",
        code: "storage_unconfigured",
      },
    };
  }

  try {
    if (method === "GET") {
      const raw = await redis(["GET", NOTES_KEY]);
      return {
        status: 200,
        body: { notes: typeof raw === "string" ? JSON.parse(raw) : [] },
      };
    }

    if (method === "PUT") {
      const notes = (payload as { notes?: unknown } | null)?.notes;
      if (!Array.isArray(notes) || !notes.every(isNote)) {
        return { status: 400, body: { error: "Invalid notes" } };
      }
      const serialized = JSON.stringify(notes);
      if (serialized.length > MAX_BYTES) {
        return { status: 413, body: { error: "Notes are too large to save" } };
      }
      await redis(["SET", NOTES_KEY, serialized]);
      return { status: 200, body: { ok: true } };
    }

    return { status: 405, body: { error: "Method not allowed" } };
  } catch (err) {
    return {
      status: 502,
      body: { error: err instanceof Error ? err.message : "Storage error" },
    };
  }
}
