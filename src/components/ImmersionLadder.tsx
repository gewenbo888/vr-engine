"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "./lang";

/* ─── palette constants (for canvas / SVG) ───────────────────────────────── */
const C = {
  flux:    "#4d9bff",
  fluxDim: "#1a3a6b",
  iris:    "#a855f7",
  irisDim: "#3b1469",
  holo:    "#22d3ee",
  holoDim: "#0a4d58",
  gold:    "#f5c24d",
  goldDim: "#5c480e",
  plasm:   "#ff4d9d",
  plasmDim:"#5c1228",
  ink50:   "#f6f4ff",
  ink300:  "#b3afd8",
  ink500:  "#797399",
  void950: "#06030f",
  void900: "#0b0620",
  void800: "#120a33",
  void700: "#1a1048",
};

/* ─── types ──────────────────────────────────────────────────────────────── */

type Axis = "sensory" | "agency" | "presence" | "seams";

type Medium = {
  id: string;
  label: { en: string; zh: string };
  era: { en: string; zh: string };
  year: string;
  /** 0–10 on each axis */
  scores: Record<Axis, number>;
  adds: { en: string; zh: string };
  lacks: { en: string; zh: string };
  color: string;
  speculative?: boolean;
};

/* ─── axis definitions ───────────────────────────────────────────────────── */

const AXES: { id: Axis; label: { en: string; zh: string }; description: { en: string; zh: string }; color: string }[] = [
  {
    id: "sensory",
    label: { en: "Sensory bandwidth", zh: "感知带宽" },
    description: {
      en: "How many sense channels does the medium activate — sight, sound, touch, smell, proprioception?",
      zh: "该媒介激活了多少感官通道——视觉、听觉、触觉、嗅觉、本体感觉？",
    },
    color: C.holo,
  },
  {
    id: "agency",
    label: { en: "Interactivity / agency", zh: "交互性 / 能动性" },
    description: {
      en: "Can you change what happens? Does the world respond to you? Are you an actor or observer?",
      zh: "你能改变发生的事情吗？世界会响应你吗？你是参与者还是旁观者？",
    },
    color: C.flux,
  },
  {
    id: "presence",
    label: { en: "Presence", zh: "临场感" },
    description: {
      en: "How strongly do you believe you are \"there\"? Does the experience occupy your full attention?",
      zh: "你有多强烈地相信自己\"在场\"？体验能完全占据你的注意力吗？",
    },
    color: C.iris,
  },
  {
    id: "seams",
    label: { en: "Seam-free (inverse)", zh: "无缝感（逆向）" },
    description: {
      en: "How few reminders are there that this is a representation? High = no breaks in the illusion.",
      zh: "有多少提醒你这只是表征的线索？高分 = 几乎没有打破幻觉的裂缝。",
    },
    color: C.gold,
  },
];

/* ─── media ladder data ──────────────────────────────────────────────────── */

