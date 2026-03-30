"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── Shinkai-style Cherry Blossom (秒速5センチメートル) ──────────── */

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  /** Depth layer: 0 = far bg (small, blurry), 1 = mid, 2 = foreground (large, soft) */
  depth: number;
  flipAngle: number;
  flipSpeed: number;
  spinAngle: number;
  spinSpeed: number;
  /** S-curve sway */
  swayPhase: number;
  swayFreq: number;
  swayAmp: number;
  /** Wind gust response */
  gustOffset: number;
  a: number;
  petalIdx: number;
}

/* Very pale, almost-white pinks — Shinkai palette */
const PETAL_PALETTES = [
  { base: [252, 228, 232], mid: [255, 240, 243], tip: [255, 248, 250], vein: [240, 200, 210] },
  { base: [250, 222, 228], mid: [253, 236, 240], tip: [255, 246, 248], vein: [238, 195, 208] },
  { base: [255, 235, 238], mid: [255, 244, 246], tip: [255, 250, 251], vein: [245, 210, 218] },
  { base: [248, 225, 230], mid: [252, 238, 242], tip: [255, 248, 250], vein: [235, 198, 210] },
  { base: [253, 232, 235], mid: [255, 242, 244], tip: [255, 250, 252], vein: [242, 205, 215] },
  { base: [255, 238, 240], mid: [255, 246, 248], tip: [255, 252, 253], vein: [248, 215, 222] },
  { base: [250, 230, 235], mid: [254, 242, 245], tip: [255, 250, 252], vein: [238, 200, 212] },
  { base: [255, 240, 242], mid: [255, 248, 250], tip: [255, 253, 254], vein: [248, 218, 225] },
];

function createPetalTextures(count: number, maxSize: number): HTMLCanvasElement[] {
  const textures: HTMLCanvasElement[] = [];
  const dpr = window.devicePixelRatio || 1;

  for (let i = 0; i < count; i++) {
    const c = document.createElement("canvas");
    const s = maxSize * dpr;
    c.width = s * 2.2;
    c.height = s * 2.8;
    const ctx = c.getContext("2d");
    if (!ctx) continue;
    ctx.scale(dpr, dpr);

    const palette = PETAL_PALETTES[i % PETAL_PALETTES.length];
    const sz = maxSize;
    const cx = sz * 1.1;
    const cy = sz * 1.2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((i % 4 - 1.5) * 0.08);

    // Sakura petal — rounded with a notch at the tip
    ctx.beginPath();
    ctx.moveTo(0, -sz * 0.9);
    ctx.bezierCurveTo(sz * 0.55, -sz * 0.7, sz * 0.5, sz * 0.1, sz * 0.12, sz * 0.55);
    ctx.quadraticCurveTo(sz * 0.04, sz * 0.7, 0, sz * 0.58);
    ctx.quadraticCurveTo(-sz * 0.04, sz * 0.7, -sz * 0.12, sz * 0.55);
    ctx.bezierCurveTo(-sz * 0.5, sz * 0.1, -sz * 0.55, -sz * 0.7, 0, -sz * 0.9);
    ctx.closePath();

    // Soft radial gradient — glowing translucent center
    const b = palette.base, m = palette.mid, t = palette.tip;
    const grad = ctx.createRadialGradient(0, -sz * 0.15, sz * 0.05, 0, 0, sz * 0.85);
    grad.addColorStop(0, `rgba(${t[0]}, ${t[1]}, ${t[2]}, 0.9)`);
    grad.addColorStop(0.35, `rgba(${m[0]}, ${m[1]}, ${m[2]}, 0.75)`);
    grad.addColorStop(0.7, `rgba(${b[0]}, ${b[1]}, ${b[2]}, 0.6)`);
    grad.addColorStop(1, `rgba(${b[0]}, ${b[1]}, ${b[2]}, 0.4)`);
    ctx.fillStyle = grad;
    ctx.fill();

    // Center vein — very subtle
    const v = palette.vein;
    ctx.beginPath();
    ctx.moveTo(0, -sz * 0.75);
    ctx.quadraticCurveTo(sz * 0.015, -sz * 0.1, 0, sz * 0.45);
    ctx.strokeStyle = `rgba(${v[0]}, ${v[1]}, ${v[2]}, 0.18)`;
    ctx.lineWidth = 0.4;
    ctx.stroke();

    ctx.restore();
    textures.push(c);
  }
  return textures;
}

