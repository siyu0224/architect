"use client";

import { useEffect, useRef, useCallback } from "react";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

/**
 * ClickBloom — Pretext-rendered text with per-character animation.
 * Click to grow a random plant: tree, dandelion, tulip, grass, or blossom branch.
 */

/* ── Character ───────────────────────────────────────────────────── */

interface Char {
  ch: string;
  hx: number; hy: number;
  ox: number; oy: number;
  vx: number; vy: number;
  phase: number; freq: number;
}

/* ── Plant types ─────────────────────────────────────────────────── */

type PlantKind = "tree" | "dandelion" | "tulip" | "grass" | "blossom" | "daisy" | "fern" | "wildflower";

interface Plant {
  kind: PlantKind;
  x: number; y: number;
  t0: number;
  seed: number;
}

const ALL_KINDS: PlantKind[] = [
  "tulip", "blossom", "daisy", "wildflower", // flowers (more likely)
  "tulip", "blossom", "daisy", "wildflower",
  "tree", "dandelion", "grass", "fern",       // others
];

function spawnPlant(x: number, y: number): Plant {
  return {
    kind: ALL_KINDS[Math.floor(Math.random() * ALL_KINDS.length)],
    x, y,
    t0: performance.now(),
    seed: Math.random() * 1000,
  };
}

/** Spawn a cluster of 2-4 plants around a click point */
function spawnCluster(x: number, y: number): Plant[] {
  const count = 2 + Math.floor(Math.random() * 3);
  const plants: Plant[] = [];
  for (let i = 0; i < count; i++) {
    const ox = (Math.random() - 0.5) * 40;
    const oy = (Math.random() - 0.5) * 20;
    const p = spawnPlant(x + ox, y + oy);
    p.t0 += i * 120; // stagger growth
    plants.push(p);
  }
  return plants;
}

/** Seeded pseudo-random for deterministic plant shapes */
function seededRand(seed: number, i: number): number {
  const x = Math.sin(seed * 9301 + i * 49297 + 233280) * 49297;
  return x - Math.floor(x);
}

function drawPlant(ctx: CanvasRenderingContext2D, p: Plant, now: number): boolean {
  const t = (now - p.t0) / 1000;
  if (t > 10) return false;
  const fade = t > 8 ? Math.max(0, 1 - (t - 8) / 2) : 1;
  if (fade <= 0) return false;

  ctx.save();
  ctx.globalAlpha = fade;

  switch (p.kind) {
    case "tree": drawTree(ctx, p, t); break;
    case "dandelion": drawDandelion(ctx, p, t); break;
    case "tulip": drawTulip(ctx, p, t); break;
    case "grass": drawGrass(ctx, p, t); break;
    case "blossom": drawBlossomBranch(ctx, p, t); break;
    case "daisy": drawDaisy(ctx, p, t); break;
    case "fern": drawFern(ctx, p, t); break;
    case "wildflower": drawWildflower(ctx, p, t); break;
  }

  ctx.restore();
  return true;
}

/* ── Tree: trunk that forks into branches with leaf clusters ────── */

