"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useLang, T } from "./lang";

/* ═══════════════════════════════════════════════════════════════════════════
   WorldGenLab
   System 05 — AI-Generated Worlds & Digital Life

   Three panels:
   1. Procedural World Canvas — seed-deterministic terrain/cityscape, same
      seed → same world, visually regenerates on seed change
   2. Authoring Ladder — hand-built → procedural → generative-AI → living NPCs
   3. NPC Panel — two autonomous agents with memory, goals, state that evolve
   4. Open Question — is a sufficiently complex simulated population still set-dressing?
═══════════════════════════════════════════════════════════════════════════ */

/* ── palette (raw hex for canvas) ──────────────────────────────────────── */
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

/* ── seeded PRNG (mulberry32) ───────────────────────────────────────────── */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = s + 0x6d2b79f5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── hash seed string to uint32 ────────────────────────────────────────── */
function hashSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/* ── types ──────────────────────────────────────────────────────────────── */
interface TerrainColumn {
  groundY:   number;  // 0–1 fraction from top
  buildingH: number;  // 0–1 fraction (0 = none)
  treeH:     number;  // 0–1 fraction (0 = none)
  type:      "city" | "nature" | "ruins";
  glowR:     number;
  glowG:     number;
  glowB:     number;
}

interface NPC {
  id:       number;
  name:     { en: string; zh: string };
  goal:     { en: string; zh: string };
  state:    "idle" | "active" | "reflecting";
  memory:   string[];
  memoryZh: string[];
  energy:   number;  // 0–1
  mood:     number;  // 0–1 = calm→excited
  x:        number;  // canvas fraction
  phase:    number;
}

/* ── deterministic terrain columns from seed ────────────────────────────── */
function buildTerrain(seedStr: string, cols: number): TerrainColumn[] {
  const rand = mulberry32(hashSeed(seedStr));
  const out: TerrainColumn[] = [];

  // world "biome" from seed
  const biomeRoll = rand();
  const biome = biomeRoll < 0.4 ? "city" : biomeRoll < 0.72 ? "nature" : "ruins";

  // noise baseline height using simple 1D value noise
  const baseHeights: number[] = [];
  for (let i = 0; i < cols; i++) {
    const t = i / cols;
    const octave1 = Math.sin(t * Math.PI * 3.7 + rand() * 0.01) * 0.5 + 0.5;
    const octave2 = Math.sin(t * Math.PI * 11.3 + rand() * 0.01) * 0.25 + 0.25;
    baseHeights.push(octave1 * 0.55 + octave2 * 0.18 + 0.05);
  }

  // smooth the heights
  for (let iter = 0; iter < 3; iter++) {
    for (let i = 1; i < cols - 1; i++) {
      baseHeights[i] = (baseHeights[i - 1] + baseHeights[i] * 2 + baseHeights[i + 1]) / 4;
    }
  }

  for (let i = 0; i < cols; i++) {
    const r = rand();
    const r2 = rand();
    const r3 = rand();
    const groundY = 0.4 + baseHeights[i] * 0.35;
    const type = biome;

    let buildingH = 0;
    let treeH = 0;
    let glowR = 0, glowG = 0, glowB = 0;

    if (type === "city") {
      buildingH = r < 0.65 ? r2 * 0.45 : 0;
      // neon colors for city windows
      const palettes = [
        [0x4d, 0x9b, 0xff], [0xa8, 0x55, 0xf7], [0x22, 0xd3, 0xee],
        [0xff, 0x4d, 0x9d], [0xf5, 0xc2, 0x4d],
      ];
      const p = palettes[Math.floor(r3 * palettes.length)];
      glowR = p[0]; glowG = p[1]; glowB = p[2];
    } else if (type === "nature") {
      treeH = r < 0.6 ? 0.04 + r2 * 0.14 : 0;
      glowR = 0x22; glowG = 0xd3; glowB = 0xee;
    } else {
      // ruins: mix of rubble columns and sparse trees
      buildingH = r < 0.35 ? r2 * 0.2 : 0;
      treeH = r > 0.65 ? r2 * 0.08 : 0;
      glowR = 0xa8; glowG = 0x55; glowB = 0xf7;
    }

    out.push({ groundY, buildingH, treeH, type, glowR, glowG, glowB });
  }
  return out;
}