const MEDIA: Medium[] = [
  {
    id: "oral",
    label: { en: "Oral story", zh: "口述故事" },
    era: { en: "Prehistoric", zh: "史前" },
    year: "~50 000 BCE",
    scores: { sensory: 2, agency: 2, presence: 4, seams: 3 },
    adds: {
      en: "Shared narrative, communal imagination, prosodic rhythm. The listener's mind actively co-generates the world — no fixed frame.",
      zh: "共享叙事、集体想象、韵律节奏。听众的大脑主动共建世界——没有固定框架。",
    },
    lacks: {
      en: "No persistent record. No visual detail. Fidelity depends entirely on memory and the teller's craft.",
      zh: "没有持久记录。没有视觉细节。逼真度完全依赖记忆和讲述者的技艺。",
    },
    color: C.ink300,
  },
  {
    id: "book",
    label: { en: "Book", zh: "书籍" },
    era: { en: "Ancient → Modern", zh: "古代至现代" },
    year: "~3 000 BCE",
    scores: { sensory: 2, agency: 1, presence: 6, seams: 4 },
    adds: {
      en: "Persistent, portable, re-readable. Dense symbolic compression. Imaginative transport can be extremely high — readers report vivid \"mind cinema\". High presence via internal simulation.",
      zh: "持久、便携、可重复阅读。密集的符号压缩。想象性传送感可极强——读者报告有生动的\"心理影院\"。通过内部模拟实现高临场感。",
    },
    lacks: {
      en: "Sensory bandwidth nearly zero — all reconstruction is internal. No feedback loop; zero agency over the narrative. Reading requires learned decoding.",
      zh: "感知带宽几乎为零——所有重构都在内部进行。没有反馈回路；对叙事没有任何能动性。阅读需要习得的解码能力。",
    },
    color: "#b3afd8",
  },
  {
    id: "painting",
    label: { en: "Painting", zh: "绘画" },
    era: { en: "Ancient → Modern", zh: "古代至现代" },
    year: "~40 000 BCE",
    scores: { sensory: 3, agency: 1, presence: 3, seams: 4 },
    adds: {
      en: "Fixed visual composition, perspective illusion. Can convey mood, space, and light with extraordinary craft. Frame is visible; illusion is bounded.",
      zh: "固定的视觉构图，透视幻觉。能以非凡技艺传递情绪、空间和光线。画框可见；幻觉是有边界的。",
    },
    lacks: {
      en: "Static: no motion, no time, no sound. Physical canvas is always visually present as a seam. No interaction.",
      zh: "静止：没有运动、没有时间、没有声音。物理画布始终作为裂缝可见。没有交互。",
    },
    color: "#9f8dcc",
  },
  {
    id: "photo",
    label: { en: "Photograph", zh: "摄影" },
    era: { en: "Industrial", zh: "工业时代" },
    year: "1839",
    scores: { sensory: 3, agency: 1, presence: 4, seams: 5 },
    adds: {
      en: "Optical verisimilitude: the medium captures continuous-tone light, not an artist's approximation. The indexical link to a real moment raises presence.",
      zh: "光学逼真性：介质捕捉连续调光线，而非艺术家的近似。与真实时刻的指示性联系提升临场感。",
    },
    lacks: {
      en: "Frozen time, no motion, no sound, no depth. The print/screen boundary is always present.",
      zh: "冻结时间、无运动、无声音、无深度。印刷品/屏幕边界始终存在。",
    },
    color: "#8a9fc4",
  },
  {
    id: "radio",
    label: { en: "Radio", zh: "广播" },
    era: { en: "Early broadcast", zh: "早期广播" },
    year: "1920s",
    scores: { sensory: 2, agency: 1, presence: 4, seams: 4 },
    adds: {
      en: "Temporal, real-time audio delivery. The 1938 War of the Worlds panic showed how a credible audio signal, stripped of visual contradiction, can collapse the seam.",
      zh: "时序性、实时音频传输。1938年《世界大战》广播恐慌表明，一个可信的音频信号在去除视觉矛盾后，能够崩溃幻觉与现实之间的裂缝。",
    },
    lacks: {
      en: "Audio only. No images, no interactivity, no persistence by default.",
      zh: "仅音频。没有图像、没有交互性、默认无持久性。",
    },
    color: C.ink500,
  },
  {
    id: "cinema",
    label: { en: "Cinema", zh: "电影" },
    era: { en: "20th century", zh: "二十世纪" },
    year: "1895",
    scores: { sensory: 5, agency: 1, presence: 7, seams: 6 },
    adds: {
      en: "Synchronized audio-visual full motion at 24+ fps. Screen fills peripheral vision in a dark room. Dolby Atmos, IMAX fill the sensory field. Cinema invented the dominant 20th-century grammar of illusion.",
      zh: "以24+帧/秒同步视听全动态。大银幕在黑暗的影院中充满余光视野。杜比全景声、IMAX填充感知空间。电影发明了二十世纪主导的幻觉语法。",
    },
    lacks: {
      en: "Completely passive. Seams re-emerge: credits, ticket stub, exit sign, other audience members. Fixed narrative; zero agency.",
      zh: "完全被动。裂缝重新出现：字幕、票根、出口标志、其他观众。固定叙事；零能动性。",
    },
    color: C.fluxDim,
  },
  {
    id: "tv",
    label: { en: "Television", zh: "电视" },
    era: { en: "Post-war mass media", zh: "战后大众媒体" },
    year: "1950s",
    scores: { sensory: 4, agency: 1, presence: 5, seams: 5 },
    adds: {
      en: "Cinema-like A/V in the home, available on demand. Live broadcast collapses temporal distance — you share the event as it happens.",
      zh: "家庭内的类电影视听，按需可得。直播广播消除时间距离——你与事件同时分享。",
    },
    lacks: {
      en: "Smaller screen, ambient room lighting, distractions. Presence is lower than cinema. Still zero interactivity.",
      zh: "屏幕较小，室内环境光，干扰因素较多。临场感低于电影。仍然零交互性。",
    },
    color: "#4a7daa",
  },
  {
    id: "game",
    label: { en: "Video game", zh: "电子游戏" },
    era: { en: "Digital age", zh: "数字时代" },
    year: "1970s–present",
    scores: { sensory: 5, agency: 8, presence: 7, seams: 6 },
    adds: {
      en: "The decisive breakthrough: the world responds to you. Agency transforms the user from spectator to actor. Player choices shape outcomes; the illusion becomes co-authored. Games prove high-presence is achievable without full sensory immersion.",
      zh: "决定性突破：世界响应你。能动性将用户从旁观者转变为行动者。玩家选择塑造结果；幻觉变为共同创作。游戏证明，无需完整感知沉浸也能实现高临场感。",
    },
    lacks: {
      en: "Sensory bandwidth still limited to screen + speakers + controller vibration. The seam of the monitor, keyboard, and gamepad is always present. No proprioception, no body.",
      zh: "感知带宽仍限于屏幕+扬声器+手柄震动。显示器、键盘和手柄的裂缝始终存在。没有本体感觉，没有身体感。",
    },
    color: C.flux,
  },
  {
    id: "vr",
    label: { en: "VR headset", zh: "VR头显" },
    era: { en: "Consumer VR", zh: "消费级VR" },
    year: "2016–present",
    scores: { sensory: 7, agency: 8, presence: 9, seams: 8 },
    adds: {
      en: "Stereoscopic 3-D, head-tracking removes the monitor-frame seam. The view fills all field of vision. 6-DOF spatial audio. Hand-tracked controllers restore the sense of inhabiting a body. Presence scores in studies rival real environments.",
      zh: "立体三维画面，头部追踪消除显示器边框裂缝。视野充满整个视场。六自由度空间音频。手部追踪控制器恢复身体占据感。研究中的临场感评分可与真实环境媲美。",
    },
    lacks: {
      en: "No haptics beyond controller buzz. No smell, no taste, no full-body proprioception. Cable, weight, and sweat are constant seam reminders. Field of view not yet 220°. Vergence-accommodation conflict causes fatigue.",
      zh: "除控制器震动外没有触觉反馈。没有嗅觉、味觉、全身本体感觉。线缆、重量和汗水是持续的裂缝提醒。视场角尚未达到220°。辐辏调节冲突导致疲劳。",
    },
    color: C.iris,
  },
  {
    id: "ar",
    label: { en: "AR / Mixed reality", zh: "AR/混合现实" },
    era: { en: "Emerging", zh: "新兴" },
    year: "2020s",
    scores: { sensory: 6, agency: 7, presence: 6, seams: 7 },
    adds: {
      en: "Digital overlays anchor to physical space — virtual objects have real-world position and shadow. The barrier between layers of reality dissolves. Spatial computing extends human reach without displacing it.",
      zh: "数字叠加锚定于物理空间——虚拟对象具有真实世界的位置和阴影。现实层之间的屏障消融。空间计算在不替代现实的情况下延伸了人的能力。",
    },
    lacks: {
      en: "Lower total presence than full VR — the real world competes. Optical see-through creates latency artefacts. Hand occlusion and surface tracking still imperfect.",
      zh: "总体临场感低于全VR——真实世界形成竞争。光学透视产生延迟伪影。手部遮挡和表面追踪仍不完善。",
    },
    color: C.holo,
  },
  {
    id: "fulldive",
    label: { en: "Full-dive (speculative)", zh: "全沉浸（推测性）" },
    era: { en: "Speculative future", zh: "推测性未来" },
    year: "~2050?",
    scores: { sensory: 10, agency: 10, presence: 10, seams: 10 },
    adds: {
      en: "Direct neural interface bypasses sense organs entirely. Every channel — sight, sound, touch, smell, taste, proprioception, temperature, pain, emotion-valence — delivered at the resolution the nervous system can accept. The brain cannot distinguish the simulation from reality.",
      zh: "直接神经接口完全绕过感觉器官。每个通道——视觉、听觉、触觉、嗅觉、味觉、本体感觉、温觉、痛觉、情绪效价——以神经系统能接受的分辨率传输。大脑无法区分模拟与现实。",
    },
    lacks: {
      en: "Currently non-existent. Requires safe high-bandwidth neural I/O, full sensorimotor loop, and consent/ethics infrastructure. Timeline deeply uncertain.",
      zh: "目前不存在。需要安全的高带宽神经接口、完整的感觉-运动回路，以及同意与伦理基础设施。时间线极不确定。",
    },
    color: C.plasm,
    speculative: true,
  },
];

