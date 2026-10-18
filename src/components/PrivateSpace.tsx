import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  LockOpen,
  X,
  Loader2,
  Target,
  MessageSquare,
  StickyNote,
  ArrowRight,
} from "lucide-react";

const STORAGE_KEY = "nk_space_unlocked";

const destinations = [
  {
    to: "/track",
    label: "ML Journey Tracker",
    description: "6-month roadmap progress",
    icon: Target,
    isStaticPage: true,
  },
  {
    to: "/chat",
    label: "AI Assistant",
    description: "Chat with the model",
    icon: MessageSquare,
    isStaticPage: false,
  },
  {
    to: "/notes",
    label: "Notes",
    description: "Personal notepad",
    icon: StickyNote,
    isStaticPage: false,
  },
];

export default function PrivateSpace() {
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === "1",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const unlock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password || checking) return;

    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Incorrect password");

      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setChecking(false);
    }
  };

  const lock = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
  };

  const close = () => {
    setOpen(false);
    setError(null);
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.6 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full glass glow text-sm text-slate-300 hover:text-cyan-300 hover:bg-white/10 transition-colors"
      >
        {unlocked ? <LockOpen size={16} /> : <Lock size={16} />}
        My Space
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md glass rounded-3xl p-8 glow"
            >
              <button
                onClick={close}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {unlocked ? (
                <>
                  <h2 className="text-xl font-bold text-white mb-1">
                    My <span className="gradient-text">Space</span>
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Choose where to go
                  </p>
                  <div className="space-y-3">
                    {destinations.map(
                      ({ to, label, description, icon: Icon, isStaticPage }) => {
                        const className =
                          "flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 transition-all group";
                        const content = (
                          <>
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
                              <Icon size={20} className="text-cyan-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-white">{label}</p>
                              <p className="text-xs text-slate-500">
                                {description}
                              </p>
                            </div>
                            <span className="text-xs font-mono text-slate-600">
                              {to}
                            </span>
                            <ArrowRight
                              size={16}
                              className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all"
                            />
                          </>
                        );
                        // /track is a standalone HTML page outside the React router.
                        return isStaticPage ? (
                          <a key={to} href={to} className={className}>
                            {content}
                          </a>
                        ) : (
                          <Link key={to} to={to} className={className}>
                            {content}
                          </Link>
                        );
                      },
                    )}
                  </div>
                  <button
                    onClick={lock}
                    className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Lock size={14} />
                    Lock again
                  </button>
                </>
              ) : (
                <form onSubmit={unlock}>
                  <div className="w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                    <Lock size={24} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Private content
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Enter the password to continue
                  </p>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoFocus
                    autoComplete="current-password"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                  {error && (
                    <p className="mt-3 text-sm text-red-400">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={!password || checking}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
                  >
                    {checking && <Loader2 size={16} className="animate-spin" />}
                    Unlock
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
