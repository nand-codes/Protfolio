import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createChatStream,
  getChatConfig,
  type ChatMessage,
} from "../server/chatHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const config = getChatConfig();
  if (!config) {
    return res.status(500).json({
      error:
        "API key not configured. Set AI_API_KEY in your Vercel environment variables.",
    });
  }

  const { messages } = req.body as { messages?: ChatMessage[] };
  if (!messages?.length) {
    return res.status(400).json({ error: "Messages are required" });
  }

  try {
    const upstream = await createChatStream(messages, config);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Model", config.model);

    const reader = upstream.body?.getReader();
    if (!reader) {
      return res.status(500).json({ error: "No response stream" });
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
