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
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
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
      className="space-y-5 rounded-xl border border-stone-200 bg-white p-6 md:p-8"
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
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
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
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
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
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
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
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-y min-h-[120px]"
          placeholder="Tell us about your project, site, timeline, and vision..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="text-sm tracking-widest uppercase border border-stone-500 px-8 py-3 text-stone-600 hover:border-stone-700 hover:text-stone-900 transition-colors disabled:opacity-40"
      >
        {loading ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
