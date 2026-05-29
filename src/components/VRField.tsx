"use client";

import { useEffect, useRef } from "react";

/* VRField — full-bleed animated hero background.
   A holographic spatial environment: infinite perspective grid receding into
   depth, floating glowing particles/motes, faint drifting wireframe shapes,
   subtle parallax on mouse move, slow forward drift — flying through VR.
   Palette (site bg #06030f):
     grid electric-blue  #4d9bff  / holographic cyan #22d3ee
     particles VR-purple #a855f7  / bright iris #c98bff
     accent cyberpunk-magenta #ff4d9d
   Additive blending for glow. Never distracting.                            */

/* ── types ─────────────────────────────────────────────────────────────── */
interface Particle {
  x: number;   // 0..1 relative canvas width
  y: number;   // 0..1 relative canvas height
  z: number;   // depth 0..1  (0 = far, 1 = near)
  vz: number;  // depth velocity (flying forward)
  col: string; // hex
  r: number;   // base radius (logical px at z=1)
  phase: number;
  tw: number;  // twinkle speed
}

interface WireShape {
  cx: number; cy: number; // center 0..1
  z: number;              // depth
  vz: number;
  rot: number;            // current rotation radians
  rotV: number;           // rotation velocity
  sides: number;          // 3 | 4 | 6
  size: number;           // base radius (logical px at z=1)
  col: string;
}

/* ── deterministic LCG ──────────────────────────────────────────────────── */
function makeLCG(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = ((s * 9301 + 49297) >>> 0) % 233280;
    return s / 233280;
  };
}

/* ── palette ─────────────────────────────────────────────────────────────── */
const C_BLUE  = "#4d9bff";
const C_HOLO  = "#22d3ee";
const C_IRIS  = "#a855f7";
const C_BRIGHT= "#c98bff";
const C_PLASM = "#ff4d9d";

const PART_COLS  = [C_HOLO, C_IRIS, C_BRIGHT, C_BLUE, C_PLASM];
const SHAPE_COLS = [C_BLUE, C_HOLO, C_IRIS];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

