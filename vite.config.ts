import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  createChatStream,
  getChatConfig,
  type ChatMessage,
} from "./server/chatHandler.js";
import { unlockResponse } from "./server/unlockHandler.js";
import { notesResponse } from "./server/notesStore.js";

const SERVER_ENV_KEYS = [
  "AI_API_KEY",
  "OPENAI_API_KEY",
  "AI_API_BASE_URL",
  "AI_MODEL",
  "CONTENT_PASSWORD",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
];

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function chatApiPlugin(): Plugin {
  return {
    name: "chat-api",
    configureServer(server) {
      server.middlewares.use(
        "/api/chat",
        async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          try {
            const config = getChatConfig();
            if (!config) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error:
                    "API key not configured. Add AI_API_KEY to your .env file.",
                }),
              );
              return;
            }

            const raw = await readBody(req);
            const { messages } = JSON.parse(raw) as {
              messages?: ChatMessage[];
            };

            if (!messages?.length) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Messages are required" }));
              return;
            }

            const upstream = await createChatStream(messages, config);

            res.statusCode = 200;
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache, no-transform");
            res.setHeader("Connection", "keep-alive");
            res.setHeader("X-Model", config.model);

            const reader = upstream.body?.getReader();
            if (!reader) throw new Error("No response stream");

            const decoder = new TextDecoder();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(decoder.decode(value, { stream: true }));
            }
            res.end();
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Unknown error";
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: message }));
            } else {
              res.end();
            }
          }
        },
      );
    },
  };
}

function unlockApiPlugin(): Plugin {
  return {
    name: "unlock-api",
    configureServer(server) {
      server.middlewares.use(
        "/api/unlock",
        async (req: IncomingMessage, res: ServerResponse) => {
          res.setHeader("Content-Type", "application/json");
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          let password: unknown;
          try {
            password = JSON.parse(await readBody(req)).password;
          } catch {
            password = undefined;
          }

          const { status, body } = unlockResponse(password);
          res.statusCode = status;
          res.end(JSON.stringify(body));
        },
      );
    },
  };
}

function notesApiPlugin(): Plugin {
  return {
    name: "notes-api",
    configureServer(server) {
      server.middlewares.use(
        "/api/notes",
        async (req: IncomingMessage, res: ServerResponse) => {
          let payload: unknown = null;
          if (req.method === "PUT") {
            try {
              payload = JSON.parse(await readBody(req));
            } catch {
              payload = null;
            }
          }

          const { status, body } = await notesResponse(
            req.method,
            req.headers.authorization,
            payload,
          );
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        },
      );
    },
  };
}

function trackRoutePlugin(): Plugin {
  const rewrite = (
    req: { url?: string },
    _res: unknown,
    next: () => void,
  ) => {
    const url = req.url?.split("?")[0];
    if (url === "/track" || url === "/track/") {
      const query = req.url?.includes("?")
        ? req.url.slice(req.url.indexOf("?"))
        : "";
      req.url = `/track/index.html${query}`;
    }
    next();
  };

  return {
    name: "track-route",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of SERVER_ENV_KEYS) {
    if (env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      trackRoutePlugin(),
      chatApiPlugin(),
      unlockApiPlugin(),
      notesApiPlugin(),
    ],
  };
});
