"use client";

import { useState } from "react";
import { useLang, T } from "./lang";
import type { Bi } from "./lang";

/* ═══════════════════════════════════════════════════════════════════════════════
   ImmersionRadar — 8-axis meta-model radar for the Virtual Reality Engine
   "Immersive Civilisation = Perception Engineering + AI World-Generation +
    Neural Interfaces + Spatial Computing + Digital Identity +
    Experience Economies + Collective Simulation + Consciousness Connectivity"

   Six selectable presets morph the polygon; any two can be overlaid for comparison.
   Speculative presets are clearly badged in plasm-magenta.
   ═══════════════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────── axes ────────────────────────────────────

const AXES: Bi[] = [
  { en: "Perception\nEngineering", zh: "感知\n工程" },
  { en: "AI World-\nGeneration", zh: "AI 世界\n生成" },
  { en: "Neural\nInterfaces", zh: "神经\n接口" },
  { en: "Spatial\nComputing", zh: "空间\n计算" },
  { en: "Digital\nIdentity", zh: "数字\n身份" },
  { en: "Experience\nEconomies", zh: "体验\n经济" },
  { en: "Collective\nSimulation", zh: "集体\n模拟" },
  { en: "Consciousness\nConnectivity", zh: "意识\n连接" },
];

const AXIS_NOTES: Bi[] = [
  {
    en: "How precisely sensory signals — sight, sound, touch, proprioception — can be synthesised and delivered to a human. Near-zero when reality is purely physical; maximal when a neural interface can render any sensation on demand.",
    zh: "视觉、听觉、触觉、本体感知等感觉信号被合成并传递给人类的精确程度。在现实纯粹物理的时代近乎为零；当神经接口能按需渲染任何感知时达到最大值。",
  },
  {
    en: "The capacity of AI systems to procedurally generate coherent, responsive, and open-ended virtual worlds — from rule-based game engines to neural-radiance-field generators to fully agentic world-simulators.",
    zh: "AI 系统以程序化方式生成连贯、响应灵敏且开放式虚拟世界的能力——从基于规则的游戏引擎，到神经辐射场生成器，再到完全自主的世界模拟器。",
  },
  {
    en: "The directness and bandwidth of the link between digital systems and the nervous system — from no link at all, through EEG headsets and cochlear implants, to speculative full-dive BCIs that intercept all sensory pathways.",
    zh: "数字系统与神经系统之间连接的直接程度与带宽——从毫无连接，经由脑电帽和人工耳蜗，到推测性的拦截所有感觉通道的全沉浸脑机接口。",
  },
  {
    en: "The ability to register, render and interact with objects at real-world scale and position — from flat screens, through stereoscopic headsets and inside-out tracking, to centimetre-accurate mixed-reality overlays on every surface.",
    zh: "在真实世界的尺度和位置上注册、渲染和交互的能力——从平面屏幕，经由立体声头显和由内向外追踪，到覆盖每个表面的厘米级精确混合现实叠加层。",
  },
  {
    en: "The richness and portability of a person's digital self — avatars, persistent inventories, cross-platform reputation, and verifiable ownership of virtual assets. Low when digital personas are fragmented per-platform; high when a unified sovereign identity travels everywhere.",
    zh: "个人数字自我的丰富性与可携带性——头像、持久化库存、跨平台声誉以及虚拟资产的可验证所有权。当数字身份在各平台间碎片化时较低；当统一的主权身份随处通行时较高。",
  },
  {
    en: "The economic weight of designed experiences relative to goods and services — theme parks, concerts, games, VR subscriptions, and ultimately immersive-world subscriptions as a primary share of GDP and human time.",
    zh: "精心设计的体验相对于商品和服务的经济比重——主题公园、演唱会、游戏、VR 订阅，直至沉浸式世界订阅成为 GDP 和人类时间的主要份额。",
  },
  {
    en: "The degree to which large groups share a simulated space simultaneously — from solo experiences, through multiplayer worlds with thousands of co-present avatars, to planet-scale shared simulations where societies coexist across physical and virtual layers.",
    zh: "大型群体同时共享模拟空间的程度——从单人体验，经由数千共在化身的多人世界，到社会在物理与虚拟层之间共存的星球规模共享模拟。",
  },
  {
    en: "How tightly subjective awareness can be coupled, broadcast, or merged across individuals within virtual systems — from zero (purely private inner life), through shared-emotion platforms and empathy interfaces, to highly speculative direct consciousness bridging.",
    zh: "主观意识在虚拟系统中被耦合、广播或跨个体融合的紧密程度——从零（纯粹私密的内心生活），经由共享情感平台和共情接口，到高度推测性的直接意识桥接。",
  },
];

// ─────────────────────────────────── presets ─────────────────────────────────

interface Preset {
  name: Bi;
  note: Bi;
  scores: [number, number, number, number, number, number, number, number];
  color: string;
  speculative?: boolean;
}

/* Scores order:
   [PerceptionEngineering, AIWorldGeneration, NeuralInterfaces, SpatialComputing,
    DigitalIdentity, ExperienceEconomies, CollectiveSimulation, ConsciousnessConnectivity] */
