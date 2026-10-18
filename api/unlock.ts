import type { VercelRequest, VercelResponse } from "@vercel/node";
import { unlockResponse } from "../server/unlockHandler.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as { password?: unknown } | undefined;
  const { status, body: result } = unlockResponse(body?.password);
  return res.status(status).json(result);
}
