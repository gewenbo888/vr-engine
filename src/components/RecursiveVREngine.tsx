"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLang, T } from "./lang";
import type { Bi } from "./lang";

/* ══════════════════════════════════════════════════════════════════
   RecursiveVREngine — The Recursive Experience-Engineering Arc
   System 10 closer: steps through 10 epochs of civilisation
   progressively engineering reality itself — from raw matter to
   programmable experience. The final three epochs are speculative
   and rendered in magenta/plasm.
══════════════════════════════════════════════════════════════════ */

/* ── palette (raw hex for canvas / SVG) ── */
const HEX = {
  flux:   "#4d9bff",
  flux4:  "#93c5ff",
  iris:   "#a855f7",
  iris4:  "#c98bff",
  holo:   "#22d3ee",
  holo4:  "#67e8f9",
  gold:   "#f5c24d",
  gold4:  "#ffd97a",
  plasm:  "#ff4d9d",
  plasm4: "#ff93c6",
  void9:  "#06030f",
  void8:  "#120a33",
  void7:  "#1a1048",
  ink3:   "#b3afd8",
  ink5:   "#797399",
} as const;

/* ── epoch definitions ── */
interface Epoch {
  id: string;
  num: number;
  era: Bi;
  name: Bi;
  engineered: Bi; // what civilisation engineered at this step
  leap: Bi;       // the enabling leap / arc insight
  speculative?: true;
}

