import { createHash, timingSafeEqual } from "node:crypto";

type UnlockResult = {
  status: number;
  body: { ok: true } | { error: string };
};

export function unlockResponse(password: unknown): UnlockResult {
  const expected = process.env.CONTENT_PASSWORD;
  if (!expected) {
    return {
      status: 500,
      body: { error: "CONTENT_PASSWORD is not configured on the server." },
    };
  }
  if (typeof password !== "string" || !password) {
    return { status: 400, body: { error: "Password is required" } };
  }

  // Hashing first gives equal-length buffers, which timingSafeEqual requires.
  const given = createHash("sha256").update(password).digest();
  const actual = createHash("sha256").update(expected).digest();

  return timingSafeEqual(given, actual)
    ? { status: 200, body: { ok: true } }
    : { status: 401, body: { error: "Incorrect password" } };
}
