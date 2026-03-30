"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── 3D Cherry Blossom Petal Animation ───────────────────────────── */

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  /** Tumble angle around the vertical axis (creates the CC Cylinder 3D flip) */
  flipAngle: number;
  flipSpeed: number;
  /** Spin around the petal's own axis */
  spinAngle: number;
  spinSpeed: number;
  /** Gentle horizontal sway phase */
  swayPhase: number;
  swayAmp: number;
  a: number;
  color: readonly [number, number, number];
  highlight: readonly [number, number, number];
}

const PETAL_COLORS: readonly {
  base: readonly [number, number, number];
  highlight: readonly [number, number, number];
}[] = [
  { base: [242, 190, 200], highlight: [255, 225, 230] }, // sakura pink
  { base: [238, 180, 190], highlight: [252, 218, 225] }, // deeper pink
  { base: [245, 200, 205], highlight: [255, 235, 238] }, // pale blush
  { base: [235, 185, 195], highlight: [250, 220, 228] }, // rose
  { base: [248, 210, 215], highlight: [255, 240, 242] }, // lightest pink
  { base: [240, 195, 190], highlight: [255, 230, 225] }, // warm pink
];

function spawnPetal(cx: number, cy: number): Petal {
  const angle = Math.random() * Math.PI * 2;
  const dist = 30 + Math.random() * 80;
  const palette = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  return {
    x: cx + Math.cos(angle) * dist,
    y: cy - 20 - Math.random() * 60, // start above
    vx: (Math.random() - 0.5) * 0.4,
    vy: 0.4 + Math.random() * 0.8,
    size: 6 + Math.random() * 8,
    flipAngle: Math.random() * Math.PI * 2,
    flipSpeed: 0.02 + Math.random() * 0.04,
    spinAngle: Math.random() * Math.PI * 2,
    spinSpeed: 0.008 + Math.random() * 0.015,
    swayPhase: Math.random() * Math.PI * 2,
    swayAmp: 0.3 + Math.random() * 0.5,
    a: 0.75 + Math.random() * 0.25,
    color: palette.base,
    highlight: palette.highlight,
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  // The CC Cylinder trick: cos(flipAngle) squashes the petal horizontally,
  // simulating a 3D tumble. When cos ≈ 0 the petal is edge-on (thin line).
  const flipScale = Math.cos(p.flipAngle);
  const absFlip = Math.abs(flipScale);

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spinAngle);
  ctx.scale(flipScale, 1);

  // Use the flip to blend between base (front) and highlight (back).
  const showBack = flipScale < 0;
  const c = showBack ? p.highlight : p.color;
  const edgeDarken = 1 - absFlip * 0.15;

  ctx.globalAlpha = p.a * Math.max(absFlip, 0.15); // don't fully vanish edge-on

  // Draw a petal shape (teardrop / rounded leaf)
  const s = p.size;
  ctx.beginPath();
  ctx.moveTo(0, -s * 1.1);
  ctx.bezierCurveTo(s * 0.55, -s * 0.8, s * 0.5, s * 0.3, 0, s * 0.7);
  ctx.bezierCurveTo(-s * 0.5, s * 0.3, -s * 0.55, -s * 0.8, 0, -s * 1.1);
  ctx.closePath();

  // Gradient fill for depth
  const grad = ctx.createLinearGradient(-s * 0.3, -s, s * 0.3, s * 0.6);
  grad.addColorStop(0, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 1)`);
  grad.addColorStop(0.5, `rgba(${Math.round(c[0] * edgeDarken)}, ${Math.round(c[1] * edgeDarken)}, ${Math.round(c[2] * edgeDarken)}, 0.9)`);
  grad.addColorStop(1, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.7)`);
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle vein/center line
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.9);
  ctx.quadraticCurveTo(s * 0.05, 0, 0, s * 0.5);
  ctx.strokeStyle = `rgba(${Math.round(c[0] * 0.85)}, ${Math.round(c[1] * 0.75)}, ${Math.round(c[2] * 0.8)}, ${0.25 * absFlip})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();

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
    // Spawn across the full width of the form
    for (let i = 0; i < count; i++) {
      const cx = formRect.left - rect.left + Math.random() * formRect.width;
      const cy = formRect.top - rect.top;
      petalsRef.current.push(spawnPetal(cx, cy));
    }
  }, []);

  const onInteract = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      spawnBurst(12);
    } else {
      if (Math.random() < 0.3) spawnBurst(1);
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

        // Sway side to side like a real petal caught in air
        p.swayPhase += 0.015;
        p.x += p.vx + Math.sin(p.swayPhase) * p.swayAmp;
        p.y += p.vy;

        // 3D tumble and spin
        p.flipAngle += p.flipSpeed;
        p.spinAngle += p.spinSpeed;

        // Slow fade
        p.a -= 0.002;

        if (p.a <= 0 || p.y > h + 30) {
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
    spawnBurst(20);
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