function spawnPetal(w: number, h: number, tc: number, fromTop = true): Petal {
  // Depth layers: 0 = background (small), 1 = mid, 2 = foreground (large, blurry)
  const depth = Math.random() < 0.15 ? 2 : Math.random() < 0.4 ? 0 : 1;
  const depthScale = depth === 0 ? 0.3 : depth === 1 ? 0.6 : 1.1;
  const depthAlpha = depth === 0 ? 0.35 : depth === 1 ? 0.55 : 0.3; // foreground is soft/faded
  const depthSpeed = depth === 0 ? 0.15 : depth === 1 ? 0.3 : 0.45;

  return {
    x: Math.random() * w * 1.2 - w * 0.1,
    y: fromTop ? -10 - Math.random() * 60 : Math.random() * h,
    vx: (Math.random() - 0.3) * 0.2, // slight rightward drift like wind
    vy: depthSpeed + Math.random() * 0.2,
    size: depthScale + Math.random() * 0.15,
    depth,
    flipAngle: Math.random() * Math.PI * 2,
    flipSpeed: 0.008 + Math.random() * 0.018, // very slow lazy tumble
    spinAngle: Math.random() * Math.PI * 2,
    spinSpeed: 0.003 + Math.random() * 0.008,
    swayPhase: Math.random() * Math.PI * 2,
    swayFreq: 0.006 + Math.random() * 0.008,
    swayAmp: 0.2 + Math.random() * 0.4,
    gustOffset: Math.random() * 100,
    a: depthAlpha + Math.random() * 0.15,
    petalIdx: Math.floor(Math.random() * tc),
  };
}

/* ── Burst petals for send ───────────────────────────────────────── */

interface BurstPetal extends Petal {
  burstVx: number;
  burstVy: number;
}