/* ─── radar spider chart (SVG) ───────────────────────────────────────────── */

function RadarChart({ medium, size = 120 }: { medium: Medium; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const n = AXES.length; // 4

  // Polygon points for a given score array
  const toPoints = (scores: number[]) =>
    scores
      .map((s, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const mag = (s / 10) * r;
        return `${cx + Math.cos(angle) * mag},${cy + Math.sin(angle) * mag}`;
      })
      .join(" ");

  const axisEnds = AXES.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });

  const scoreArray = AXES.map((a) => medium.scores[a.id]);
  const gridLevels = [2, 5, 8, 10];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* grid rings */}
      {gridLevels.map((lv) => (
        <polygon
          key={lv}
          points={AXES.map((_, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
            const mag = (lv / 10) * r;
            return `${cx + Math.cos(angle) * mag},${cy + Math.sin(angle) * mag}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(179,175,216,0.12)"
          strokeWidth="0.8"
        />
      ))}
      {/* axis spokes */}
      {axisEnds.map((pt, i) => (
        <line
          key={i}
          x1={cx} y1={cy} x2={pt.x} y2={pt.y}
          stroke="rgba(179,175,216,0.18)"
          strokeWidth="0.8"
        />
      ))}
      {/* filled area */}
      <polygon
        points={toPoints(scoreArray)}
        fill={`${medium.color}28`}
        stroke={medium.color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 5px ${medium.color}55)` }}
      />
      {/* score dots */}
      {scoreArray.map((s, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const mag = (s / 10) * r;
        return (
          <circle
            key={i}
            cx={cx + Math.cos(angle) * mag}
            cy={cy + Math.sin(angle) * mag}
            r="2.5"
            fill={medium.color}
            style={{ filter: `drop-shadow(0 0 3px ${medium.color})` }}
          />
        );
      })}
      {/* axis color dots at edge */}
      {axisEnds.map((pt, i) => (
        <circle
          key={`ax-${i}`}
          cx={pt.x} cy={pt.y} r="2"
          fill={AXES[i].color}
          opacity={0.5}
        />
      ))}
    </svg>
  );
}

/* ─── immersion score bar ────────────────────────────────────────────────── */

function ImmersionBar({ medium, isSelected }: { medium: Medium; isSelected: boolean }) {
  const total = AXES.reduce((s, a) => s + medium.scores[a.id], 0);
  const pct = (total / 40) * 100;

  return (
    <div
      className="relative h-2 rounded-full overflow-hidden"
      style={{ background: "rgba(179,175,216,0.08)" }}
    >
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${medium.color}80, ${medium.color})`,
          boxShadow: isSelected ? `0 0 10px 2px ${medium.color}66` : "none",
        }}
      />
    </div>
  );
}

/* ─── rung on the ladder ─────────────────────────────────────────────────── */

function LadderRung({
  medium,
  isSelected,
  rankIndex,
  onSelect,
  lang,
}: {
  medium: Medium;
  isSelected: boolean;
  rankIndex: number;
  onSelect: () => void;
  lang: string;
}) {
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);
  const total = AXES.reduce((s, a) => s + medium.scores[a.id], 0);

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border transition-all duration-300 px-3 py-2.5 flex items-center gap-3 group ${
        isSelected ? "panel" : "hover:panel"
      }`}
      style={{
        borderColor: isSelected ? `${medium.color}55` : `${medium.color}1a`,
        background: isSelected
          ? `linear-gradient(135deg, ${medium.color}12, rgba(11,6,32,0.95))`
          : "rgba(11,6,32,0.6)",
        boxShadow: isSelected ? `0 0 28px -10px ${medium.color}` : "none",
      }}
      aria-pressed={isSelected}
    >
      {/* rank number */}
      <span
        className="label-mono text-[0.6rem] w-5 flex-shrink-0 text-center"
        style={{ color: isSelected ? medium.color : C.ink500 }}
      >
        {rankIndex + 1}
      </span>

      {/* color dot */}
      <span
        className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
        style={{
          background: medium.color,
          boxShadow: isSelected ? `0 0 6px 2px ${medium.color}66` : "none",
          opacity: isSelected ? 1 : 0.55,
        }}
      />

      {/* label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium leading-none truncate ${lang === "zh" ? "zh" : "display"}`}
            style={{ color: isSelected ? medium.color : C.ink300 }}
          >
            {medium.label[lang as "en" | "zh"]}
          </span>
          {medium.speculative && (
            <span
              className="label-mono text-[0.48rem] rounded-full px-1.5 py-0.5 flex-shrink-0"
              style={{ background: `${C.plasm}14`, border: `1px solid ${C.plasm}44`, color: C.plasm }}
            >
              {L("SPECULATIVE", "推测性")}
            </span>
          )}
        </div>
        <div className="mt-1.5">
          <ImmersionBar medium={medium} isSelected={isSelected} />
        </div>
      </div>

      {/* total score badge */}
      <span
        className="label-mono text-[0.6rem] flex-shrink-0"
        style={{ color: isSelected ? medium.color : C.ink500 }}
      >
        {total}
        <span style={{ color: C.ink500 }}>/40</span>
      </span>
    </button>
  );
}

