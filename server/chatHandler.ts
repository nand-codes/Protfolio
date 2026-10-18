export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function getChatConfig(): ChatConfig | null {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: (
      process.env.AI_API_BASE_URL || "https://api.openai.com/v1"
    ).replace(/\/$/, ""),
    model: process.env.AI_MODEL || "gpt-4o-mini",
  };
}

export async function createChatStream(
  messages: ChatMessage[],
  config: ChatConfig,
): Promise<Response> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `API error (${response.status})`;
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.error?.message || parsed.message || message;
    } catch {
      if (errorText) message = errorText.slice(0, 200);
    }
    throw new Error(message);
  }

  return response;
}

export function parseSseChunk(line: string): string | null {
  if (!line.startsWith("data: ")) return null;
  const data = line.slice(6).trim();
  if (data === "[DONE]") return null;
  try {
    const parsed = JSON.parse(data);
    return parsed.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}
