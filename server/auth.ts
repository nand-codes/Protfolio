import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

// Tokens are signed with CONTENT_PASSWORD, so changing the password logs out every device.
export function createToken(): string | null {
  const secret = process.env.CONTENT_PASSWORD;
  if (!secret) return null;
  const expiresAt = String(Date.now() + TOKEN_TTL_MS);
  return `${expiresAt}.${sign(expiresAt, secret)}`;
}

export function verifyToken(authorization: string | undefined | null): boolean {
  const secret = process.env.CONTENT_PASSWORD;
  if (!secret || !authorization?.startsWith("Bearer ")) return false;

  const [expiresAt, signature] = authorization.slice(7).split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Date.now()) return false;

  const expected = Buffer.from(sign(expiresAt, secret));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