function spawnBurstPetal(cx: number, cy: number, tc: number): BurstPetal {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2 + Math.random() * 5;
  const p = spawnPetal(0, 0, tc);
  return {
    ...p,
    x: cx,
    y: cy,
    depth: 1,
    size: 0.5 + Math.random() * 0.5,
    a: 0.7 + Math.random() * 0.3,
    flipSpeed: 0.025 + Math.random() * 0.04,
    burstVx: Math.cos(angle) * speed,
    burstVy: Math.sin(angle) * speed - 1.5,
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
  const initializedRef = useRef(false);
  const timeRef = useRef(0);

  const triggerBurst = useCallback((cx: number, cy: number, count: number) => {
    const tc = texturesRef.current.length || 8;
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
    texturesRef.current = createPetalTextures(8, 14);

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

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = visibleRef.current;
        visibleRef.current = entry.isIntersecting;

        // First time visible — seed with petals already mid-fall
        if (entry.isIntersecting && !initializedRef.current) {
          initializedRef.current = true;
          const w = canvas.width / (window.devicePixelRatio || 1);
          const h = canvas.height / (window.devicePixelRatio || 1);
          const tc = texturesRef.current.length;
          for (let i = 0; i < 25; i++) {
            petalsRef.current.push(spawnPetal(w, h, tc, false));
          }
        }
        // Re-entering view — add a few
        if (entry.isIntersecting && !wasVisible && initializedRef.current) {
          const w = canvas.width / (window.devicePixelRatio || 1);
          const h = canvas.height / (window.devicePixelRatio || 1);
          const tc = texturesRef.current.length;
          for (let i = 0; i < 8; i++) {
            petalsRef.current.push(spawnPetal(w, h, tc, true));
          }
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(wrapper);

    const animate = () => {
      if (cancelled) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const now = performance.now();
      timeRef.current = now;
      const textures = texturesRef.current;
      const tc = textures.length || 8;

      // Gentle wind wave — shared across all petals
      const windX = Math.sin(now * 0.0004) * 0.3 + Math.sin(now * 0.00015) * 0.15;

      // Continuous spawn — dense like Shinkai
      if (visibleRef.current && now - spawnTimerRef.current > 180) {
        spawnTimerRef.current = now;
        petalsRef.current.push(spawnPetal(w, h, tc, true));
      }

      // Cap for performance
      if (petalsRef.current.length > 80) {
        petalsRef.current.splice(0, petalsRef.current.length - 80);
      }

      // Sort by depth so background draws first
      const petals = petalsRef.current;

      // Draw background petals first, then mid, then foreground
      for (let layer = 0; layer <= 2; layer++) {
        for (let i = petals.length - 1; i >= 0; i--) {
          const p = petals[i];
          if (p.depth !== layer) continue;

          // S-curve drift
          p.swayPhase += p.swayFreq;
          const sway = Math.sin(p.swayPhase) * p.swayAmp;
          const gustWave = Math.sin(now * 0.0003 + p.gustOffset) * 0.12;

          p.x += p.vx + sway + windX + gustWave;
          p.y += p.vy;

          // Very slow lazy tumble
          p.flipAngle += p.flipSpeed;
          p.spinAngle += p.spinSpeed;

          // Very slow fade
          p.a -= 0.0005;

          if (p.a <= 0 || p.y > h + 30) {
            petals.splice(i, 1);
            continue;
          }

          drawPetal(ctx, p, textures, layer === 2);
        }
      }

      // Burst petals
      const bursts = burstRef.current;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const bp = bursts[i];
        bp.x += bp.burstVx;
        bp.y += bp.burstVy;
        bp.burstVx *= 0.97;
        bp.burstVy *= 0.97;
        bp.burstVy += 0.06;
        bp.flipAngle += bp.flipSpeed;
        bp.spinAngle += bp.spinSpeed;
        bp.a -= 0.006;

        if (bp.a <= 0 || bp.y > h + 30 || bp.x < -40 || bp.x > w + 40) {
          bursts.splice(i, 1);
          continue;
        }
        drawPetal(ctx, bp, textures, false);
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

  // Extra petals while typing
  const onInteract = useCallback(() => {
    if (Math.random() < 0.2) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const tc = texturesRef.current.length || 8;
      petalsRef.current.push(spawnPetal(w, h, tc, true));
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // Burst from send button
    const btn = e.currentTarget.querySelector("button[type=submit]") as HTMLElement;
    const canvas = canvasRef.current;
    if (btn && canvas) {
      const btnRect = btn.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      triggerBurst(
        btnRect.left - canvasRect.left + btnRect.width / 2,
        btnRect.top - canvasRect.top + btnRect.height / 2,
        35
      );
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

  return (
    <div ref={wrapperRef} className="relative">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10"
      />
      {sent ? (
        <div className="relative flex min-h-[320px] flex-col items-center justify-center border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-10 text-center">
          <p
            className="text-2xl text-stone-800 md:text-3xl"
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              letterSpacing: "-0.01em",
              lineHeight: 1.4,
              animation: "fadeInUp 0.8s ease-out both",
            }}
          >
            Thank you for reaching out.
          </p>
          <p
            className="mt-4 max-w-sm text-sm leading-7 text-stone-500"
            style={{ animation: "fadeInUp 0.8s ease-out 0.3s both" }}
          >
            We received your message and will get back to you soon.
            We look forward to the conversation ahead.
          </p>
          <div
            className="mt-8 h-px w-16 bg-stone-200"
            style={{ animation: "fadeInUp 0.8s ease-out 0.5s both" }}
          />
          <button
            onClick={() => setSent(false)}
            className="mt-6 text-sm text-stone-400 underline underline-offset-4 transition hover:text-stone-800"
            style={{ animation: "fadeInUp 0.8s ease-out 0.6s both" }}
          >
            Send another message
          </button>
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      ) : (
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
      )}
    </div>
  );
}

/* ── Draw petal with 3D tumble ───────────────────────────────────── */

function drawPetal(
  ctx: CanvasRenderingContext2D,
  p: Petal,
  textures: HTMLCanvasElement[],
  isForeground: boolean
) {
  const tex = textures[p.petalIdx % textures.length];
  if (!tex) return;

  const flipScale = Math.cos(p.flipAngle);
  const absFlip = Math.abs(flipScale);

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spinAngle);
  ctx.scale(flipScale * p.size, p.size);

  // Foreground petals get a slight blur effect via extra transparency
  const layerAlpha = isForeground ? p.a * 0.7 : p.a;
  ctx.globalAlpha = layerAlpha * Math.max(absFlip, 0.08);

  const dpr = window.devicePixelRatio || 1;
  const tw = tex.width / dpr;
  const th = tex.height / dpr;
  ctx.drawImage(tex, -tw / 2, -th / 2, tw, th);

  // Foreground petals: draw again slightly offset for a soft/bokeh feel
  if (isForeground && absFlip > 0.3) {
    ctx.globalAlpha = layerAlpha * 0.2;
    ctx.drawImage(tex, -tw / 2 + 0.5, -th / 2 + 0.5, tw + 1, th + 1);
  }

  ctx.restore();
}