const PRESETS: Preset[] = [
  {
    name: { en: "Pre-Screen World", zh: "屏幕之前" },
    note: {
      en: "Pre-cinema, pre-broadcast: experience is purely physical and embodied; no mediated immersion.",
      zh: "前电影、前广播时代：体验纯粹是物理的和具身的；没有媒介化的沉浸。",
    },
    scores: [0.04, 0.02, 0.01, 0.02, 0.03, 0.14, 0.05, 0.04],
    color: "#4d9bff", // flux blue
  },
  {
    name: { en: "The Screen Age", zh: "屏幕时代" },
    note: {
      en: "TV, cinema and the internet deliver collective media; experience economies grow; immersion stays flat on glass.",
      zh: "电视、电影和互联网传递集体媒体；体验经济兴起；沉浸感停留在玻璃平面上。",
    },
    scores: [0.18, 0.12, 0.02, 0.09, 0.22, 0.44, 0.38, 0.05],
    color: "#f5c24d", // gold amber
  },
  {
    name: { en: "Today's Headset VR", zh: "今日头显 VR" },
    note: {
      en: "Quest / PSVR2 era: real spatial computing and growing AI worlds; digital identity emerging; neural interfaces near zero.",
      zh: "Quest / PSVR2 时代：真正的空间计算与日益增长的 AI 世界；数字身份初现；神经接口近乎为零。",
    },
    scores: [0.52, 0.38, 0.04, 0.62, 0.42, 0.54, 0.45, 0.06],
    color: "#22d3ee", // holo cyan
  },
  {
    name: { en: "Spatial Computing / AR", zh: "空间计算 / AR" },
    note: {
      en: "Vision Pro era: high spatial computing, mixed real+virtual, richer digital identity and shared AR spaces.",
      zh: "Apple Vision Pro 时代：高度空间计算，真实与虚拟混合，更丰富的数字身份与共享 AR 空间。",
    },
    scores: [0.68, 0.52, 0.07, 0.88, 0.62, 0.66, 0.60, 0.10],
    color: "#93c5fd", // flux-300 cool blue
  },
  {
    name: { en: "AI-Generated Metaverse", zh: "AI 元宇宙" },
    note: {
      en: "Speculative near-future: AI world-generation reaches near-infinite content; experience economies dominant; digital identity sovereign.",
      zh: "推测性的近未来：AI 世界生成达到近乎无限的内容；体验经济占主导；数字身份实现主权化。",
    },
    scores: [0.78, 0.88, 0.22, 0.84, 0.82, 0.86, 0.78, 0.28],
    color: "#a855f7", // iris purple
    speculative: true,
  },
  {
    name: { en: "Full-Dive Civilisation", zh: "全沉浸文明" },
    note: {
      en: "Highly speculative: neural interfaces intercept all sensory pathways; perception engineering and consciousness connectivity at maximum.",
      zh: "高度推测性：神经接口拦截所有感觉通路；感知工程与意识连接达到最大值。",
    },
    scores: [0.96, 0.92, 0.90, 0.88, 0.90, 0.92, 0.88, 0.86],
    color: "#ff4d9d", // plasm magenta
    speculative: true,
  },
];

// ─────────────────────────────── geometry ────────────────────────────────────

const SIZE = 460;
const C = SIZE / 2;
const R = SIZE * 0.36;
const N = AXES.length;

function pt(i: number, frac: number): [number, number] {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
  return [C + Math.cos(a) * R * frac, C + Math.sin(a) * R * frac];
}

function polyPoints(scores: readonly number[]): string {
  return scores.map((s, i) => pt(i, s).join(",")).join(" ");
}

// ─────────────────────────────── component ───────────────────────────────────