const EPOCHS: Epoch[] = [
  {
    id: "embodied",
    num: 1,
    era: { en: "Deep prehistory", zh: "远古" },
    name: { en: "Embodied Reality", zh: "具身的现实" },
    engineered: {
      en: "Nothing — experience is the unmediated physical world",
      zh: "无——经验就是未经中介的物理世界本身",
    },
    leap: {
      en: "The baseline: sensation arrives raw, authored by matter alone",
      zh: "起点：感觉原始地到来，唯由物质书写",
    },
  },
  {
    id: "image-symbol",
    num: 2,
    era: { en: "c. 40,000 BCE", zh: "约公元前 4 万年" },
    name: { en: "Image & Symbol", zh: "图像与符号" },
    engineered: {
      en: "The first constructed experiences — cave art, writing, marks that carry worlds",
      zh: "第一批人工建构的经验——洞穴壁画、文字、携带世界的符号",
    },
    leap: {
      en: "Reality can be represented; a mark on stone outlasts the moment that made it",
      zh: "现实可以被表征；石壁上的记号，比刻下它的那一刻活得更久",
    },
  },
  {
    id: "narrative-media",
    num: 3,
    era: { en: "c. 500 BCE – 1600s CE", zh: "约公元前 500 年至 17 世纪" },
    name: { en: "Narrative Media", zh: "叙事媒介" },
    engineered: {
      en: "Worlds in the mind — theatre, the novel: interior experience engineered by story",
      zh: "心灵中的世界——戏剧、小说：由故事建构的内在体验",
    },
    leap: {
      en: "A single author's imagination colonises the private experience of millions",
      zh: "一位作者的想象力，殖民了数百万人的私人体验",
    },
  },
  {
    id: "recorded-broadcast",
    num: 4,
    era: { en: "1830s – 1990s", zh: "1830 年代至 1990 年代" },
    name: { en: "Recorded & Broadcast", zh: "录制与广播" },
    engineered: {
      en: "Captured, surrounding experience — photography, cinema, radio, TV: sensory envelopes",
      zh: "被捕捉的、环绕式的体验——摄影、电影、广播、电视：感官的包裹",
    },
    leap: {
      en: "Experience can be recorded, duplicated and transmitted at civilisation scale",
      zh: "体验可以被录制、复制，并以文明的规模传播",
    },
  },
  {
    id: "interactive-worlds",
    num: 5,
    era: { en: "1970s –", zh: "1970 年代至今" },
    name: { en: "Interactive Worlds", zh: "交互世界" },
    engineered: {
      en: "Experiences that answer back — video games, the internet: agency inside constructed realities",
      zh: "会回应的体验——电子游戏、互联网：在人工现实中的能动性",
    },
    leap: {
      en: "The audience becomes a participant; the world changes when you touch it",
      zh: "观众变成参与者；世界在你触碰时改变",
    },
  },
  {
    id: "spatial-computing",
    num: 6,
    era: { en: "2010s –", zh: "2010 年代至今" },
    name: { en: "Spatial Computing", zh: "空间计算" },
    engineered: {
      en: "Experience with depth and presence — VR/AR headsets: the body is inside the world now",
      zh: "具有深度与临场感的体验——VR/AR 头显：身体如今已在世界之内",
    },
    leap: {
      en: "The frame dissolves; constructed space occupies the full perceptual field",
      zh: "边框消失；人工空间占据了全部的感知视野",
    },
  },
  {
    id: "ai-worlds",
    num: 7,
    era: { en: "2020s –", zh: "2020 年代至今" },
    name: { en: "AI-Generated Worlds", zh: "AI 生成的世界" },
    engineered: {
      en: "Worlds authored at runtime — living NPCs, infinite narrative, every visit unique",
      zh: "在运行时生成的世界——有生命的 NPC、无限叙事、每次体验皆是唯一",
    },
    leap: {
      en: "The author becomes an engine; reality is procedural, not pre-written",
      zh: "作者变成一台引擎；现实是程序性的，而非预先书写的",
    },
  },
  {
    id: "neural-immersion",
    num: 8,
    era: { en: "2020s – present frontier", zh: "2020 年代至今日前沿" },
    name: { en: "Neural Immersion", zh: "神经沉浸" },
    engineered: {
      en: "Full-dive: experience written toward the senses directly, bypassing the interface",
      zh: "全潜式沉浸：体验直接写向感官，绕过界面",
    },
    leap: {
      en: "Today: sensory augmentation. Frontier: the screen is the nervous system itself",
      zh: "今日：感官增强。前沿：屏幕就是神经系统本身",
    },
  },
  {
    id: "collective-sim",
    num: 9,
    era: { en: "Speculative — near future", zh: "推测性——近未来" },
    name: { en: "Collective Simulation", zh: "集体模拟" },
    engineered: {
      en: "Shared persistent realities — billions co-inhabit the same constructed world simultaneously",
      zh: "共享的持久性现实——数十亿人同时共同栖居于同一个人工世界之中",
    },
    leap: {
      en: "Reality becomes social infrastructure; the shared dream is the city ⚠ speculative",
      zh: "现实成为社会基础设施；共同的梦，就是那座城市 ⚠ 推测性",
    },
    speculative: true,
  },
  {
    id: "engineered-experience",
    num: 10,
    era: { en: "Speculative — open horizon", zh: "推测性——开放的地平线" },
    name: { en: "Engineered Experience", zh: "被工程化的经验" },
    engineered: {
      en: "Civilisation living primarily inside programmable realities authored by — whom?",
      zh: "文明主要生活在可编程现实之内——由谁来书写？",
    },
    leap: {
      en: "The open question: will we live in realities we author together, or ones authored for us? ⚠ speculative",
      zh: "那个悬而未决的问题：我们将生活在共同书写的现实里，还是为我们书写的现实里？⚠ 推测性",
    },
    speculative: true,
  },
];

