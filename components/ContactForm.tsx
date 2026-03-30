"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── 3D Cherry Blossom Petals ────────────────────────────────────── */

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  flipAngle: number;
  flipSpeed: number;
  spinAngle: number;
  spinSpeed: number;
  swayPhase: number;
  swayAmp: number;
  a: number;
  petalIdx: number; // which pre-rendered petal texture to use
}

const PETAL_PALETTES = [
  { base: [242, 190, 200], mid: [248, 210, 218], tip: [255, 230, 235], vein: [220, 160, 175] },
  { base: [238, 178, 188], mid: [245, 200, 210], tip: [252, 225, 232], vein: [215, 150, 168] },
  { base: [245, 200, 205], mid: [250, 220, 225], tip: [255, 240, 242], vein: [225, 175, 185] },
  { base: [235, 182, 192], mid: [242, 205, 215], tip: [250, 228, 235], vein: [210, 152, 170] },
  { base: [248, 208, 212], mid: [252, 225, 230], tip: [255, 242, 245], vein: [230, 180, 190] },
  { base: [240, 192, 188], mid: [248, 215, 210], tip: [255, 235, 230], vein: [218, 162, 158] },
];

/** Pre-render petal textures to offscreen canvases for performance */
function createPetalTextures(count: number, maxSize: number): HTMLCanvasElement[] {
  const textures: HTMLCanvasElement[] = [];
  const dpr = window.devicePixelRatio || 1;

  for (let i = 0; i < count; i++) {
    const c = document.createElement("canvas");
    const s = maxSize * dpr;
    c.width = s * 2;
    c.height = s * 2.5;
    const ctx = c.getContext("2d");
    if (!ctx) continue;

    ctx.scale(dpr, dpr);
    const palette = PETAL_PALETTES[i % PETAL_PALETTES.length];
    const sz = maxSize;
    const cx = sz;
    const cy = sz * 1.1;

    // Main petal shape — asymmetric for realism
    ctx.save();
    ctx.translate(cx, cy);

    // Slightly different shape per petal
    const skew = (i % 3 - 1) * 0.06;
    ctx.rotate(skew);

    // Petal body with bezier curves
    ctx.beginPath();
    ctx.moveTo(0, -sz * 0.95);
    ctx.bezierCurveTo(sz * 0.6, -sz * 0.75, sz * 0.55, sz * 0.15, sz * 0.08, sz * 0.65);
    ctx.bezierCurveTo(sz * 0.03, sz * 0.8, -sz * 0.03, sz * 0.8, -sz * 0.08, sz * 0.65);
    ctx.bezierCurveTo(-sz * 0.5, sz * 0.15, -sz * 0.55, -sz * 0.75, 0, -sz * 0.95);
    ctx.closePath();

    // Radial gradient for natural depth
    const grad = ctx.createRadialGradient(
      sz * 0.05, -sz * 0.1, sz * 0.05,
      0, 0, sz * 0.9
    );
    const b = palette.base;
    const m = palette.mid;
    const t = palette.tip;
    grad.addColorStop(0, `rgba(${t[0]}, ${t[1]}, ${t[2]}, 0.95)`);
    grad.addColorStop(0.4, `rgba(${m[0]}, ${m[1]}, ${m[2]}, 0.9)`);
    grad.addColorStop(0.8, `rgba(${b[0]}, ${b[1]}, ${b[2]}, 0.85)`);
    grad.addColorStop(1, `rgba(${b[0] - 10}, ${b[1] - 15}, ${b[2] - 10}, 0.75)`);
    ctx.fillStyle = grad;
    ctx.fill();

    // Soft edge glow
    ctx.shadowColor = `rgba(${t[0]}, ${t[1]}, ${t[2]}, 0.3)`;
    ctx.shadowBlur = 2;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Center vein
    const v = palette.vein;
    ctx.beginPath();
    ctx.moveTo(0, -sz * 0.8);
    ctx.quadraticCurveTo(sz * 0.02, -sz * 0.1, 0, sz * 0.5);
    ctx.strokeStyle = `rgba(${v[0]}, ${v[1]}, ${v[2]}, 0.3)`;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Side veins
    for (let j = 0; j < 3; j++) {
      const yy = -sz * 0.5 + j * sz * 0.3;
      ctx.beginPath();
      ctx.moveTo(0, yy);
      ctx.quadraticCurveTo(sz * 0.15, yy + sz * 0.08, sz * 0.25, yy + sz * 0.15);
      ctx.strokeStyle = `rgba(${v[0]}, ${v[1]}, ${v[2]}, 0.12)`;
      ctx.lineWidth = 0.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, yy);
      ctx.quadraticCurveTo(-sz * 0.12, yy + sz * 0.1, -sz * 0.22, yy + sz * 0.18);
      ctx.stroke();
    }

    // Notch at tip
    ctx.beginPath();
    ctx.moveTo(-sz * 0.03, sz * 0.6);
    ctx.lineTo(0, sz * 0.52);
    ctx.lineTo(sz * 0.03, sz * 0.6);
    ctx.strokeStyle = `rgba(${v[0]}, ${v[1]}, ${v[2]}, 0.2)`;
    ctx.lineWidth = 0.4;
    ctx.stroke();

    ctx.restore();
    textures.push(c);
  }
  return textures;
}

