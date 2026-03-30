"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── Petal animation ─────────────────────────────────────────────── */

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  rotSpeed: number;
  a: number;
  color: readonly [number, number, number];
  stretch: number;
}

const PETAL_COLORS: readonly (readonly [number, number, number])[] = [
  [225, 195, 185], // blush
  [235, 210, 200], // soft rose
  [210, 190, 175], // warm sand
  [200, 185, 170], // dusty mauve
  [215, 205, 190], // cream
  [195, 200, 185], // sage hint
];

function spawnPetal(cx: number, cy: number): Petal {
  const angle = Math.random() * Math.PI * 2;
  const dist = 20 + Math.random() * 60;
  return {
    x: cx + Math.cos(angle) * dist,
    y: cy + Math.sin(angle) * dist * 0.5,
    vx: (Math.random() - 0.5) * 0.8,
    vy: 0.3 + Math.random() * 0.6,
    r: 4 + Math.random() * 6,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.03,
    a: 0.6 + Math.random() * 0.3,
    color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    stretch: 1.6 + Math.random() * 0.8,
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.scale(1, p.stretch);
  ctx.beginPath();
  ctx.ellipse(0, 0, p.r, p.r * 0.45, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.a})`;
  ctx.fill();
  ctx.restore();
}

/* ── Component ───────────────────────────────────────────────────── */

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const rafRef = useRef(0);

  const spawnBurst = useCallback((count: number) => {
    const form = formRef.current;
    const canvas = canvasRef.current;
    if (!form || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const formRect = form.getBoundingClientRect();
    const cx = formRect.left - rect.left + formRect.width * (0.3 + Math.random() * 0.4);
    const cy = formRect.top - rect.top + formRect.height * (0.2 + Math.random() * 0.6);
    for (let i = 0; i < count; i++) {
      petalsRef.current.push(spawnPetal(cx, cy));
    }
  }, []);

  const onInteract = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Initial burst
      spawnBurst(8);
    } else {
      // Small burst on each keystroke
      if (Math.random() < 0.35) spawnBurst(1);
    }
  }, [hasInteracted, spawnBurst]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      if (cancelled) return;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      const petals = petalsRef.current;
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.x += p.vx + Math.sin(p.rot * 2) * 0.15;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.a -= 0.003;

        if (p.a <= 0 || p.y > h + 20) {
          petals.splice(i, 1);
          continue;
        }
        drawPetal(ctx, p);
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Celebration burst on submit
    spawnBurst(15);
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
      <div className="border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-8 text-center">
        <p className="text-lg font-medium text-stone-800">
          Thank you for reaching out.
        </p>
        <p className="mt-2 text-stone-600">
          We'll get back to you as soon as we can.
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
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10"
      />
      <form
        ref={formRef}
        id="inquiry-form"
        onSubmit={handleSubmit}
        onFocus={onInteract}
        onInput={onInteract}
        className="relative space-y-5 border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 md:p-8 scroll-mt-28"
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
              className="w-full border-b border-[color:var(--border)] bg-transparent px-0 py-3 text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-900"
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
              className="w-full border-b border-[color:var(--border)] bg-transparent px-0 py-3 text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-900"
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
            className="w-full border-b border-[color:var(--border)] bg-transparent px-0 py-3 text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-900"
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
            className="min-h-[140px] w-full resize-y border-b border-[color:var(--border)] bg-transparent px-0 py-3 text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-900"
            placeholder="Tell us about your project, site, timeline, and vision..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="border border-stone-900 px-8 py-3 text-sm tracking-[0.28em] uppercase text-stone-900 transition hover:bg-stone-900 hover:text-white disabled:opacity-40"
        >
          {loading ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}