/* ── engine narrative states keyed on arc progress ── */
interface EngineState { min: number; title: Bi; body: Bi; }
const ENGINE_STATES: EngineState[] = [
  {
    min: 0,
    title: { en: "The unmediated world", zh: "未经中介的世界" },
    body: {
      en: "Experience arrives raw. The senses open onto matter: light, texture, sound, weight. Nothing is constructed. Reality is what it is, authored by physics alone, indifferent to the observer.",
      zh: "体验原始地到来。感官向物质敞开：光、质地、声音、重量。没有什么是被建构的。现实就是它所是的样子，由物理学独自书写，对观察者漠然。",
    },
  },
  {
    min: 0.12,
    title: { en: "The first constructions", zh: "最初的建构" },
    body: {
      en: "Image and story arrive. A mark on a cave wall is already not the world — it is a world. Narrative colonises the interior; theatre and the novel engineer states of being that physics alone cannot produce.",
      zh: "图像与故事到来。洞穴壁上的一道痕迹已经不是世界——它是一个世界。叙事殖民内在；戏剧与小说工程化出物理学单独无法产生的存在状态。",
    },
  },
  {
    min: 0.30,
    title: { en: "The envelope closes", zh: "包裹合拢" },
    body: {
      en: "Recording and broadcast wrap the senses in constructed signal. Cinema, radio, television: experience no longer needs to be lived to be felt. The engineer of reality is no longer nature — it is the studio, the network, the feed.",
      zh: "录制与广播将感官包裹进人工信号之中。电影、广播、电视：体验不再需要被亲历，才能被感受到。现实的工程师不再是自然——而是摄影棚、网络、信息流。",
    },
  },
  {
    min: 0.48,
    title: { en: "Worlds that answer back", zh: "会回应的世界" },
    body: {
      en: "Interactive media and spatial computing hand agency back to the participant. The constructed world responds, adapts, remembers. Presence replaces observation. Then AI enters and the world begins writing itself — every session is unique, no two visits the same.",
      zh: "互动媒介与空间计算将能动性还给参与者。人工世界回应、适应、记忆。临场感取代观察。随后 AI 到来，世界开始自我书写——每次会话都是唯一的，没有两次访问是相同的。",
    },
  },
  {
    min: 0.68,
    title: { en: "The interface dissolves", zh: "界面消融" },
    body: {
      en: "Neural immersion reaches toward the senses directly. The headset gives way to the signal; the screen becomes the nervous system. Experience is now authored at the substrate of perception — below the level of volition, at the level of sensation itself.",
      zh: "神经沉浸直接触及感官。头显让位于信号；屏幕成为神经系统。体验现在在感知的基底上被书写——在意志的层面之下，在感觉本身的层面上。",
    },
  },
  {
    min: 0.85,
    title: { en: "The open question", zh: "那个悬而未决的问题" },
    body: {
      en: "Collective simulation and engineered experience are speculation — but the arc is clear. Civilisation has been moving from engineering matter, to engineering information, to engineering experience itself. The question is no longer whether — it is who holds the authoring tool.",
      zh: "集体模拟与被工程化的经验，皆属推测——但那道弧线是清晰的。文明一直在从工程化物质，走向工程化信息，走向工程化体验本身。问题不再是『是否』——而是谁握着那支创作的笔。",
    },
  },
];

/* ── canvas dimensions ── */
const W = 440;
const H = 340;

