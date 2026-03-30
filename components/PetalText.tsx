"use client";

import { useEffect, useRef } from "react";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

/**
 * PetalText — Pretext-rendered text with cherry blossom petals drifting through.
 * When petals pass near characters, characters ripple outward and spring back.
 */

/* ── Petal ────────────────────────────────────────────────────────── */

interface Petal {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  flipAngle: number; flipSpeed: number;
  spinAngle: number; spinSpeed: number;
  swayPhase: number; swayFreq: number; swayAmp: number;
  a: number;
  color: readonly [number, number, number];
}

const PETAL_COLORS: readonly (readonly [number, number, number])[] = [
  [245, 185, 195], [240, 175, 188], [248, 195, 200],
  [238, 178, 190], [242, 188, 195], [250, 195, 200],
];

function spawnPetal(w: number, h: number): Petal {
  return {
    x: Math.random() * w * 1.2 - w * 0.1,
    y: -10 - Math.random() * 40,
    vx: (Math.random() - 0.3) * 0.2,
    vy: 0.3 + Math.random() * 0.5,
    size: 0.4 + Math.random() * 0.4,
    flipAngle: Math.random() * Math.PI * 2,
    flipSpeed: 0.01 + Math.random() * 0.02,
    spinAngle: Math.random() * Math.PI * 2,
    spinSpeed: 0.004 + Math.random() * 0.008,
    swayPhase: Math.random() * Math.PI * 2,
    swayFreq: 0.006 + Math.random() * 0.008,
    swayAmp: 0.25 + Math.random() * 0.4,
    a: 0.6 + Math.random() * 0.3,
    color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
  };
}

/* ── Character ───────────────────────────────────────────────────── */

interface Char {
  ch: string;
  hx: number; hy: number;
  ox: number; oy: number;
  vx: number; vy: number;
  font: string;
  color: string;
}

/* ── Pre-rendered petal texture ───────────────────────────────────── */

function createPetalTexture(maxSize: number): HTMLCanvasElement {
  const dpr = window.devicePixelRatio || 1;
  const c = document.createElement("canvas");
  const sz = maxSize;
  c.width = sz * 2.2 * dpr;
  c.height = sz * 2.8 * dpr;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.scale(dpr, dpr);
  const cx = sz * 1.1, cy = sz * 1.2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, -sz * 0.9);
  ctx.bezierCurveTo(sz * 0.55, -sz * 0.7, sz * 0.5, sz * 0.1, sz * 0.12, sz * 0.55);
  ctx.quadraticCurveTo(sz * 0.04, sz * 0.7, 0, sz * 0.58);
  ctx.quadraticCurveTo(-sz * 0.04, sz * 0.7, -sz * 0.12, sz * 0.55);
  ctx.bezierCurveTo(-sz * 0.5, sz * 0.1, -sz * 0.55, -sz * 0.7, 0, -sz * 0.9);
  ctx.closePath();
  const grad = ctx.createRadialGradient(0, -sz * 0.15, sz * 0.05, 0, 0, sz * 0.85);
  grad.addColorStop(0, "rgba(255, 235, 240, 1)");
  grad.addColorStop(0.35, "rgba(248, 200, 210, 0.95)");
  grad.addColorStop(0.7, "rgba(242, 185, 195, 0.85)");
  grad.addColorStop(1, "rgba(238, 175, 188, 0.7)");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
  return c;
}

/* ── Component ───────────────────────────────────────────────────── */

type Props = {
  label?: string;
  heading: string;
  body: string;
  email?: string;
  className?: string;
};

