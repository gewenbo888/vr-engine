"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useLang } from "./lang";

/* ═══════════════════════════════════════════════════════════════════════════
   SimulationLab
   System 09 — Simulation Theory & the Nature of Existence

   Three related but distinct ideas, clearly labelled by epistemic status:
   1. Simulation Hypothesis (PHILOSOPHY) — Bostrom's trilemma, counting argument
   2. Holographic Principle (ESTABLISHED PHYSICS) — black-hole entropy / AdS-CFT
   3. Digital Physics (OPEN CONJECTURE) — nature as computation/information

   Throughline: building convincing virtual worlds teaches us from the inside
   what building this one would take; "simulated vs real" becomes a question
   of resolution, not an absolute wall.
═══════════════════════════════════════════════════════════════════════════ */

/* ─── palette ─── */
const C = {
  // void depths
  void:  "#06030f",
  void9: "#0b0620",
  void8: "#120a33",
  void7: "#1a1048",
  // flux (blue)
  flux5: "#4d9bff",
  flux4: "#93c5ff",
  // iris (purple)
  iris5: "#a855f7",
  iris4: "#c98bff",
  // holo (cyan — nested sims)
  holo5: "#22d3ee",
  holo4: "#67e8f9",
  // gold (amber — established physics)
  gold5: "#f5c24d",
  gold4: "#ffd97a",
  // plasm (magenta — philosophy/speculation)
  plasm: "#ff4d9d",
  plasm4:"#ff8fc4",
  // ink
  ink50: "#f6f4ff",
  ink3:  "#b3afd8",
  ink5:  "#797399",
} as const;

/* ─── epistemic badge types ─── */
type EpistemicStatus = "philosophy" | "physics" | "conjecture";

const BADGE: Record<EpistemicStatus, { en: string; zh: string; color: string; bg: string }> = {
  philosophy: { en: "Philosophy", zh: "哲学",   color: C.plasm,  bg: "rgba(255,77,157,0.09)" },
  physics:    { en: "Established Physics", zh: "成熟物理学", color: C.gold5,  bg: "rgba(245,194,77,0.09)" },
  conjecture: { en: "Open Conjecture", zh: "开放猜想", color: C.holo5,  bg: "rgba(34,211,238,0.09)" },
};

/* ═══════════════════════════════════════════════════════════════════
   SECTION 1 — SIMULATION HYPOTHESIS
   Bostrom's trilemma + nested-sim counting argument (interactive)
═══════════════════════════════════════════════════════════════════ */

/* deterministic nested-sim layout: index → circle position */
function simPosition(index: number, total: number, cx: number, cy: number, R: number) {
  // sunflower packing, fully deterministic
  const PHI = (1 + Math.sqrt(5)) / 2;
  if (total === 1) return { x: cx, y: cy };
  const t = index / (total - 1);
  const angle = index * 2 * Math.PI / PHI;
  const r = R * Math.sqrt(t);
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
}

