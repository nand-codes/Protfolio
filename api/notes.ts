import type { VercelRequest, VercelResponse } from "@vercel/node";
import { notesResponse } from "../server/notesStore.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { status, body } = await notesResponse(
    req.method,
    req.headers.authorization,
    req.body,
  );
  return res.status(status).json(body);
}