function spawnPetal(x: number, y: number, textureCount: number): Petal {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 0.3,
    vy: 0.35 + Math.random() * 0.55,
    size: 0.5 + Math.random() * 0.5, // scale factor
    flipAngle: Math.random() * Math.PI * 2,
    flipSpeed: 0.015 + Math.random() * 0.035,
    spinAngle: Math.random() * Math.PI * 2,
    spinSpeed: 0.006 + Math.random() * 0.012,
    swayPhase: Math.random() * Math.PI * 2,
    swayAmp: 0.25 + Math.random() * 0.45,
    a: 0.8 + Math.random() * 0.2,
    petalIdx: Math.floor(Math.random() * textureCount),
  };
}

/* ── Send burst effect: petals swirl outward in a spiral ─────────── */

interface BurstPetal extends Petal {
  burstVx: number;
  burstVy: number;
  burstDecay: number;
}

function spawnBurstPetal(cx: number, cy: number, textureCount: number): BurstPetal {
  const angle = Math.random() * Math.PI * 2;
  const speed = 3 + Math.random() * 6;
  return {
    ...spawnPetal(cx, cy, textureCount),
    size: 0.6 + Math.random() * 0.6,
    a: 1,
    flipSpeed: 0.04 + Math.random() * 0.06,
    spinSpeed: 0.02 + Math.random() * 0.03,
    burstVx: Math.cos(angle) * speed,
    burstVy: Math.sin(angle) * speed - 2, // bias upward
    burstDecay: 0.96 + Math.random() * 0.02,
  };
}

/* ── Component ───────────────────────────────────────────────────── */

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const burstRef = useRef<BurstPetal[]>([]);
  const texturesRef = useRef<HTMLCanvasElement[]>([]);
  const rafRef = useRef(0);
  const visibleRef = useRef(false);
  const spawnTimerRef = useRef(0);

  // Spawn petals across the top of the canvas area
  const spawnRain = useCallback((count: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const tc = texturesRef.current.length || 6;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = -10 - Math.random() * 40;
      petalsRef.current.push(spawnPetal(x, y, tc));
    }
  }, []);

  // Burst from a point (for send button)
  const triggerBurst = useCallback((cx: number, cy: number, count: number) => {
    const tc = texturesRef.current.length || 6;
    for (let i = 0; i < count; i++) {
      burstRef.current.push(spawnBurstPetal(cx, cy, tc));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;

    // Pre-render petal textures
    texturesRef.current = createPetalTextures(6, 16);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = wrapper.offsetWidth;
      const h = wrapper.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // IntersectionObserver — start continuous rain when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(wrapper);

    const animate = () => {
      if (cancelled) return;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      const now = performance.now();
      const textures = texturesRef.current;

      // Spawn new petals continuously when in view
      if (visibleRef.current && now - spawnTimerRef.current > 400) {
        spawnTimerRef.current = now;
        const tc = textures.length || 6;
        const x = Math.random() * w;
        petalsRef.current.push(spawnPetal(x, -10, tc));
      }

      // Cap max petals for performance
      if (petalsRef.current.length > 50) {
        petalsRef.current.splice(0, petalsRef.current.length - 50);
      }

      // Draw regular petals
      const petals = petalsRef.current;
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.swayPhase += 0.012;
        p.x += p.vx + Math.sin(p.swayPhase) * p.swayAmp;
        p.y += p.vy;
        p.flipAngle += p.flipSpeed;
        p.spinAngle += p.spinSpeed;
        p.a -= 0.001;

        if (p.a <= 0 || p.y > h + 30) {
          petals.splice(i, 1);
          continue;
        }

        drawTexturedPetal(ctx, p, textures);
      }

      // Draw burst petals
      const bursts = burstRef.current;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const bp = bursts[i];
        bp.x += bp.burstVx;
        bp.y += bp.burstVy;
        bp.burstVx *= bp.burstDecay;
        bp.burstVy *= bp.burstDecay;
        bp.burstVy += 0.08; // gravity
        bp.flipAngle += bp.flipSpeed;
        bp.spinAngle += bp.spinSpeed;
        bp.a -= 0.008;

        if (bp.a <= 0 || bp.y > h + 30 || bp.x < -30 || bp.x > w + 30) {
          bursts.splice(i, 1);
          continue;
        }

        drawTexturedPetal(ctx, bp, textures);
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, []);

  // Extra petals on keystroke
  const onInteract = useCallback(() => {
    if (Math.random() < 0.25) spawnRain(1);
  }, [spawnRain]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // Burst from the send button
    const btn = (e.currentTarget.querySelector("button[type=submit]") as HTMLElement);
    const canvas = canvasRef.current;
    if (btn && canvas) {
      const btnRect = btn.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const cx = btnRect.left - canvasRect.left + btnRect.width / 2;
      const cy = btnRect.top - canvasRect.top + btnRect.height / 2;
      triggerBurst(cx, cy, 30);
    }

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
    <div ref={wrapperRef} className="relative">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10"
      />
      <form
        ref={formRef}
        id="inquiry-form"
        onSubmit={handleSubmit}
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

/* ── Draw a petal using pre-rendered texture ─────────────────────── */

function drawTexturedPetal(
  ctx: CanvasRenderingContext2D,
  p: Petal,
  textures: HTMLCanvasElement[]
) {
  const tex = textures[p.petalIdx % textures.length];
  if (!tex) return;

  const flipScale = Math.cos(p.flipAngle);
  const absFlip = Math.abs(flipScale);

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spinAngle);
  ctx.scale(flipScale * p.size, p.size);
  ctx.globalAlpha = p.a * Math.max(absFlip, 0.12);

  const dpr = window.devicePixelRatio || 1;
  const tw = tex.width / dpr;
  const th = tex.height / dpr;
  ctx.drawImage(tex, -tw / 2, -th / 2, tw, th);

  ctx.restore();
}
