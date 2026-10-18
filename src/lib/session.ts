const TOKEN_KEY = "nk_space_token";

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  if (Number(token.split(".")[0]) < Date.now()) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function requestToken(password: string): Promise<string> {
  const res = await fetch("/api/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.token) {
    throw new Error(data.error || "Incorrect password");
  }
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.token;
}
