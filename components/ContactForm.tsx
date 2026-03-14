"use client";

import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-8 text-center shadow-[0_20px_50px_rgba(63,46,31,0.08)] backdrop-blur-sm">
        <p className="text-lg font-medium text-stone-800">
          Thank you for reaching out.
        </p>
        <p className="mt-2 text-stone-600">
          We’ll get back to you as soon as we can.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-sm text-stone-500 underline underline-offset-4 hover:text-stone-800"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_20px_50px_rgba(63,46,31,0.08)] backdrop-blur-sm md:p-8"
    >
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-stone-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 py-3 text-stone-900 placeholder-stone-400 outline-none transition focus:border-[color:var(--accent)] focus:bg-white"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 py-3 text-stone-900 placeholder-stone-400 outline-none transition focus:border-[color:var(--accent)] focus:bg-white"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-stone-700">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          className="w-full rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 py-3 text-stone-900 placeholder-stone-400 outline-none transition focus:border-[color:var(--accent)] focus:bg-white"
          placeholder="Project or inquiry"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-stone-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="min-h-[140px] w-full resize-y rounded-[24px] border border-[color:var(--border)] bg-white/80 px-4 py-3 text-stone-900 placeholder-stone-400 outline-none transition focus:border-[color:var(--accent)] focus:bg-white"
          placeholder="Tell us about your project, site, timeline, and vision..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-8 py-3 text-sm uppercase tracking-[0.28em] text-white transition hover:bg-[#a95f36] disabled:opacity-40"
      >
        {loading ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