/* deterministic seeded value (no Math.random in render) */
function seededVal(x: number, seed: number): number {
  const s = Math.sin(x * 127.1 + seed * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/* colour band for epoch index */
function epochBandColor(i: number): string {
  if (i >= 8) return HEX.plasm;   // speculative
  if (i >= 6) return HEX.iris;    // neural / AI
  if (i >= 4) return HEX.holo;    // spatial / interactive
  if (i >= 2) return HEX.flux;    // recorded / narrative
  return HEX.gold;                 // embodied / symbol
}

/* draw the experience-arc visualisation */
function drawArc(
  ctx: CanvasRenderingContext2D,
  epochIdx: number,
  progress: number,
  tick: number,
): void {
  const n = EPOCHS.length; // 10
  const specStart = 8;     // epochs 8 & 9 are speculative

  ctx.clearRect(0, 0, W, H);

  /* ── background micro-grid ── */
  ctx.strokeStyle = "rgba(77,155,255,0.04)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 24) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  /* ── layout ── */
  const leftPad = 48;
  const rightPad = 16;
  const topPad = 18;
  const botPad = 38;
  const bw = W - leftPad - rightPad;
  const bh = H - topPad - botPad;

  /* ── arc: experience-depth bands ── */
  for (let i = 0; i < n; i++) {
    const isSpec = i >= specStart;
    const bandH = bh / n;
    const by = topPad + (n - 1 - i) * bandH;

    let fill = 0;
    if (i < epochIdx) fill = 1;
    else if (i === epochIdx) fill = progress;

    if (fill <= 0) continue;

    const col = epochBandColor(i);

    /* gradient fill */
    const grad = ctx.createLinearGradient(leftPad, 0, leftPad + bw * fill, 0);
    grad.addColorStop(0, col + "44");
    grad.addColorStop(0.55, col + "bb");
    grad.addColorStop(1, col + "ff");
    ctx.fillStyle = grad;
    ctx.fillRect(leftPad, by + 2, bw * fill, bandH - 4);

    /* speculative dashed overlay */
    if (isSpec && fill > 0) {
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = col + "55";
      ctx.lineWidth = 0.7;
      ctx.strokeRect(leftPad + 1, by + 3, bw * fill - 2, bandH - 6);
      ctx.setLineDash([]);
    }

    /* leading-edge glow on active epoch */
    if (i === epochIdx && fill > 0.02) {
      const ex = leftPad + bw * fill;
      const eglow = ctx.createLinearGradient(ex - 20, 0, ex + 8, 0);
      eglow.addColorStop(0, col + "00");
      eglow.addColorStop(1, col + "ff");
      ctx.fillStyle = eglow;
      ctx.fillRect(ex - 20, by + 2, 28, bandH - 4);
    }

    /* flowing dashes for active epoch */
    if (i === epochIdx && fill > 0.05) {
      const phase = (tick * 0.45) % 26;
      ctx.setLineDash([5, 8]);
      ctx.lineDashOffset = -phase;
      ctx.strokeStyle = col + "88";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(leftPad, by + bandH / 2);
      ctx.lineTo(leftPad + bw * fill, by + bandH / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  /* ── y-axis epoch numbers ── */
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.textAlign = "right";
  for (let i = 0; i < n; i++) {
    const bandH = bh / n;
    const cy = topPad + (n - 1 - i) * bandH + bandH / 2 + 3.5;
    const active = i <= epochIdx;
    const col = epochBandColor(i);
    ctx.fillStyle = active ? col + "ff" : HEX.ink5;
    ctx.fillText(`${i + 1}`, leftPad - 6, cy);
  }

  /* ── animated sparks on active band ── */
  if (epochIdx < n) {
    const col = epochBandColor(epochIdx);
    const bandH = bh / n;
    const by = topPad + (n - 1 - epochIdx) * bandH;
    const maxX = leftPad + bw * Math.max(0.05, progress);
    for (let s = 0; s < 6; s++) {
      const t = (tick + s * 7) % 60;
      const sx = leftPad + (t / 60) * (maxX - leftPad);
      const sy = by + bandH / 2 + (seededVal(s, tick * 0.01) - 0.5) * (bandH * 0.55);
      const r = 1.2 + seededVal(s + 3, tick * 0.02) * 2;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = col + "cc";
      ctx.fill();
    }
  }

  /* ── three-phase arc label ── */
  const phaseY = H - botPad + 14;
  ctx.textAlign = "left";
  ctx.font = "8px 'JetBrains Mono', monospace";
  // MATTER zone
  ctx.fillStyle = HEX.gold + "aa";
  ctx.fillText("MATTER", leftPad, phaseY);
  // INFO zone
  const infoX = leftPad + bw * (2 / n);
  ctx.fillStyle = HEX.flux + "aa";
  ctx.fillText("INFO", infoX, phaseY);
  // EXP zone
  const expX = leftPad + bw * (4 / n);
  ctx.fillStyle = HEX.iris + "aa";
  ctx.fillText("EXPERIENCE →", expX, phaseY);

  /* ── speculative zone marker ── */
  const specBandTop = topPad + (n - 1 - (specStart - 1)) * (bh / n);
  ctx.setLineDash([4, 6]);
  ctx.strokeStyle = HEX.plasm + "55";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftPad, specBandTop);
  ctx.lineTo(leftPad + bw, specBandTop);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textAlign = "right";
  ctx.fillStyle = HEX.plasm + "aa";
  ctx.font = "8px 'JetBrains Mono', monospace";
  ctx.fillText("▲ SPECULATIVE", leftPad + bw, specBandTop - 3);

  /* ── top label ── */
  ctx.textAlign = "center";
  ctx.fillStyle = HEX.flux4 + "aa";
  ctx.font = "9px 'JetBrains Mono', monospace";
  ctx.fillText("EXPERIENCE ENGINEERING ARC", W / 2, 11);
}

/* ─────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────── */
export default function RecursiveVREngine() {
  const { lang } = useLang();

  const [epochIdx, setEpochIdx] = useState(0);
  const [sweepProg, setSweepProg] = useState(0);
  const [running, setRunning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef(0);
  const runRef = useRef(false);
  const epochRef = useRef(epochIdx);
  const sweepRef = useRef(sweepProg);

  epochRef.current = epochIdx;
  sweepRef.current = sweepProg;

  const totalEpochs = EPOCHS.length;
  const mastery = (epochIdx + sweepProg) / totalEpochs;

  let engineState = ENGINE_STATES[0];
  for (const s of ENGINE_STATES) if (mastery >= s.min) engineState = s;

  /* canvas draw loop */
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    tickRef.current += 1;
    drawArc(ctx, epochRef.current, sweepRef.current, tickRef.current);
    rafRef.current = requestAnimationFrame(renderFrame);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [renderFrame]);

  /* auto-advance */
  const startRun = useCallback(() => {
    if (runRef.current) return;
    runRef.current = true;
    setRunning(true);

    let startEpoch = epochRef.current;
    let startSweep = sweepRef.current;
    if (startEpoch >= totalEpochs - 1 && startSweep >= 0.99) {
      startEpoch = 0;
      startSweep = 0;
      setEpochIdx(0);
      setSweepProg(0);
    }

    const epochDurMs = 360;
    const totalMs = epochDurMs * (totalEpochs - startEpoch - startSweep);
    const startT = performance.now();

    const step = (now: number) => {
      if (!runRef.current) return;
      const elapsed = now - startT;
      const totalProgress = startSweep + elapsed / epochDurMs;
      const clampedTotal = Math.min(totalProgress, totalEpochs - startEpoch);
      const newEpoch = Math.min(totalEpochs - 1, startEpoch + Math.floor(clampedTotal));
      const newSweep =
        newEpoch < totalEpochs - 1
          ? clampedTotal - Math.floor(clampedTotal)
          : 1;

      setEpochIdx(newEpoch);
      setSweepProg(newSweep);

      if (elapsed < totalMs - epochDurMs * startSweep) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setEpochIdx(totalEpochs - 1);
        setSweepProg(1);
        runRef.current = false;
        setRunning(false);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [totalEpochs]);

  /* step forward / backward */
  const stepEpoch = useCallback(
    (dir: 1 | -1) => {
      if (runRef.current) { runRef.current = false; setRunning(false); }
      setEpochIdx((prev) => {
        const next = Math.max(0, Math.min(totalEpochs - 1, prev + dir));
        setSweepProg(dir > 0 ? 1 : 0);
        return next;
      });
    },
    [totalEpochs],
  );

  const resetAll = useCallback(() => {
    runRef.current = false;
    setRunning(false);
    setEpochIdx(0);
    setSweepProg(0);
  }, []);

  const currentEpoch = EPOCHS[epochIdx];
  const isSpeculative = !!currentEpoch.speculative;

  /* colour classification */
  const epochColorKey =
    isSpeculative
      ? "plasm"
      : epochIdx >= 6
      ? "iris"
      : epochIdx >= 4
      ? "holo"
      : epochIdx >= 2
      ? "flux"
      : "gold";

  const epochBorderCls =
    epochColorKey === "plasm"
      ? "border-plasm-500/40 bg-plasm-500/[0.07]"
      : epochColorKey === "iris"
      ? "border-iris-500/30 bg-iris-500/[0.07]"
      : epochColorKey === "holo"
      ? "border-holo-500/30 bg-holo-500/[0.07]"
      : epochColorKey === "flux"
      ? "border-flux-500/30 bg-flux-500/[0.08]"
      : "border-gold-500/30 bg-gold-500/[0.07]";

  const epochTextCls =
    epochColorKey === "plasm"
      ? "plasm-text"
      : epochColorKey === "iris"
      ? "iris-text"
      : epochColorKey === "holo"
      ? "holo-text"
      : epochColorKey === "flux"
      ? "flux-glow"
      : "gold-text";

  const epochDotCls =
    epochColorKey === "plasm"
      ? "bg-plasm-500"
      : epochColorKey === "iris"
      ? "bg-iris-500"
      : epochColorKey === "holo"
      ? "bg-holo-500"
      : epochColorKey === "flux"
      ? "bg-flux-500"
      : "bg-gold-500";

  return (
    <div className="panel rounded-2xl p-5 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-center">

        {/* ── canvas ── */}
        <div className="relative mx-auto w-full max-w-[440px]">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full rounded-lg"
            style={{ background: HEX.void9 }}
            aria-label={
              lang === "zh"
                ? "体验工程化弧线图"
                : "experience engineering arc"
            }
          />

          {/* epoch pill overlay */}
          <div className="pointer-events-none absolute left-2 top-2">
            <div
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.13em] backdrop-blur-sm ${epochBorderCls} ${epochTextCls}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${epochDotCls} pulse`} />
              <span
                key={`ep-${epochIdx}-${lang}`}
                className={`lang-fade ${lang === "zh" ? "zh" : ""}`}
              >
                {lang === "zh"
                  ? `第 ${currentEpoch.num} 纪元`
                  : `Epoch ${currentEpoch.num} / ${totalEpochs}`}
              </span>
            </div>
          </div>
        </div>

        {/* ── right panel ── */}
        <div>

          {/* progress bar */}
          <div className="flex items-center justify-between">
            <div className="label-mono">
              {lang === "zh" ? "体验工程化进程" : "experience engineering"}
            </div>
            <div className="display text-3xl flux-glow">
              {Math.round(mastery * 100)}%
            </div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-void-700">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${mastery * 100}%`,
                background:
                  "linear-gradient(90deg,#f5c24d,#4d9bff,#22d3ee,#a855f7,#ff4d9d)",
              }}
            />
          </div>

          {/* current epoch card */}
          <div
            key={`ec-${epochIdx}-${lang}`}
            className={`mt-5 rounded-xl border p-5 lang-fade ${epochBorderCls}`}
          >
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div className={`display text-xl ${epochTextCls}`}>
                <span
                  key={`en-${epochIdx}-${lang}`}
                  className={`lang-fade ${lang === "zh" ? "zh" : ""}`}
                >
                  <T v={currentEpoch.name} />
                </span>
              </div>
              <div className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-500 shrink-0">
                <T v={currentEpoch.era} />
              </div>
            </div>

            {isSpeculative && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-plasm-500/40 bg-plasm-500/10 px-2 py-0.5">
                <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-plasm-400">
                  {lang === "zh" ? "⚠ 推测性" : "⚠ speculative"}
                </span>
              </div>
            )}

            <div className="mt-3 space-y-2">
              <div className="flex gap-2 text-sm leading-snug">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink-500 shrink-0 mt-0.5">
                  {lang === "zh" ? "工程化" : "engineered"}
                </span>
                <span className={`text-ink-300 ${lang === "zh" ? "zh" : ""}`}>
                  <T v={currentEpoch.engineered} />
                </span>
              </div>
              <div className="flex gap-2 text-sm leading-snug">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink-500 shrink-0 mt-0.5">
                  {lang === "zh" ? "跃迁" : "leap"}
                </span>
                <span className={`${epochTextCls} text-sm leading-snug ${lang === "zh" ? "zh" : ""}`}>
                  <T v={currentEpoch.leap} />
                </span>
              </div>
            </div>
          </div>

          {/* engine narrative */}
          <div
            key={`es-${engineState.title.en}-${lang}`}
            className="mt-4 rounded-xl border border-void-600 bg-void-800/50 p-4 lang-fade"
          >
            <div className="display text-base text-ink-300">
              <T v={engineState.title} />
            </div>
            <p className={`mt-1.5 text-sm leading-relaxed text-ink-500 ${lang === "zh" ? "zh" : ""}`}>
              <T v={engineState.body} />
            </p>
          </div>

          {/* epoch stepper dots */}
          <div className="mt-5">
            <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-500 mb-2">
              <span>{lang === "zh" ? "选择纪元" : "epoch"}</span>
              <span className={epochTextCls}>{epochIdx + 1} / {totalEpochs}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EPOCHS.map((ep, i) => {
                const isS = !!ep.speculative;
                const isCur = i === epochIdx;
                const colKey =
                  isS
                    ? "plasm"
                    : i >= 6
                    ? "iris"
                    : i >= 4
                    ? "holo"
                    : i >= 2
                    ? "flux"
                    : "gold";
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      if (runRef.current) { runRef.current = false; setRunning(false); }
                      setEpochIdx(i);
                      setSweepProg(1);
                    }}
                    className={`h-7 w-7 rounded font-mono text-[0.62rem] transition
                      ${isCur
                        ? colKey === "plasm"
                          ? "bg-plasm-500/25 border border-plasm-500/60 text-plasm-400"
                          : colKey === "iris"
                          ? "bg-iris-500/25 border border-iris-500/60 text-iris-400"
                          : colKey === "holo"
                          ? "bg-holo-500/25 border border-holo-500/60 text-holo-400"
                          : colKey === "flux"
                          ? "bg-flux-500/20 border border-flux-500/60 text-flux-400"
                          : "bg-gold-500/25 border border-gold-500/60 text-gold-400"
                        : isS
                          ? "border border-dashed border-plasm-500/30 text-ink-500 hover:border-plasm-500/60 hover:text-plasm-400"
                          : "border border-void-600 text-ink-500 hover:border-flux-500/40 hover:text-flux-400"
                      }`}
                    aria-label={`Epoch ${i + 1}`}
                    aria-pressed={isCur}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* controls */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={startRun}
              disabled={running}
              className="rounded-full border border-flux-500/50 bg-flux-500/10 px-5 py-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-flux-400 transition hover:bg-flux-500/20 disabled:opacity-40"
            >
              {running
                ? lang === "zh" ? "运行中…" : "running…"
                : lang === "zh" ? "▶ 运行引擎" : "▶ run engine"}
            </button>
            <button
              onClick={() => stepEpoch(-1)}
              disabled={epochIdx === 0}
              className="rounded-full border border-ink-100/15 px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-400 transition hover:text-flux-400 disabled:opacity-30"
            >
              ‹ {lang === "zh" ? "上一纪元" : "prev"}
            </button>
            <button
              onClick={() => stepEpoch(1)}
              disabled={epochIdx === totalEpochs - 1}
              className="rounded-full border border-ink-100/15 px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-400 transition hover:text-flux-400 disabled:opacity-30"
            >
              {lang === "zh" ? "下一纪元" : "next"} ›
            </button>
            <button
              onClick={resetAll}
              className="rounded-full border border-ink-100/15 px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-400 transition hover:text-flux-400"
            >
              {lang === "zh" ? "重置" : "reset"}
            </button>
          </div>

          {/* closing question */}
          <div className="mt-5 border-t border-void-700 pt-4">
            <p className={`text-xs leading-relaxed text-ink-500 italic ${lang === "zh" ? "zh" : ""}`}>
              {lang === "zh"
                ? "那整台引擎所环绕的问题：我们将生活在共同书写的现实里，还是为我们书写的现实里？当文明迁入可编程的体验，真正的问题是谁持有那支创作的笔。"
                : "The question the whole engine circles: will we live in realities we author together, or ones authored for us? When civilisation moves inside programmable experience, the real question is who holds the authoring tool."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