/* ── static NPC definitions (seeded state evolves per tick) ─────────────── */
const NPCS_INIT: NPC[] = [
  {
    id: 0,
    name:     { en: "ARIA-7", zh: "艾丽亚-7" },
    goal:     { en: "Scout the eastern ruins", zh: "侦察东部废墟" },
    state:    "active",
    memory:   ["Spotted a light source at grid E-14", "Avoided a patrol route"],
    memoryZh: ["在E-14格发现光源", "绕开了一条巡逻路线"],
    energy:   0.72,
    mood:     0.65,
    x:        0.28,
    phase:    0.0,
  },
  {
    id: 1,
    name:     { en: "KESSLER", zh: "凯斯勒" },
    goal:     { en: "Build a shelter before nightfall", zh: "在夜幕降临前建造避难所" },
    state:    "idle",
    memory:   ["Gathered 14 units of salvage", "Knows ARIA-7's last position"],
    memoryZh: ["收集了14单位废料", "知道艾丽亚-7的最后位置"],
    energy:   0.41,
    mood:     0.38,
    x:        0.62,
    phase:    1.8,
  },
];

/* ── NPC state machine: deterministic tick (called in RAF) ────────────────── */
const NPC_STATES: NPC["state"][] = ["idle", "active", "reflecting"];
function seededChoice<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════════════ */
export default function WorldGenLab() {
  const { lang } = useLang();
  const L = (en: string, zh: string) => lang === "zh" ? zh : en;

  /* ── state ──────────────────────────────────────────────────────────────── */
  const [seedInput, setSeedInput]   = useState("GENESIS-01");
  const [activeSeed, setActiveSeed] = useState("GENESIS-01");
  const [generating, setGenerating] = useState(false);
  const [npcTick, setNpcTick]       = useState(0);
  const [npcs, setNpcs]             = useState<NPC[]>(NPCS_INIT);
  const [question, setQuestion]     = useState(0);
  const [activeLayer, setActiveLayer] = useState<number>(1); // 0=hand,1=proc,2=genAI,3=npc

  /* ── refs ───────────────────────────────────────────────────────────────── */
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const tRef         = useRef<number>(0);
  const terrainRef   = useRef<TerrainColumn[]>([]);
  const seedRef      = useRef(activeSeed);
  const transRef     = useRef(0); // 0→1 reveal animation after seed change

  /* sync seed ref */
  useEffect(() => { seedRef.current = activeSeed; }, [activeSeed]);

  /* ── regenerate terrain when seed changes ─────────────────────────────── */
  const regenerate = useCallback((seed: string) => {
    setGenerating(true);
    setActiveSeed(seed);
    transRef.current = 0;
    setTimeout(() => setGenerating(false), 650);
  }, []);

  const handleGenerate = useCallback(() => {
    regenerate(seedInput.trim() || "GENESIS-01");
  }, [seedInput, regenerate]);

  const handleRandomSeed = useCallback(() => {
    const rand = mulberry32(hashSeed(activeSeed + Date.now().toString()));
    const words = ["SIGMA", "NEXUS", "TERRA", "VOID", "PRIME", "ECHO", "ATLAS", "ZERO"];
    const word = words[Math.floor(rand() * words.length)];
    const num = (Math.floor(rand() * 99) + 1).toString().padStart(2, "0");
    const newSeed = `${word}-${num}`;
    setSeedInput(newSeed);
    regenerate(newSeed);
  }, [activeSeed, regenerate]);

  /* ── NPC ticker: update every ~3s ─────────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(() => {
      setNpcTick(n => n + 1);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setNpcs(prev => prev.map(npc => {
      const r = mulberry32(hashSeed(npc.name.en + npcTick));
      const r1 = r(), r2 = r(), r3 = r();
      const newEnergy = Math.max(0.05, Math.min(0.98, npc.energy + (r1 - 0.5) * 0.15));
      const newMood   = Math.max(0.05, Math.min(0.98, npc.mood   + (r2 - 0.5) * 0.12));
      const newState  = r3 < 0.35 ? seededChoice(NPC_STATES, npcTick + npc.id) : npc.state;
      return { ...npc, energy: newEnergy, mood: newMood, state: newState };
    }));
  }, [npcTick]);

  /* ── main canvas animation loop ─────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width  = Math.floor(rect.width * dpr);
      canvas!.height = Math.floor(rect.height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function getSize() {
      const rect = canvas!.getBoundingClientRect();
      return { w: rect.width, h: rect.height };
    }

    let lastTs = 0;

    function drawScene(w: number, h: number, t: number, reveal: number) {
      // background
      const bg = ctx!.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, C.void900);
      bg.addColorStop(0.5, C.void800);
      bg.addColorStop(1, C.void950);
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, w, h);

      // sky stars (deterministic)
      const rand = mulberry32(hashSeed(seedRef.current + "stars"));
      for (let i = 0; i < 60; i++) {
        const sx = rand() * w;
        const sy = rand() * h * 0.55;
        const sr = 0.4 + rand() * 0.8;
        const twinkle = 0.3 + 0.5 * Math.sin(t * (0.5 + rand() * 1.5) + rand() * 6);
        ctx!.beginPath();
        ctx!.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${179},${175},${216},${twinkle * reveal})`;
        ctx!.fill();
      }

      // nebula glow behind horizon
      const nebulaRand = mulberry32(hashSeed(seedRef.current + "nebula"));
      const nR = Math.floor(nebulaRand() * 200) + 30;
      const nG = Math.floor(nebulaRand() * 100) + 30;
      const nB = Math.floor(nebulaRand() * 255) + 80;
      const nebulaGrad = ctx!.createRadialGradient(w * 0.5, h * 0.6, 0, w * 0.5, h * 0.6, w * 0.6);
      nebulaGrad.addColorStop(0,   `rgba(${nR},${nG},${nB},${0.22 * reveal})`);
      nebulaGrad.addColorStop(0.5, `rgba(${nR},${nG},${nB},${0.07 * reveal})`);
      nebulaGrad.addColorStop(1,   "transparent");
      ctx!.fillStyle = nebulaGrad;
      ctx!.fillRect(0, 0, w, h);

      // rebuild terrain for this seed (deterministic)
      const cols = Math.floor(w / 3);
      if (terrainRef.current.length !== cols || seedRef.current !== (canvas as HTMLCanvasElement & { _lastSeed?: string })._lastSeed) {
        terrainRef.current = buildTerrain(seedRef.current, cols);
        (canvas as HTMLCanvasElement & { _lastSeed?: string })._lastSeed = seedRef.current;
      }
      const terrain = terrainRef.current;
      const biome = terrain[0]?.type ?? "city";

      const colW = w / cols;

      // horizon glow line
      ctx!.save();
      const avgGroundY = terrain.reduce((s, c) => s + c.groundY, 0) / terrain.length;
      const horizonY = avgGroundY * h;
      const horizGrad = ctx!.createLinearGradient(0, horizonY - 6, 0, horizonY + 3);
      horizGrad.addColorStop(0, `rgba(${nR},${nG},${nB},${0.55 * reveal})`);
      horizGrad.addColorStop(1, "transparent");
      ctx!.fillStyle = horizGrad;
      ctx!.fillRect(0, horizonY - 6, w, 10);
      ctx!.restore();

      // terrain columns
      for (let i = 0; i < cols; i++) {
        const col    = terrain[i];
        const x      = i * colW;
        const groundYpx = col.groundY * h;
        const reveal_i  = Math.max(0, Math.min(1, reveal * cols / (i + 1)));

        // ground column
        const groundGrad = ctx!.createLinearGradient(0, groundYpx, 0, h);
        if (biome === "city") {
          groundGrad.addColorStop(0, `rgba(20,10,55,${reveal_i})`);
          groundGrad.addColorStop(1, `rgba(6,3,15,${reveal_i})`);
        } else if (biome === "nature") {
          groundGrad.addColorStop(0, `rgba(10,35,20,${reveal_i})`);
          groundGrad.addColorStop(1, `rgba(4,12,8,${reveal_i})`);
        } else {
          groundGrad.addColorStop(0, `rgba(30,12,50,${reveal_i})`);
          groundGrad.addColorStop(1, `rgba(8,3,18,${reveal_i})`);
        }
        ctx!.fillStyle = groundGrad;
        ctx!.fillRect(x, groundYpx, colW + 0.5, h - groundYpx);

        // buildings
        if (col.buildingH > 0) {
          const bH = col.buildingH * h * 0.55;
          const bY = groundYpx - bH;
          const bW = Math.max(colW * 1.8, 5);
          const bx = x - (bW - colW) / 2;

          // building body
          ctx!.save();
          ctx!.globalAlpha = reveal_i;
          const bGrad = ctx!.createLinearGradient(bx, bY, bx + bW, bY + bH);
          bGrad.addColorStop(0, `rgba(${col.glowR},${col.glowG},${col.glowB},0.22)`);
          bGrad.addColorStop(1, `rgba(${col.glowR},${col.glowG},${col.glowB},0.05)`);
          ctx!.fillStyle = bGrad;
          ctx!.fillRect(bx, bY, bW, bH);

          // building edge glow
          ctx!.strokeStyle = `rgba(${col.glowR},${col.glowG},${col.glowB},0.5)`;
          ctx!.lineWidth = 0.8;
          ctx!.strokeRect(bx, bY, bW, bH);

          // windows (random but deterministic)
          const winRand = mulberry32(hashSeed(seedRef.current + "win" + i));
          const rows = Math.max(2, Math.floor(bH / 9));
          const winsPerRow = Math.max(1, Math.floor(bW / 8));
          for (let row = 0; row < rows; row++) {
            for (let wc = 0; wc < winsPerRow; wc++) {
              if (winRand() < 0.55) {
                const wx = bx + 2 + wc * (bW / winsPerRow);
                const wy = bY + 3 + row * (bH / rows);
                const lit = winRand() > 0.25;
                if (lit) {
                  ctx!.fillStyle = `rgba(${col.glowR},${col.glowG},${col.glowB},${0.65 + 0.35 * Math.sin(t * 2.3 + i + row)})`;
                  ctx!.fillRect(wx, wy, Math.max(1.5, bW / winsPerRow - 2), Math.max(1.2, bH / rows - 3));
                }
              }
            }
          }
          ctx!.restore();
        }

        // trees (nature / ruins biome)
        if (col.treeH > 0) {
          const tH = col.treeH * h;
          const ty = groundYpx - tH;
          const cx2 = x + colW / 2;
          const sway = Math.sin(t * 0.8 + i * 0.4) * 2;

          ctx!.save();
          ctx!.globalAlpha = reveal_i * 0.9;

          // trunk
          ctx!.fillStyle = biome === "nature"
            ? `rgba(14,80,40,0.7)`
            : `rgba(60,20,80,0.5)`;
          ctx!.fillRect(cx2 - 1 + sway * 0.2, ty + tH * 0.55, 2, tH * 0.45);

          // canopy
          const canopyColor = biome === "nature"
            ? `rgba(${0x22},${0xd3},${0xee},0.55)`
            : `rgba(${0xa8},${0x55},${0xf7},0.4)`;
          const cgGrad = ctx!.createRadialGradient(cx2 + sway, ty + tH * 0.3, 0, cx2 + sway, ty + tH * 0.3, tH * 0.55);
          cgGrad.addColorStop(0, canopyColor);
          cgGrad.addColorStop(1, "transparent");
          ctx!.fillStyle = cgGrad;
          ctx!.beginPath();
          ctx!.arc(cx2 + sway, ty + tH * 0.3, tH * 0.55, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.restore();
        }
      }

      // ground fog at base
      const fogGrad = ctx!.createLinearGradient(0, h * 0.75, 0, h);
      fogGrad.addColorStop(0, "transparent");
      fogGrad.addColorStop(1, `rgba(6,3,15,${0.6 * reveal})`);
      ctx!.fillStyle = fogGrad;
      ctx!.fillRect(0, 0, w, h);

      // scan-line overlay (holographic feel)
      for (let sy = 0; sy < h; sy += 4) {
        ctx!.fillStyle = `rgba(0,0,0,${0.04 * reveal})`;
        ctx!.fillRect(0, sy, w, 1);
      }

      // seed label watermark
      ctx!.save();
      ctx!.globalAlpha = 0.28 * reveal;
      ctx!.font = '600 10px "JetBrains Mono", monospace';
      ctx!.fillStyle = C.holo400;
      ctx!.textAlign = "left";
      ctx!.fillText(`SEED: ${seedRef.current}`, 10, h - 10);
      ctx!.textAlign = "right";
      ctx!.fillStyle = C.ink500;
      ctx!.fillText(biome.toUpperCase(), w - 10, h - 10);
      ctx!.restore();
    }

    function tick(ts: number) {
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      tRef.current += dt;
      transRef.current = Math.min(transRef.current + dt * 2.2, 1);

      const { w, h } = getSize();
      ctx!.clearRect(0, 0, w, h);
      drawScene(w, h, tRef.current, transRef.current);

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [activeSeed]);

  /* ── authoring layer data ──────────────────────────────────────────────── */
  const LAYERS = [
    {
      id: 0,
      icon: "✦",
      color: C.flux400,
      border: "rgba(77,155,255,0.35)",
      label: { en: "Hand-built", zh: "手工构建" },
      desc: {
        en: "Every object placed by a human — Doom's id Tech maps, Half-Life's Hammer editor. Infinitely expressive; scales to the size of the team.",
        zh: "每个物件都由人工放置——Doom 的 id Tech 地图、半衰期的 Hammer 编辑器。表达力无限；规模受限于团队大小。",
      },
      tag: { en: "finite · artisanal", zh: "有限 · 匠心之作" },
    },
    {
      id: 1,
      icon: "◎",
      color: C.holo500,
      border: "rgba(34,211,238,0.4)",
      label: { en: "Procedural", zh: "程序生成" },
      desc: {
        en: "Infinite terrain from a seed — Minecraft's chunks, No Man's Sky's 18 quintillion planets. Same seed → same world, every time.",
        zh: "从种子生成无限地形——Minecraft 的区块、无人深空的1.8×10¹⁹颗星球。相同种子 → 相同世界，永远如此。",
      },
      tag: { en: "infinite · deterministic", zh: "无限 · 确定性" },
    },
    {
      id: 2,
      icon: "◈",
      color: C.iris400,
      border: "rgba(168,85,247,0.4)",
      label: { en: "Generative AI", zh: "生成式AI" },
      desc: {
        en: "Text/image models generate environments, objects, dialogues from a prompt. Every wall texture unique; every dungeon styled to 'haunted baroque'.",
        zh: "文本/图像模型从提示语生成环境、物件、对话。每面墙纹理独一无二；每个地牢都可定制为【鬼魅巴洛克】风格。",
      },
      tag: { en: "semantic · limitless style", zh: "语义驱动 · 风格无界" },
    },
    {
      id: 3,
      icon: "⬡",
      color: C.plasm500,
      border: "rgba(255,77,157,0.4)",
      label: { en: "Living NPCs", zh: "活体NPC" },
      desc: {
        en: "LLM-driven agents with persistent memory, shifting goals, open dialogue — not scripted loops. They adapt, remember you, and pursue ends of their own.",
        zh: "由大语言模型驱动、拥有持久记忆、变化目标与开放对话的代理——而非脚本循环。它们会适应、记住你，并追求自己的目的。",
      },
      tag: { en: "autonomous · open-ended", zh: "自主 · 开放结局" },
    },
  ];

  /* ── open questions ──────────────────────────────────────────────────────── */
  const QUESTIONS = [
    {
      en: "When a simulated population models and pursues its members' interests, is it still set-dressing — or a living computational ecosystem?",
      zh: "当一个模拟种群能够建模并追求其成员的利益时，它仍是布景道具——还是已成为活的计算生态系统？",
    },
    {
      en: "We are nowhere near agents that suffer. But the design choices being made now — memory persistence, goal autonomy, emotional state — shape what is possible later.",
      zh: "我们离能够感受痛苦的代理还差得很远。但现在做出的设计选择——记忆持久化、目标自主性、情绪状态——正在塑造未来的可能性。",
    },
    {
      en: "If an NPC accumulates enough episodic memory and consistent preferences to model itself, is that the beginning of something? We don't know. The honest answer is: this is where philosophy earns its keep.",
      zh: "如果一个NPC积累了足够多的情节记忆和一致的偏好，足以建立自我模型，这是某种东西的开始吗？我们不知道。诚实的回答是：这正是哲学大显身手之处。",
    },
  ];

  /* ── NPC state color/label helpers ─────────────────────────────────────── */
  function npcStateColor(state: NPC["state"]) {
    if (state === "active")     return C.holo500;
    if (state === "reflecting") return C.iris400;
    return C.ink500;
  }
  function npcStateLabel(state: NPC["state"], lang: string) {
    const map = {
      idle:       { en: "IDLE",       zh: "待机" },
      active:     { en: "ACTIVE",     zh: "活跃" },
      reflecting: { en: "REFLECTING", zh: "思考中" },
    };
    return lang === "zh" ? map[state].zh : map[state].en;
  }

  return (
    <div className="w-full space-y-6">

      {/* ── header ────────────────────────────────────────────────────────── */}
      <div>
        <p className="label-mono mb-1">
          <T v={{ en: "System 05 · World Authoring", zh: "系统 05 · 世界创作" }} />
        </p>
        <h3 className="display text-2xl md:text-3xl leading-tight mb-2">
          <span className="spark-text">
            <T v={{ en: "AI-Generated Worlds & Digital Life", zh: "AI生成的世界与数字生命" }} />
          </span>
        </h3>
        <p className="text-ink-400 text-sm max-w-2xl leading-relaxed">
          <T v={{
            en: "Worlds that author themselves — from deterministic seeds to LLM-driven agents with memory, goals, and open dialogue. The question is not whether we can build them, but what we owe the inhabitants.",
            zh: "自我创作的世界——从确定性种子到拥有记忆、目标与开放对话的大语言模型代理。问题不在于我们能否构建它们，而在于我们对其居民负有怎样的责任。",
          }} />
        </p>
        <div className="rule-flux mt-3 h-px rounded" />
      </div>

      {/* ── main grid ─────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">

        {/* ── canvas: procedural world ────────────────────────────────────── */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            border:     "1px solid rgba(34,211,238,0.2)",
            boxShadow:  "0 0 60px -20px rgba(34,211,238,0.25)",
          }}
        >
          <canvas
            ref={canvasRef}
            className="block w-full"
            style={{ aspectRatio: "16/9", minHeight: 200 }}
            aria-label={L("Procedural world visualisation", "程序生成世界可视化")}
          />

          {/* generating flash overlay */}
          {generating && (
            <div
              className="absolute inset-0 rise-in flex items-center justify-center"
              style={{ background: "rgba(6,3,15,0.7)" }}
            >
              <p className="label-mono" style={{ color: C.holo400 }}>
                <T v={{ en: "⟳ GENERATING WORLD…", zh: "⟳ 正在生成世界…" }} />
              </p>
            </div>
          )}

          {/* layer badge */}
          <div
            className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[0.6rem] font-mono"
            style={{
              background: "rgba(6,3,15,0.75)",
              border: "1px solid rgba(34,211,238,0.35)",
              color: C.holo400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            <T v={{ en: "Procedural · Deterministic", zh: "程序生成 · 确定性" }} />
          </div>
        </div>

        {/* ── seed panel ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* seed input */}
          <div className="panel rounded-xl p-5 flex flex-col gap-4">
            <p className="label-mono" style={{ color: C.holo500 }}>
              <T v={{ en: "World Seed", zh: "世界种子" }} />
            </p>
            <p className="text-[0.73rem] text-ink-400 leading-relaxed">
              <T v={{
                en: "Same seed always generates the same world. Change the seed to explore a different reality.",
                zh: "相同种子始终生成相同的世界。更改种子，探索另一个现实。",
              }} />
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={seedInput}
                onChange={e => setSeedInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleGenerate(); }}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg text-[0.75rem] font-mono bg-void-800 border border-flux-500/20 text-ink-300 focus:outline-none focus:border-holo-500/50 transition"
                style={{ background: "rgba(18,10,51,0.8)" }}
                placeholder="GENESIS-01"
                maxLength={32}
                aria-label={L("Seed input", "种子输入")}
              />
              <button
                onClick={handleGenerate}
                className="px-3 py-2 rounded-lg text-[0.72rem] font-mono transition-all"
                style={{
                  background: "rgba(34,211,238,0.12)",
                  border: "1px solid rgba(34,211,238,0.4)",
                  color: C.holo400,
                }}
              >
                <T v={{ en: "GEN", zh: "生成" }} />
              </button>
            </div>
            <button
              onClick={handleRandomSeed}
              className="w-full py-2 rounded-lg text-[0.7rem] font-mono transition-all"
              style={{
                background: "rgba(77,155,255,0.07)",
                border: "1px solid rgba(77,155,255,0.2)",
                color: C.flux400,
              }}
            >
              <T v={{ en: "Random Seed →", zh: "随机种子 →" }} />
            </button>
            <div
              className="px-3 py-2 rounded-lg text-[0.7rem] font-mono"
              style={{
                background: "rgba(18,10,51,0.5)",
                border: "1px solid rgba(34,211,238,0.12)",
                color: C.ink500,
              }}
            >
              <span style={{ color: C.holo500 }}>◎ </span>
              <span style={{ color: C.holo400 }}>{activeSeed}</span>
            </div>
          </div>

          {/* world facts */}
          <div className="panel panel-holo rounded-xl p-4 space-y-2">
            <p className="label-mono" style={{ color: C.holo400 }}>
              <T v={{ en: "How It Works", zh: "运作原理" }} />
            </p>
            <ul className="space-y-1.5">
              {[
                { en: "Seed → uint32 via FNV hash", zh: "种子 → 通过FNV哈希转为uint32" },
                { en: "Mulberry32 PRNG seeds all geometry", zh: "Mulberry32伪随机生成器播种所有几何体" },
                { en: "1D value noise → terrain heights", zh: "一维值噪声 → 地形高度" },
                { en: "Biome determined by first random draw", zh: "生物群系由第一次随机抽取决定" },
                { en: "Windows, trees, colors all seeded", zh: "窗户、树木、颜色全部从种子派生" },
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-[0.68rem] text-ink-400 leading-relaxed">
                  <span style={{ color: C.holo500, flexShrink: 0 }}>·</span>
                  {lang === "zh" ? item.zh : item.en}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── authoring ladder ────────────────────────────────────────────────── */}
      <div>
        <p className="label-mono mb-3">
          <T v={{ en: "World Authoring Progression", zh: "世界创作进阶层次" }} />
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className="panel rounded-xl p-4 text-left transition-all flex flex-col gap-2"
              style={{
                border:     activeLayer === layer.id ? layer.border : "1px solid rgba(77,155,255,0.1)",
                boxShadow:  activeLayer === layer.id ? `0 0 28px -8px ${layer.color}55` : undefined,
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: layer.color, fontSize: "1rem" }}>{layer.icon}</span>
                <span className="label-mono text-[0.58rem]" style={{ color: layer.color }}>
                  {lang === "zh" ? layer.label.zh : layer.label.en}
                </span>
              </div>
              <p className="text-[0.68rem] text-ink-400 leading-relaxed">
                {lang === "zh" ? layer.desc.zh : layer.desc.en}
              </p>
              <span
                className="text-[0.58rem] font-mono px-2 py-0.5 rounded-full self-start"
                style={{
                  background: `${layer.color}18`,
                  border: `1px solid ${layer.color}40`,
                  color: layer.color,
                }}
              >
                {lang === "zh" ? layer.tag.zh : layer.tag.en}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── NPC panel ───────────────────────────────────────────────────────── */}
      <div>
        <p className="label-mono mb-3">
          <T v={{ en: "Autonomous Agents — Live State", zh: "自主代理 — 实时状态" }} />
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {npcs.map(npc => (
            <div
              key={npc.id}
              className="panel panel-plasm rounded-xl p-5 flex flex-col gap-3"
            >
              {/* header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className="display text-base"
                    style={{ color: C.plasm500 }}
                  >
                    {lang === "zh" ? npc.name.zh : npc.name.en}
                  </p>
                  <p className="text-[0.68rem] text-ink-400 mt-0.5">
                    <span style={{ color: C.gold500 }}>
                      <T v={{ en: "Goal: ", zh: "目标：" }} />
                    </span>
                    {lang === "zh" ? npc.goal.zh : npc.goal.en}
                  </p>
                </div>
                <span
                  className="text-[0.6rem] font-mono px-2 py-0.5 rounded-full flex-shrink-0 pulse"
                  style={{
                    background: `${npcStateColor(npc.state)}18`,
                    border: `1px solid ${npcStateColor(npc.state)}55`,
                    color: npcStateColor(npc.state),
                  }}
                >
                  {npcStateLabel(npc.state, lang)}
                </span>
              </div>

              {/* energy / mood bars */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "energy", val: npc.energy, color: C.holo500, label: { en: "Energy", zh: "能量" } },
                  { key: "mood",   val: npc.mood,   color: C.iris400,  label: { en: "Mood",   zh: "情绪" } },
                ].map(bar => (
                  <div key={bar.key}>
                    <div className="flex justify-between text-[0.6rem] font-mono mb-1">
                      <span style={{ color: bar.color }}>{lang === "zh" ? bar.label.zh : bar.label.en}</span>
                      <span style={{ color: C.ink500 }}>{Math.round(bar.val * 100)}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full" style={{ background: "rgba(26,16,72,0.9)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.round(bar.val * 100)}%`,
                          background: bar.color,
                          boxShadow: `0 0 6px ${bar.color}88`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* memory */}
              <div>
                <p className="text-[0.6rem] font-mono mb-1.5" style={{ color: C.ink500 }}>
                  <T v={{ en: "Memory", zh: "记忆" }} />
                </p>
                <div className="space-y-1">
                  {(lang === "zh" ? npc.memoryZh : npc.memory).map((mem, i) => (
                    <div
                      key={i}
                      className="flex gap-2 text-[0.66rem] text-ink-400 leading-relaxed px-2.5 py-1 rounded-lg"
                      style={{ background: "rgba(26,16,72,0.5)", border: "1px solid rgba(168,85,247,0.12)" }}
                    >
                      <span style={{ color: C.iris400, flexShrink: 0 }}>⦿</span>
                      {mem}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[0.65rem] text-ink-500 font-mono mt-2 text-center">
          <T v={{ en: "State updates every ~3s — energy, mood, and activity shift autonomously", zh: "状态每约3秒更新一次——能量、情绪和活动自主变化" }} />
        </p>
      </div>

      {/* ── open question panel ─────────────────────────────────────────────── */}
      <div>
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{
            background: "rgba(255,77,157,0.04)",
            border:     "1px dashed rgba(255,77,157,0.32)",
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: C.plasm500, fontSize: "1rem" }}>◈</span>
            <p className="label-mono" style={{ color: C.plasm500 }}>
              <T v={{ en: "Open Question", zh: "开放问题" }} />
            </p>
          </div>

          <p className="text-[0.82rem] text-ink-300 leading-relaxed min-h-[72px] lang-fade" key={`oq-${question}-${lang}`}>
            {lang === "zh" ? QUESTIONS[question].zh : QUESTIONS[question].en}
          </p>

          {/* pager */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setQuestion(q => (q - 1 + QUESTIONS.length) % QUESTIONS.length)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-plasm-500/30 text-ink-500 hover:text-plasm-300 transition text-sm"
            >‹</button>
            <div className="flex gap-2">
              {QUESTIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setQuestion(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: i === question ? C.plasm500 : "rgba(255,77,157,0.25)",
                    transform:  i === question ? "scale(1.3)" : "scale(1)",
                  }}
                  aria-label={`Question ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setQuestion(q => (q + 1) % QUESTIONS.length)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-plasm-500/30 text-ink-500 hover:text-plasm-300 transition text-sm"
            >›</button>
          </div>

          {/* honest framing note */}
          <div
            className="px-3 py-2.5 rounded-lg text-[0.7rem] text-ink-400 leading-relaxed"
            style={{ background: "rgba(18,10,51,0.5)", borderLeft: `2px solid ${C.plasm500}55` }}
          >
            <T v={{
              en: "We are nowhere near agents that suffer in any morally relevant sense. Current NPCs have no inner life — they approximate one syntactically. The design choices being made now (memory persistence, goal autonomy, self-modelling) are early seeds of a future question that philosophers and engineers will need to answer together.",
              zh: "我们距离能够在任何道德意义上感受痛苦的代理还差得很远。当前的NPC没有内在生命——它们只是在句法层面上近似模拟。然而现在所做的设计选择（记忆持久化、目标自主性、自我建模）正是一个未来问题的早期种子，哲学家与工程师需要共同回答。",
            }} />
          </div>
        </div>
      </div>

    </div>
  );
}