function drawNestedSims(
  ctx: CanvasRenderingContext2D,
  w: number, h: number, frame: number,
  simWorlds: number  // user-controlled 1–64
) {
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) * 0.42;
  const t = frame * 0.014;

  // background grid
  ctx.strokeStyle = "rgba(77,155,255,0.04)";
  ctx.lineWidth = 0.6;
  for (let i = 0; i <= 10; i++) {
    ctx.beginPath(); ctx.moveTo(i * w / 10, 0); ctx.lineTo(i * w / 10, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * h / 10); ctx.lineTo(w, i * h / 10); ctx.stroke();
  }

  // "base reality" — single large outer ring, fading as simWorlds grows
  const baseAlpha = Math.max(0.05, 1 - (simWorlds / 64) * 0.92);
  const baseGlow = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.25);
  baseGlow.addColorStop(0, `rgba(77,155,255,0)`);
  baseGlow.addColorStop(0.5, `rgba(77,155,255,${baseAlpha * 0.15})`);
  baseGlow.addColorStop(1, `rgba(77,155,255,0)`);
  ctx.fillStyle = baseGlow;
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2); ctx.fill();

  // outer ring — base reality
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(77,155,255,${baseAlpha * 0.7})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // label base reality
  if (baseAlpha > 0.15) {
    ctx.save();
    ctx.globalAlpha = baseAlpha;
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.fillStyle = C.flux4;
    ctx.textAlign = "center";
    ctx.fillText("base reality", cx, cy - R - 8);
    ctx.restore();
  }

  // nested sims — each represented as a smaller circle
  const TOTAL = simWorlds;
  for (let i = 0; i < TOTAL; i++) {
    const pos = simPosition(i, TOTAL, cx, cy, R * 0.82);
    // nested radius shrinks for deeper sims
    const depth = i / TOTAL; // 0 = outermost, 1 = deepest
    const nodeR = Math.max(3, 16 * (1 - depth * 0.75));
    const phase = (i * 137 % 100) / 100 * Math.PI * 2;
    const pulse = 0.55 + 0.45 * Math.sin(t * 1.4 + phase);

    // colour shifts from iris (shallow) to holo (deep)
    const r = Math.round(168 + (34 - 168) * depth);
    const g = Math.round(85 + (211 - 85) * depth);
    const b = Math.round(247 + (238 - 247) * depth);
    const nodeColor = `rgb(${r},${g},${b})`;

    // glow
    const ng = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, nodeR * 3);
    ng.addColorStop(0, nodeColor.replace("rgb", "rgba").replace(")", `,${pulse * 0.35})`));
    ng.addColorStop(1, nodeColor.replace("rgb", "rgba").replace(")", `,0)`));
    ctx.fillStyle = ng;
    ctx.beginPath(); ctx.arc(pos.x, pos.y, nodeR * 3, 0, Math.PI * 2); ctx.fill();

    // node dot
    ctx.fillStyle = nodeColor.replace("rgb", "rgba").replace(")", `,${0.55 + pulse * 0.45})`);
    ctx.beginPath(); ctx.arc(pos.x, pos.y, nodeR * pulse, 0, Math.PI * 2); ctx.fill();

    // inner nested ring (suggest recursion)
    if (nodeR > 7) {
      ctx.beginPath(); ctx.arc(pos.x, pos.y, nodeR * 0.5 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = nodeColor.replace("rgb", "rgba").replace(")", `,${0.4})`);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  // "observer" fraction ring at top right — base observers vs simulated
  const frac = 1 / (1 + simWorlds); // shrinks toward 0
  const ringCx = w - 52, ringCy = 50, ringR = 28;
  // background ring
  ctx.beginPath(); ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 5; ctx.stroke();
  // base-reality slice
  const fracAngle = frac * Math.PI * 2;
  ctx.beginPath(); ctx.arc(ringCx, ringCy, ringR, -Math.PI / 2, -Math.PI / 2 + fracAngle);
  ctx.strokeStyle = C.flux5; ctx.lineWidth = 5; ctx.stroke();
  // rest = simulated
  ctx.beginPath(); ctx.arc(ringCx, ringCy, ringR, -Math.PI / 2 + fracAngle, -Math.PI / 2 + Math.PI * 2);
  ctx.strokeStyle = `rgba(168,85,247,0.55)`; ctx.lineWidth = 5; ctx.stroke();
  // percentage text
  const pct = Math.round(frac * 100);
  ctx.font = "bold 9px JetBrains Mono, monospace";
  ctx.fillStyle = C.flux4; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(`${pct}%`, ringCx, ringCy - 2);
  ctx.font = "7px JetBrains Mono, monospace";
  ctx.fillStyle = C.ink5;
  ctx.fillText("base", ringCx, ringCy + 9);
}

function NestedSimViz({ lang }: { lang: "en" | "zh" }) {
  const L = (en: string, zh: string) => lang === "zh" ? zh : en;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const [simWorlds, setSimWorlds] = useState(4);
  const simWorldsRef = useRef(4);

  useEffect(() => { simWorldsRef.current = simWorlds; }, [simWorlds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const loop = () => {
      frameRef.current += 1;
      drawNestedSims(ctx!, w, h, frameRef.current, simWorldsRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  const fraction = 1 / (1 + simWorlds);
  const pctBase = (fraction * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: "280px" }} aria-label="Nested simulation counting visualisation" />

      {/* slider */}
      <div className="flex items-center gap-3 px-1">
        <span className="label-mono text-[0.6rem]" style={{ color: C.iris4 }}>
          {L("Simulated Worlds", "模拟世界数量")}
        </span>
        <input
          type="range" min={1} max={64} step={1} value={simWorlds}
          onChange={(e) => setSimWorlds(Number(e.target.value))}
          className="flex-1 h-1 rounded cursor-pointer appearance-none"
          style={{ accentColor: C.iris5 }}
          aria-label={L("Number of simulated worlds", "模拟世界数量")}
        />
        <span className="font-mono text-[0.72rem] min-w-[2rem] text-right" style={{ color: C.iris4 }}>{simWorlds}</span>
      </div>

      {/* ratio display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="panel rounded-lg p-3 text-center">
          <div className="font-mono text-xl font-bold" style={{ color: C.flux5 }}>{pctBase}%</div>
          <div className={`text-[0.68rem] mt-0.5 ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink5 }}>
            {L("base-reality observers", "基础现实中的观察者")}
          </div>
        </div>
        <div className="panel rounded-lg p-3 text-center">
          <div className="font-mono text-xl font-bold" style={{ color: C.iris4 }}>{(100 - Number(pctBase)).toFixed(1)}%</div>
          <div className={`text-[0.68rem] mt-0.5 ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink5 }}>
            {L("simulated observers", "模拟现实中的观察者")}
          </div>
        </div>
      </div>

      <p className={`text-[0.74rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink5 }}>
        {L(
          `With ${simWorlds} simulated world${simWorlds !== 1 ? "s" : ""}, only ${pctBase}% of observers live in base reality. As simulated civilisations themselves run sims, the ratio collapses further. This is the counting argument — not a proof, but a probability reweighting under uncertain priors.`,
          `在 ${simWorlds} 个模拟世界中，只有 ${pctBase}% 的观察者生活在基础现实里。若模拟文明本身也运行模拟，该比例将进一步崩溃。这是「计数论证」——不是证明，而是在不确定先验下的概率重新加权。`
        )}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 2 — HOLOGRAPHIC PRINCIPLE
   Canvas: information boundary encoding a volume
═══════════════════════════════════════════════════════════════════ */

function drawHolographic(
  ctx: CanvasRenderingContext2D,
  w: number, h: number, frame: number
) {
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  const t = frame * 0.012;

  // outer sphere (boundary surface)
  const R = Math.min(w, h) * 0.38;

  // rotating boundary lattice (Planck-area pixels on the sphere surface)
  const LATS = 10, LONS = 18;
  ctx.save();
  for (let lat = 0; lat < LATS; lat++) {
    for (let lon = 0; lon < LONS; lon++) {
      const theta = (lat / LATS) * Math.PI;
      const phi = (lon / LONS) * Math.PI * 2 + t * 0.4;
      // project 3D sphere to 2D ellipse (simple orthographic, slight tilt)
      const sinT = Math.sin(theta), cosT = Math.cos(theta);
      const sinP = Math.sin(phi), cosP = Math.cos(phi);
      // tilt axis
      const tilt = 0.32;
      const x3 = sinT * cosP;
      const y3 = sinT * sinP;
      const z3 = cosT;
      // rotate around x by tilt
      const y3r = y3 * Math.cos(tilt) - z3 * Math.sin(tilt);
      const z3r = y3 * Math.sin(tilt) + z3 * Math.cos(tilt);

      // only draw front-facing pixels (z3r > -0.1)
      if (z3r < -0.1) continue;
      const px = cx + x3 * R;
      const py = cy + y3r * R;

      // brightness by information density (deterministic by lat/lon)
      const infoBit = ((lat * 7 + lon * 13) % 17) / 17;
      const brightness = 0.25 + infoBit * 0.65;
      const alpha = (0.3 + z3r * 0.5) * brightness;

      ctx.fillStyle = `rgba(245,194,77,${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // outer boundary circle
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(245,194,77,0.4)`;
  ctx.lineWidth = 1.4;
  ctx.setLineDash([4, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // glow on boundary
  const bGlow = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.15);
  bGlow.addColorStop(0, "rgba(245,194,77,0.0)");
  bGlow.addColorStop(0.5, "rgba(245,194,77,0.08)");
  bGlow.addColorStop(1, "rgba(245,194,77,0.0)");
  ctx.fillStyle = bGlow;
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2); ctx.fill();

  // interior volume — sparse grid representing 3D bulk
  const GRID3 = 5;
  for (let x = 0; x < GRID3; x++) {
    for (let y = 0; y < GRID3; y++) {
      const nx = cx + (x - (GRID3 - 1) / 2) * R * 0.36;
      const ny = cy + (y - (GRID3 - 1) / 2) * R * 0.36;
      // check inside sphere
      const dist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);
      if (dist > R * 0.82) continue;
      const pulse = 0.3 + 0.5 * Math.sin(t * 1.1 + x * 0.9 + y * 1.3);
      ctx.fillStyle = `rgba(34,211,238,${pulse * 0.35})`;
      ctx.beginPath(); ctx.arc(nx, ny, 3 + pulse * 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // radial "projection lines" from boundary to interior
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + t * 0.25;
    const bx = cx + Math.cos(angle) * R;
    const by = cy + Math.sin(angle) * R;
    const lineGrad = ctx.createLinearGradient(bx, by, cx, cy);
    lineGrad.addColorStop(0, `rgba(245,194,77,0.4)`);
    lineGrad.addColorStop(0.5, `rgba(34,211,238,0.15)`);
    lineGrad.addColorStop(1, `rgba(34,211,238,0.0)`);
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(cx, cy); ctx.stroke();
  }

  // black hole horizon suggestion — inner dark circle
  const bhGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.18);
  bhGrad.addColorStop(0, "rgba(6,3,15,0.9)");
  bhGrad.addColorStop(0.7, "rgba(18,10,51,0.6)");
  bhGrad.addColorStop(1, "rgba(18,10,51,0)");
  ctx.fillStyle = bhGrad;
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.18, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(245,194,77,0.6)`; ctx.lineWidth = 1.2; ctx.stroke();
}

function HolographicViz({ lang }: { lang: "en" | "zh" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const loop = () => {
      frameRef.current += 1;
      drawHolographic(ctx!, w, h, frameRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  const L = (en: string, zh: string) => lang === "zh" ? zh : en;

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: "240px" }}
        aria-label="Holographic principle visualisation" />
      <div className="grid grid-cols-2 gap-3">
        <div className="panel panel-gold rounded-lg p-3 space-y-1">
          <div className="label-mono text-[0.58rem]" style={{ color: C.gold4 }}>S = A/4</div>
          <div className={`text-[0.72rem] ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
            {L("Bekenstein–Hawking entropy: a black hole's entropy scales with horizon area, not volume.", "贝肯斯坦–霍金熵：黑洞熵与视界面积成正比，而非体积。")}
          </div>
        </div>
        <div className="panel panel-gold rounded-lg p-3 space-y-1">
          <div className="label-mono text-[0.58rem]" style={{ color: C.gold4 }}>AdS/CFT</div>
          <div className={`text-[0.72rem] ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
            {L("Maldacena (1997): a gravity theory in a bulk volume is dual to a quantum field theory on its boundary.", "马尔达塞纳（1997）：体积内的引力理论与其边界上的量子场论是对偶的。")}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 3 — DIGITAL PHYSICS
   Bit-flip cellular automaton canvas + Wolfram / Fredkin context
═══════════════════════════════════════════════════════════════════ */

// Rule 110 — known Turing-complete elementary cellular automaton
function rule110(left: number, center: number, right: number): number {
  const pattern = (left << 2) | (center << 1) | right;
  return (110 >> pattern) & 1;
}

function drawDigitalPhysics(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  grid: Uint8Array, cols: number, rows: number, currentRow: number
) {
  ctx.clearRect(0, 0, w, h);
  const cellW = w / cols;
  const cellH = h / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = grid[r * cols + c];
      if (val === 0) continue;

      const rAge = (r - currentRow + rows) % rows;
      const ageFrac = rAge / rows;
      const alpha = Math.max(0.04, 1 - ageFrac * 0.88);

      // colour shifts with age: fresh = holo, old = iris
      const rC = Math.round(34 + (168 - 34) * (1 - alpha));
      const gC = Math.round(211 + (85 - 211) * (1 - alpha));
      const bC = Math.round(238 + (247 - 238) * (1 - alpha));
      ctx.fillStyle = `rgba(${rC},${gC},${bC},${alpha})`;
      ctx.fillRect(c * cellW, r * cellH, Math.max(1, cellW - 0.5), Math.max(1, cellH - 0.5));
    }
  }

  // scan line
  const scanY = currentRow * cellH;
  const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
  scanGrad.addColorStop(0, "rgba(34,211,238,0)");
  scanGrad.addColorStop(0.5, "rgba(34,211,238,0.7)");
  scanGrad.addColorStop(1, "rgba(34,211,238,0)");
  ctx.fillStyle = scanGrad;
  ctx.fillRect(0, scanY - 2, w, 4);
}

function DigitalPhysicsViz({ lang }: { lang: "en" | "zh" }) {
  const L = (en: string, zh: string) => lang === "zh" ? zh : en;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const [running, setRunning] = useState(true);
  const runningRef = useRef(true);

  useEffect(() => { runningRef.current = running; }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const COLS = 80, ROWS = 40;
    const grid = new Uint8Array(COLS * ROWS);

    // deterministic seed — single cell in the centre of row 0
    grid[Math.floor(COLS / 2)] = 1;
    let currentRow = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const loop = () => {
      frameRef.current += 1;
      // advance one row every 4 frames
      if (runningRef.current && frameRef.current % 4 === 0) {
        const nextRow = (currentRow + 1) % ROWS;
        for (let c = 0; c < COLS; c++) {
          const left = grid[currentRow * COLS + ((c - 1 + COLS) % COLS)];
          const center = grid[currentRow * COLS + c];
          const right = grid[currentRow * COLS + ((c + 1) % COLS)];
          grid[nextRow * COLS + c] = rule110(left, center, right);
        }
        currentRow = nextRow;
      }
      drawDigitalPhysics(ctx!, w, h, grid, COLS, ROWS, currentRow);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative">
        <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: "200px" }}
          aria-label="Rule 110 cellular automaton — digital physics visualisation" />
        <div className="absolute top-2 left-3 flex items-center gap-2">
          <span className="label-mono text-[0.58rem]" style={{ color: C.holo4 }}>
            {L("Rule 110 CA", "110号规则元胞自动机")}
          </span>
          <button
            onClick={() => setRunning(r => !r)}
            className="px-2 py-0.5 rounded border text-[0.58rem] font-mono uppercase tracking-widest transition"
            style={{
              borderColor: running ? `${C.holo5}55` : `${C.ink5}44`,
              color: running ? C.holo4 : C.ink5,
              background: "rgba(6,3,15,0.7)",
            }}
          >
            {running ? L("Pause", "暂停") : L("Run", "运行")}
          </button>
        </div>
      </div>
      <p className={`text-[0.74rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink5 }}>
        {L(
          "Rule 110 is provably Turing-complete: universal computation emerging from three bits of local state. Digital physics asks whether the laws of nature are themselves such a rule — space, time, and matter as output of a cosmic computation. This remains an open conjecture with no agreed experimental signature.",
          "110号规则已被证明是图灵完备的——普遍计算从三个局部状态位中涌现。数字物理学追问自然法则本身是否就是这样一条规则——空间、时间与物质是某种宇宙计算的输出。这仍是一个开放猜想，尚无公认的实验验证方式。"
        )}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EPISTEMIC BADGE COMPONENT
═══════════════════════════════════════════════════════════════════ */
function EpistemicBadge({ status, lang }: { status: EpistemicStatus; lang: "en" | "zh" }) {
  const b = BADGE[status];
  const icons: Record<EpistemicStatus, string> = {
    philosophy: "◈",
    physics:    "◆",
    conjecture: "◇",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6rem] font-mono uppercase tracking-widest"
      style={{ color: b.color, background: b.bg, border: `1px solid ${b.color}33` }}
    >
      <span>{icons[status]}</span>
      <span className={lang === "zh" ? "zh" : ""}>{lang === "zh" ? b.zh : b.en}</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BOSTROM TRILEMMA (collapsible)
═══════════════════════════════════════════════════════════════════ */
const TRILEMMA = [
  {
    id: "extinct",
    en_label: "Extinction before maturity",
    zh_label: "文明在成熟前灭绝",
    en: "Nearly all technological civilisations go extinct before reaching the computational power needed to run ancestor simulations at scale.",
    zh: "几乎所有技术文明在获得运行祖先模拟所需计算能力之前就已灭绝。",
    icon: "Ⅰ",
    color: C.plasm,
  },
  {
    id: "disinterest",
    en_label: "Mature civilisations choose not to simulate",
    zh_label: "成熟文明选择不模拟",
    en: "Civilisations that reach the required capability show no interest in running detailed ancestor simulations — perhaps for ethical, resource, or cultural reasons.",
    zh: "达到所需能力的文明对运行详细的祖先模拟毫无兴趣——可能出于伦理、资源或文化原因。",
    icon: "Ⅱ",
    color: C.flux5,
  },
  {
    id: "simulated",
    en_label: "We are almost certainly simulated",
    zh_label: "我们几乎必然是模拟的",
    en: "If neither of the above holds, the number of simulated minds overwhelmingly outnumbers base-reality observers. Given typical probabilistic reasoning, you are likely in a simulation.",
    zh: "若以上两者均不成立，则模拟意识的数量将压倒性地多于基础现实中的观察者。基于概率推理，你很可能处于模拟中。",
    icon: "Ⅲ",
    color: C.iris4,
  },
] as const;

function TrilemmaCard({ item, lang, open, onToggle }: {
  item: typeof TRILEMMA[number];
  lang: "en" | "zh";
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`panel rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${open ? "" : "hover:scale-[1.01]"}`}
      style={{ borderColor: open ? item.color + "55" : undefined, boxShadow: open ? `0 0 28px -10px ${item.color}55` : undefined }}
      onClick={onToggle}
      role="button"
      aria-expanded={open}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onToggle()}
    >
      <div className="flex items-start gap-4 p-4">
        <span className="text-[1.2rem] font-mono leading-none shrink-0 mt-0.5 tabular-nums"
          style={{ color: item.color }}>{item.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-[0.84rem] font-semibold leading-snug ${lang === "zh" ? "zh" : ""}`}
            style={{ color: item.color }}>
            {lang === "zh" ? item.zh_label : item.en_label}
          </p>
        </div>
        <span className="label-mono text-[0.55rem] shrink-0 mt-1 transition-transform duration-300"
          style={{ color: item.color, transform: open ? "rotate(180deg)" : undefined }}>▾</span>
      </div>
      {open && (
        <div className="px-5 pb-5 rise-in">
          <div className="h-px mb-3" style={{ background: item.color + "25" }} />
          <p className={`text-[0.8rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
            {lang === "zh" ? item.zh : item.en}
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB NAVIGATION for the three ideas
═══════════════════════════════════════════════════════════════════ */
type Tab = "simulation" | "holographic" | "digital";

const TABS: Array<{ id: Tab; en: string; zh: string; status: EpistemicStatus; color: string }> = [
  { id: "simulation", en: "Simulation Hypothesis", zh: "模拟假说", status: "philosophy", color: C.plasm },
  { id: "holographic", en: "Holographic Principle", zh: "全息原理",  status: "physics",   color: C.gold5 },
  { id: "digital",   en: "Digital Physics",       zh: "数字物理学", status: "conjecture", color: C.holo5 },
];

/* ═══════════════════════════════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function SimulationLab() {
  const { lang } = useLang();
  const L = (en: string, zh: string) => lang === "zh" ? zh : en;

  const [tab, setTab] = useState<Tab>("simulation");
  const [openTrilemma, setOpenTrilemma] = useState<number | null>(null);

  const activeTab = TABS.find(t => t.id === tab)!;

  return (
    <section className="w-full space-y-10 py-2">

      {/* ── header ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="label-mono" style={{ color: C.holo4 }}>
          {L("System 09 · Simulation Theory & the Nature of Existence", "系统09 · 模拟理论与存在的本质")}
        </p>
        <h2 className="display text-2xl md:text-3xl spark-text">
          {L("Is Reality Simulated?", "现实是被模拟的吗？")}
        </h2>
        <p className={`text-[0.88rem] max-w-2xl leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
          {L(
            "Three distinct ideas orbit this question. They are not the same idea, and conflating them is a common mistake. Each has its own epistemic status — clearly labelled below.",
            "三个截然不同的观念围绕这一问题。它们并非同一件事，混为一谈是常见错误。每个观念都有其明确的认识论地位——如下所示。"
          )}
        </p>
        {/* throughline */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
          style={{ borderColor: `${C.iris5}33`, background: "rgba(168,85,247,0.06)" }}>
          <span style={{ color: C.iris4 }} className="text-[0.7rem]">◇</span>
          <span className={`text-[0.68rem] ${lang === "zh" ? "zh" : ""}`} style={{ color: C.iris4 }}>
            {L(
              "Building VR teaches us from the inside what building this world would take",
              "构建虚拟现实让我们从内部领会构建这个世界所需的代价"
            )}
          </span>
        </div>
      </div>

      {/* ── tab bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border text-[0.72rem] font-mono transition-all duration-200"
            style={{
              borderColor: tab === t.id ? t.color + "66" : "rgba(255,255,255,0.08)",
              background: tab === t.id ? t.color + "14" : "transparent",
              color: tab === t.id ? t.color : C.ink5,
              boxShadow: tab === t.id ? `0 0 20px -8px ${t.color}66` : undefined,
            }}
            aria-pressed={tab === t.id}
          >
            <span className={lang === "zh" ? "zh" : ""}>{lang === "zh" ? t.zh : t.en}</span>
            <EpistemicBadge status={t.status} lang={lang} />
          </button>
        ))}
      </div>

      {/* ── active panel ────────────────────────────────────────────── */}
      <div key={tab} className="rise-in space-y-6">

        {/* status header row */}
        <div className="flex items-center gap-3 flex-wrap">
          <EpistemicBadge status={activeTab.status} lang={lang} />
          <span className="h-px flex-1 min-w-[20px] rounded" style={{ background: activeTab.color + "33" }} />
        </div>

        {/* ── SIMULATION HYPOTHESIS ───────────────────────────────── */}
        {tab === "simulation" && (
          <div className="space-y-6">
            {/* disclaimer */}
            <div className="panel panel-plasm rounded-xl p-4 flex items-start gap-3">
              <span style={{ color: C.plasm4 }} className="text-lg shrink-0">◈</span>
              <p className={`text-[0.8rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
                {L(
                  "The simulation hypothesis is a philosophical argument, not a scientific theory. It generates no experimental predictions and cannot, in principle, be falsified. Its value is clarifying what we mean by 'real' — not claiming to have answered the question.",
                  "模拟假说是一种哲学论证，而非科学理论。它不产生任何实验预测，在原则上也无法被证伪。其价值在于厘清我们所说的「真实」意味着什么——而非声称已经回答了这个问题。"
                )}
              </p>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
              {/* nested sim viz */}
              <div className="panel rounded-2xl p-5 space-y-2"
                style={{ borderColor: `${C.plasm}22` }}>
                <p className="label-mono text-[0.6rem]" style={{ color: C.plasm4 }}>
                  {L("Counting Argument Visualisation", "计数论证可视化")}
                </p>
                <NestedSimViz lang={lang} />
              </div>

              {/* Bostrom trilemma */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="label-mono text-[0.6rem]" style={{ color: C.plasm4 }}>
                    {L("Bostrom's Trilemma (2003)", "博斯特罗姆三难困境（2003）")}
                  </p>
                  <p className={`text-[0.78rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink5 }}>
                    {L(
                      "At least one of these three propositions must be true.",
                      "以下三个命题中，至少有一个为真。"
                    )}
                  </p>
                </div>
                {TRILEMMA.map((item, i) => (
                  <TrilemmaCard
                    key={item.id}
                    item={item}
                    lang={lang}
                    open={openTrilemma === i}
                    onToggle={() => setOpenTrilemma(openTrilemma === i ? null : i)}
                  />
                ))}
                <div className="panel rounded-xl p-4 mt-2" style={{ borderColor: `${C.plasm}22` }}>
                  <p className={`text-[0.76rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink5 }}>
                    {L(
                      "The argument is logically valid under standard probability theory, but the priors are deeply uncertain. We have no reliable way to estimate the likelihood of Ⅰ or Ⅱ. The logic doesn't tell us which branch we're on.",
                      "该论证在标准概率论下逻辑上是有效的，但先验概率极度不确定。我们没有可靠方法估计Ⅰ或Ⅱ的可能性。逻辑本身无法告诉我们处于哪个分支。"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* resolution bridge */}
            <div className="panel rounded-xl p-5 space-y-2 border-l-2" style={{ borderLeftColor: C.plasm }}>
              <p className="label-mono text-[0.6rem]" style={{ color: C.plasm4 }}>
                {L("The VR Parallel", "VR的类比")}
              </p>
              <p className={`text-[0.84rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
                {L(
                  "Every VR system built makes the question sharper: to make a world feel real requires physics engines, persistent memory, causal consistency, convincing embodiment. The harder it gets, the more we appreciate what 'this world being real' would have to mean. The question of resolution — how detailed is detailed enough — turns out to be non-trivial in either direction.",
                  "每一个构建出的VR系统都让这个问题更加清晰：要让一个世界感觉真实，需要物理引擎、持久内存、因果一致性、令人信服的具身感。这越来越难，我们也越来越理解「这个世界是真实的」究竟意味着什么。分辨率的问题——多精细才算足够精细——在任何方向上都是非平凡的。"
                )}
              </p>
            </div>
          </div>
        )}

        {/* ── HOLOGRAPHIC PRINCIPLE ───────────────────────────────── */}
        {tab === "holographic" && (
          <div className="space-y-6">
            {/* physics affirmation */}
            <div className="panel panel-gold rounded-xl p-4 flex items-start gap-3">
              <span style={{ color: C.gold5 }} className="text-lg shrink-0">◆</span>
              <p className={`text-[0.8rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
                {L(
                  "The holographic principle is real, hard-won physics — not speculation. It emerged from the study of black-hole thermodynamics and has since been formalised in AdS/CFT correspondence, one of the best-tested dualities in theoretical physics.",
                  "全息原理是真实的、来之不易的物理学——而非推测。它源于对黑洞热力学的研究，后来在AdS/CFT对应关系中被形式化，这是理论物理学中检验最充分的对偶关系之一。"
                )}
              </p>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
              {/* holographic viz */}
              <div className="panel rounded-2xl p-5 space-y-2"
                style={{ borderColor: `${C.gold5}22` }}>
                <p className="label-mono text-[0.6rem]" style={{ color: C.gold4 }}>
                  {L("Boundary Encodes Volume", "边界编码体积")}
                </p>
                <HolographicViz lang={lang} />
              </div>

              {/* key facts */}
              <div className="space-y-3">
                {[
                  {
                    en_h: "Bekenstein–Hawking Entropy",
                    zh_h: "贝肯斯坦–霍金熵",
                    en: "A black hole's maximum information content scales with its surface area (in Planck units), not its volume. This was derived from thermodynamics + general relativity, confirmed theoretically by Hawking radiation.",
                    zh: "黑洞的最大信息量与其表面积（以普朗克单位计）成正比，而非体积。这由热力学与广义相对论推导而来，并通过霍金辐射在理论上得到验证。",
                    color: C.gold5,
                  },
                  {
                    en_h: "AdS/CFT Correspondence",
                    zh_h: "AdS/CFT对应",
                    en: "Maldacena's 1997 duality: a (d+1)-dimensional gravity theory in anti-de Sitter space is exactly equivalent to a d-dimensional quantum field theory on its conformal boundary. Bulk physics = boundary information.",
                    zh: "马尔达塞纳1997年的对偶：反德西特空间中的(d+1)维引力理论与其共形边界上的d维量子场论完全等价。体积物理学 = 边界信息。",
                    color: C.holo5,
                  },
                  {
                    en_h: "What this is NOT",
                    zh_h: "这不是什么",
                    en: "The holographic principle does not say reality is a computer simulation. It says information in a volume can be described on its boundary. The distinction matters: one is physics, the other is metaphysics.",
                    zh: "全息原理并不是说现实是计算机模拟。它说的是体积中的信息可以用其边界来描述。这一区别至关重要：一个是物理学，另一个是形而上学。",
                    color: C.iris4,
                  },
                ].map((item, i) => (
                  <div key={i} className="panel rounded-xl p-4 space-y-1.5"
                    style={{ borderColor: `${item.color}22` }}>
                    <div className={`text-[0.78rem] font-semibold ${lang === "zh" ? "zh" : ""}`}
                      style={{ color: item.color }}>{lang === "zh" ? item.zh_h : item.en_h}</div>
                    <p className={`text-[0.76rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}
                      style={{ color: C.ink5 }}>{lang === "zh" ? item.zh : item.en}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* resolution bridge */}
            <div className="panel rounded-xl p-5 space-y-2 border-l-2" style={{ borderLeftColor: C.gold5 }}>
              <p className="label-mono text-[0.6rem]" style={{ color: C.gold4 }}>
                {L("The VR Parallel", "VR的类比")}
              </p>
              <p className={`text-[0.84rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
                {L(
                  "VR rendering often encodes a 3D world's state in 2D texture maps and render targets. The holographic principle does something structurally similar at the deepest level of physics — but this is a mathematical duality, not a statement about 'running on hardware'. The analogy illuminates; it should not be taken literally.",
                  "VR渲染通常将三维世界的状态编码在二维纹理贴图和渲染目标中。全息原理在物理学最深层做了类似的结构性事情——但这是一种数学对偶关系，并非关于「在硬件上运行」的陈述。这个类比有启发意义，但不应字面理解。"
                )}
              </p>
            </div>
          </div>
        )}

        {/* ── DIGITAL PHYSICS ─────────────────────────────────────── */}
        {tab === "digital" && (
          <div className="space-y-6">
            {/* conjecture disclaimer */}
            <div className="panel panel-holo rounded-xl p-4 flex items-start gap-3">
              <span style={{ color: C.holo4 }} className="text-lg shrink-0">◇</span>
              <p className={`text-[0.8rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
                {L(
                  "Digital physics is a serious scientific conjecture — not fringe speculation — but it remains unproven. Unlike the holographic principle, it lacks a fully formalised mathematical framework and has no consensus experimental signature. Researchers including Wolfram, Fredkin, Zuse, Lloyd, and Wheeler ('it from bit') have proposed versions. None are yet scientifically established.",
                  "数字物理学是一个严肃的科学猜想——而非边缘推测——但尚未得到证明。与全息原理不同，它缺乏完全形式化的数学框架，也没有公认的实验特征。包括沃尔夫拉姆、弗雷德金、楚泽、劳埃德和惠勒（「万物源于比特」）在内的研究者提出了各种版本，但均未获得科学上的确立。"
                )}
              </p>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
              {/* CA viz */}
              <div className="panel rounded-2xl p-5 space-y-2"
                style={{ borderColor: `${C.holo5}22` }}>
                <p className="label-mono text-[0.6rem]" style={{ color: C.holo4 }}>
                  {L("Computation from Local Rules", "局部规则生成计算")}
                </p>
                <DigitalPhysicsViz lang={lang} />
              </div>

              {/* key thinkers */}
              <div className="space-y-3">
                {[
                  {
                    en_h: "Wheeler: 'It from Bit'",
                    zh_h: "惠勒：「万物源于比特」",
                    en: "John Archibald Wheeler (1989): every particle, every field, even spacetime itself derives its existence from binary choices — participatory, observer-mediated information.",
                    zh: "约翰·惠勒（1989）：每个粒子、每个场，乃至时空本身，都从二元选择——参与性的、由观察者介入的信息——中获得其存在。",
                    color: C.holo5,
                  },
                  {
                    en_h: "Wolfram: A New Kind of Science",
                    zh_h: "沃尔夫拉姆：《一种新的科学》",
                    en: "Wolfram (2002) proposed that simple computational rules (like cellular automata) could generate all physical complexity. His 2020 Ruliad project extends this to an abstract computational universe. Provocative; not yet falsifiable at the physics level.",
                    zh: "沃尔夫拉姆（2002）提出，简单的计算规则（如元胞自动机）可能生成所有物理复杂性。他2020年的Ruliad项目将此扩展为抽象计算宇宙。引人深思；但在物理层面尚不可证伪。",
                    color: C.flux5,
                  },
                  {
                    en_h: "What would it take to be true?",
                    zh_h: "这需要什么才能成立？",
                    en: "A computational substrate for reality would need to produce quantisation, Lorentz invariance, and quantum entanglement as emergent properties — without introducing a preferred frame or discretisation scale we'd already have detected.",
                    zh: "现实的计算基底需要将量子化、洛伦兹不变性和量子纠缠作为涌现属性产生——同时不引入我们已经能探测到的优先参考系或离散化尺度。",
                    color: C.iris4,
                  },
                ].map((item, i) => (
                  <div key={i} className="panel rounded-xl p-4 space-y-1.5"
                    style={{ borderColor: `${item.color}22` }}>
                    <div className={`text-[0.78rem] font-semibold ${lang === "zh" ? "zh" : ""}`}
                      style={{ color: item.color }}>{lang === "zh" ? item.zh_h : item.en_h}</div>
                    <p className={`text-[0.76rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}
                      style={{ color: C.ink5 }}>{lang === "zh" ? item.zh : item.en}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* resolution bridge */}
            <div className="panel rounded-xl p-5 space-y-2 border-l-2" style={{ borderLeftColor: C.holo5 }}>
              <p className="label-mono text-[0.6rem]" style={{ color: C.holo4 }}>
                {L("The VR Parallel", "VR的类比")}
              </p>
              <p className={`text-[0.84rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
                {L(
                  "A VR physics engine is literally digital physics: spacetime is a float buffer, forces are numerical integrations, matter is vertex data. When you build one convincingly enough, you realise that the question 'is the physics real?' becomes indistinguishable from 'does it behave consistently?'. Digital physics asks if nature itself is in this position — that what we call physical law is the consistent behaviour of an underlying computation whose substrate we cannot observe from inside.",
                  "VR物理引擎字面上就是数字物理：时空是浮点缓冲区，力是数值积分，物质是顶点数据。当你构建的足够逼真时，你会意识到「物理是真实的吗？」这个问题与「它表现一致吗？」变得无法区分。数字物理学追问自然本身是否处于这种境地——我们所说的物理定律是底层计算的一致行为，而我们从内部无法观察其基底。"
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── rule ─────────────────────────────────────────────────────── */}
      <div className="w-full h-px rule-flux rounded" />

      {/* ── comparison table ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <p className="label-mono" style={{ color: C.iris4 }}>
          {L("Epistemic Comparison", "认识论比较")}
        </p>
        <div className="panel rounded-xl overflow-hidden">
          <table className="w-full text-[0.74rem] border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { en: "Idea", zh: "观念" },
                  { en: "Status", zh: "地位" },
                  { en: "Evidence", zh: "证据" },
                  { en: "Falsifiable?", zh: "可证伪？" },
                ].map((h, i) => (
                  <th key={i} className={`text-left px-4 py-3 font-mono ${lang === "zh" ? "zh" : ""}`}
                    style={{ color: C.ink5 }}>
                    {lang === "zh" ? h.zh : h.en}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  en_idea: "Simulation Hypothesis",
                  zh_idea: "模拟假说",
                  status: "philosophy" as EpistemicStatus,
                  en_ev: "Logical argument only",
                  zh_ev: "仅为逻辑论证",
                  en_f: "In principle, no",
                  zh_f: "原则上，否",
                },
                {
                  en_idea: "Holographic Principle",
                  zh_idea: "全息原理",
                  status: "physics" as EpistemicStatus,
                  en_ev: "Black-hole thermodynamics, AdS/CFT",
                  zh_ev: "黑洞热力学、AdS/CFT",
                  en_f: "Yes — tested in specific regimes",
                  zh_f: "是——在特定范围内已验证",
                },
                {
                  en_idea: "Digital Physics",
                  zh_idea: "数字物理学",
                  status: "conjecture" as EpistemicStatus,
                  en_ev: "Mathematical analogy; no confirmed predictions",
                  zh_ev: "数学类比；无已确认的预测",
                  en_f: "Proposed versions unclear",
                  zh_f: "现有版本尚不明确",
                },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className={`px-4 py-3 font-semibold ${lang === "zh" ? "zh" : ""}`}
                    style={{ color: BADGE[row.status].color }}>
                    {lang === "zh" ? row.zh_idea : row.en_idea}
                  </td>
                  <td className="px-4 py-3">
                    <EpistemicBadge status={row.status} lang={lang} />
                  </td>
                  <td className={`px-4 py-3 ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
                    {lang === "zh" ? row.zh_ev : row.en_ev}
                  </td>
                  <td className={`px-4 py-3 ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
                    {lang === "zh" ? row.zh_f : row.en_f}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── closing note ─────────────────────────────────────────────── */}
      <div className="panel panel-iris rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <span style={{ color: C.iris4 }}>◈</span>
          <span className="label-mono text-[0.62rem]" style={{ color: C.iris4 }}>
            {L("Resolution, Not a Wall", "分辨率，而非隔墙")}
          </span>
        </div>
        <p className={`text-[0.84rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink3 }}>
          {L(
            "The most honest thing we can say: building virtual worlds teaches us that 'simulated vs real' is less a binary than a spectrum of resolution, consistency, and causal depth. A world is 'real' to its inhabitants when its physics is consistent, its objects persist, its causes produce reliable effects. Whether our world meets these criteria at some deeper computational level is a question we cannot answer — and may not be able to answer from inside.",
            "我们能说的最诚实的话是：构建虚拟世界让我们明白，「模拟的与真实的」与其说是二元对立，不如说是分辨率、一致性和因果深度的谱系。当一个世界的物理法则一致、物体持久存在、原因产生可靠结果时，这个世界对其居民而言就是「真实的」。我们的世界是否在某种更深的计算层面满足这些条件，是一个我们无法回答的问题——也可能是一个我们从内部永远无法回答的问题。"
          )}
        </p>
        <div className="h-px" style={{ background: `${C.iris5}22` }} />
        <p className={`text-[0.76rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink5 }}>
          {L(
            "The three ideas explored here — Bostrom's counting argument, the holographic principle, and digital physics — each add a different facet to this question. None answers it. All sharpen it.",
            "此处探索的三个观念——博斯特罗姆的计数论证、全息原理和数字物理学——各自为这个问题增添了不同的面向。没有一个能回答它，但都使它更加清晰。"
          )}
        </p>
      </div>

    </section>
  );
}