function drawTree(ctx: CanvasRenderingContext2D, p: Plant, t: number) {
  const grow = Math.min(t / 0.8, 1);
  const leafGrow = Math.max(0, Math.min((t - 0.5) / 0.7, 1));
  const e = 1 - Math.pow(1 - grow, 3);
  const s = p.seed;

  const trunkH = (45 + seededRand(s, 0) * 30) * e;
  const lean = (seededRand(s, 1) - 0.5) * 12;

  // Trunk
  const tx = p.x + lean;
  const ty = p.y - trunkH;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.quadraticCurveTo(p.x + lean * 0.4, p.y - trunkH * 0.5, tx, ty);
  ctx.strokeStyle = `rgba(120, 105, 85, 0.7)`;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (grow < 0.4) return;

  // 2-3 branches
  const branchCount = 2 + Math.floor(seededRand(s, 2) * 2);
  for (let i = 0; i < branchCount; i++) {
    const bGrow = Math.max(0, Math.min((t - 0.4 - i * 0.15) / 0.5, 1));
    if (bGrow <= 0) continue;
    const bE = 1 - Math.pow(1 - bGrow, 2);

    const angle = -Math.PI / 2 + (i - (branchCount - 1) / 2) * 0.7 + (seededRand(s, 10 + i) - 0.5) * 0.3;
    const bLen = (18 + seededRand(s, 20 + i) * 15) * bE;
    const bx = tx + Math.cos(angle) * bLen;
    const by = ty + Math.sin(angle) * bLen;

    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = `rgba(130, 115, 95, 0.6)`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Leaf cluster at branch tip
    if (leafGrow > 0) {
      const lE = 1 - Math.pow(1 - leafGrow, 2);
      const lr = (5 + seededRand(s, 30 + i) * 4) * lE;
      const gc = [
        130 + Math.floor(seededRand(s, 40 + i) * 30),
        155 + Math.floor(seededRand(s, 50 + i) * 25),
        120 + Math.floor(seededRand(s, 60 + i) * 20),
      ];

      // Draw 3-4 small leaves
      for (let j = 0; j < 3 + Math.floor(seededRand(s, 70 + i) * 2); j++) {
        const la = (j / 4) * Math.PI * 2 + seededRand(s, 80 + i * 10 + j) * 0.8;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(la);
        ctx.beginPath();
        ctx.ellipse(lr * 0.5, 0, lr, lr * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${gc[0]}, ${gc[1]}, ${gc[2]}, ${0.35 * lE})`;
        ctx.fill();
        ctx.restore();
      }
    }
  }
}

/* ── Dandelion: thin stem with a spherical seed puff ─────────────── */

function drawDandelion(ctx: CanvasRenderingContext2D, p: Plant, t: number) {
  const grow = Math.min(t / 0.5, 1);
  const puffGrow = Math.max(0, Math.min((t - 0.3) / 0.6, 1));
  const e = 1 - Math.pow(1 - grow, 3);
  const s = p.seed;

  const stemH = (50 + seededRand(s, 0) * 25) * e;
  const curve = (seededRand(s, 1) - 0.5) * 15;
  const tipX = p.x + curve;
  const tipY = p.y - stemH;

  // Thin stem
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.quadraticCurveTo(p.x + curve * 0.3, p.y - stemH * 0.5, tipX, tipY);
  ctx.strokeStyle = "rgba(140, 160, 130, 0.6)";
  ctx.lineWidth = 1;
  ctx.stroke();

  if (puffGrow <= 0) return;
  const pE = 1 - Math.pow(1 - puffGrow, 2);

  // Seed puff — radial lines with dots
  const seedCount = 16 + Math.floor(seededRand(s, 2) * 8);
  const puffR = (8 + seededRand(s, 3) * 5) * pE;

  for (let i = 0; i < seedCount; i++) {
    const a = (i / seedCount) * Math.PI * 2 + seededRand(s, 10 + i) * 0.3;
    const r = puffR * (0.7 + seededRand(s, 20 + i) * 0.3);

    const sx = tipX + Math.cos(a) * r;
    const sy = tipY + Math.sin(a) * r;

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(sx, sy);
    ctx.strokeStyle = `rgba(200, 195, 180, ${0.3 * pE})`;
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // Tiny seed dot
    ctx.beginPath();
    ctx.arc(sx, sy, 0.7, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(210, 205, 190, ${0.6 * pE})`;
    ctx.fill();
  }

  // Center
  ctx.beginPath();
  ctx.arc(tipX, tipY, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(180, 170, 150, ${0.7 * pE})`;
  ctx.fill();
}

/* ── Tulip: single cup-shaped flower ─────────────────────────────── */

function drawTulip(ctx: CanvasRenderingContext2D, p: Plant, t: number) {
  const grow = Math.min(t / 0.6, 1);
  const bloomP = Math.max(0, Math.min((t - 0.35) / 0.7, 1));
  const e = 1 - Math.pow(1 - grow, 3);
  const s = p.seed;

  const stemH = (45 + seededRand(s, 0) * 25) * e;
  const curve = (seededRand(s, 1) - 0.5) * 18;
  const tipX = p.x + curve;
  const tipY = p.y - stemH;

  // Stem
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.quadraticCurveTo(p.x + curve * 0.3, p.y - stemH * 0.5, tipX, tipY);
  ctx.strokeStyle = "rgba(130, 155, 120, 0.7)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Leaf on stem
  if (grow > 0.3) {
    const leafS = 6 * Math.min((grow - 0.3) / 0.3, 1);
    const lx = p.x + curve * 0.25;
    const ly = p.y - stemH * 0.35;
    const side = seededRand(s, 2) > 0.5 ? 1 : -1;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.scale(side, 1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(leafS * 1.2, -leafS * 1.5, leafS * 0.3, -leafS * 2.5);
    ctx.quadraticCurveTo(-leafS * 0.3, -leafS * 1.2, 0, 0);
    ctx.fillStyle = "rgba(130, 160, 115, 0.4)";
    ctx.fill();
    ctx.restore();
  }

  if (bloomP <= 0) return;
  const bE = 1 - Math.pow(1 - bloomP, 2);

  // Tulip cup — 3 overlapping petals
  const colors = [
    [235, 90, 95],   // red
    [245, 180, 60],  // yellow
    [230, 130, 180], // pink
    [180, 120, 200], // purple
    [245, 155, 100], // orange
  ];
  const c = colors[Math.floor(seededRand(s, 3) * colors.length)];
  const ps = (8 + seededRand(s, 4) * 4) * bE;

  ctx.save();
  ctx.translate(tipX, tipY);

  // Back petals
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI - Math.PI / 2 + (seededRand(s, 10 + i) - 0.5) * 0.2;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-ps * 0.3, -ps * 0.6, ps * 0.3, -ps * 1.2, 0, -ps * 1.4);
    ctx.bezierCurveTo(-ps * 0.3, -ps * 1.2, ps * 0.3, -ps * 0.6, 0, 0);
    ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${0.6 * bE})`;
    ctx.fill();
    ctx.restore();
  }

  // Front petals (darker)
  for (let i = 0; i < 2; i++) {
    const a = (i / 2) * Math.PI * 0.6 - Math.PI / 2 - 0.15 + i * 0.3;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-ps * 0.25, -ps * 0.5, ps * 0.25, -ps * 1.1, 0, -ps * 1.3);
    ctx.bezierCurveTo(-ps * 0.25, -ps * 1.1, ps * 0.25, -ps * 0.5, 0, 0);
    ctx.fillStyle = `rgba(${c[0] - 20}, ${c[1] - 20}, ${c[2] - 15}, ${0.7 * bE})`;
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

/* ── Grass: fan of blades ────────────────────────────────────────── */

function drawGrass(ctx: CanvasRenderingContext2D, p: Plant, t: number) {
  const grow = Math.min(t / 0.4, 1);
  const e = 1 - Math.pow(1 - grow, 3);
  const s = p.seed;

  const bladeCount = 4 + Math.floor(seededRand(s, 0) * 4);

  for (let i = 0; i < bladeCount; i++) {
    const bGrow = Math.max(0, Math.min((t - i * 0.06) / 0.4, 1));
    if (bGrow <= 0) continue;
    const bE = 1 - Math.pow(1 - bGrow, 2);

    const angle = -Math.PI / 2 + (i - (bladeCount - 1) / 2) * 0.25 + (seededRand(s, 10 + i) - 0.5) * 0.15;
    const h = (20 + seededRand(s, 20 + i) * 25) * bE;
    const curve = (seededRand(s, 30 + i) - 0.5) * 12;

    const tipX = p.x + Math.cos(angle) * h + curve;
    const tipY = p.y + Math.sin(angle) * h;

    // Gentle sway
    const sway = Math.sin(t * 1.5 + i * 0.7) * 2 * bE;

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.quadraticCurveTo(
      p.x + (tipX - p.x) * 0.5 + sway,
      p.y + (tipY - p.y) * 0.5,
      tipX + sway * 1.5,
      tipY
    );

    const green = [
      115 + Math.floor(seededRand(s, 40 + i) * 35),
      145 + Math.floor(seededRand(s, 50 + i) * 30),
      100 + Math.floor(seededRand(s, 60 + i) * 25),
    ];
    ctx.strokeStyle = `rgba(${green[0]}, ${green[1]}, ${green[2]}, ${0.5 * bE})`;
    ctx.lineWidth = 1 + seededRand(s, 70 + i) * 0.8;
    ctx.stroke();
  }
}

/* ── Cherry blossom branch: angled branch with small flowers ─────── */

function drawBlossomBranch(ctx: CanvasRenderingContext2D, p: Plant, t: number) {
  const grow = Math.min(t / 0.7, 1);
  const bloomP = Math.max(0, Math.min((t - 0.4) / 0.8, 1));
  const e = 1 - Math.pow(1 - grow, 3);
  const s = p.seed;

  const branchLen = (55 + seededRand(s, 0) * 30) * e;
  const angle = -Math.PI * 0.35 + (seededRand(s, 1) - 0.5) * 0.5;
  const endX = p.x + Math.cos(angle) * branchLen;
  const endY = p.y + Math.sin(angle) * branchLen;

  // Main branch
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  const midX = p.x + (endX - p.x) * 0.5 + (seededRand(s, 2) - 0.5) * 10;
  const midY = p.y + (endY - p.y) * 0.5 + (seededRand(s, 3) - 0.5) * 8;
  ctx.quadraticCurveTo(midX, midY, endX, endY);
  ctx.strokeStyle = "rgba(110, 90, 75, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Sub-branch
  if (grow > 0.5) {
    const subT = 0.4 + seededRand(s, 4) * 0.3;
    const sx = p.x + (endX - p.x) * subT;
    const sy = p.y + (endY - p.y) * subT;
    const subAngle = angle + (seededRand(s, 5) > 0.5 ? 0.6 : -0.6);
    const subLen = 15 + seededRand(s, 6) * 10;
    const subGrow = Math.min((grow - 0.5) / 0.3, 1);

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(
      sx + Math.cos(subAngle) * subLen * subGrow,
      sy + Math.sin(subAngle) * subLen * subGrow
    );
    ctx.strokeStyle = "rgba(120, 100, 85, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  if (bloomP <= 0) return;
  const bE = 1 - Math.pow(1 - bloomP, 2);

  // Small sakura flowers along the branch
  const flowerCount = 3 + Math.floor(seededRand(s, 7) * 3);
  for (let i = 0; i < flowerCount; i++) {
    const ft = 0.2 + (i / flowerCount) * 0.7;
    const fx = p.x + (endX - p.x) * ft + (seededRand(s, 20 + i) - 0.5) * 6;
    const fy = p.y + (endY - p.y) * ft + (seededRand(s, 30 + i) - 0.5) * 6;
    const fDelay = Math.max(0, Math.min((bloomP - i * 0.1) / 0.5, 1));
    if (fDelay <= 0) continue;
    const fE = 1 - Math.pow(1 - fDelay, 2);
    const ps = (3.5 + seededRand(s, 40 + i) * 2.5) * fE;

    // 5 petals — sakura style
    const pink = [
      240 + Math.floor(seededRand(s, 50 + i) * 15),
      185 + Math.floor(seededRand(s, 60 + i) * 30),
      195 + Math.floor(seededRand(s, 70 + i) * 20),
    ];

    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(seededRand(s, 80 + i) * Math.PI * 2);

    for (let j = 0; j < 5; j++) {
      const pa = (j / 5) * Math.PI * 2;
      ctx.save();
      ctx.rotate(pa);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(ps * 0.35, -ps * 0.25, ps * 0.7, -ps * 0.4, ps * 0.85, 0);
      ctx.bezierCurveTo(ps * 0.7, ps * 0.4, ps * 0.35, ps * 0.25, 0, 0);
      ctx.fillStyle = `rgba(${pink[0]}, ${pink[1]}, ${pink[2]}, ${0.65 * fE * bE})`;
      ctx.fill();
      ctx.restore();
    }

    // Tiny center
    ctx.beginPath();
    ctx.arc(0, 0, ps * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(225, 185, 100, ${0.7 * fE * bE})`;
    ctx.fill();

    ctx.restore();
  }
}

/* ── Daisy: white petals with yellow center ──────────────────────── */

function drawDaisy(ctx: CanvasRenderingContext2D, p: Plant, t: number) {
  const grow = Math.min(t / 0.5, 1);
  const bloomP = Math.max(0, Math.min((t - 0.3) / 0.6, 1));
  const e = 1 - Math.pow(1 - grow, 3);
  const s = p.seed;

  const stemH = (35 + seededRand(s, 0) * 25) * e;
  const curve = (seededRand(s, 1) - 0.5) * 12;
  const tipX = p.x + curve;
  const tipY = p.y - stemH;

  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.quadraticCurveTo(p.x + curve * 0.3, p.y - stemH * 0.5, tipX, tipY);
  ctx.strokeStyle = "rgba(130, 160, 115, 0.65)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  if (bloomP <= 0) return;
  const bE = 1 - Math.pow(1 - bloomP, 2);
  const ps = (5 + seededRand(s, 2) * 3) * bE;
  const petalCount = 8 + Math.floor(seededRand(s, 3) * 5);

  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.rotate(seededRand(s, 4) * Math.PI * 2);

  for (let i = 0; i < petalCount; i++) {
    const a = (i / petalCount) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(ps * 0.7, 0, ps, ps * 0.28, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 252, 245, ${0.8 * bE})`;
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, ps * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(235, 195, 70, ${0.9 * bE})`;
  ctx.fill();
  ctx.restore();
}

/* ── Fern: curling frond ─────────────────────────────────────────── */

function drawFern(ctx: CanvasRenderingContext2D, p: Plant, t: number) {
  const grow = Math.min(t / 0.7, 1);
  const e = 1 - Math.pow(1 - grow, 3);
  const s = p.seed;

  const totalH = (50 + seededRand(s, 0) * 25) * e;
  const lean = (seededRand(s, 1) - 0.5) * 20;
  const segments = 8;

  let px = p.x;
  let py = p.y;

  for (let i = 0; i < segments; i++) {
    const segGrow = Math.max(0, Math.min((grow - i * 0.08) / 0.3, 1));
    if (segGrow <= 0) break;
    const sE = 1 - Math.pow(1 - segGrow, 2);

    const segH = (totalH / segments) * sE;
    const curl = lean * (i / segments) * 0.15;
    const nx = px + curl;
    const ny = py - segH;

    // Main spine
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = `rgba(110, 145, 95, ${0.6 * sE})`;
    ctx.lineWidth = 1.5 - i * 0.12;
    ctx.stroke();

    // Small leaflets on each side
    if (segGrow > 0.5) {
      const leafLen = (4 + (segments - i) * 0.8) * Math.min((segGrow - 0.5) / 0.3, 1);
      for (let side = -1; side <= 1; side += 2) {
        const la = -Math.PI * 0.35 * side + (seededRand(s, 20 + i * 2 + (side > 0 ? 1 : 0)) - 0.5) * 0.2;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(nx + Math.cos(la) * leafLen * side, ny + Math.sin(la) * leafLen);
        ctx.strokeStyle = `rgba(125, 158, 108, ${0.4 * sE})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }

    px = nx;
    py = ny;
  }
}

/* ── Wildflower: thin stem with small multi-petal bloom ───────────── */

function drawWildflower(ctx: CanvasRenderingContext2D, p: Plant, t: number) {
  const grow = Math.min(t / 0.5, 1);
  const bloomP = Math.max(0, Math.min((t - 0.3) / 0.6, 1));
  const e = 1 - Math.pow(1 - grow, 3);
  const s = p.seed;

  const stemH = (30 + seededRand(s, 0) * 30) * e;
  const curve = (seededRand(s, 1) - 0.5) * 18;
  const tipX = p.x + curve;
  const tipY = p.y - stemH;

  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.quadraticCurveTo(p.x + curve * 0.4, p.y - stemH * 0.5, tipX, tipY);
  ctx.strokeStyle = "rgba(135, 158, 118, 0.6)";
  ctx.lineWidth = 0.9;
  ctx.stroke();

  if (bloomP <= 0) return;
  const bE = 1 - Math.pow(1 - bloomP, 2);

  const colors = [
    [200, 140, 210], // violet
    [255, 180, 120], // coral
    [180, 200, 240], // periwinkle
    [255, 210, 140], // buttercup
    [210, 170, 190], // mauve
    [170, 210, 180], // mint
  ];
  const c = colors[Math.floor(seededRand(s, 2) * colors.length)];
  const ps = (3.5 + seededRand(s, 3) * 2.5) * bE;
  const petalCount = 4 + Math.floor(seededRand(s, 4) * 3);

  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.rotate(seededRand(s, 5) * Math.PI * 2);

  for (let i = 0; i < petalCount; i++) {
    const a = (i / petalCount) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(ps * 0.3, -ps * 0.2, ps * 0.6, -ps * 0.35, ps * 0.8, 0);
    ctx.bezierCurveTo(ps * 0.6, ps * 0.35, ps * 0.3, ps * 0.2, 0, 0);
    ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${0.7 * bE})`;
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, ps * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(230, 195, 90, ${0.8 * bE})`;
  ctx.fill();
  ctx.restore();
}

/* ── Component ───────────────────────────────────────────────────── */

type Props = { text: string; label?: string; className?: string; overlay?: boolean };

export function ClickBloom({ text, label, className, overlay }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<Char[]>([]);
  const plantsRef = useRef<Plant[]>([]);
  const rafRef = useRef(0);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    plantsRef.current.push(...spawnCluster(cx, cy));

    // Ripple characters (non-overlay mode)
    if (!overlay) {
      const RIPPLE_R = 55;
      for (const c of charsRef.current) {
        const dx = (c.hx + c.ox) - cx;
        const dy = (c.hy + c.oy) - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < RIPPLE_R && dist > 0) {
          const force = (RIPPLE_R - dist) / RIPPLE_R;
          c.vx += (dx / dist) * force * 3.5;
          c.vy += (dy / dist) * force * 2.5;
        }
      }
    }
  }, [overlay]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;

    const fontSize = 15;
    const lineHeight = fontSize * 1.9;
    const font = `400 ${fontSize}px system-ui, -apple-system, "Helvetica Neue", sans-serif`;

    const doLayout = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = container.offsetWidth;
      const H = container.offsetHeight;

      if (overlay) {
        // Overlay mode: canvas covers full container, no text rendering
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return;
      }

      const labelH = label ? 36 : 0;

      // Pretext: measure + wrap
      const prepared = prepareWithSegments(text, font);
      const result = layoutWithLines(prepared, W, lineHeight);

      // Per-character positions
      const chars: Char[] = [];
      ctx.font = font;
      for (let li = 0; li < result.lines.length; li++) {
        const lt = result.lines[li].text;
        const y = labelH + lineHeight + li * lineHeight;
        let x = 0;
        for (let ci = 0; ci < lt.length; ci++) {
          const ch = lt[ci];
          const w = ctx.measureText(ch).width;
          chars.push({
            ch, hx: x, hy: y, ox: 0, oy: 0, vx: 0, vy: 0,
            phase: Math.random() * Math.PI * 2,
            freq: 0.8 + Math.random() * 0.6,
          });
          x += w;
        }
      }
      charsRef.current = chars;

      const totalH = labelH + (result.lines.length + 1) * lineHeight + 40;
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
      const sec = now / 1000;

      if (!overlay) {
        // Label
        if (label) {
          ctx.font = "400 10px system-ui, -apple-system, sans-serif";
          ctx.fillStyle = "#a8a29e";
          ctx.textBaseline = "top";
          let lx = 0;
          for (const ch of label.toUpperCase()) {
            ctx.fillText(ch, lx, 0);
            lx += ctx.measureText(ch).width + 3.5;
          }
        }

        // Characters
        ctx.font = font;
        ctx.textBaseline = "top";
        for (const c of charsRef.current) {
          const fx = Math.sin(sec * c.freq + c.phase) * 0.35;
          const fy = Math.cos(sec * c.freq * 0.7 + c.phase + 1) * 0.45;
          c.vx += -c.ox * 0.08;
          c.vy += -c.oy * 0.08;
          c.vx *= 0.88;
          c.vy *= 0.88;
          c.ox += c.vx;
          c.oy += c.vy;
          const disp = Math.sqrt(c.ox * c.ox + c.oy * c.oy);
          ctx.fillStyle = `rgba(120, 113, 108, ${Math.max(0.3, 1 - disp * 0.02)})`;
          ctx.fillText(c.ch, c.hx + c.ox + fx, c.hy + c.oy + fy);
        }
      }

      // Plants
      const plants = plantsRef.current;
      for (let i = plants.length - 1; i >= 0; i--) {
        if (!drawPlant(ctx, plants[i], now)) plants.splice(i, 1);
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
  }, [text, label]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className={className}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className={overlay ? "absolute inset-0 cursor-pointer" : "cursor-pointer"}
        style={overlay ? { pointerEvents: "auto" } : undefined}
      />
    </div>
  );
}
