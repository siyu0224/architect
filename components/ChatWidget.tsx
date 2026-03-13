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
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function speak(text: string) {
    if (!voiceEnabled) return;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
    } catch {
      // silently ignore TTS errors
    }
  }

  async function send(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    const next: Message[] = [...messages, { role: "user", content: userText }];
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
      const reply = data.reply || "Sorry, I couldn't get a response.";
      setMessages([...next, { role: "assistant", content: reply }]);
      speak(reply);
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

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      send(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function toggleVoice() {
    if (voiceEnabled && audioRef.current) {
      audioRef.current.pause();
    }
    setVoiceEnabled((v) => !v);
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
              <div className="flex items-center gap-2">
                {/* Voice toggle */}
                <button
                  onClick={toggleVoice}
                  title={voiceEnabled ? "Mute voice" : "Enable voice"}
                  className="w-7 h-7 flex items-center justify-center transition-colors"
                  style={{
                    background: voiceEnabled ? "rgba(0,0,0,0.82)" : "rgba(0,0,0,0.06)",
                    borderRadius: "50%",
                    color: voiceEnabled ? "#fff" : "rgba(0,0,0,0.4)",
                  }}
                >
                  {voiceEnabled ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    </svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  )}
                </button>
                {/* Close */}
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
                  placeholder={listening ? "Listening…" : "Ask a question…"}
                  className="flex-1 text-sm text-stone-900 bg-transparent outline-none"
                  style={{ color: "#1c1917" }}
                />
              </div>
              {/* Mic button */}
              <button
                onClick={toggleMic}
                title={listening ? "Stop listening" : "Speak"}
                className="w-8 h-8 flex items-center justify-center transition-all shrink-0"
                style={{
                  background: listening ? "rgba(220,38,38,0.12)" : "rgba(0,0,0,0.06)",
                  borderRadius: "50%",
                  color: listening ? "rgb(220,38,38)" : "rgba(0,0,0,0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
              {/* Send button */}
              <button
                onClick={() => send()}
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
