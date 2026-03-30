"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  prepareWithSegments,
  layoutNextLine,
  type LayoutCursor,
} from "@chenglou/pretext";

/**
 * GardenOverlay — Dark canvas with Pretext-rendered text that reflows
 * around glowing flowers. Inspired by Lichin Lin's "Text, with Love".
 */

/* ── Plant ───────────────────────────────────────────────────────── */

type PlantStyle = "bamboo" | "flower";

interface Plant {
  x: number; y: number;
  t0: number;
  seed: number;
  hue: number;
  stemH: number;
  stemCurve: number;
  petalCount: number;
  petalSize: number;
  style: PlantStyle;
}

function rand(s: number, i: number): number {
  const x = Math.sin(s * 9301 + i * 49297 + 233280) * 49297;
  return x - Math.floor(x);
}

function spawnPlant(x: number, y: number): Plant {
  const s = Math.random() * 1000;
  const isBamboo = Math.random() < 0.45;

  if (isBamboo) {
    return {
      x, y, t0: performance.now(), seed: s,
      style: "bamboo",
      hue: 130 + Math.floor(Math.random() * 30),
      stemH: 100 + rand(s, 0) * 80,
      stemCurve: (rand(s, 1) - 0.5) * 12,
      petalCount: 3 + Math.floor(rand(s, 2) * 3),
      petalSize: 12 + rand(s, 3) * 8,
    };
  }

  const flowerHues = [280, 300, 320, 340, 30, 45, 200];
  return {
    x, y, t0: performance.now(), seed: s,
    style: "flower",
    hue: flowerHues[Math.floor(Math.random() * flowerHues.length)],
    stemH: 80 + rand(s, 0) * 70,
    stemCurve: (rand(s, 1) - 0.5) * 25,
    petalCount: 5 + Math.floor(rand(s, 2) * 3),
    petalSize: 15 + rand(s, 3) * 12,
  };
}

function spawnCluster(x: number, y: number): Plant[] {
  const count = 1 + Math.floor(Math.random() * 2);
  const now = performance.now();
  const plants: Plant[] = [];
  for (let i = 0; i < count; i++) {
    const p = spawnPlant(x + (Math.random() - 0.5) * 40, y);
    p.t0 = now + i * 200;
    plants.push(p);
  }
  return plants;
}

/** Get the column this plant occupies at a given y */
function getPlantColumnAt(p: Plant, y: number, now: number): { left: number; right: number } | null {
  const t = (now - p.t0) / 1000;
  if (t < 0 || t > 12) return null;
  const fade = t > 10 ? 1 - (t - 10) / 2 : 1;
  if (fade <= 0) return null;

  const grow = Math.min(t / 0.8, 1);
  const e = 1 - Math.pow(1 - grow, 3);
  const h = p.stemH * e;
  const topY = p.y - h - p.petalSize - 10;
  const bottomY = p.y + 5;
  if (y < topY || y > bottomY) return null;

  const relY = (y - topY) / (bottomY - topY);
  const stemX = p.x + p.stemCurve * (1 - relY) * e;
  // Column width — enough to keep text clear of petals and stem
  const halfW = relY < 0.25 ? p.petalSize * 0.7 + 3 : 5;
  return { left: stemX - halfW, right: stemX + halfW };
}

function drawPlant(ctx: CanvasRenderingContext2D, p: Plant, now: number): boolean {
  if (p.style === "flower") return drawFlowerStyle(ctx, p, now);
  return drawBambooStyle(ctx, p, now);
}

