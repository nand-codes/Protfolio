import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Trash2,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT =
  "You are a helpful AI assistant on Nanda Kishor's personal portfolio. Be concise, friendly, and knowledgeable about software engineering, Python, AI/ML, and backend development.";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState("AI");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const assistantId = crypto.randomUUID();
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const apiMessages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const responseModel = response.headers.get("X-Model");
      if (responseModel) setModel(responseModel);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) {
              fullContent += chunk;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: fullContent } : m,
                ),
              );
            }
          } catch {
            /* skip malformed chunks */
          }
        }
      }

      if (!fullContent) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "No response received." }
              : m,
          ),
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    textareaRef.current?.focus();
  };

  return (
    <div className="h-dvh flex flex-col bg-[#0a0a0f] text-slate-200 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 glass border-b border-white/5 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-white">AI Assistant</h1>
              <p className="text-xs text-slate-500 font-mono">{model}</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Trash2 size={15} />
              Clear
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                <Bot size={32} className="text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                How can I help you?
              </h2>
              <p className="text-slate-500 max-w-md mx-auto text-sm">
                Ask me anything about software engineering, Python, AI/ML, or
                backend development.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {[
                  "Explain RAG pipelines",
                  "Best practices for FastAPI",
                  "What is AIOps?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 text-sm rounded-full glass text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-violet-500/20"
                      : "bg-cyan-500/20"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User size={16} className="text-violet-400" />
                  ) : (
                    <Bot size={16} className="text-cyan-400" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-violet-500/15 text-slate-200"
                      : "glass text-slate-300"
                  }`}
                >
                  {msg.content || (
                    <span className="flex items-center gap-2 text-slate-500">
                      <Loader2 size={14} className="animate-spin" />
                      Thinking...
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-red-400/80 mt-1">{error}</p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl flex items-end gap-2 p-2 glow">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AI assistant..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent resize-none px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none max-h-40"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shrink-0"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </footer>
    </div>
  );
}