/* ── component ──────────────────────────────────────────────────────────── */
export default function VRField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr    = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0, h = 0;

    /* ── state ─────────────────────────────────────────────────────────── */
    let particles: Particle[] = [];
    let shapes: WireShape[]   = [];

    /* ── grid perspective state ─────────────────────────────────────────── */
    // Z offset cycles 0→1 to create infinite forward motion
    let gridZ = 0;

    /* ── resize + reinit ─────────────────────────────────────────────── */
    function resize() {
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width  = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    }

    function init() {
      const rand = makeLCG(0x7ef3a2);

      /* particles */
      const pCount = w < 640 ? 55 : w < 1200 ? 80 : 110;
      particles = [];
      for (let i = 0; i < pCount; i++) {
        particles.push({
          x:     rand(),
          y:     rand(),
          z:     rand(),           // spread across depth
          vz:    0.0008 + rand() * 0.0012,  // fly forward
          col:   PART_COLS[Math.floor(rand() * PART_COLS.length)],
          r:     0.8 + rand() * 2.4,
          phase: rand() * Math.PI * 2,
          tw:    0.5 + rand() * 1.8,
        });
      }

      /* wireframe shapes */
      const sCount = w < 640 ? 6 : w < 1200 ? 10 : 14;
      shapes = [];
      const sidePick = [3, 4, 4, 6] as const;
      for (let i = 0; i < sCount; i++) {
        shapes.push({
          cx:   rand(),
          cy:   rand(),
          z:    rand(),
          vz:   0.0004 + rand() * 0.0007,
          rot:  rand() * Math.PI * 2,
          rotV: (rand() - 0.5) * 0.004,
          sides: sidePick[Math.floor(rand() * sidePick.length)],
          size: 18 + rand() * 44,
          col:  SHAPE_COLS[Math.floor(rand() * SHAPE_COLS.length)],
        });
      }

      gridZ = 0;
    }

    resize();

    /* ── mouse parallax ─────────────────────────────────────────────────── */
    let mx = 0, my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    /* ── grid drawing ───────────────────────────────────────────────────── */
    /* Vanishing-point perspective grid.
       Horizontal lines recede from bottom-center horizon to screen edges.
       Vertical lines fan out from a central vanishing point.             */
    function drawGrid(t: number) {
      const VP_X = w * 0.5 + mx * w * 0.04;   // vanishing point x (parallax)
      const VP_Y = h * 0.38 + my * h * 0.03;  // vanishing point y

      // ── horizontal lines ──────────────────────────────────────────────
      // We draw N "depth slices" — lines that get closer together near VP
      const H_LINES = 18;
      // zOffset animates 0→1 for infinite scroll illusion
      const zOff = (gridZ % 1);

      ctx!.save();
      for (let i = 0; i < H_LINES + 1; i++) {
        // parametric t from 0 (horizon) to 1 (very near bottom)
        const frac = (i + zOff) / H_LINES;
        // perspective mapping: near = large t, far = small t
        const perspT = frac * frac * frac;   // cubic easing = natural perspective
        const y = VP_Y + (h + 20 - VP_Y) * perspT;
        if (y > h + 4) continue;
        if (y < VP_Y) continue;

        // alpha: distant lines are fainter
        const alpha = 0.04 + perspT * 0.22;
        // alternate blue/cyan every few lines for holographic shimmer
        const useCyan = (i % 3 === 0);
        const lineCol = useCyan ? `rgba(34,211,238,${alpha.toFixed(3)})` : `rgba(77,155,255,${alpha.toFixed(3)})`;

        ctx!.strokeStyle = lineCol;
        ctx!.lineWidth   = 0.5 + perspT * 1.2;
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }

      // ── vertical / fan lines ──────────────────────────────────────────
      // Fan lines from VP down to bottom, spread across full width
      const V_LINES = 22;
      for (let i = 0; i <= V_LINES; i++) {
        const frac = i / V_LINES;                  // 0..1 across width
        const bx   = frac * w;                     // bottom target x
        const alpha = 0.05 + Math.abs(frac - 0.5) * 0.18;
        const useCyan = (i % 4 === 0);
        const lineCol = useCyan ? `rgba(34,211,238,${alpha.toFixed(3)})` : `rgba(77,155,255,${alpha.toFixed(3)})`;

        ctx!.strokeStyle = lineCol;
        ctx!.lineWidth   = 0.45;
        ctx!.beginPath();
        ctx!.moveTo(VP_X, VP_Y);
        ctx!.lineTo(bx, h + 4);
        ctx!.stroke();
      }

      // ── horizon shimmer line ──────────────────────────────────────────
      const hGrd = ctx!.createLinearGradient(0, VP_Y, w, VP_Y);
      hGrd.addColorStop(0,    "rgba(34,211,238,0)");
      hGrd.addColorStop(0.2,  "rgba(77,155,255,0.18)");
      hGrd.addColorStop(0.5,  "rgba(34,211,238,0.38)");
      hGrd.addColorStop(0.8,  "rgba(77,155,255,0.18)");
      hGrd.addColorStop(1,    "rgba(34,211,238,0)");
      ctx!.strokeStyle = hGrd;
      ctx!.lineWidth   = 1.2;
      ctx!.beginPath();
      ctx!.moveTo(0, VP_Y);
      ctx!.lineTo(w, VP_Y);
      ctx!.stroke();

      ctx!.restore();
    }

    /* ── wireframe polygon helper ───────────────────────────────────────── */
    function drawWireShape(s: WireShape, alpha: number) {
      const sx = s.cx * w;
      const sy = s.cy * h;
      const scale = 0.2 + s.z * 0.8;        // near shapes bigger
      const R = s.size * scale;
      const [r, g, b] = hexToRgb(s.col);

      ctx!.save();
      ctx!.translate(sx, sy);
      ctx!.rotate(s.rot);
      ctx!.strokeStyle = `rgba(${r},${g},${b},${(alpha * 0.55).toFixed(3)})`;
      ctx!.lineWidth = 0.7 + scale * 0.8;

      /* outer ring */
      ctx!.beginPath();
      for (let i = 0; i <= s.sides; i++) {
        const a = (i / s.sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * R, py = Math.sin(a) * R;
        i === 0 ? ctx!.moveTo(px, py) : ctx!.lineTo(px, py);
      }
      ctx!.stroke();

      /* inner ring at 0.45× */
      ctx!.beginPath();
      ctx!.strokeStyle = `rgba(${r},${g},${b},${(alpha * 0.25).toFixed(3)})`;
      for (let i = 0; i <= s.sides; i++) {
        const a = (i / s.sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * R * 0.45, py = Math.sin(a) * R * 0.45;
        i === 0 ? ctx!.moveTo(px, py) : ctx!.lineTo(px, py);
      }
      ctx!.stroke();

      /* spokes */
      ctx!.strokeStyle = `rgba(${r},${g},${b},${(alpha * 0.15).toFixed(3)})`;
      ctx!.lineWidth = 0.4;
      for (let i = 0; i < s.sides; i++) {
        const a = (i / s.sides) * Math.PI * 2 - Math.PI / 2;
        ctx!.beginPath();
        ctx!.moveTo(0, 0);
        ctx!.lineTo(Math.cos(a) * R, Math.sin(a) * R);
        ctx!.stroke();
      }

      ctx!.restore();
    }

    /* ── particle glow helper ───────────────────────────────────────────── */
    function drawParticle(p: Particle, twinkle: number) {
      const px = p.x * w + mx * w * 0.025 * p.z;
      const py = p.y * h + my * h * 0.018 * p.z;
      const scale = 0.15 + p.z * 0.85;
      const R  = p.r * scale;
      const gR = R * (3.5 + twinkle * 5);
      const [r, g, b] = hexToRgb(p.col);
      const ca = (0.4 + twinkle * 0.6).toFixed(3);

      const grd = ctx!.createRadialGradient(px, py, 0, px, py, gR);
      grd.addColorStop(0,   `rgba(${r},${g},${b},${ca})`);
      grd.addColorStop(0.35,`rgba(${r},${g},${b},${(+ca * 0.3).toFixed(3)})`);
      grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx!.fillStyle = grd;
      ctx!.beginPath();
      ctx!.arc(px, py, gR, 0, Math.PI * 2);
      ctx!.fill();

      /* crisp core */
      ctx!.fillStyle = `rgba(${r},${g},${b},${(0.65 + twinkle * 0.35).toFixed(3)})`;
      ctx!.beginPath();
      ctx!.arc(px, py, R * (0.7 + twinkle * 0.5), 0, Math.PI * 2);
      ctx!.fill();
    }

    /* ── ambient depth haze ─────────────────────────────────────────────── */
    function drawHaze() {
      /* deep vanishing-point radial fog */
      const VP_X = w * 0.5;
      const VP_Y = h * 0.38;
      const grd = ctx!.createRadialGradient(VP_X, VP_Y, 0, VP_X, VP_Y, Math.max(w, h) * 0.7);
      grd.addColorStop(0,   "rgba(34,211,238,0.05)");
      grd.addColorStop(0.4, "rgba(77,155,255,0.03)");
      grd.addColorStop(1,   "rgba(6,3,15,0)");
      ctx!.fillStyle = grd;
      ctx!.fillRect(0, 0, w, h);

      /* bottom near-field gradient: deep purple haze */
      const botGrd = ctx!.createLinearGradient(0, h * 0.55, 0, h);
      botGrd.addColorStop(0, "rgba(168,85,247,0)");
      botGrd.addColorStop(1, "rgba(168,85,247,0.06)");
      ctx!.fillStyle = botGrd;
      ctx!.fillRect(0, h * 0.55, w, h * 0.45);
    }

    /* ── main loop ──────────────────────────────────────────────────────── */
    let tick = 0;
    function frame() {
      tick++;
      ctx!.clearRect(0, 0, w, h);

      /* advance grid z */
      gridZ += 0.004;

      /* ── grid (source-over, faint) ────────────────────────────────── */
      drawGrid(tick);

      /* ── depth haze ────────────────────────────────────────────────── */
      drawHaze();

      /* ── wireframe shapes (source-over) ───────────────────────────── */
      for (const s of shapes) {
        s.z   += s.vz;
        s.rot += s.rotV;
        if (s.z > 1.08) {
          /* recycle to far distance, new random position */
          const lcgR = makeLCG((tick * 7919 + shapes.indexOf(s) * 3571) >>> 0);
          s.z   = 0.02 + lcgR() * 0.15;
          s.cx  = lcgR();
          s.cy  = 0.1 + lcgR() * 0.8;
        }
        const alpha = s.z * 0.5;  // fade in as it approaches
        if (alpha < 0.02) continue;
        drawWireShape(s, alpha);
      }

      /* ── particles (additive) ─────────────────────────────────────── */
      ctx!.globalCompositeOperation = "lighter";
      for (const p of particles) {
        p.z += p.vz;
        if (p.z > 1.1) {
          // recycle: send to far field, random new XY
          const lcgR = makeLCG((tick * 6271 + particles.indexOf(p) * 4127) >>> 0);
          p.z  = 0.0 + lcgR() * 0.08;
          p.x  = lcgR();
          p.y  = lcgR();
        }
        const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(tick * 0.014 * p.tw + p.phase));
        drawParticle(p, twinkle * Math.min(1, p.z * 5));
      }
      ctx!.globalCompositeOperation = "source-over";

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    frame();
    if (reduce) {
      /* a few extra passes for a settled static snapshot */
      for (let i = 0; i < 8; i++) frame();
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="h-full w-full" aria-hidden />;
}