export function PetalText({ label, heading, body, email, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<Char[]>([]);
  const petalsRef = useRef<Petal[]>([]);
  const texRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const spawnRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;

    texRef.current = createPetalTexture(14);

    const headingSize = 28;
    const bodySize = 14.5;
    const emailSize = 14;
    const headingFont = `400 ${headingSize}px system-ui, -apple-system, "Helvetica Neue", sans-serif`;
    const bodyFont = `400 ${bodySize}px system-ui, -apple-system, "Helvetica Neue", sans-serif`;
    const emailFont = `400 ${emailSize}px system-ui, -apple-system, "Helvetica Neue", sans-serif`;
    const headingLH = headingSize * 1.35;
    const bodyLH = bodySize * 1.85;

    const doLayout = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = container.offsetWidth;
      const chars: Char[] = [];
      let curY = 0;

      // Label
      if (label) {
        ctx.font = "400 10px system-ui, -apple-system, sans-serif";
        let x = 0;
        for (const ch of label.toUpperCase()) {
          const w = ctx.measureText(ch).width;
          chars.push({ ch, hx: x, hy: curY, ox: 0, oy: 0, vx: 0, vy: 0, font: "400 10px system-ui", color: "#a8a29e" });
          x += w + 3.5;
        }
        curY += 28;
      }

      // Heading
      const hPrep = prepareWithSegments(heading, headingFont);
      const hLayout = layoutWithLines(hPrep, W, headingLH);
      ctx.font = headingFont;
      for (let li = 0; li < hLayout.lines.length; li++) {
        const lt = hLayout.lines[li].text;
        const y = curY + li * headingLH;
        let x = 0;
        for (const ch of lt) {
          const w = ctx.measureText(ch).width;
          chars.push({ ch, hx: x, hy: y, ox: 0, oy: 0, vx: 0, vy: 0, font: headingFont, color: "#1c1917" });
          x += w;
        }
      }
      curY += hLayout.lines.length * headingLH + 24;

      // Body
      const bPrep = prepareWithSegments(body, bodyFont);
      const bLayout = layoutWithLines(bPrep, Math.min(W, 420), bodyLH);
      ctx.font = bodyFont;
      for (let li = 0; li < bLayout.lines.length; li++) {
        const lt = bLayout.lines[li].text;
        const y = curY + li * bodyLH;
        let x = 0;
        for (const ch of lt) {
          const w = ctx.measureText(ch).width;
          chars.push({ ch, hx: x, hy: y, ox: 0, oy: 0, vx: 0, vy: 0, font: bodyFont, color: "#78716c" });
          x += w;
        }
      }
      curY += bLayout.lines.length * bodyLH + 32;

      // "Contact" label + email
      if (email) {
        // Divider line space
        curY += 8;
        ctx.font = "400 10px system-ui";
        let x = 0;
        for (const ch of "CONTACT") {
          const w = ctx.measureText(ch).width;
          chars.push({ ch, hx: x, hy: curY, ox: 0, oy: 0, vx: 0, vy: 0, font: "400 10px system-ui", color: "#a8a29e" });
          x += w + 3.5;
        }
        curY += 24;

        ctx.font = emailFont;
        x = 0;
        for (const ch of email) {
          const w = ctx.measureText(ch).width;
          chars.push({ ch, hx: x, hy: curY, ox: 0, oy: 0, vx: 0, vy: 0, font: emailFont, color: "#1c1917" });
          x += w;
        }
        curY += 30;
      }

      charsRef.current = chars;

      const totalH = curY + 20;
      canvas.width = W * dpr;
      canvas.height = totalH * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = totalH + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      if (cancelled) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      const now = performance.now();

      // Spawn petals
      if (now - spawnRef.current > 250) {
        spawnRef.current = now;
        petalsRef.current.push(spawnPetal(w, h));
      }
      if (petalsRef.current.length > 40) {
        petalsRef.current.splice(0, petalsRef.current.length - 40);
      }

      // Wind
      const windX = Math.sin(now * 0.0004) * 0.3;

      // Update petals
      const petals = petalsRef.current;
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.swayPhase += p.swayFreq;
        p.x += p.vx + Math.sin(p.swayPhase) * p.swayAmp + windX;
        p.y += p.vy;
        p.flipAngle += p.flipSpeed;
        p.spinAngle += p.spinSpeed;
        p.a -= 0.0006;
        if (p.a <= 0 || p.y > h + 20) {
          petals.splice(i, 1);
        }
      }

      // Characters: spring physics + petal ripple
      const chars = charsRef.current;
      for (const c of chars) {
        // Check nearby petals → push character
        for (const p of petals) {
          const dx = (c.hx + c.ox) - p.x;
          const dy = (c.hy + c.oy) - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const rippleR = 25;
          if (dist < rippleR && dist > 0) {
            const force = (rippleR - dist) / rippleR;
            c.vx += (dx / dist) * force * 0.4;
            c.vy += (dy / dist) * force * 0.3;
          }
        }

        // Spring back
        c.vx += -c.ox * 0.06;
        c.vy += -c.oy * 0.06;
        c.vx *= 0.9;
        c.vy *= 0.9;
        c.ox += c.vx;
        c.oy += c.vy;

        // Draw
        ctx.font = c.font;
        ctx.textBaseline = "top";
        ctx.fillStyle = c.color;
        ctx.fillText(c.ch, c.hx + c.ox, c.hy + c.oy);
      }

      // Draw petals on top
      const tex = texRef.current;
      if (tex) {
        for (const p of petals) {
          const flipScale = Math.cos(p.flipAngle);
          const absFlip = Math.abs(flipScale);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.spinAngle);
          ctx.scale(flipScale * p.size, p.size);
          ctx.globalAlpha = p.a * Math.max(absFlip, 0.1);
          const tw = tex.width / dpr;
          const th = tex.height / dpr;
          ctx.drawImage(tex, -tw / 2, -th / 2, tw, th);
          ctx.restore();
        }
      }

      // Draw divider line before "Contact" label
      if (email) {
        const contactLabel = chars.find(c => c.font === "400 10px system-ui" && c.ch === "C" && c.hy > 100);
        if (contactLabel) {
          ctx.beginPath();
          ctx.moveTo(0, contactLabel.hy - 10);
          ctx.lineTo(w, contactLabel.hy - 10);
          ctx.strokeStyle = "rgba(200, 195, 185, 0.3)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    try { doLayout(); } catch {}
    rafRef.current = requestAnimationFrame(render);
    const onResize = () => { try { doLayout(); } catch {} };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [label, heading, body, email]);

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} />
    </div>
  );
}