export default function ImmersionRadar() {
  const { lang } = useLang();

  // primary selected preset (always shown)
  const [primary, setPrimary] = useState<number>(2); // default: Today's Headset VR
  // optional compare overlay (null = off)
  const [compare, setCompare] = useState<number | null>(null);
  // hovered axis for tooltip
  const [axis, setAxis] = useState<number | null>(null);
  // hover on a preset button to dim others
  const [hover, setHover] = useState<number | null>(null);

  const primaryPreset = PRESETS[primary];
  const comparePreset = compare !== null ? PRESETS[compare] : null;

  function handlePresetClick(idx: number) {
    if (idx === primary) return;
    if (compare === idx) {
      // clicking compare preset again clears comparison
      setCompare(null);
      return;
    }
    if (compare === null) {
      // first click on a non-primary: set as primary
      setPrimary(idx);
    } else {
      // already comparing: replace primary, keep compare unless same
      if (idx === compare) {
        setCompare(null);
      } else {
        setPrimary(idx);
      }
    }
  }

  function handleCompareToggle(idx: number) {
    if (idx === primary) return; // can't compare with self
    setCompare((c) => (c === idx ? null : idx));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      {/* ─── Radar SVG ─── */}
      <div className="relative mx-auto w-full max-w-[540px]">
        <svg viewBox={`-128 -52 ${SIZE + 256} ${SIZE + 104}`} className="w-full">
          {/* grid rings */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <polygon
              key={f}
              points={AXES.map((_, i) => pt(i, f).join(",")).join(" ")}
              fill="none"
              stroke="rgba(77,155,255,0.09)"
              strokeWidth={1}
            />
          ))}

          {/* ring labels (25 … 100) at top axis */}
          {[0.25, 0.5, 0.75, 1].map((f) => {
            const [lx, ly] = pt(0, f);
            return (
              <text
                key={f}
                x={lx + 5}
                y={ly}
                fontSize={8}
                dominantBaseline="middle"
                fill="rgba(118,123,162,0.6)"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {(f * 100).toFixed(0)}
              </text>
            );
          })}

          {/* axis spokes */}
          {AXES.map((_, i) => {
            const [x, y] = pt(i, 1);
            return (
              <g key={i}>
                <line
                  x1={C}
                  y1={C}
                  x2={x}
                  y2={y}
                  stroke="rgba(77,155,255,0.11)"
                  strokeWidth={1}
                />
                {/* invisible hit target */}
                <circle
                  cx={x}
                  cy={y}
                  r={16}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setAxis(i)}
                  onMouseLeave={() => setAxis(null)}
                />
              </g>
            );
          })}

          {/* compare polygon (drawn below primary so primary is on top) */}
          {comparePreset && (
            <g style={{ transition: "opacity 0.25s" }}>
              <polygon
                points={polyPoints(comparePreset.scores)}
                fill={comparePreset.color}
                fillOpacity={0.07}
                stroke={comparePreset.color}
                strokeWidth={1.6}
                strokeDasharray="5 3"
                strokeLinejoin="round"
                style={{ transition: "points 0.45s cubic-bezier(0.4,0,0.2,1)" }}
              />
              {comparePreset.scores.map((s, i) => {
                const [x, y] = pt(i, s);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={2.2}
                    fill={comparePreset.color}
                    opacity={0.7}
                  />
                );
              })}
            </g>
          )}

          {/* primary polygon */}
          <g>
            <polygon
              points={polyPoints(primaryPreset.scores)}
              fill={primaryPreset.color}
              fillOpacity={0.12}
              stroke={primaryPreset.color}
              strokeWidth={2.2}
              strokeLinejoin="round"
              style={{
                filter: `drop-shadow(0 0 8px ${primaryPreset.color}88)`,
                transition: "points 0.45s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
            {primaryPreset.scores.map((s, i) => {
              const [x, y] = pt(i, s);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={3}
                  fill={primaryPreset.color}
                  style={{ filter: `drop-shadow(0 0 4px ${primaryPreset.color})` }}
                />
              );
            })}
          </g>

          {/* axis labels */}
          {AXES.map((ax, i) => {
            const [x, y] = pt(i, 1.18);
            const anchor: "middle" | "start" | "end" =
              Math.abs(x - C) < 40 ? "middle" : x > C ? "start" : "end";
            const lines = ax[lang].split("\n");
            return (
              <text
                key={i}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={lang === "zh" ? 12 : 10.5}
                className={`${
                  axis === i ? "fill-flux-400" : "fill-[#767ba2]"
                } ${lang === "zh" ? "zh" : "font-mono"}`}
                style={{
                  letterSpacing: lang === "zh" ? "0.02em" : "0.04em",
                  cursor: "pointer",
                  textTransform: lang === "zh" ? "none" : "uppercase",
                  transition: "fill 0.15s",
                }}
                onMouseEnter={() => setAxis(i)}
                onMouseLeave={() => setAxis(null)}
              >
                {lines.map((line, li) => (
                  <tspan
                    key={li}
                    x={x}
                    dy={li === 0 ? (lines.length > 1 ? "-0.55em" : "0") : "1.25em"}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            );
          })}

          {/* centre dot */}
          <circle cx={C} cy={C} r={3} fill="rgba(77,155,255,0.35)" />
        </svg>
      </div>

      {/* ─── Controls panel ─── */}
      <div>
        <div className="label-mono">
          {lang === "zh"
            ? "沉浸式文明阶段 · 选择"
            : "immersive civilisation stages · select"}
        </div>

        <div className="mt-4 space-y-2">
          {PRESETS.map((p, pi) => {
            const isPrimary = pi === primary;
            const isCompare = pi === compare;
            const dimmed =
              hover !== null && hover !== pi && !isPrimary && !isCompare;

            return (
              <div
                key={pi}
                className={`flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-all ${
                  isPrimary
                    ? "border-ink-100/25 bg-void-800/80"
                    : isCompare
                    ? "border-ink-100/15 bg-void-900/60"
                    : "border-ink-100/6 bg-void-950/40"
                } ${dimmed ? "opacity-35" : "opacity-100"}`}
                style={{ transition: "opacity 0.2s, border-color 0.2s" }}
                onMouseEnter={() => setHover(pi)}
                onMouseLeave={() => setHover(null)}
              >
                {/* colour swatch + click-to-set-primary */}
                <button
                  onClick={() => handlePresetClick(pi)}
                  className="flex min-w-0 flex-1 items-start gap-3"
                  aria-pressed={isPrimary}
                >
                  <span
                    className="mt-1 h-3 w-3 flex-none rounded-sm"
                    style={{
                      background: p.color,
                      boxShadow: isPrimary
                        ? `0 0 12px ${p.color}`
                        : isCompare
                        ? `0 0 7px ${p.color}88`
                        : "none",
                    }}
                  />
                  <span className="min-w-0">
                    <span className="display block text-sm text-ink-100">
                      <T v={p.name} />
                      {p.speculative && (
                        <span
                          className="ml-1.5 inline-block rounded px-1 py-px text-[9px] font-mono uppercase tracking-wider"
                          style={{
                            background: "rgba(255,77,157,0.15)",
                            color: "#ff93c8",
                            border: "1px solid rgba(255,77,157,0.35)",
                          }}
                        >
                          {lang === "zh" ? "推测" : "speculative"}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-ink-500">
                      <T v={p.note} />
                    </span>
                  </span>
                </button>

                {/* compare toggle button */}
                {!isPrimary && (
                  <button
                    onClick={() => handleCompareToggle(pi)}
                    title={
                      isCompare
                        ? lang === "zh"
                          ? "移除对比"
                          : "Remove overlay"
                        : lang === "zh"
                        ? "添加对比"
                        : "Overlay"
                    }
                    className={`mt-0.5 flex-none rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider transition ${
                      isCompare
                        ? "border-iris-500/50 bg-iris-500/15 text-iris-400"
                        : "border-ink-100/10 text-ink-500 hover:border-iris-500/40 hover:text-iris-400"
                    }`}
                  >
                    {isCompare
                      ? lang === "zh"
                        ? "取消"
                        : "×"
                      : lang === "zh"
                      ? "对比"
                      : "vs"}
                  </button>
                )}

                {isPrimary && (
                  <span className="mt-0.5 flex-none rounded border border-flux-500/40 bg-flux-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-flux-400">
                    {lang === "zh" ? "选中" : "active"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── axis detail card ─── */}
        <div
          key={axis ?? -1}
          className="mt-6 min-h-[96px] rounded-xl border border-flux-500/20 bg-void-900/60 p-4 lang-fade"
        >
          {axis === null ? (
            <p className="text-sm leading-relaxed text-ink-400">
              <T
                v={{
                  en: "Hover an axis to read what it measures. Click a stage to morph the polygon; use the vs button to overlay a second stage for comparison.",
                  zh: "悬停某个轴以阅读它度量什么。点击某个阶段，多边形将变形；使用「对比」按钮叠加另一个阶段进行比较。",
                }}
              />
            </p>
          ) : (
            <>
              <div className="display text-base flux-glow">
                <T v={AXES[axis]} />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
                <T v={AXIS_NOTES[axis]} />
              </p>
            </>
          )}
        </div>

        {/* ─── compare legend strip (visible when comparing) ─── */}
        {comparePreset && (
          <div
            className="mt-3 flex items-center gap-4 rounded-lg border border-ink-100/8 bg-void-900/40 px-4 py-2.5"
            style={{ transition: "opacity 0.3s" }}
          >
            <span className="flex items-center gap-2 text-xs text-ink-400">
              <span
                className="inline-block h-2.5 w-5 rounded-sm"
                style={{
                  background: primaryPreset.color,
                  boxShadow: `0 0 8px ${primaryPreset.color}`,
                }}
              />
              <T v={primaryPreset.name} />
            </span>
            <span className="text-ink-500/40 text-xs">vs</span>
            <span className="flex items-center gap-2 text-xs text-ink-400">
              <span
                className="inline-block h-2.5 w-5 rounded-sm opacity-70"
                style={{
                  background: comparePreset.color,
                  border: `1px dashed ${comparePreset.color}`,
                }}
              />
              <T v={comparePreset.name} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