/* ─── axis score cell ────────────────────────────────────────────────────── */

function AxisCell({ axis, score, color }: { axis: typeof AXES[0]; score: number; color: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="label-mono text-[0.52rem]" style={{ color: axis.color }}>
          {axis.label.en}
        </span>
        <span className="label-mono text-[0.6rem]" style={{ color }}>
          {score}
          <span style={{ color: C.ink500 }}>/10</span>
        </span>
      </div>
      <div
        className="relative h-1.5 rounded-full overflow-hidden"
        style={{ background: `${axis.color}15` }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{
            width: `${score * 10}%`,
            background: axis.color,
            boxShadow: `0 0 6px 2px ${axis.color}44`,
          }}
        />
      </div>
    </div>
  );
}

/* ─── detail panel ───────────────────────────────────────────────────────── */

function DetailPanel({ medium, lang }: { medium: Medium; lang: string }) {
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);

  return (
    <div
      key={medium.id}
      className="panel rounded-2xl p-5 flex flex-col gap-5 rise-in"
      style={{ borderColor: `${medium.color}33` }}
    >
      {/* header */}
      <div className="flex items-start gap-3">
        <span
          className="mt-1 w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: medium.color, boxShadow: `0 0 10px 3px ${medium.color}55` }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`display text-xl leading-tight ${lang === "zh" ? "zh" : ""}`}
              style={{ color: medium.color }}
            >
              {medium.label[lang as "en" | "zh"]}
            </h3>
            {medium.speculative && (
              <span
                className="label-mono text-[0.5rem] rounded-full px-2 py-0.5"
                style={{ background: `${C.plasm}18`, border: `1px solid ${C.plasm}55`, color: C.plasm }}
              >
                {L("SPECULATIVE", "推测性")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="label-mono text-[0.55rem]" style={{ color: C.ink500 }}>
              {medium.era[lang as "en" | "zh"]}
            </span>
            <span className="label-mono text-[0.55rem]" style={{ color: medium.color, opacity: 0.6 }}>
              {medium.year}
            </span>
          </div>
        </div>
        {/* radar mini chart */}
        <div className="flex-shrink-0 opacity-90">
          <RadarChart medium={medium} size={90} />
        </div>
      </div>

      <div className="h-px rule-flux opacity-20 rounded-full" />

      {/* axis scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AXES.map((ax) => (
          <AxisCell key={ax.id} axis={ax} score={medium.scores[ax.id]} color={medium.color} />
        ))}
      </div>

      <div className="h-px" style={{ background: `${medium.color}18` }} />

      {/* adds / lacks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div
            className="label-mono text-[0.55rem] flex items-center gap-1.5"
            style={{ color: medium.color }}
          >
            <svg viewBox="0 0 10 10" width="9" height="9">
              <circle cx="5" cy="5" r="4" fill="none" stroke={medium.color} strokeWidth="1.2" />
              <line x1="5" y1="3" x2="5" y2="7" stroke={medium.color} strokeWidth="1.2" strokeLinecap="round" />
              <line x1="3" y1="5" x2="7" y2="5" stroke={medium.color} strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {L("WHAT IT ADDS", "新增的维度")}
          </div>
          <p
            className={`text-xs text-ink-300 leading-relaxed ${lang === "zh" ? "zh leading-loose" : ""}`}
            style={{ fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
          >
            {medium.adds[lang as "en" | "zh"]}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="label-mono text-[0.55rem] flex items-center gap-1.5" style={{ color: C.ink500 }}>
            <svg viewBox="0 0 10 10" width="9" height="9">
              <circle cx="5" cy="5" r="4" fill="none" stroke={C.ink500} strokeWidth="1.2" />
              <line x1="3" y1="5" x2="7" y2="5" stroke={C.ink500} strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {L("WHAT REMAINS MISSING", "仍缺失的维度")}
          </div>
          <p
            className={`text-xs text-ink-500 leading-relaxed ${lang === "zh" ? "zh leading-loose" : ""}`}
            style={{ fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
          >
            {medium.lacks[lang as "en" | "zh"]}
          </p>
        </div>
      </div>

      {/* speculative note */}
      {medium.speculative && (
        <div
          className="rounded-xl border px-4 py-3 text-xs leading-relaxed"
          style={{
            borderColor: `${C.plasm}25`,
            background: `${C.plasm}08`,
            color: `${C.plasm}cc`,
            fontFamily: lang === "zh" ? undefined : '"Spectral", serif',
          }}
        >
          <span className={lang === "zh" ? "zh" : ""}>
            {L(
              "This rung is speculative — no implementation exists. Scores reflect theoretical maxima if the technology were realized.",
              "此阶梯是推测性的——目前尚无任何实现。分数反映了如果该技术得以实现的理论最大值。"
            )}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── comparison overlay: small multi-radar ─────────────────────────────── */

function AxisLegend({ lang }: { lang: string }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {AXES.map((ax) => (
        <div key={ax.id} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ax.color }} />
          <span className="label-mono text-[0.52rem]" style={{ color: ax.color }}>
            {ax.label[lang as "en" | "zh"]}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────────────── */

export default function ImmersionLadder() {
  const { lang } = useLang();
  const L = useCallback((en: string, zh: string) => (lang === "zh" ? zh : en), [lang]);

  // Sort media by total immersion score ascending (ladder order — lowest to highest)
  const sorted = [...MEDIA].sort((a, b) => {
    const ta = AXES.reduce((s, ax) => s + a.scores[ax.id], 0);
    const tb = AXES.reduce((s, ax) => s + b.scores[ax.id], 0);
    return ta - tb;
  });

  const [selectedId, setSelectedId] = useState<string>("vr");
  const selected = MEDIA.find((m) => m.id === selectedId) ?? MEDIA[MEDIA.length - 1];

  // Active axis highlight for the legend tooltip
  const [hoverAxis, setHoverAxis] = useState<Axis | null>(null);

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-12 flex flex-col gap-10">

      {/* ── section header ── */}
      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="label-mono text-flux-400">
          {L("System 02 · History of VR", "系统 02 · 虚拟现实史")}
        </div>
        <h2 className="display text-4xl md:text-5xl spark-text leading-none">
          {L("The Immersion Ladder", "沉浸阶梯")}
        </h2>
        <p
          className={`text-base text-ink-300 leading-relaxed max-w-2xl ${lang === "zh" ? "zh" : ""}`}
          style={{ fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
        >
          {L(
            "Media are ranked not by date, but by how completely they capture perception. Immersion is multi-dimensional: a novel can score high on presence while scoring near-zero on sensory bandwidth. Click any rung to see what each medium adds — and what seams it still leaves.",
            "媒介不按时间排序，而是按照它们对感知的捕捉程度排序。沉浸感是多维的：一部小说的临场感可以很高，但感知带宽几乎为零。点击任意一级阶梯，了解每种媒介新增了什么——以及它仍留下了哪些裂缝。"
          )}
        </p>
      </div>

      {/* ── axis key ── */}
      <div className="panel rounded-xl px-4 py-3 flex flex-col gap-3">
        <div className="label-mono text-[0.55rem]" style={{ color: C.ink500 }}>
          {L("FOUR AXES OF IMMERSION", "四个沉浸维度")}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AXES.map((ax) => (
            <button
              key={ax.id}
              onMouseEnter={() => setHoverAxis(ax.id)}
              onMouseLeave={() => setHoverAxis(null)}
              onFocus={() => setHoverAxis(ax.id)}
              onBlur={() => setHoverAxis(null)}
              className="flex items-start gap-2 text-left rounded-lg px-3 py-2 transition-all duration-200"
              style={{
                background: hoverAxis === ax.id ? `${ax.color}10` : "transparent",
                border: `1px solid ${hoverAxis === ax.id ? ax.color + "30" : "transparent"}`,
              }}
            >
              <span
                className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: ax.color, boxShadow: `0 0 5px ${ax.color}` }}
              />
              <div className="flex flex-col gap-0.5">
                <span className="label-mono text-[0.55rem]" style={{ color: ax.color }}>
                  {ax.label[lang as "en" | "zh"]}
                </span>
                <span
                  className={`text-[0.68rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}
                  style={{ color: C.ink500, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
                >
                  {ax.description[lang as "en" | "zh"]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── main layout: ladder + detail ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">

        {/* left: ladder rungs */}
        <div className="flex flex-col gap-2">
          {/* column headers */}
          <div className="flex items-center gap-3 px-3 pb-1">
            <span className="w-5 flex-shrink-0" />
            <span className="w-2 flex-shrink-0" />
            <span className="flex-1 label-mono text-[0.52rem]" style={{ color: C.ink500 }}>
              {L("MEDIUM — total immersion score", "媒介 — 总沉浸分")}
            </span>
          </div>

          {/* axis mini-legend below header */}
          <div className="px-3 mb-1">
            <AxisLegend lang={lang} />
          </div>

          {/* rungs — sorted low → high, numbered bottom-up visually by reversing display */}
          {[...sorted].reverse().map((medium, i) => (
            <LadderRung
              key={medium.id}
              medium={medium}
              isSelected={selectedId === medium.id}
              rankIndex={sorted.length - 1 - i}
              onSelect={() => setSelectedId(medium.id)}
              lang={lang}
            />
          ))}

          {/* ladder visual indicator */}
          <div className="flex items-center gap-2 mt-3 px-1">
            <svg viewBox="0 0 16 40" width="16" height="40" className="flex-shrink-0">
              <line x1="8" y1="2" x2="8" y2="38" stroke={C.flux} strokeWidth="1" opacity="0.3" />
              <polygon points="8,0 5,6 11,6" fill={C.iris} opacity="0.7" />
            </svg>
            <span className="label-mono text-[0.52rem]" style={{ color: C.ink500 }}>
              {L("← increasing immersion", "← 沉浸感递增")}
            </span>
          </div>
        </div>

        {/* right: detail + radar */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-8">
          <DetailPanel medium={selected} lang={lang} />

          {/* mini comparison of all mediums on selected axis if axis hovered */}
          {hoverAxis && (
            <div
              className="panel rounded-xl p-4 flex flex-col gap-3 rise-in"
              style={{ borderColor: `${AXES.find(a => a.id === hoverAxis)?.color}30` }}
            >
              <div
                className="label-mono text-[0.55rem]"
                style={{ color: AXES.find(a => a.id === hoverAxis)?.color }}
              >
                {L(
                  `ALL MEDIA · ${AXES.find(a => a.id === hoverAxis)?.label.en ?? ""}`,
                  `所有媒介 · ${AXES.find(a => a.id === hoverAxis)?.label.zh ?? ""}`
                )}
              </div>
              {sorted.map((m) => {
                const ax = hoverAxis as Axis;
                const score = m.scores[ax];
                const axColor = AXES.find(a => a.id === ax)?.color ?? m.color;
                return (
                  <div key={m.id} className="flex items-center gap-2">
                    <span
                      className={`text-[0.65rem] w-24 truncate flex-shrink-0 ${lang === "zh" ? "zh" : ""}`}
                      style={{ color: selectedId === m.id ? m.color : C.ink500 }}
                    >
                      {m.label[lang as "en" | "zh"]}
                    </span>
                    <div
                      className="relative flex-1 h-1.5 rounded-full"
                      style={{ background: `${axColor}15` }}
                    >
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${score * 10}%`,
                          background: axColor,
                          opacity: selectedId === m.id ? 1 : 0.4,
                        }}
                      />
                    </div>
                    <span className="label-mono text-[0.55rem] w-4 text-right" style={{ color: axColor }}>
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── closing insight ── */}
      <div
        className="rounded-2xl border px-6 py-5 text-sm leading-relaxed"
        style={{
          borderColor: "rgba(168,85,247,0.12)",
          background: "rgba(168,85,247,0.04)",
        }}
      >
        <p
          className={`text-ink-300 ${lang === "zh" ? "zh leading-loose" : ""}`}
          style={{ fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
        >
          {L(
            "The ladder reveals a paradox: books outperform television on presence, despite offering almost zero sensory bandwidth. Immersion is not sensory overwhelm — it is the degree to which a medium occupies and commits the perceiving mind. The frontier is not richer pixels, but closing the agency and seam gaps that still separate VR from full-dive.",
            "这个阶梯揭示了一个悖论：书籍在临场感上胜过电视，尽管其感知带宽几乎为零。沉浸感不是感官的轰炸——而是一种媒介占据和驱动感知心智的程度。前沿不在于更丰富的像素，而在于弥合那些仍将VR与全沉浸分隔开的能动性与裂缝差距。"
          )}
        </p>
      </div>

    </section>
  );
}
