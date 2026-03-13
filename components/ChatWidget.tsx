"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  uiOnly?: boolean;
}

const WELCOME = "Hello. How can I help you today?";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME, uiOnly: true },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => !m.uiOnly).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply || "Sorry, I couldn't get a response." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-[340px] flex flex-col overflow-hidden"
            style={{
              maxHeight: "460px",
              background: "rgba(255, 255, 255, 0.72)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 1.5px 0 rgba(255,255,255,0.8) inset",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div>
                <p className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(0,0,0,0.35)" }}>
                  Gao Architect
                </p>
                <p
                  className="text-base font-light leading-tight mt-0.5 text-stone-900"
                  style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                >
                  Studio Assistant
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center transition-colors"
                style={{
                  background: "rgba(0,0,0,0.06)",
                  borderRadius: "50%",
                  color: "rgba(0,0,0,0.4)",
                  fontSize: "11px",
                }}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="text-sm leading-relaxed max-w-[82%] px-3.5 py-2.5"
                    style={
                      m.role === "user"
                        ? {
                            background: "rgba(0,0,0,0.82)",
                            color: "#fff",
                            borderRadius: "16px 16px 4px 16px",
                          }
                        : {
                            background: "rgba(0,0,0,0.05)",
                            color: "#1c1917",
                            borderRadius: "16px 16px 16px 4px",
                          }
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="flex gap-1 items-center px-3.5 py-2.5"
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      borderRadius: "16px 16px 16px 4px",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="block w-1.5 h-1.5"
                        style={{ background: "rgba(0,0,0,0.25)", borderRadius: "50%" }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div
                className="flex-1 flex items-center gap-2 px-4 py-2.5"
                style={{
                  background: "rgba(0,0,0,0.05)",
                  borderRadius: "12px",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask a question…"
                  className="flex-1 text-sm text-stone-900 bg-transparent outline-none"
                  style={{ color: "#1c1917" }}
                />
              </div>
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-8 h-8 flex items-center justify-center transition-all disabled:opacity-30 shrink-0"
                style={{
                  background: input.trim() ? "rgba(0,0,0,0.82)" : "rgba(0,0,0,0.08)",
                  borderRadius: "50%",
                  color: input.trim() ? "#fff" : "rgba(0,0,0,0.3)",
                  transition: "all 0.2s ease",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.94 }}
        className="flex items-center gap-2.5 px-5 py-3 transition-all"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.6)",
          borderRadius: "100px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.8) inset",
          color: "#1c1917",
        }}
        aria-label="Toggle chat"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-[11px] tracking-wide font-medium" style={{ color: "rgba(0,0,0,0.6)" }}>
          {open ? "Close" : "Ask the Studio"}
        </span>
      </motion.button>
    </div>
  );
}