function drawFlowerStyle(ctx: CanvasRenderingContext2D, p: Plant, now: number): boolean {
  const t = (now - p.t0) / 1000;
  if (t < 0) return true;
  if (t > 12) return false;
  const fade = t > 10 ? Math.max(0, 1 - (t - 10) / 2) : 1;
  if (fade <= 0) return false;

  const grow = Math.min(t / 0.8, 1);
  const bloomP = Math.max(0, Math.min((t - 0.5) / 0.8, 1));
  const e = 1 - Math.pow(1 - grow, 3);
  const bE = 1 - Math.pow(1 - bloomP, 2);

  ctx.save();
  ctx.globalAlpha = fade;

  const h = p.stemH * e;
  const tipX = p.x + p.stemCurve * e;
  const tipY = p.y - h;
  const ctrlX = p.x + p.stemCurve * 0.4;
  const ctrlY = p.y - h * 0.5;
  const hue = p.hue;

  // Stem
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
  ctx.strokeStyle = `hsla(120, 30%, 35%, ${0.6 * fade})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Leaf
  if (grow > 0.3) {
    const ls = 8 * Math.min((grow - 0.3) / 0.3, 1);
    const lt = 0.35;
    const lx = p.x * (1 - lt) + ctrlX * lt;
    const ly = p.y * (1 - lt) + ctrlY * lt;
    const side = rand(p.seed, 10) > 0.5 ? 1 : -1;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(side * 0.4);
    ctx.scale(side, 1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(ls, -ls * 0.8, ls * 2, 0);
    ctx.quadraticCurveTo(ls, ls * 0.4, 0, 0);
    ctx.fillStyle = `hsla(110, 30%, 30%, ${0.4 * fade})`;
    ctx.fill();
    ctx.restore();
  }

  // Flower head
  if (bloomP > 0) {
    const ps = p.petalSize * bE;

    // Glow
    const glowR = ps * 2.5;
    const glow = ctx.createRadialGradient(tipX, tipY, ps * 0.3, tipX, tipY, glowR);
    glow.addColorStop(0, `hsla(${hue}, 60%, 65%, ${0.15 * bE * fade})`);
    glow.addColorStop(0.5, `hsla(${hue}, 50%, 60%, ${0.06 * bE * fade})`);
    glow.addColorStop(1, `hsla(${hue}, 40%, 55%, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(tipX - glowR, tipY - glowR, glowR * 2, glowR * 2);

    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(rand(p.seed, 20) * Math.PI * 2);

    for (let i = 0; i < p.petalCount; i++) {
      const angle = (i / p.petalCount) * Math.PI * 2;
      const petalHue = hue + (rand(p.seed, 30 + i) - 0.5) * 20;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(ps * 0.25, -ps * 0.3, ps * 0.7, -ps * 0.35, ps * 0.95, 0);
      ctx.bezierCurveTo(ps * 0.7, ps * 0.35, ps * 0.25, ps * 0.3, 0, 0);
      const pg = ctx.createRadialGradient(ps * 0.2, 0, 0, ps * 0.5, 0, ps);
      pg.addColorStop(0, `hsla(${petalHue}, 55%, 70%, ${0.85 * bE * fade})`);
      pg.addColorStop(0.6, `hsla(${petalHue}, 50%, 60%, ${0.55 * bE * fade})`);
      pg.addColorStop(1, `hsla(${petalHue}, 45%, 50%, ${0.2 * bE * fade})`);
      ctx.fillStyle = pg;
      ctx.fill();
      ctx.restore();
    }

    // Center
    ctx.beginPath();
    ctx.arc(0, 0, ps * 0.15, 0, Math.PI * 2);
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, ps * 0.15);
    cg.addColorStop(0, `hsla(45, 80%, 80%, ${0.95 * bE * fade})`);
    cg.addColorStop(1, `hsla(40, 70%, 60%, ${0.6 * bE * fade})`);
    ctx.fillStyle = cg;
    ctx.fill();

    for (let i = 0; i < 6; i++) {
      const sa = (i / 6) * Math.PI * 2;
      const sr = ps * 0.22;
      ctx.beginPath();
      ctx.arc(Math.cos(sa) * sr, Math.sin(sa) * sr, 1, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(50, 70%, 75%, ${0.7 * bE * fade})`;
      ctx.fill();
    }

    ctx.restore();
  }

  ctx.restore();
  return true;
}

function drawBambooStyle(ctx: CanvasRenderingContext2D, p: Plant, now: number): boolean {
  const t = (now - p.t0) / 1000;
  if (t < 0) return true;
  if (t > 12) return false;
  const fade = t > 10 ? Math.max(0, 1 - (t - 10) / 2) : 1;
  if (fade <= 0) return false;

  const grow = Math.min(t / 0.9, 1);
  const leafP = Math.max(0, Math.min((t - 0.4) / 0.8, 1));
  const e = 1 - Math.pow(1 - grow, 3);
  const lE = 1 - Math.pow(1 - leafP, 2);
  const s = p.seed;
  const hue = p.hue;

  ctx.save();
  ctx.globalAlpha = fade;

  const h = p.stemH * e;
  const tipX = p.x + p.stemCurve * e;
  const tipY = p.y - h;

  // ── Bamboo stalk — segmented with nodes ──
  const nodeCount = 3 + Math.floor(rand(s, 5) * 3);
  const segH = h / nodeCount;

  for (let i = 0; i < nodeCount; i++) {
    const segGrow = Math.max(0, Math.min((grow - i * 0.08) / 0.25, 1));
    if (segGrow <= 0) break;
    const sE = 1 - Math.pow(1 - segGrow, 2);

    const segBot = p.y - i * segH;
    const segTop = p.y - (i + sE) * segH;
    const xOff = p.stemCurve * ((i + 0.5) / nodeCount) * e;
    const botX = p.x + p.stemCurve * (i / nodeCount) * e;
    const topX = p.x + xOff;

    // Stalk segment — gradient fill for depth
    const stalkW = 3.5 - i * 0.3;
    ctx.beginPath();
    ctx.moveTo(botX - stalkW / 2, segBot);
    ctx.lineTo(topX - stalkW / 2, segTop);
    ctx.lineTo(topX + stalkW / 2, segTop);
    ctx.lineTo(botX + stalkW / 2, segBot);
    ctx.closePath();

    const sg = ctx.createLinearGradient(botX - stalkW, segBot, botX + stalkW, segBot);
    sg.addColorStop(0, `hsla(${hue}, 35%, 42%, ${0.5 * fade})`);
    sg.addColorStop(0.3, `hsla(${hue}, 40%, 55%, ${0.65 * fade})`);
    sg.addColorStop(0.7, `hsla(${hue}, 38%, 48%, ${0.6 * fade})`);
    sg.addColorStop(1, `hsla(${hue}, 30%, 38%, ${0.45 * fade})`);
    ctx.fillStyle = sg;
    ctx.fill();

    // Node ring
    if (i > 0 && segGrow > 0.5) {
      ctx.beginPath();
      ctx.ellipse(botX, segBot, stalkW * 0.8, 1.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 25%, 38%, ${0.4 * fade})`;
      ctx.fill();
    }

    // Soft glow around stalk
    if (i === 0) {
      const glowR = 15;
      const glow = ctx.createRadialGradient(botX, (segBot + segTop) / 2, 2, botX, (segBot + segTop) / 2, glowR);
      glow.addColorStop(0, `hsla(${hue}, 40%, 55%, ${0.06 * fade})`);
      glow.addColorStop(1, `hsla(${hue}, 30%, 50%, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(botX - glowR, segTop - glowR, glowR * 2, segBot - segTop + glowR * 2);
    }
  }

  // ── Bamboo leaves — long, tapered, graceful ──
  if (leafP > 0) {
    // Leaves sprout from nodes
    const leafNodes = [0.3, 0.5, 0.7, 0.85, 1.0];
    for (let li = 0; li < p.petalCount + 2; li++) {
      const leafDelay = Math.max(0, Math.min((leafP - li * 0.08) / 0.5, 1));
      if (leafDelay <= 0) continue;
      const ldE = 1 - Math.pow(1 - leafDelay, 2);

      const nodeT = leafNodes[li % leafNodes.length] + (rand(s, 20 + li) - 0.5) * 0.1;
      const clampT = Math.min(Math.max(nodeT, 0.1), 0.95);
      const nx = p.x + p.stemCurve * clampT * e;
      const ny = p.y - h * clampT;

      const side = rand(s, 30 + li) > 0.5 ? 1 : -1;
      const leafLen = (18 + rand(s, 40 + li) * 14) * ldE;
      const droop = (rand(s, 50 + li) - 0.3) * 0.6; // slight downward curve
      const spread = side * (0.15 + rand(s, 60 + li) * 0.35);

      const leafHue = hue + (rand(s, 70 + li) - 0.5) * 15;

      ctx.save();
      ctx.translate(nx, ny);
      ctx.rotate(spread + droop);

      // Bamboo leaf shape — long, tapered
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        leafLen * 0.2, -leafLen * 0.08 * side,
        leafLen * 0.6, -leafLen * 0.06 * side,
        leafLen, leafLen * 0.02
      );
      ctx.bezierCurveTo(
        leafLen * 0.6, leafLen * 0.08 * side,
        leafLen * 0.2, leafLen * 0.06 * side,
        0, 0
      );

      // Gradient fill — light inner, darker edge
      const lg = ctx.createLinearGradient(0, -leafLen * 0.06, leafLen, leafLen * 0.06);
      lg.addColorStop(0, `hsla(${leafHue}, 40%, 52%, ${0.6 * ldE * fade})`);
      lg.addColorStop(0.4, `hsla(${leafHue}, 45%, 58%, ${0.7 * ldE * fade})`);
      lg.addColorStop(1, `hsla(${leafHue}, 35%, 45%, ${0.35 * ldE * fade})`);
      ctx.fillStyle = lg;
      ctx.fill();

      // Center vein
      ctx.beginPath();
      ctx.moveTo(leafLen * 0.05, 0);
      ctx.lineTo(leafLen * 0.9, leafLen * 0.01);
      ctx.strokeStyle = `hsla(${leafHue}, 30%, 40%, ${0.2 * ldE * fade})`;
      ctx.lineWidth = 0.4;
      ctx.stroke();

      ctx.restore();
    }

    // Soft glow at top where leaves cluster
    const glowR = p.petalSize * 1.5;
    const glow = ctx.createRadialGradient(tipX, tipY + 10, 3, tipX, tipY + 10, glowR);
    glow.addColorStop(0, `hsla(${hue}, 40%, 55%, ${0.08 * lE * fade})`);
    glow.addColorStop(1, `hsla(${hue}, 30%, 50%, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(tipX - glowR, tipY + 10 - glowR, glowR * 2, glowR * 2);
  }

  ctx.restore();
  return true;
}

/* ── Text layout with Pretext ────────────────────────────────────── */

interface TextLine { text: string; x: number; y: number; }

function layoutTextBlock(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number,
  startY: number,
  plants: Plant[],
  now: number,
): { lines: TextLine[]; endY: number } {
  const prepared = prepareWithSegments(text, font);
  const lines: TextLine[] = [];
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = startY;
  const gap = 8;
  const minSegW = 25;

  for (let safety = 0; safety < 300; safety++) {
    // Collect ALL plant columns overlapping this line
    const cols: { left: number; right: number }[] = [];
    for (const p of plants) {
      const col = getPlantColumnAt(p, y + lineHeight / 2, now);
      if (col && col.right > 0 && col.left < maxWidth) {
        cols.push(col);
      }
    }

    if (cols.length === 0) {
      // No plants — full-width line
      const line = layoutNextLine(prepared, cursor, maxWidth);
      if (!line) break;
      lines.push({ text: line.text, x: 0, y });
      cursor = line.end;
    } else {
      // Sort columns left to right
      cols.sort((a, b) => a.left - b.left);

      // Merge overlapping columns
      const merged: { left: number; right: number }[] = [cols[0]];
      for (let i = 1; i < cols.length; i++) {
        const prev = merged[merged.length - 1];
        if (cols[i].left <= prev.right + gap) {
          prev.right = Math.max(prev.right, cols[i].right);
        } else {
          merged.push(cols[i]);
        }
      }

      // Build text segments between plant columns
      // Segments: [0, col1.left], [col1.right, col2.left], ..., [lastCol.right, maxWidth]
      const segments: { x: number; w: number }[] = [];

      // Left of first plant
      const firstLeft = merged[0].left - gap;
      if (firstLeft > minSegW) {
        segments.push({ x: 0, w: firstLeft });
      }

      // Between plants
      for (let i = 0; i < merged.length - 1; i++) {
        const segX = merged[i].right + gap;
        const segW = merged[i + 1].left - gap - segX;
        if (segW > minSegW) {
          segments.push({ x: segX, w: segW });
        }
      }

      // Right of last plant
      const lastRight = merged[merged.length - 1].right + gap;
      const rightW = maxWidth - lastRight;
      if (rightW > minSegW) {
        segments.push({ x: lastRight, w: rightW });
      }

      // Fallback: if no valid segments, use full width
      if (segments.length === 0) {
        segments.push({ x: 0, w: maxWidth });
      }

      // Lay out text into each segment
      for (const seg of segments) {
        const line = layoutNextLine(prepared, cursor, seg.w);
        if (!line) break;
        lines.push({ text: line.text, x: seg.x, y });
        cursor = line.end;
      }
    }

    y += lineHeight;
  }

  return { lines, endY: y };
}

/* ── Component ───────────────────────────────────────────────────── */

type Props = {
  heading: string;
  body: string;
  label?: string;
};

export function GardenOverlay({ heading, body, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const plantsRef = useRef<Plant[]>([]);
  const rafRef = useRef(0);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    plantsRef.current.push(...spawnCluster(
      e.clientX - rect.left,
      e.clientY - rect.top,
    ));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;

    const headingSize = 28;
    const bodySize = 15;
    const headingFont = `400 ${headingSize}px system-ui, -apple-system, "Helvetica Neue", sans-serif`;
    const bodyFont = `400 ${bodySize}px system-ui, -apple-system, "Helvetica Neue", sans-serif`;
    const headingLH = headingSize * 1.4;
    const bodyLH = bodySize * 1.95;

    const render = () => {
      if (cancelled) return;
      const dpr = window.devicePixelRatio || 1;
      const W = container.offsetWidth;
      const now = performance.now();
      const plants = plantsRef.current;

      let curY = 0;
      const labelH = label ? 30 : 0;
      curY = labelH;

      // Heading — no reflow (stays readable)
      const hResult = layoutTextBlock(heading, headingFont, W, headingLH, curY, [], now);
      curY = hResult.endY + 22;

      // Layout body with reflow
      const bResult = layoutTextBlock(body, bodyFont, W, bodyLH, curY, plants, now);
      curY = bResult.endY + 24;

      const totalH = Math.max(curY, 200);

      // Size canvas
      canvas.width = W * dpr;
      canvas.height = totalH * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = totalH + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear (transparent — inherits page background)
      ctx.clearRect(0, 0, W, totalH);

      // Draw label
      if (label) {
        ctx.font = "400 10px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = "#a8a29e";
        ctx.textBaseline = "top";
        let lx = 0;
        for (const ch of label.toUpperCase()) {
          ctx.fillText(ch, lx, 8);
          lx += ctx.measureText(ch).width + 3.5;
        }
      }

      // Draw heading lines (light text on dark)
      ctx.textBaseline = "top";
      for (const line of hResult.lines) {
        ctx.font = headingFont;
        ctx.fillStyle = "#1c1917";
        ctx.fillText(line.text, line.x, line.y);
      }

      // Draw body lines
      for (const line of bResult.lines) {
        ctx.font = bodyFont;
        ctx.fillStyle = "#78716c";
        ctx.fillText(line.text, line.x, line.y);
      }

      // Draw plants on top
      for (let i = plants.length - 1; i >= 0; i--) {
        if (!drawPlant(ctx, plants[i], now)) plants.splice(i, 1);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [heading, body, label]);

  return (
    <div ref={containerRef}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="cursor-pointer rounded-lg"
      />
    </div>
  );
}
