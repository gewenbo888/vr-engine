"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "./lang";

/* ─────────────────────────────────────────────────────────────────────────────
   PALETTE — matches globals.css contract
───────────────────────────────────────────────────────────────────────────── */
const C = {
  void950:  "#06030f",
  void900:  "#0b0620",
  void800:  "#120a33",
  void700:  "#1a1048",
  flux500:  "#4d9bff",
  flux400:  "#93c5ff",
  iris500:  "#a855f7",
  iris400:  "#c98bff",
  holo500:  "#22d3ee",
  holo400:  "#67e8f9",
  gold500:  "#f5c24d",
  gold400:  "#ffd97a",
  plasm500: "#ff4d9d",
  ink50:    "#f6f4ff",
  ink300:   "#b3afd8",
  ink500:   "#797399",
};

/* ─────────────────────────────────────────────────────────────────────────────
   DETERMINISTIC PSEUDO-NOISE (no Math.random in render)
───────────────────────────────────────────────────────────────────────────── */
function dNoise(t: number, seed: number): number {
  const x = Math.sin(seed * 127.1 + t * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ─────────────────────────────────────────────────────────────────────────────
   MODE TOGGLE: "today" | "fulldive"
───────────────────────────────────────────────────────────────────────────── */
type Mode = "today" | "fulldive";

/* ─────────────────────────────────────────────────────────────────────────────
   SIGNAL PATH DIAGRAM (SVG)
   Shows the chain of nodes with active highlights per mode.
   Today:    World → Display → Eyes/Ears → Sensory Nerve → Brain
   FullDive: World → [Display bypassed] → Device → Sensory Nerve → Brain
             with a READ arrow from motor cortex → Device
───────────────────────────────────────────────────────────────────────────── */

interface PathNode {
  id: string;
  label: { en: string; zh: string };
  sub: { en: string; zh: string };
  cx: number;
  cy: number;
  shape: "rect" | "circle" | "hex";
  color: string;
  todayActive: boolean;
  fulldiveActive: boolean;
  todayBypassed: boolean;  // crossed-out in fulldive
}

const PATH_NODES: PathNode[] = [
  {
    id: "world",
    label: { en: "Physical World", zh: "物理世界" },
    sub:   { en: "light · sound · touch", zh: "光 · 声 · 触" },
    cx: 60, cy: 120,
    shape: "circle",
    color: C.ink300,
    todayActive: true,
    fulldiveActive: false,
    todayBypassed: false,
  },
  {
    id: "display",
    label: { en: "Screen / Speakers", zh: "屏幕 / 扬声器" },
    sub:   { en: "photons & pressure waves", zh: "光子与声压波" },
    cx: 175, cy: 60,
    shape: "rect",
    color: C.flux500,
    todayActive: true,
    fulldiveActive: false,
    todayBypassed: true,  // shown as bypassed node in fulldive
  },
  {
    id: "senses",
    label: { en: "Eyes / Ears / Skin", zh: "眼 / 耳 / 皮肤" },
    sub:   { en: "transduces physical → electrical", zh: "物理信号转化为电信号" },
    cx: 290, cy: 60,
    shape: "rect",
    color: C.flux500,
    todayActive: true,
    fulldiveActive: false,
    todayBypassed: true,
  },
  {
    id: "device",
    label: { en: "Neural Interface", zh: "神经接口" },
    sub:   { en: "writes signal directly to nerve", zh: "直接向神经写入信号" },
    cx: 232, cy: 180,
    shape: "hex",
    color: C.holo500,
    todayActive: false,
    fulldiveActive: true,
    todayBypassed: false,
  },
  {
    id: "nerve",
    label: { en: "Sensory Nerve / Cortex", zh: "感觉神经 / 皮层" },
    sub:   { en: "spike patterns into the brain", zh: "锋电位进入大脑" },
    cx: 390, cy: 120,
    shape: "rect",
    color: C.iris400,
    todayActive: true,
    fulldiveActive: true,
    todayBypassed: false,
  },
  {
    id: "brain",
    label: { en: "Brain", zh: "大脑" },
    sub:   { en: "perception constructed here", zh: "感知在此构建" },
    cx: 510, cy: 120,
    shape: "circle",
    color: C.iris500,
    todayActive: true,
    fulldiveActive: true,
    todayBypassed: false,
  },
];

function PathDiagram({ mode, lang }: { mode: Mode; lang: "en" | "zh" }) {
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);

  // The today path arrows
  const todayArrows: [string, string][] = [
    ["world", "display"],
    ["display", "senses"],
    ["senses", "nerve"],
    ["nerve", "brain"],
  ];

  // The fulldive path arrows
  const fulldiveArrows: [string, string][] = [
    ["device", "nerve"],
    ["nerve", "brain"],
  ];

  // The READ arrow (from brain → device)
  const brainNode = PATH_NODES.find(n => n.id === "brain")!;
  const deviceNode = PATH_NODES.find(n => n.id === "device")!;

  const nodeMap = Object.fromEntries(PATH_NODES.map(n => [n.id, n]));

  function getNodeCenter(id: string): [number, number] {
    const n = nodeMap[id];
    return [n.cx, n.cy];
  }

  return (
    <svg
      viewBox="0 0 600 260"
      className="w-full h-full"
      aria-label={L("Signal path diagram: today vs full-dive", "信号路径图：今日模式 vs 全沉浸模式")}
    >
      <defs>
        <filter id="fdl-glow">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="fdl-glow-sm">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrow-flux" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0.5 L6,3.5 L0,6.5 Z" fill={C.flux500} opacity="0.8" />
        </marker>
        <marker id="arrow-holo" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0.5 L6,3.5 L0,6.5 Z" fill={C.holo500} opacity="0.9" />
        </marker>
        <marker id="arrow-plasm" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0.5 L6,3.5 L0,6.5 Z" fill={C.plasm500} opacity="0.8" />
        </marker>
        <marker id="arrow-iris" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0.5 L6,3.5 L0,6.5 Z" fill={C.iris400} opacity="0.8" />
        </marker>
        <radialGradient id="fdl-brain-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.iris500} stopOpacity="0.3" />
          <stop offset="100%" stopColor={C.iris500} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── TODAY mode arrows ── */}
      {mode === "today" && todayArrows.map(([from, to]) => {
        const [x1, y1] = getNodeCenter(from);
        const [x2, y2] = getNodeCenter(to);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return (
          <path
            key={`${from}-${to}`}
            d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
            fill="none"
            stroke={C.flux500}
            strokeWidth="1.8"
            strokeOpacity="0.75"
            strokeDasharray={from === "world" ? "none" : "none"}
            markerEnd="url(#arrow-flux)"
            className="flow"
          />
        );
      })}

      {/* ── FULLDIVE mode arrows ── */}
      {mode === "fulldive" && (
        <>
          {/* World → (dimmed, bypassed) */}
          <path
            d={`M${nodeMap["world"].cx},${nodeMap["world"].cy} Q${(nodeMap["world"].cx + deviceNode.cx)/2},${nodeMap["world"].cy} ${deviceNode.cx},${deviceNode.cy}`}
            fill="none"
            stroke={C.ink500}
            strokeWidth="1"
            strokeOpacity="0.25"
            strokeDasharray="4 6"
          />

          {/* WRITE: Device → Sensory Nerve */}
          {fulldiveArrows.slice(0,1).map(([from, to]) => {
            const [x1,y1] = getNodeCenter(from);
            const [x2,y2] = getNodeCenter(to);
            return (
              <path
                key={`${from}-${to}`}
                d={`M${x1},${y1} L${x2},${y2}`}
                fill="none"
                stroke={C.holo500}
                strokeWidth="2.4"
                strokeOpacity="0.9"
                markerEnd="url(#arrow-holo)"
                filter="url(#fdl-glow-sm)"
                className="flow"
              />
            );
          })}

          {/* Nerve → Brain */}
          {fulldiveArrows.slice(1).map(([from, to]) => {
            const [x1,y1] = getNodeCenter(from);
            const [x2,y2] = getNodeCenter(to);
            return (
              <path
                key={`${from}-${to}`}
                d={`M${x1},${y1} L${x2},${y2}`}
                fill="none"
                stroke={C.iris400}
                strokeWidth="2"
                strokeOpacity="0.85"
                markerEnd="url(#arrow-iris)"
                className="flow"
              />
            );
          })}

          {/* READ: Brain → Device (curved, plasm) */}
          <path
            d={`M${brainNode.cx},${brainNode.cy + 20} C${brainNode.cx + 40},240 ${deviceNode.cx + 80},240 ${deviceNode.cx + 18},${deviceNode.cy + 14}`}
            fill="none"
            stroke={C.plasm500}
            strokeWidth="1.8"
            strokeOpacity="0.8"
            strokeDasharray="5 4"
            markerEnd="url(#arrow-plasm)"
            filter="url(#fdl-glow-sm)"
          />
          {/* READ label */}
          <text x="390" y="250" textAnchor="middle"
            fontSize="7.5" fontFamily="JetBrains Mono, monospace"
            fill={C.plasm500} fillOpacity="0.8" letterSpacing="0.1em">
            {L("READ motor intent", "读取运动意图")}
          </text>
        </>
      )}

      {/* ── NODES ── */}
      {PATH_NODES.map((node) => {
        const isActive = mode === "today" ? node.todayActive : node.fulldiveActive;
        const isBypassed = mode === "fulldive" && node.todayBypassed;
        const opacity = isBypassed ? 0.2 : isActive ? 1 : (mode === "today" ? 0.08 : 0.15);
        const color = isActive ? node.color : C.ink500;
        const { cx, cy } = node;

        return (
          <g key={node.id} opacity={opacity} style={{ transition: "opacity 0.5s" }}>
            {/* Brain gets a glow blob */}
            {node.id === "brain" && isActive && (
              <circle cx={cx} cy={cy} r={44} fill="url(#fdl-brain-glow)" />
            )}
            {/* Shape */}
            {node.shape === "circle" && (
              <>
                <circle cx={cx} cy={cy} r={28}
                  fill={C.void800}
                  stroke={color}
                  strokeWidth={isActive ? 1.8 : 0.8}
                  filter={isActive && node.id === "brain" ? "url(#fdl-glow)" : undefined}
                />
                {node.id === "brain" && isActive && (
                  <circle cx={cx} cy={cy} r={20}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.6"
                    strokeDasharray="3 5"
                    strokeOpacity="0.4"
                  />
                )}
              </>
            )}
            {node.shape === "rect" && (
              <rect
                x={cx - 38} y={cy - 22} width={76} height={44} rx="6"
                fill={C.void800}
                stroke={color}
                strokeWidth={isActive ? 1.8 : 0.8}
                filter={isActive ? "url(#fdl-glow-sm)" : undefined}
              />
            )}
            {node.shape === "hex" && (
              <>
                {/* Hexagon via polygon */}
                <polygon
                  points={[0,1,2,3,4,5].map(i => {
                    const a = (i * 60 - 30) * Math.PI / 180;
                    return `${cx + 30 * Math.cos(a)},${cy + 30 * Math.sin(a)}`;
                  }).join(" ")}
                  fill={C.void800}
                  stroke={color}
                  strokeWidth={isActive ? 2.2 : 0.8}
                  filter={isActive ? "url(#fdl-glow)" : undefined}
                />
                {/* Inner hex ring */}
                {isActive && (
                  <polygon
                    points={[0,1,2,3,4,5].map(i => {
                      const a = (i * 60 - 30) * Math.PI / 180;
                      return `${cx + 20 * Math.cos(a)},${cy + 20 * Math.sin(a)}`;
                    }).join(" ")}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.6"
                    strokeDasharray="2 3"
                    strokeOpacity="0.5"
                  />
                )}
              </>
            )}

            {/* Bypassed X mark */}
            {isBypassed && (
              <>
                <line x1={cx - 16} y1={cy - 16} x2={cx + 16} y2={cy + 16}
                  stroke={C.plasm500} strokeWidth="2" strokeOpacity="0.7" />
                <line x1={cx + 16} y1={cy - 16} x2={cx - 16} y2={cy + 16}
                  stroke={C.plasm500} strokeWidth="2" strokeOpacity="0.7" />
              </>
            )}

            {/* Label */}
            <text x={cx} y={cy - 2}
              textAnchor="middle"
              fontSize={lang === "zh" ? "7.5" : "7"}
              fontFamily={lang === "zh" ? "Noto Serif SC, serif" : "JetBrains Mono, monospace"}
              fill={isActive ? color : C.ink500}
              letterSpacing="0.06em"
              fontWeight="600"
            >
              {node.label[lang]}
            </text>
            <text x={cx} y={cy + 10}
              textAnchor="middle"
              fontSize="6"
              fontFamily="JetBrains Mono, monospace"
              fill={isActive ? color : C.ink500}
              fillOpacity="0.6"
              letterSpacing="0.04em"
            >
              {node.sub[lang]}
            </text>
          </g>
        );
      })}

      {/* ── WRITE label on holo arrow ── */}
      {mode === "fulldive" && (
        <text
          x={(deviceNode.cx + nodeMap["nerve"].cx) / 2}
          y={((deviceNode.cy + nodeMap["nerve"].cy) / 2) - 8}
          textAnchor="middle"
          fontSize="7.5"
          fontFamily="JetBrains Mono, monospace"
          fill={C.holo500}
          fillOpacity="0.9"
          letterSpacing="0.1em"
        >
          {L("WRITE", "写入")}
        </text>
      )}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BRAIN CANVAS — animated neural read/write loops for fulldive mode
   Particles flow in (write) and out (read), cycling around a stylised brain.
───────────────────────────────────────────────────────────────────────────── */

interface Particle {
  angle: number;
  speed: number;
  radius: number;
  size: number;
  type: "write" | "read";
  phase: number;
}

// Deterministic particle initialization
const PARTICLES: Particle[] = Array.from({ length: 28 }, (_, i) => ({
  angle:  (i / 28) * Math.PI * 2,
  speed:  0.005 + (i % 5) * 0.003,
  radius: 62 + (i % 4) * 12,
  size:   1.4 + (i % 3) * 0.7,
  type:   i % 3 === 0 ? "read" : "write",
  phase:  (i * 0.37) % (Math.PI * 2),
}));

function BrainCanvas({ mode }: { mode: Mode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);
  const particlesRef = useRef(PARTICLES.map(p => ({ ...p })));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // DPR-aware resize
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf: number;

    function draw() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const cx = W / 2;
      const cy = H / 2;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = C.void950;
      ctx.fillRect(0, 0, W, H);

      phaseRef.current += 0.016;
      const t = phaseRef.current;

      // Background subtle grid
      ctx.save();
      ctx.strokeStyle = `${C.iris500}10`;
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx <= W; gx += 28) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy <= H; gy += 28) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }
      ctx.restore();

      const brainR = Math.min(W, H) * 0.28;

      // ── Brain outer glow ──
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, brainR * 1.6);
      glowGrad.addColorStop(0,   `${C.iris500}30`);
      glowGrad.addColorStop(0.5, `${C.iris500}12`);
      glowGrad.addColorStop(1,   `${C.iris500}00`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, brainR * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // ── Brain shape (stylised left-hemisphere oval) ──
      ctx.save();
      ctx.shadowColor = mode === "fulldive" ? C.iris500 : C.iris500;
      ctx.shadowBlur = mode === "fulldive" ? 28 : 14;
      ctx.strokeStyle = mode === "fulldive" ? C.iris400 : `${C.iris500}70`;
      ctx.lineWidth = mode === "fulldive" ? 2 : 1.2;
      ctx.beginPath();
      // Stylised blob via bezier
      ctx.moveTo(cx, cy - brainR);
      ctx.bezierCurveTo(
        cx + brainR * 0.85, cy - brainR * 0.9,
        cx + brainR * 1.1,  cy + brainR * 0.1,
        cx + brainR * 0.4,  cy + brainR * 0.85
      );
      ctx.bezierCurveTo(
        cx,                 cy + brainR * 1.0,
        cx - brainR * 0.55, cy + brainR * 0.85,
        cx - brainR * 0.9,  cy + brainR * 0.1
      );
      ctx.bezierCurveTo(
        cx - brainR * 1.05, cy - brainR * 0.55,
        cx - brainR * 0.55, cy - brainR * 1.0,
        cx,                 cy - brainR
      );
      ctx.stroke();
      ctx.restore();

      // ── Inner cortex fold lines (deterministic sulci) ──
      const sulci = [
        { a: 0.35, r0: brainR * 0.45, r1: brainR * 0.82 },
        { a: 0.6,  r0: brainR * 0.4,  r1: brainR * 0.75 },
        { a: 0.88, r0: brainR * 0.35, r1: brainR * 0.7  },
      ];
      ctx.save();
      ctx.strokeStyle = `${C.iris400}25`;
      ctx.lineWidth = 0.8;
      sulci.forEach(({ a, r0, r1 }) => {
        ctx.beginPath();
        ctx.moveTo(cx + r0 * Math.cos(a * Math.PI * 2), cy + r0 * Math.sin(a * Math.PI * 2));
        ctx.lineTo(cx + r1 * Math.cos(a * Math.PI * 2), cy + r1 * Math.sin(a * Math.PI * 2));
        ctx.stroke();
      });
      ctx.restore();

      // ── TODAY mode: simple inward-flowing arrows showing sensory path ──
      if (mode === "today") {
        const arrows = [0.12, 0.38, 0.62, 0.88];
        arrows.forEach((frac, i) => {
          const a = frac * Math.PI * 2;
          const outerR = brainR * 1.55;
          const innerR = brainR * 1.05;
          // animated travel
          const travel = (t * 0.5 + i * 0.25) % 1;
          const tr = outerR + (innerR - outerR) * travel;
          const ax = cx + tr * Math.cos(a);
          const ay = cy + tr * Math.sin(a);

          ctx.save();
          ctx.fillStyle = C.flux500;
          ctx.shadowColor = C.flux500;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.4);
          ctx.beginPath();
          ctx.arc(ax, ay, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        // label
        ctx.save();
        ctx.font = "9px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = `${C.flux400}90`;
        ctx.fillText("INBOUND SENSORY", cx, cy + brainR * 1.85);
        ctx.restore();
      }

      // ── FULLDIVE mode: particles in two rings — write (in) and read (out) ──
      if (mode === "fulldive") {
        particlesRef.current.forEach((p) => {
          p.angle += p.speed;
          const a = p.angle + p.phase;
          const px = cx + p.radius * Math.cos(a);
          const py = cy + p.radius * Math.sin(a);

          const color = p.type === "write" ? C.holo500 : C.plasm500;
          // pulsing alpha
          const alpha = 0.4 + 0.6 * dNoise(t + p.phase, p.type === "write" ? 1 : 2);

          ctx.save();
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Trailing line toward brain
          const dirX = (cx - px) / p.radius;
          const dirY = (cy - py) / p.radius;
          const trailLen = p.type === "write" ? 18 : -14;
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = alpha * 0.35;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + dirX * trailLen, py + dirY * trailLen);
          ctx.stroke();
          ctx.restore();
        });

        // WRITE / READ labels on rings
        ctx.save();
        ctx.font = "8.5px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = `${C.holo500}cc`;
        ctx.fillText("WRITE →", cx, cy - brainR * 1.2 - 6);
        ctx.fillStyle = `${C.plasm500}cc`;
        ctx.fillText("← READ", cx, cy + brainR * 1.2 + 16);
        ctx.restore();

        // Pulsing core dot
        const coreAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.2));
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, brainR * 0.28);
        coreGrad.addColorStop(0, `${C.iris500}${Math.round(coreAlpha * 180).toString(16).padStart(2,"0")}`);
        coreGrad.addColorStop(1, `${C.iris500}00`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, brainR * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   REALITY CARD — "where we actually are" entries
───────────────────────────────────────────────────────────────────────────── */

interface RealityEntry {
  id: string;
  tech: { en: string; zh: string };
  status: "real" | "partial" | "speculative";
  what: { en: string; zh: string };
  gap: { en: string; zh: string };
}

const REALITY: RealityEntry[] = [
  {
    id: "cochlear",
    tech: { en: "Cochlear Implants", zh: "人工耳蜗" },
    status: "real",
    what: {
      en: "Electrode array (22 channels) bypasses damaged hair cells, stimulates the auditory nerve directly. ~700,000 people use them today.",
      zh: "电极阵列（22通道）绕过受损毛细胞，直接刺激听神经。目前约70万人在使用。",
    },
    gap: {
      en: "22 channels vs. ~3,500 inner hair cells. Sound is intelligible but lacks the timbre richness of natural hearing.",
      zh: "22通道 vs. 约3500个内毛细胞。声音可辨，但缺乏自然听觉的音色丰富性。",
    },
  },
  {
    id: "retinal",
    tech: { en: "Retinal / Cortical Implants", zh: "视网膜 / 皮层植入物" },
    status: "real",
    what: {
      en: "Argus II, Orion: electrode grids inject crude pixelated vision — enough to detect doorways, large objects. Direct cortical stimulation produces phosphenes.",
      zh: "Argus II、Orion：电极阵列注入粗粒化像素视觉——足以辨别门口和大物体。直接皮层刺激产生光幻视。",
    },
    gap: {
      en: "Best current device: ~60 electrodes. Natural visual cortex: ~200 million neurons with full color, motion, depth, 200° field. Orders of magnitude apart.",
      zh: "最佳现有设备：约60个电极。自然视觉皮层：约2亿神经元，具备全色彩、运动感知、深度感和200°视野。差距达数个数量级。",
    },
  },
  {
    id: "motor-bci",
    tech: { en: "Motor BCIs (BrainGate, Neuralink)", zh: "运动型脑机接口（BrainGate、Neuralink）" },
    status: "real",
    what: {
      en: "Intracortical arrays decode intended movement from motor cortex. Paralysed patients type ~40 words/min, control robotic arms, play video games.",
      zh: "皮层内阵列从运动皮层解码运动意图。瘫痪患者可达每分钟约40词的打字速度，控制机械臂，玩电子游戏。",
    },
    gap: {
      en: "Output only — no sensory return. Signal degrades over months. Arrays cover ~4mm² of a cortex that's ~2,400 cm². Reading intent ≠ writing experience.",
      zh: "仅输出端——无感觉反馈。信号随月降级。阵列覆盖约4平方毫米，而皮层面积约2400平方厘米。读取意图 ≠ 写入体验。",
    },
  },
  {
    id: "sensory-feedback",
    tech: { en: "Somatosensory Stimulation (ICMS)", zh: "躯体感觉刺激（皮层内微电刺激）" },
    status: "partial",
    what: {
      en: "Intracortical microstimulation of somatosensory cortex lets prosthetic hand users perceive rudimentary touch — pressure, texture differentiation.",
      zh: "对躯体感觉皮层进行皮层内微电刺激，使假手用户能感知初步触觉——压力与纹理区分。",
    },
    gap: {
      en: "A handful of channels for one finger. The hand has ~17,000 mechanoreceptors. Rich haptic experience remains far out of reach.",
      zh: "一根手指对应寥寥几个通道。手部约有1.7万个机械感受器。丰富的触觉体验仍遥不可及。",
    },
  },
  {
    id: "full-sensory",
    tech: { en: "High-fidelity Sensory Injection", zh: "高保真感觉注入" },
    status: "speculative",
    what: {
      en: "Writing a full, arbitrary, photorealistic visual scene to the visual cortex. Feels real. Indistinguishable from physical light hitting your retina.",
      zh: "向视觉皮层写入完整、任意、照片级真实的视觉场景。感觉真实，与物理光线照射视网膜无法区分。",
    },
    gap: {
      en: "Unknown electrode count needed: possibly millions. Unknown spike-pattern language for complex scenes. Neural code for 'objects' vs 'raw pixels' barely understood. No timeline.",
      zh: "所需电极数量未知：可能需数百万个。复杂场景的锋电位模式语言未知。「物体」与「原始像素」的神经编码几乎尚未理解。无时间表。",
    },
  },
];

const STATUS_CONFIG = {
  real:        { label: { en: "EXISTS NOW", zh: "已实现" },       color: C.holo500, bg: `${C.holo500}15`        },
  partial:     { label: { en: "EARLY STAGE", zh: "早期阶段" },     color: C.gold500, bg: `${C.gold500}15`        },
  speculative: { label: { en: "SPECULATIVE", zh: "推测性" },       color: C.plasm500, bg: `${C.plasm500}15`     },
};

/* ─────────────────────────────────────────────────────────────────────────────
   ETHICS PANEL
───────────────────────────────────────────────────────────────────────────── */
const ETHICS = [
  {
    id: "control",
    icon: "⚠",
    title:  { en: "Who controls the signal?", zh: "谁控制信号？" },
    body: {
      en: "A cochlear implant manufacturer can push software updates to what you hear. A full-dive interface, if it existed, would give that authority over your entire sensory world. The question of who owns the write-access to your perception is the deepest privacy question there is.",
      zh: "人工耳蜗制造商可以推送软件更新，改变你听到的声音。如果全沉浸接口存在，这种权限将覆盖你整个感知世界。谁拥有对你感知的写入权限，是最深层的隐私问题。",
    },
  },
  {
    id: "consent",
    icon: "◈",
    title: { en: "Consent under immersion", zh: "沉浸状态下的知情同意" },
    body: {
      en: "If the brain receives a fabricated signal indistinguishable from reality, meaningful consent to experiences becomes structurally impossible — you cannot evaluate what you have never been permitted to escape.",
      zh: "如果大脑接收到与现实无法区分的虚假信号，对体验的实质性知情同意在结构上就变得不可能——你无法评价一个你从未被允许逃离的状态。",
    },
  },
  {
    id: "identity",
    icon: "◉",
    title: { en: "Memory and identity continuity", zh: "记忆与身份的连续性" },
    body: {
      en: "Memory formation is itself a neural process. A device that writes to sensory cortex and reads motor cortex sits one architectural step from also writing memories. The self that emerges from that environment may not share continuity with the self that entered.",
      zh: "记忆形成本身就是神经过程。一个写入感觉皮层、读取运动皮层的设备，与写入记忆仅有一步之遥。从那个环境中走出的自我，可能与进入时的自我不再具有连续性。",
    },
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function FullDiveLab() {
  const { lang } = useLang();
  const L = useCallback((en: string, zh: string) => (lang === "zh" ? zh : en), [lang]);
  const [mode, setMode] = useState<Mode>("today");

  return (
    <div className="w-full flex flex-col gap-10">

      {/* ── Section header ── */}
      <div className="flex flex-col gap-3">
        <div className="label-mono" style={{ color: C.holo500 }}>
          {L("System 04 · Full-Dive VR & Neural Immersion", "系统04 · 全沉浸VR与神经沉浸")}
        </div>
        <h2 className={`display text-3xl md:text-4xl leading-tight spark-text ${lang === "zh" ? "zh" : ""}`}>
          {L("Bypassing the Body", "绕过身体")}
        </h2>
        <p
          className={`text-sm max-w-2xl leading-relaxed ${lang === "zh" ? "zh" : ""}`}
          style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
        >
          {L(
            "Perception is not the world — it is the brain's model of the world, constructed from electrical signals. Current VR routes those signals through eyes and ears. Full-dive VR would write them directly onto the nerves, bypassing every sense organ. The principle is sound. The engineering gap is staggering.",
            "感知并非世界本身——而是大脑对世界建构的模型，由电信号构成。当前VR通过眼睛和耳朵传递这些信号。全沉浸VR将直接向神经写入信号，绕过所有感觉器官。原理上成立。工程上的差距令人咋舌。",
          )}
        </p>
      </div>

      <div className="h-px rule-flux opacity-40 rounded-full" />

      {/* ── MODE TOGGLE ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {(["today", "fulldive"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="relative flex items-center gap-2.5 rounded-full border px-5 py-2.5 font-mono text-[0.72rem] tracking-widest uppercase transition-all duration-300"
              style={{
                borderColor: mode === m
                  ? (m === "today" ? C.flux500 : C.holo500)
                  : "rgba(77,155,255,0.18)",
                color: mode === m
                  ? (m === "today" ? C.flux400 : C.holo400)
                  : C.ink500,
                background: mode === m
                  ? (m === "today" ? `${C.flux500}12` : `${C.holo500}12`)
                  : "transparent",
                boxShadow: mode === m
                  ? `0 0 20px -8px ${m === "today" ? C.flux500 : C.holo500}80`
                  : "none",
              }}
              aria-pressed={mode === m}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: mode === m ? (m === "today" ? C.flux500 : C.holo500) : C.ink500,
                  boxShadow: mode === m ? `0 0 6px ${m === "today" ? C.flux500 : C.holo500}` : "none",
                }}
              />
              {m === "today"
                ? L("Today: through the body", "今日：经由身体")
                : L("Full-dive: bypassing the body", "全沉浸：绕过身体")}
            </button>
          ))}
        </div>

        {/* Context caption */}
        <p
          className={`text-xs leading-relaxed max-w-xl ${lang === "zh" ? "zh" : ""}`}
          style={{
            color: C.ink500,
            fontFamily: lang === "zh" ? undefined : '"Spectral", serif',
            transition: "opacity 0.4s",
          }}
        >
          {mode === "today"
            ? L(
                "The external world produces light and sound. Hardware transduces those into signals your eyes and ears understand. Nerves carry the electrical result to cortex, where perception is assembled.",
                "外部世界产生光和声音。硬件将其转换为眼睛和耳朵能理解的信号。神经将电信号传至皮层，感知在此组装。",
              )
            : L(
                "Speculative. A device that understands the spike-pattern language of each sensory nerve could write signals directly — no eye, no ear required. The brain, receiving valid signals, would construct experience indistinguishable from physical reality.",
                "推测性。一种理解各感觉神经锋电位模式语言的设备，可以直接写入信号——无需眼睛，无需耳朵。大脑收到有效信号后，将构建与物理现实无法区分的体验。",
              )}
        </p>
      </div>

      {/* ── PATH DIAGRAM + BRAIN CANVAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

        {/* Signal Path Diagram */}
        <div
          className="panel rounded-2xl border overflow-hidden flex flex-col"
          style={{
            borderColor: mode === "today" ? `${C.flux500}25` : `${C.holo500}30`,
            boxShadow: mode === "today"
              ? `0 0 48px -22px ${C.flux500}44`
              : `0 0 48px -22px ${C.holo500}55`,
            minHeight: 280,
          }}
        >
          <div className="px-4 pt-4 pb-1 flex items-center gap-2">
            <span className="label-mono" style={{ color: mode === "today" ? C.flux400 : C.holo400 }}>
              {L("Signal Path", "信号路径")}
            </span>
            {mode === "fulldive" && (
              <span
                className="text-[0.58rem] font-mono px-2 py-0.5 rounded-full border"
                style={{ color: C.plasm500, borderColor: `${C.plasm500}40`, background: `${C.plasm500}10` }}
              >
                {L("speculative", "推测性")}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-[220px] p-2">
            <PathDiagram mode={mode} lang={lang} />
          </div>
        </div>

        {/* Brain Canvas */}
        <div
          className="panel rounded-2xl border overflow-hidden flex flex-col"
          style={{
            borderColor: `${C.iris500}25`,
            boxShadow: `0 0 60px -28px ${C.iris500}55`,
            minHeight: 280,
          }}
        >
          <div className="px-4 pt-4 pb-1">
            <span className="label-mono" style={{ color: C.iris400 }}>
              {mode === "today"
                ? L("Sensory Input Flow", "感觉输入流")
                : L("Neural Read / Write Loop", "神经读写回路")}
            </span>
          </div>
          <div className="flex-1 min-h-[220px]">
            <BrainCanvas mode={mode} />
          </div>
        </div>
      </div>

      {/* ── WHERE WE ACTUALLY ARE ── */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <div className="label-mono" style={{ color: C.gold500 }}>
            {L("Where We Actually Are", "我们实际所处的位置")}
          </div>
          <h3 className={`display text-xl text-ink-50 ${lang === "zh" ? "zh" : ""}`}>
            {L("Real Pieces, Enormous Gaps", "真实碎片，巨大鸿沟")}
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {REALITY.map((entry) => {
            const sc = STATUS_CONFIG[entry.status];
            return (
              <div
                key={entry.id}
                className="panel rounded-xl border transition-all duration-300"
                style={{ borderColor: `${sc.color}25` }}
              >
                {/* Top bar */}
                <div
                  className="w-full h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${sc.color}60, transparent)`,
                  }}
                />
                <div className="p-4 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h4
                      className={`display text-sm font-bold ${lang === "zh" ? "zh" : ""}`}
                      style={{ color: sc.color }}
                    >
                      {entry.tech[lang]}
                    </h4>
                    <span
                      className="shrink-0 font-mono text-[0.58rem] tracking-widest px-2.5 py-1 rounded-full border"
                      style={{ color: sc.color, borderColor: `${sc.color}40`, background: sc.bg }}
                    >
                      {sc.label[lang]}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <div
                        className="font-mono text-[0.58rem] tracking-widest uppercase mb-1"
                        style={{ color: `${sc.color}88` }}
                      >
                        {L("What exists", "已实现")}
                      </div>
                      <p
                        className={`text-[0.78rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}
                        style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
                      >
                        {entry.what[lang]}
                      </p>
                    </div>
                    <div>
                      <div
                        className="font-mono text-[0.58rem] tracking-widest uppercase mb-1"
                        style={{ color: `${C.plasm500}88` }}
                      >
                        {L("Gap to full-dive", "与全沉浸的差距")}
                      </div>
                      <p
                        className={`text-[0.78rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}
                        style={{ color: C.ink500, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
                      >
                        {entry.gap[lang]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STATUS LEGEND ── */}
      <div className="flex flex-wrap gap-4 items-center">
        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val.color }} />
            <span
              className={`font-mono text-[0.64rem] tracking-widest uppercase ${lang === "zh" ? "zh" : ""}`}
              style={{ color: val.color + "cc" }}
            >
              {val.label[lang]}
            </span>
          </div>
        ))}
      </div>

      <div className="h-px rule-flux opacity-25 rounded-full" />

      {/* ── ETHICS PANEL ── */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <div className="label-mono" style={{ color: C.plasm500 }}>
            {L("Ethical Dimension", "伦理维度")}
          </div>
          <h3 className={`display text-xl text-ink-50 ${lang === "zh" ? "zh" : ""}`}>
            {L("The Write-Access Problem", "写入权限问题")}
          </h3>
          <p
            className={`text-sm max-w-2xl leading-relaxed ${lang === "zh" ? "zh" : ""}`}
            style={{ color: C.ink500, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
          >
            {L(
              "The technical question is hard. The ethical question is harder. A device that writes to your sensory cortex has authority over reality-as-you-experience-it.",
              "技术问题很难。伦理问题更难。一个向你感觉皮层写入信号的设备，对你所经历的现实拥有控制权。",
            )}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {ETHICS.map((item) => (
            <div
              key={item.id}
              className="panel panel-plasm rounded-xl p-4 flex gap-4"
              style={{ borderColor: `${C.plasm500}20` }}
            >
              <div
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-mono text-lg"
                style={{ background: `${C.plasm500}15`, color: C.plasm500, border: `1px solid ${C.plasm500}35` }}
                aria-hidden="true"
              >
                {item.icon}
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <h4
                  className={`display text-sm font-bold ${lang === "zh" ? "zh" : ""}`}
                  style={{ color: C.plasm500 }}
                >
                  {item.title[lang]}
                </h4>
                <p
                  className={`text-[0.8rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}
                  style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
                >
                  {item.body[lang]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CLOSING FRAMING ── */}
      <div
        className="rounded-2xl border px-6 py-5 flex flex-col gap-2"
        style={{
          borderColor: `${C.iris500}20`,
          background: `linear-gradient(135deg, ${C.void800}60, ${C.void900}90)`,
        }}
      >
        <div className="label-mono" style={{ color: C.iris400 }}>
          {L("The honest framing", "诚实的表述")}
        </div>
        <p
          className={`text-sm leading-relaxed ${lang === "zh" ? "zh" : ""}`}
          style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
        >
          {L(
            "Perception is signals. That principle is established neuroscience. A cochlear implant already proves that injecting artificial signals into a nerve produces genuine perception. Full-dive VR is therefore not physically impossible — it is an engineering problem, not a conceptual one. What makes it speculative is the scale: millions of precisely-patterned channels, a neural code for complex experience we have not yet cracked, and materials that do not yet exist at the required density. The gap between 22 channels and full immersive reality is not the gap between prototype and product. It is the gap between a candle and a star.",
            "感知即信号。这是神经科学的确立原理。人工耳蜗已经证明，向神经注入人工信号能产生真实感知。因此，全沉浸VR并非物理上不可能——它是工程问题，而非概念问题。使其成为推测性的，是规模：数百万精确模式化的通道、我们尚未破解的复杂体验神经编码，以及尚不存在的高密度材料。22通道与完全沉浸现实之间的差距，不是原型与产品之间的差距，而是蜡烛与星星之间的差距。",
          )}
        </p>
      </div>
    </div>
  );
}
