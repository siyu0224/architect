"use client";

import { useEffect, useState, useRef } from "react";

/**
 * 银河 Loading Screen — silver galaxy particle text.
 * 1. Red 高 logo fades in first
 * 2. Particles form "GAO ARCHITECT" letter by letter
 * 3. Mouse cursor leaves a comet trail + bounces particles
 * 4. Click to scatter particles outward and reveal the site
 */

interface Dot {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  charIdx: number;
  twinkle: number;
  shade: number;
}

interface Trail {
  x: number;
  y: number;
  a: number;
  r: number;
}

const SILVER = [
  [200, 205, 215],
  [220, 225, 235],
  [175, 185, 205],
  [230, 230, 240],
];

const FADE_MS = 900;
const MOUSE_RADIUS = 120;

export function LoadingScreen() {
  const [phase, setPhase] = useState<"active" | "exploding" | "fading" | "gone">("active");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const phaseRef = useRef<"active" | "exploding" | "fading" | "gone">("active");
  const trailRef = useRef<Trail[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    const handleMove = (x: number, y: number) => {
      const prev = mouseRef.current;
      mouseRef.current = { x, y };
      if (prev.x > -999 && phaseRef.current === "active") {
        for (let i = 0; i < 2; i++) {
          trailRef.current.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            a: 0.5,
            r: 0.8 + Math.random() * 1.2,
          });
        }
        if (trailRef.current.length > 60) trailRef.current.splice(0, 4);
      }
    };
    const onMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) handleMove(t.clientX, t.clientY);
    };
    const onTouchEnd = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    const onClick = () => {
      if (phaseRef.current !== "active") return;
      phaseRef.current = "exploding";
      setPhase("exploding");
      // After explosion animation, fade out
      setTimeout(() => {
        phaseRef.current = "fading";
        setPhase("fading");
        setTimeout(() => {
          phaseRef.current = "gone";
          setPhase("gone");
        }, FADE_MS);
      }, 800);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("click", onClick);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    const run = async () => {
      try { await document.fonts.ready; } catch {}
      await new Promise((r) => requestAnimationFrame(r));
      if (cancelled) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";

      // --- Sample text ---
      const mainText = "GAO  ARCHITECT";
      const fontSize = Math.min(W * 0.055, H * 0.08, 64);
      const font = `300 ${fontSize}px system-ui, -apple-system, "Helvetica Neue", sans-serif`;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.font = font;
      ctx.textBaseline = "middle";

      const spacing = fontSize * 0.25;
      let totalTextW = 0;
      const charWidths: number[] = [];
      for (const ch of mainText) {
        const w = ctx.measureText(ch).width;
        charWidths.push(w);
        totalTextW += w + spacing;
      }
      totalTextW -= spacing;

      const startX = (W - totalTextW) / 2;
      const centerY = H / 2 + 20; // offset down for logo above
      const step = Math.max(1, Math.round(dpr * 0.8));
      const dots: Dot[] = [];
      const scatter = Math.max(W, H) * 0.45;

      let curX = startX;
      for (let ci = 0; ci < mainText.length; ci++) {
        const ch = mainText[ci];
        const cw = charWidths[ci];

        if (ch === " ") {
          curX += cw + spacing;
          continue;
        }

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#000";
        ctx.fillText(ch, curX, centerY);

        const x0 = Math.max(0, Math.floor((curX - 5) * dpr));
        const x1 = Math.min(W * dpr, Math.ceil((curX + cw + 5) * dpr));
        const y0 = Math.max(0, Math.floor((centerY - fontSize * 0.7) * dpr));
        const y1 = Math.min(H * dpr, Math.ceil((centerY + fontSize * 0.7) * dpr));
        const region = ctx.getImageData(x0, y0, x1 - x0, y1 - y0);
        const rw = x1 - x0;

        for (let py = 0; py < y1 - y0; py += step) {
          for (let px = 0; px < rw; px += step) {
            if (region.data[(py * rw + px) * 4 + 3] > 50) {
              const worldX = (x0 + px) / dpr;
              const worldY = (y0 + py) / dpr;
              const angle = Math.random() * Math.PI * 2;
              const dist = Math.random() * scatter + scatter * 0.1;

              dots.push({
                x: W / 2 + Math.cos(angle) * dist,
                y: H / 2 + Math.sin(angle) * dist,
                tx: worldX,
                ty: worldY,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                r: 0.7 + Math.random() * 0.6,
                a: 0,
                charIdx: ci,
                twinkle: Math.random() * Math.PI * 2,
                shade: Math.floor(Math.random() * SILVER.length),
              });
            }
          }
        }

        curX += cw + spacing;
      }

      ctx.restore();
      ctx.clearRect(0, 0, W * dpr, H * dpr);

      const perChar = 0.22;
      const t0 = performance.now();
      let explodeT0 = 0;

      const animate = () => {
        if (cancelled) return;
        const now = performance.now();
        const elapsed = (now - t0) / 1000;
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const currentPhase = phaseRef.current;

        if (currentPhase === "gone") return;

        // Handle explosion start
        if (currentPhase === "exploding" && explodeT0 === 0) {
          explodeT0 = now;
          // Give each dot an outward velocity from center
          for (const d of dots) {
            const dx = d.x - W / 2;
            const dy = d.y - H / 2;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            d.vx = (dx / dist) * (8 + Math.random() * 12);
            d.vy = (dy / dist) * (8 + Math.random() * 12);
          }
        }

        ctx.clearRect(0, 0, W * dpr, H * dpr);
        ctx.save();
        ctx.scale(dpr, dpr);

        // --- Draw cursor trail ---
        const trails = trailRef.current;
        for (let i = trails.length - 1; i >= 0; i--) {
          const tr = trails[i];
          tr.a -= 0.02;
          if (tr.a <= 0) {
            trails.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(tr.x, tr.y, tr.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(210, 215, 230, ${tr.a * 0.6})`;
          ctx.fill();
        }

        // --- Draw dots ---
        for (const d of dots) {
          const charStart = d.charIdx * perChar;
          const c = SILVER[d.shade];
          const twinkle = 0.85 + 0.15 * Math.sin(elapsed * 2.5 + d.twinkle);

          if (currentPhase === "exploding" || currentPhase === "fading") {
            // Explosion: fly outward, fade out
            d.x += d.vx;
            d.y += d.vy;
            d.vx *= 0.97;
            d.vy *= 0.97;
            d.a = Math.max(d.a - 0.025, 0);

            if (d.a > 0.01) {
              ctx.beginPath();
              ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${d.a})`;
              ctx.fill();
            }
            continue;
          }

          if (elapsed < charStart) {
            // Floating scattered ghost
            d.x += d.vx * 0.25;
            d.y += d.vy * 0.25;
            if (d.x < -30 || d.x > W + 30) d.vx *= -1;
            if (d.y < -30 || d.y > H + 30) d.vy *= -1;
            d.a = Math.min(d.a + 0.005, 0.18);

            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${d.a * 0.15})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${d.a * twinkle})`;
            ctx.fill();
            continue;
          }

          // Smooth glide into position
          d.x += (d.tx - d.x) * 0.045;
          d.y += (d.ty - d.y) * 0.045;

          // Mouse bounce
          const dx = d.x - mx;
          const dy = d.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            d.vx += (dx / dist) * force * 8;
            d.vy += (dy / dist) * force * 8;
          }

          d.vx *= 0.82;
          d.vy *= 0.82;
          d.x += d.vx;
          d.y += d.vy;

          const progress = Math.min((elapsed - charStart) / 1.2, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          d.a = Math.min(d.a + 0.04, 0.6 + ease * 0.4);

          const alpha = d.a * twinkle;

          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
          ctx.fill();
        }

        ctx.restore();
        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      style={{
        background: "#0c0c14",
        opacity: phase === "fading" ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
        cursor: "pointer",
      }}
    >

      <canvas ref={canvasRef} className="block" />

      <p
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em]"
        style={{
          color: "rgba(200, 205, 215, 0.25)",
          animation: "fadeInLogo 1.5s ease-out 4s both",
          opacity: phase === "exploding" || phase === "fading" ? 0 : undefined,
          transition: "opacity 0.3s ease-out",
        }}
      >
        Tap to enter
      </p>
    </div>
  );
}
