"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "./lang";

/* ═══════════════════════════════ IMMERSION DIAL ═══════════════════════════════
   Three-lens interactive control panel for the Virtual Reality Engine.
     A · Immersion Ladder   — Text → Radio → Photo → Cinema → Game → VR → AR → Full-Dive
     B · Sensory Budget     — Vision / Audio / Haptics / Vestibular / Proprioception
     C · Fidelity → Indistinguishability — today → convincing → social → embodied → full-dive
   ════════════════════════════════════════════════════════════════════════════ */

function L(en: string, zh: string, lang: string) {
  return lang === "zh" ? zh : en;
}

/* ════════════════════════════════════════════════════════════════════════
   LENS A — Immersion Ladder
   ════════════════════════════════════════════════════════════════════════ */

type ImmersionRung = {
  id: string;
  label: { en: string; zh: string };
  presence: number; // 0–100 %
  senses: { vision: boolean; hearing: boolean; touch: boolean; proprioception: boolean; agency: boolean };
  interactivity: number; // 0–100 %
  seams: { en: string; zh: string }; // what reminds you it's not real
  fov: number; // field-of-view proxy 0–360 degrees (for the visual)
  color: string;
  speculative: boolean;
  blurb: { en: string; zh: string };
};

const RUNGS: ImmersionRung[] = [
  {
    id: "text",
    label: { en: "Text / Book", zh: "文字 / 书籍" },
    presence: 5,
    senses: { vision: true, hearing: false, touch: false, proprioception: false, agency: false },
    interactivity: 2,
    seams: { en: "Physical book object, ambient room, body fatigue", zh: "书本实体、周围房间、身体疲劳" },
    fov: 12,
    color: "#93c5ff",
    speculative: false,
    blurb: {
      en: "Linear text activates mental imagery in the mind's eye but engages no sensory channels other than vision. Presence is purely cognitive.",
      zh: "线性文字在心眼中激活意象，但除视觉外不激活任何感官。临场感纯属认知。",
    },
  },
  {
    id: "radio",
    label: { en: "Radio / Podcast", zh: "广播 / 播客" },
    presence: 10,
    senses: { vision: false, hearing: true, touch: false, proprioception: false, agency: false },
    interactivity: 3,
    seams: { en: "Absence of imagery, body awareness, physical environment", zh: "缺乏视觉、身体感知、物理环境" },
    fov: 0,
    color: "#93c5ff",
    speculative: false,
    blurb: {
      en: "Audio-only. Binaural recording hints at spatial presence; voice performance creates intimacy. No visual channel.",
      zh: "纯音频。双耳录音暗示空间临场感；声音表演制造亲密感。无视觉通道。",
    },
  },
  {
    id: "photo",
    label: { en: "Photograph / 2D Image", zh: "照片 / 平面图像" },
    presence: 15,
    senses: { vision: true, hearing: false, touch: false, proprioception: false, agency: false },
    interactivity: 4,
    seams: { en: "Flat rectangle, fixed viewpoint, no parallax, silence", zh: "平面矩形、固定视角、无视差、静默" },
    fov: 20,
    color: "#4d9bff",
    speculative: false,
    blurb: {
      en: "Static 2D framing. The fixed rectangle and absence of parallax are strong seams. Depth cues (perspective, shading) provide mild immersion.",
      zh: "静态二维取景。固定矩形和缺乏视差是强烈的\"缝隙\"。透视、阴影等深度线索提供轻度沉浸感。",
    },
  },
  {
    id: "cinema",
    label: { en: "Cinema", zh: "电影院" },
    presence: 38,
    senses: { vision: true, hearing: true, touch: false, proprioception: false, agency: false },
    interactivity: 5,
    seams: { en: "Fixed seat, hard screen edge, no head-tracking, audience", zh: "固定座位、硬屏幕边框、无头部追踪、其他观众" },
    fov: 50,
    color: "#4d9bff",
    speculative: false,
    blurb: {
      en: "Large-screen visuals + Dolby Atmos spatial audio create powerful emotional transport. The hard screen border and static viewpoint remain strong seams.",
      zh: "大屏视觉 + 杜比全景声空间音频创造强烈的情感代入。硬屏幕边框和静止视角仍是强\"缝隙\"。",
    },
  },
  {
    id: "game",
    label: { en: "Video Game (2D/3D)", zh: "电子游戏（2D/3D）" },
    presence: 55,
    senses: { vision: true, hearing: true, touch: false, proprioception: false, agency: true },
    interactivity: 68,
    seams: { en: "Monitor bezel, mouse/controller abstraction, no physical avatar sense", zh: "显示器边框、鼠标/手柄抽象、无身体化身感" },
    fov: 90,
    color: "#a855f7",
    speculative: false,
    blurb: {
      en: "Agency transforms experience: choices create stakes, narrative consequence, and flow state. Controller abstraction and monitor frame remain hard seams.",
      zh: "能动性改变体验：选择创造风险、叙事后果和心流状态。手柄抽象和显示器边框仍是强\"缝隙\"。",
    },
  },
  {
    id: "vr",
    label: { en: "VR Headset", zh: "VR头显" },
    presence: 75,
    senses: { vision: true, hearing: true, touch: false, proprioception: true, agency: true },
    interactivity: 78,
    seams: { en: "Weight/heat of headset, no haptics, inside-out boundary awareness, screen door effect", zh: "头显重量/热量、无触觉、边界感知、纱窗效应" },
    fov: 120,
    color: "#a855f7",
    speculative: false,
    blurb: {
      en: "~120° FOV, 90Hz+ refresh, <20ms motion-to-photon latency, 6DoF head tracking and hand controllers. Proprioception engaged via body tracking. Still no haptic feedback beyond rumble.",
      zh: "~120° 视场角、90Hz+刷新率、<20ms 动作到光子延迟、6自由度头部追踪和手柄控制器。身体追踪激活本体感觉。除震动外仍无触觉反馈。",
    },
  },
  {
    id: "ar",
    label: { en: "AR / Mixed Reality", zh: "AR / 混合现实" },
    presence: 68,
    senses: { vision: true, hearing: true, touch: false, proprioception: true, agency: true },
    interactivity: 80,
    seams: { en: "Virtual anchoring drift, overlay brightness limits, hand occlusion artifacts", zh: "虚拟锚定漂移、叠加亮度限制、手部遮挡伪影" },
    fov: 100,
    color: "#22d3ee",
    speculative: false,
    blurb: {
      en: "Digital and physical space blend. Apple Vision Pro-class hardware achieves spatial anchoring of sub-centimetre accuracy but full display FOV and outdoor brightness remain unsolved.",
      zh: "数字与物理空间融合。Apple Vision Pro级硬件实现亚厘米精度的空间锚定，但完整显示视场角和户外亮度仍未解决。",
    },
  },
  {
    id: "fulldive",
    label: { en: "Full-Dive (speculative)", zh: "全沉浸（推测性）" },
    presence: 99,
    senses: { vision: true, hearing: true, touch: true, proprioception: true, agency: true },
    interactivity: 97,
    seams: { en: "None — no seams remaining; indistinguishable from reality", zh: "无——没有剩余缝隙；与现实无法区分" },
    fov: 360,
    color: "#ff4d9d",
    speculative: true,
    blurb: {
      en: "Direct neural stimulation of all sensory cortices. Analogous to dreaming with full agency. Requires solving brain-computer interface depth, spinal haptics, and vestibular synthesis — none of which are engineered yet.",
      zh: "直接神经刺激所有感觉皮层。类似于拥有完全能动性的梦境。需要解决脑机接口深度、脊髓触觉和前庭感觉合成——目前均未实现工程化。",
    },
  },
];

/* ── FOV visualiser canvas ── */
function FovViz({ fov, color, speculative }: { fov: number; color: string; speculative: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const tRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const CX = W / 2;
    const CY = H * 0.72;
    const R = Math.min(W, H) * 0.72;

    // parse hex to rgb
    function hexRgb(hex: string) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    }
    const { r, g, b } = hexRgb(color);

    function draw(t: number) {
      ctx!.clearRect(0, 0, W, H);

      // background void
      ctx!.fillStyle = "rgba(6,3,15,0.85)";
      ctx!.fillRect(0, 0, W, H);

      // grid lines — subtle
      ctx!.strokeStyle = "rgba(77,155,255,0.07)";
      ctx!.lineWidth = 0.5;
      for (let gx = 0; gx <= W; gx += W / 8) {
        ctx!.beginPath(); ctx!.moveTo(gx, 0); ctx!.lineTo(gx, H); ctx!.stroke();
      }
      for (let gy = 0; gy <= H; gy += H / 6) {
        ctx!.beginPath(); ctx!.moveTo(0, gy); ctx!.lineTo(W, gy); ctx!.stroke();
      }

      const halfRad = (Math.min(fov, 359) / 2) * (Math.PI / 180);
      const clampedFov = Math.min(fov, 359.9);
      const breathe = 1 + Math.sin(t * 1.2) * 0.012;

      // outer reference ring (360° ghost)
      ctx!.beginPath();
      ctx!.arc(CX, CY, R * breathe, -Math.PI, 0);
      ctx!.strokeStyle = "rgba(255,255,255,0.06)";
      ctx!.lineWidth = 1;
      ctx!.stroke();

      if (fov >= 360) {
        // full-dive: complete filled circle with pulsing glow
        const pulseGrad = ctx!.createRadialGradient(CX, CY, 0, CX, CY, R * breathe);
        pulseGrad.addColorStop(0, `rgba(${r},${g},${b},0.55)`);
        pulseGrad.addColorStop(0.55, `rgba(${r},${g},${b},0.22)`);
        pulseGrad.addColorStop(1, `rgba(${r},${g},${b},0.0)`);
        ctx!.beginPath();
        ctx!.arc(CX, CY, R * breathe, 0, Math.PI * 2);
        ctx!.fillStyle = pulseGrad;
        ctx!.fill();

        // outer glow ring
        ctx!.beginPath();
        ctx!.arc(CX, CY, R * breathe, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${r},${g},${b},${0.5 + Math.sin(t * 2.1) * 0.25})`;
        ctx!.lineWidth = 2.5;
        ctx!.stroke();

        // "FULL" label
        ctx!.fillStyle = `rgba(${r},${g},${b},0.8)`;
        ctx!.font = "bold 9px JetBrains Mono, monospace";
        ctx!.textAlign = "center";
        ctx!.fillText("360° FULL-DIVE", CX, CY - R * 0.35);

      } else {
        // angular wedge from viewer's POV
        const leftAngle = -Math.PI / 2 - halfRad;
        const rightAngle = -Math.PI / 2 + halfRad;

        // filled wedge
        const grad = ctx!.createRadialGradient(CX, CY, 0, CX, CY, R * 1.05);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.35)`);
        grad.addColorStop(0.6, `rgba(${r},${g},${b},0.15)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0.0)`);

        ctx!.beginPath();
        ctx!.moveTo(CX, CY);
        ctx!.arc(CX, CY, R * breathe, leftAngle, rightAngle);
        ctx!.closePath();
        ctx!.fillStyle = grad;
        ctx!.fill();

        // wedge edges — bright
        ctx!.beginPath();
        ctx!.moveTo(CX, CY);
        ctx!.arc(CX, CY, R * breathe, leftAngle, rightAngle);
        ctx!.closePath();
        ctx!.strokeStyle = `rgba(${r},${g},${b},0.75)`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        // horizon arc
        ctx!.beginPath();
        ctx!.arc(CX, CY, R * 0.62 * breathe, leftAngle, rightAngle);
        ctx!.strokeStyle = `rgba(${r},${g},${b},0.3)`;
        ctx!.lineWidth = 1;
        ctx!.setLineDash([3, 5]);
        ctx!.stroke();
        ctx!.setLineDash([]);

        // depth rings inside cone
        for (let d = 0.25; d < 0.95; d += 0.25) {
          const alpha = (1 - d) * 0.18;
          ctx!.beginPath();
          ctx!.arc(CX, CY, R * d * breathe, leftAngle, rightAngle);
          ctx!.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx!.lineWidth = 0.8;
          ctx!.stroke();
        }
      }

      // FOV label at bottom
      ctx!.fillStyle = `rgba(${r},${g},${b},0.9)`;
      ctx!.font = "bold 11px JetBrains Mono, monospace";
      ctx!.textAlign = "center";
      ctx!.fillText(fov >= 360 ? "360°" : `${clampedFov}°`, CX, H - 8);

      // viewer dot
      ctx!.beginPath();
      ctx!.arc(CX, CY, 4, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${r},${g},${b},${0.8 + Math.sin(t * 1.8) * 0.2})`;
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(CX, CY, 7, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(${r},${g},${b},0.4)`;
      ctx!.lineWidth = 1;
      ctx!.stroke();
    }

    let prev = 0;
    function step(ts: number) {
      const dt = (ts - prev) / 1000;
      prev = ts;
      tRef.current += dt;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(step);
    }
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [fov, color, speculative]);

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={120}
      className="w-full rounded-xl"
      style={{ maxWidth: 220 }}
    />
  );
}

/* ── Sense badge ── */
const SENSE_DEFS = [
  { key: "vision" as const, en: "Vision", zh: "视觉", icon: "◉" },
  { key: "hearing" as const, en: "Hearing", zh: "听觉", icon: "◎" },
  { key: "touch" as const, en: "Touch", zh: "触觉", icon: "◈" },
  { key: "proprioception" as const, en: "Proprioception", zh: "本体感觉", icon: "⊕" },
  { key: "agency" as const, en: "Agency", zh: "能动性", icon: "⊞" },
];

function SenseBadges({
  senses,
  lang,
  color,
}: {
  senses: ImmersionRung["senses"];
  lang: string;
  color: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SENSE_DEFS.map((s) => {
        const active = senses[s.key];
        return (
          <div
            key={s.key}
            className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] transition-all duration-500"
            style={
              active
                ? {
                    borderColor: color + "99",
                    background: color + "1a",
                    color: color,
                    boxShadow: `0 0 10px -3px ${color}66`,
                  }
                : {
                    borderColor: "rgba(255,255,255,0.07)",
                    background: "transparent",
                    color: "#797399",
                  }
            }
          >
            <span className="text-sm leading-none">{s.icon}</span>
            {L(s.en, s.zh, lang)}
          </div>
        );
      })}
    </div>
  );
}

/* ── Presence / Seams bar ── */
function MetricBar({
  value,
  label,
  labelZh,
  color,
  lang,
}: {
  value: number;
  label: string;
  labelZh: string;
  color: string;
  lang: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-500">
        <span>{L(label, labelZh, lang)}</span>
        <span style={{ color }} className="text-[0.72rem]">
          {value}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-void-700/60">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

function ImmersionLadderLens({ lang }: { lang: string }) {
  const [idx, setIdx] = useState(5); // default: VR headset

  const rung = RUNGS[idx];
  const seamsScore = rung.speculative ? 1 : Math.max(5, 100 - rung.presence);

  return (
    <div className="space-y-6">
      {/* Tab strip */}
      <div className="flex flex-wrap gap-2">
        {RUNGS.map((r, i) => (
          <button
            key={r.id}
            onClick={() => setIdx(i)}
            className="rounded-lg border px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.15em] transition-all duration-300"
            style={
              i === idx
                ? {
                    borderColor: r.color + "99",
                    background: r.color + "1a",
                    color: r.color,
                    boxShadow: `0 0 14px -4px ${r.color}66`,
                  }
                : {
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "#797399",
                  }
            }
          >
            {L(r.label.en, r.label.zh, lang)}
          </button>
        ))}
      </div>

      {/* Slider + track */}
      <div>
        <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-500">
          <span>{L("Shallow", "浅层", lang)}</span>
          <span style={{ color: rung.color }} className="text-[0.75rem]">
            {L(rung.label.en, rung.label.zh, lang)}
            {rung.speculative && (
              <span className="ml-2 rounded border border-plasm-500/50 bg-plasm-500/10 px-1.5 py-0.5 text-[0.55rem] text-plasm-400">
                {L("SPECULATIVE", "推测性", lang)}
              </span>
            )}
          </span>
          <span>{L("Deep", "深层", lang)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={RUNGS.length - 1}
          step={1}
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          className="mt-2 w-full accent-iris-400"
        />
        <div className="relative mt-1 flex h-1.5 w-full gap-0.5">
          {RUNGS.map((r, i) => (
            <div
              key={r.id}
              className="flex-1 rounded-sm transition-all duration-500"
              style={{
                background: i <= idx ? r.color : "rgba(255,255,255,0.07)",
                opacity: i <= idx ? 0.4 + i * 0.08 : 0.12,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main info row */}
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        {/* FOV visualiser */}
        <div className="flex flex-col items-center gap-2">
          <div className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-ink-500">
            {L("Field of View", "视场角", lang)}
          </div>
          <FovViz fov={rung.fov} color={rung.color} speculative={rung.speculative} />
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          <MetricBar value={rung.presence} label="Presence" labelZh="临场感" color={rung.color} lang={lang} />
          <MetricBar
            value={rung.interactivity}
            label="Agency / Interactivity"
            labelZh="能动性 / 互动性"
            color="#22d3ee"
            lang={lang}
          />
          <MetricBar
            value={seamsScore}
            label="Seams remaining"
            labelZh="剩余缝隙"
            color="#ff4d9d"
            lang={lang}
          />
        </div>
      </div>

      {/* Senses engaged */}
      <div className="rounded-xl border border-ink-100/8 bg-void-900/50 p-4">
        <div className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-500">
          {L("Sensory channels engaged", "激活的感觉通道", lang)}
        </div>
        <SenseBadges senses={rung.senses} lang={lang} color={rung.color} />
      </div>

      {/* Seams */}
      <div className="rounded-xl border border-plasm-500/15 bg-void-900/40 p-4">
        <div className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-500">
          {L("Seams — cues reminding you it's not real", "缝隙——提醒你这不是现实的线索", lang)}
        </div>
        <p className="text-sm leading-relaxed text-ink-200">{L(rung.seams.en, rung.seams.zh, lang)}</p>
      </div>

      {/* Blurb */}
      <div className="rounded-xl border border-ink-100/8 bg-void-900/40 p-4">
        <p className="text-sm leading-relaxed text-ink-300">{L(rung.blurb.en, rung.blurb.zh, lang)}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   LENS B — Sensory Budget
   ════════════════════════════════════════════════════════════════════════ */

type SenseEntry = {
  id: string;
  label: { en: string; zh: string };
  icon: string;
  status: "solved" | "partial" | "research";
  vrScore: number; // 0–100 % how convincingly VR fools this sense
  color: string;
  techNumbers: { en: string; zh: string };
  howFooled: { en: string; zh: string };
  challenge: { en: string; zh: string };
};

const SENSES: SenseEntry[] = [
  {
    id: "vision",
    label: { en: "Vision", zh: "视觉" },
    icon: "◉",
    status: "solved",
    vrScore: 85,
    color: "#4d9bff",
    techNumbers: {
      en: "~90 Hz panel, <20 ms motion-to-photon latency, 2.5K/eye (Quest 3), 110° FOV, foveated rendering. Retinal-resolution display (~57 PPD needed) within reach.",
      zh: "~90 Hz 面板、<20 ms 动作到光子延迟、每眼 2.5K 分辨率（Quest 3）、110° 视场角、注视点渲染。视网膜分辨率显示（约需 57 PPD）触手可及。",
    },
    howFooled: {
      en: "High refresh rate eliminates motion judder; correct IPD removes double-vision. Foveated rendering matches peripheral resolution to human acuity falloff.",
      zh: "高刷新率消除运动卡顿；正确瞳距消除重影。注视点渲染将周边分辨率与人眼敏锐度下降相匹配。",
    },
    challenge: {
      en: "Vergence–accommodation conflict (eyes focus at display plane but converge on virtual object depth) causes fatigue. VAC largely unsolved without light-field or varifocal optics.",
      zh: "辐辏-调节冲突（眼睛聚焦在显示屏平面，但辐辏汇聚在虚拟物体深度）导致疲劳。VAC在没有光场或变焦光学的情况下基本未解决。",
    },
  },
  {
    id: "audio",
    label: { en: "Hearing / Spatial Audio", zh: "听觉 / 空间音频" },
    icon: "◎",
    status: "solved",
    vrScore: 88,
    color: "#22d3ee",
    techNumbers: {
      en: "Head-related transfer functions (HRTFs) + room impulse response convolution. Real-time 3D audio at <5 ms latency. Personalized HRTFs improve front/back disambiguation.",
      zh: "头相关传递函数（HRTF）+ 房间脉冲响应卷积。实时 3D 音频延迟 <5 ms。个性化 HRTF 改善前后方位辨别。",
    },
    howFooled: {
      en: "Spatial audio cues (interaural time and level differences, HRTF spectral shaping, room reverberation) closely match the natural acoustic scene.",
      zh: "空间音频线索（双耳时差和声级差、HRTF 频谱整形、房间混响）与自然声学场景高度匹配。",
    },
    challenge: {
      en: "Individualised HRTFs require measurement or personalisation. Dynamic reverb rendering is compute-heavy. Bone conduction and body resonance not yet replicated.",
      zh: "个性化 HRTF 需要测量或个性化处理。动态混响渲染计算密集。骨传导和身体共鸣尚未复制。",
    },
  },
  {
    id: "haptics",
    label: { en: "Touch / Haptics", zh: "触觉 / 触感" },
    icon: "◈",
    status: "partial",
    vrScore: 30,
    color: "#f5c24d",
    techNumbers: {
      en: "Current: eccentric rotating mass (ERM) rumble, LRA actuators in controllers. Research: ultrasonic mid-air haptics (Ultrahaptics), pneumatic gloves, electrotactile arrays.",
      zh: "当前：偏心旋转质量（ERM）震动、控制器中的线性谐振执行器（LRA）。研究阶段：超声波空气触觉（Ultrahaptics）、气动手套、电触觉阵列。",
    },
    howFooled: {
      en: "Rumble vibration creates impact cues and trigger resistance (PS5 DualSense). Thermal feedback and texture simulation remain early-stage.",
      zh: "震动反馈创造冲击线索和扳机阻力（PS5 DualSense）。温度反馈和质感模拟仍处于早期阶段。",
    },
    challenge: {
      en: "The human hand has ~17,000 mechanoreceptors per cm². Replicating fingertip texture, temperature, compliance, and pain is an open engineering problem. Full-body haptic suits exist as prototypes with <50 actuator points.",
      zh: "人手每平方厘米约有 17,000 个机械感受器。复制指尖质感、温度、柔软度和痛觉是开放性工程问题。全身触觉套装作为原型存在，但执行器点数 <50 个。",
    },
  },
  {
    id: "vestibular",
    label: { en: "Balance / Vestibular", zh: "平衡感 / 前庭感觉" },
    icon: "⊛",
    status: "research",
    vrScore: 20,
    color: "#a855f7",
    techNumbers: {
      en: "Galvanic vestibular stimulation (GVS) can induce tilt/roll sensations non-invasively using skin electrodes at the mastoid. Latency ~20–50 ms. Not commercially available in consumer VR.",
      zh: "电流前庭刺激（GVS）可通过乳突皮肤电极非侵入性地诱导倾斜/滚动感觉。延迟约 20–50 ms。消费级 VR 尚不商用。",
    },
    howFooled: {
      en: "Visual-vestibular conflict is the primary cause of VR motion sickness (cybersickness). When visual flow does not match vestibular input, the brain infers toxin ingestion — triggering nausea.",
      zh: "视觉-前庭冲突是 VR 晕动症（网络晕动症）的主要原因。当视觉流与前庭输入不匹配时，大脑推断摄入了毒素——触发恶心感。",
    },
    challenge: {
      en: "GVS cannot replicate translational (linear acceleration) cues well, only rotational. Motion platforms (hexapods, treadmills) add physical movement but are large and expensive. No solution exists at consumer scale.",
      zh: "GVS 无法很好地复制平动（线性加速）线索，只能复制旋转感。运动平台（六自由度平台、跑步机）添加物理运动，但体积大且昂贵。消费级规模尚无解决方案。",
    },
  },
  {
    id: "proprioception",
    label: { en: "Proprioception / Body Sense", zh: "本体感觉 / 身体感知" },
    icon: "⊕",
    status: "partial",
    vrScore: 45,
    color: "#ff8fc4",
    techNumbers: {
      en: "Full-body tracking (Vive trackers, Quest body tracking, optical suit): <5 ms latency in well-lit lab. Avatar embodiment established when visual-motor contingency holds. Rubber hand illusion generalises to full VR body.",
      zh: "全身追踪（Vive追踪器、Quest身体追踪、光学捕捉套装）：良好照明实验室中延迟 <5 ms。视觉运动一致性成立时建立化身具身感。橡皮手幻觉推广至完整 VR 身体。",
    },
    howFooled: {
      en: "Avatar ownership (the 'body illusion') arises when virtual body movement synchronises with physical movement. Subjective body ownership can transfer to non-human avatars.",
      zh: "当虚拟身体运动与物理运动同步时，会产生化身所有权（\"身体幻觉\"）。主观身体所有权可转移至非人类化身。",
    },
    challenge: {
      en: "Muscle spindle feedback (efference copy matching) cannot be faked without haptic sleeves or functional electrical stimulation. Fingers and fine motor proprioception remain largely untracked without data gloves.",
      zh: "肌肉纺锤体反馈（传出副本匹配）在没有触觉袖套或功能性电刺激的情况下无法伪造。手指和精细运动本体感觉在没有数据手套的情况下基本无法追踪。",
    },
  },
];

const STATUS_META = {
  solved: { en: "Largely solved", zh: "基本已解决", color: "#22d3ee" },
  partial: { en: "Partial", zh: "部分解决", color: "#f5c24d" },
  research: { en: "Research / Hard", zh: "研究阶段 / 难题", color: "#ff4d9d" },
};

function SensoryBudgetLens({ lang }: { lang: string }) {
  const [activeId, setActiveId] = useState<string>("vision");
  const sense = SENSES.find((s) => s.id === activeId) ?? SENSES[0];
  const sm = STATUS_META[sense.status];

  return (
    <div className="space-y-6">
      {/* Sense selector */}
      <div className="flex flex-wrap gap-2">
        {SENSES.map((s) => {
          const meta = STATUS_META[s.status];
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] transition-all duration-300"
              style={
                isActive
                  ? {
                      borderColor: s.color + "99",
                      background: s.color + "18",
                      color: s.color,
                      boxShadow: `0 0 16px -5px ${s.color}66`,
                    }
                  : { borderColor: "rgba(255,255,255,0.08)", color: "#797399" }
              }
            >
              <span className="text-base leading-none">{s.icon}</span>
              {L(s.label.en, s.label.zh, lang)}
            </button>
          );
        })}
      </div>

      {/* Overview bar — all senses at a glance */}
      <div className="rounded-xl border border-ink-100/8 bg-void-900/50 p-4">
        <div className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-500">
          {L("VR convincingness per sense", "VR 每个感官的欺骗性", lang)}
        </div>
        <div className="space-y-2.5">
          {SENSES.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <div
                className="w-24 flex-shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.12em] truncate"
                style={{ color: s.id === activeId ? s.color : "#797399" }}
              >
                {L(s.label.en, s.label.zh, lang)}
              </div>
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-void-700/60">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${s.vrScore}%`,
                    background: `linear-gradient(90deg, ${s.color}66, ${s.color})`,
                    boxShadow: s.id === activeId ? `0 0 8px ${s.color}88` : "none",
                  }}
                />
              </div>
              <div
                className="w-8 flex-shrink-0 font-mono text-[0.62rem] text-right"
                style={{ color: STATUS_META[s.status].color }}
              >
                {s.vrScore}%
              </div>
              <div
                className="hidden sm:block w-20 flex-shrink-0 rounded border px-1.5 py-0.5 text-center font-mono text-[0.52rem] uppercase tracking-[0.12em]"
                style={{
                  borderColor: STATUS_META[s.status].color + "55",
                  color: STATUS_META[s.status].color,
                  background: STATUS_META[s.status].color + "12",
                }}
              >
                {L(STATUS_META[s.status].en, STATUS_META[s.status].zh, lang)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed panel */}
      <div
        className="rounded-2xl border p-5 space-y-4 transition-all duration-500"
        style={{
          borderColor: sense.color + "44",
          background: sense.color + "0a",
        }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl">{sense.icon}</span>
          <div>
            <div className="display text-lg" style={{ color: sense.color }}>
              {L(sense.label.en, sense.label.zh, lang)}
            </div>
            <div
              className="mt-0.5 inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.15em]"
              style={{
                borderColor: sm.color + "66",
                background: sm.color + "14",
                color: sm.color,
              }}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full ${sense.status === "solved" ? "pulse" : sense.status === "partial" ? "breathe" : "twinkle"}`}
                style={{ background: sm.color }}
              />
              {L(sm.en, sm.zh, lang)}
            </div>
          </div>
          <div className="ml-auto font-mono text-2xl font-bold" style={{ color: sense.color }}>
            {sense.vrScore}%
          </div>
        </div>

        <div className="h-px opacity-20" style={{ background: sense.color }} />

        {/* Tech numbers */}
        <div>
          <div className="mb-1.5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-500">
            {L("Engineering numbers", "工程参数", lang)}
          </div>
          <p className="text-xs leading-relaxed text-ink-200">
            {L(sense.techNumbers.en, sense.techNumbers.zh, lang)}
          </p>
        </div>

        {/* How fooled */}
        <div>
          <div className="mb-1.5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-500">
            {L("How VR fools this sense", "VR 如何欺骗该感官", lang)}
          </div>
          <p className="text-xs leading-relaxed text-ink-200">
            {L(sense.howFooled.en, sense.howFooled.zh, lang)}
          </p>
        </div>

        {/* Challenge */}
        <div
          className="rounded-xl border p-3"
          style={{ borderColor: "#ff4d9d33", background: "rgba(255,77,157,0.05)" }}
        >
          <div className="mb-1.5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-plasm-400">
            {L("Unsolved challenge", "未解决的挑战", lang)}
          </div>
          <p className="text-xs leading-relaxed text-ink-300">
            {L(sense.challenge.en, sense.challenge.zh, lang)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   LENS C — Fidelity → Indistinguishability
   ════════════════════════════════════════════════════════════════════════ */

type FidelityLevel = {
  id: string;
  label: { en: string; zh: string };
  fidelity: number; // 0–100
  unlocked: {
    label: { en: string; zh: string };
    speculative: boolean;
    note: { en: string; zh: string };
    color: string;
  }[];
  color: string;
  speculative: boolean;
};

const FIDELITY_LEVELS: FidelityLevel[] = [
  {
    id: "f0",
    label: { en: "Early VR (2016 era)", zh: "早期VR（2016年代）" },
    fidelity: 10,
    color: "#4d9bff",
    speculative: false,
    unlocked: [
      {
        label: { en: "Presence in simple environments", zh: "简单环境中的临场感" },
        speculative: false,
        note: {
          en: "Oculus DK2 / HTC Vive: 90 Hz, 110° FOV, basic 6DoF. 'I am here' sense is real even at low visual fidelity.",
          zh: "Oculus DK2 / HTC Vive：90 Hz、110° 视场角、基础 6DoF。即使在低视觉保真度下，\"我在这里\"的感觉也是真实的。",
        },
        color: "#4d9bff",
      },
    ],
  },
  {
    id: "f1",
    label: { en: "Current consumer VR (Quest 3 era)", zh: "当前消费VR（Quest 3 时代）" },
    fidelity: 32,
    color: "#4d9bff",
    speculative: false,
    unlocked: [
      {
        label: { en: "Presence in simple environments", zh: "简单环境中的临场感" },
        speculative: false,
        note: {
          en: "Solid baseline established by 2016-era hardware.",
          zh: "2016年代硬件已建立坚实基线。",
        },
        color: "#4d9bff",
      },
      {
        label: { en: "Convincing spatial audio", zh: "令人信服的空间音频" },
        speculative: false,
        note: {
          en: "HRTF-based spatial audio largely solved. Personalized HRTFs add realism for front/back disambiguation.",
          zh: "基于 HRTF 的空间音频基本已解决。个性化 HRTF 增强前后方位辨别的真实感。",
        },
        color: "#22d3ee",
      },
      {
        label: { en: "Basic hand presence & object manipulation", zh: "基本手部临场感与物体操控" },
        speculative: false,
        note: {
          en: "Quest 3 hand tracking: sub-cm precision, no controllers needed for many tasks. Interactions feel natural for pick/place.",
          zh: "Quest 3 手部追踪：亚厘米精度，许多任务无需控制器。拾取/放置交互感觉自然。",
        },
        color: "#a855f7",
      },
    ],
  },
  {
    id: "f2",
    label: { en: "Near-future (2026–2030 roadmap)", zh: "近期未来（2026–2030 路线图）" },
    fidelity: 55,
    color: "#a855f7",
    speculative: false,
    unlocked: [
      {
        label: { en: "Presence in simple environments", zh: "简单环境中的临场感" },
        speculative: false,
        note: { en: "Already achieved.", zh: "已实现。" },
        color: "#4d9bff",
      },
      {
        label: { en: "Convincing spatial audio", zh: "令人信服的空间音频" },
        speculative: false,
        note: { en: "Already achieved.", zh: "已实现。" },
        color: "#22d3ee",
      },
      {
        label: { en: "Basic hand presence", zh: "基本手部临场感" },
        speculative: false,
        note: { en: "Already achieved.", zh: "已实现。" },
        color: "#a855f7",
      },
      {
        label: { en: "Retinal-resolution display", zh: "视网膜分辨率显示" },
        speculative: false,
        note: {
          en: "~57 PPD target. Micro-OLED panels and pancake optics are approaching this. Eliminates screen-door effect completely.",
          zh: "目标约 57 PPD。微型 OLED 面板和薄饼光学正在接近这一目标。完全消除纱窗效应。",
        },
        color: "#4d9bff",
      },
      {
        label: { en: "Varifocal / light-field optics (VAC resolved)", zh: "变焦 / 光场光学（VAC 已解决）" },
        speculative: false,
        note: {
          en: "Resolves vergence–accommodation conflict. Under active development by Meta Reality Labs, Creal, others. Prototype-stage 2024.",
          zh: "解决辐辏-调节冲突。由 Meta Reality Labs、Creal 等积极开发中。2024年处于原型阶段。",
        },
        color: "#22d3ee",
      },
      {
        label: { en: "Social presence with photorealistic avatars", zh: "具有照片真实感化身的社交临场感" },
        speculative: false,
        note: {
          en: "Codec avatars (Meta) from RGB-D scan + neural rendering approach real faces. Eye contact and micro-expressions are close to natural.",
          zh: "来自 RGB-D 扫描 + 神经渲染的编解码器化身（Meta）接近真实面孔。眼神接触和微表情接近自然。",
        },
        color: "#f5c24d",
      },
    ],
  },
  {
    id: "f3",
    label: { en: "Advanced (2030s hardware)", zh: "先进阶段（2030年代硬件）" },
    fidelity: 72,
    color: "#f5c24d",
    speculative: false,
    unlocked: [
      {
        label: { en: "Presence / spatial audio / hand tracking", zh: "临场感 / 空间音频 / 手部追踪" },
        speculative: false,
        note: { en: "Established.", zh: "已建立。" },
        color: "#4d9bff",
      },
      {
        label: { en: "Retinal resolution + VAC", zh: "视网膜分辨率 + VAC 解决" },
        speculative: false,
        note: { en: "Expected achieved by 2030s hardware.", zh: "预计 2030 年代硬件实现。" },
        color: "#22d3ee",
      },
      {
        label: { en: "Social presence + photorealistic avatars", zh: "社交临场感 + 照片真实感化身" },
        speculative: false,
        note: { en: "Near-future milestone, likely solved 2026–2028.", zh: "近期里程碑，可能 2026–2028 年解决。" },
        color: "#f5c24d",
      },
      {
        label: { en: "Body ownership / avatar embodiment", zh: "身体所有权 / 化身具身感" },
        speculative: false,
        note: {
          en: "Full-body tracking + haptic suit + neural feedback creates Proteus effect: users adopt avatar posture and psychology. Demonstrated in lab studies. Commercialisation within reach.",
          zh: "全身追踪 + 触觉套装 + 神经反馈创造 Proteus 效应：用户采用化身姿势和心理。已在实验室研究中证明。商业化触手可及。",
        },
        color: "#a855f7",
      },
      {
        label: { en: "Convincing haptic texture (localised)", zh: "令人信服的触觉质感（局部）" },
        speculative: false,
        note: {
          en: "Dense actuator arrays (100+ per hand) with ultrasonic or electrotactile stimulation can replicate coarse textures, vibration, and impact — within reach by 2030s.",
          zh: "密集执行器阵列（每只手 100+ 个）通过超声波或电触觉刺激可复制粗糙质感、振动和冲击——2030 年代内可实现。",
        },
        color: "#f5c24d",
      },
    ],
  },
  {
    id: "f4",
    label: { en: "Full-fidelity sensory injection (speculative)", zh: "完全保真感觉注入（推测性）" },
    fidelity: 90,
    color: "#ff4d9d",
    speculative: true,
    unlocked: [
      {
        label: { en: "All 2030s capabilities", zh: "所有 2030 年代能力" },
        speculative: false,
        note: { en: "Foundation established.", zh: "基础已建立。" },
        color: "#f5c24d",
      },
      {
        label: { en: "Full-body haptic fidelity (skin-level)", zh: "全身触觉保真度（皮肤级别）" },
        speculative: true,
        note: {
          en: "SPECULATIVE: Exo-suit with ~17,000 actuator points per hand replicating all mechanoreceptor subtypes. No engineering path exists at this density.",
          zh: "推测性：每只手约 17,000 个执行器点的外骨骼套装，复制所有机械感受器亚型。目前没有在此密度下的工程路径。",
        },
        color: "#ff4d9d",
      },
      {
        label: { en: "Vestibular synthesis without motion platform", zh: "无运动平台的前庭感觉合成" },
        speculative: true,
        note: {
          en: "SPECULATIVE: Closed-loop GVS that convincingly emulates arbitrary acceleration profiles. Requires real-time inner-ear state estimation not yet possible.",
          zh: "推测性：可信地模拟任意加速度曲线的闭环电流前庭刺激。需要目前尚不可能的实时内耳状态估计。",
        },
        color: "#ff4d9d",
      },
      {
        label: { en: "Direct neural sensory injection (BCI-mediated)", zh: "直接神经感觉注入（BCI 介导）" },
        speculative: true,
        note: {
          en: "SPECULATIVE: Stimulating somatosensory and visual cortices directly via high-density implants to generate arbitrary percepts. Analogous to the movie 'The Matrix'. Requires intracortical arrays 10–100× beyond Neuralink N1.",
          zh: "推测性：通过高密度植入物直接刺激体感皮层和视觉皮层，生成任意感知。类似电影《黑客帝国》。需要比 Neuralink N1 高 10–100 倍的皮层内阵列。",
        },
        color: "#ff4d9d",
      },
    ],
  },
  {
    id: "f5",
    label: { en: "Perceptually indistinguishable from reality", zh: "感知上与现实无法区分" },
    fidelity: 100,
    color: "#ff4d9d",
    speculative: true,
    unlocked: [
      {
        label: { en: "All fidelity levels below", zh: "以下所有保真度级别" },
        speculative: false,
        note: { en: "All prior capabilities fully realised.", zh: "所有先前能力完全实现。" },
        color: "#f5c24d",
      },
      {
        label: { en: "Full sensory substitution — no seams remain", zh: "完全感觉替代——没有剩余缝隙" },
        speculative: true,
        note: {
          en: "SPECULATIVE: Every sensory modality (including proprioception, interoception, pain, temperature, smell) indistinguishable from physical reality. The question of whether this state is even detectable becomes philosophical.",
          zh: "推测性：每种感官模态（包括本体感觉、内感受、痛觉、温度、嗅觉）与物理现实无法区分。这种状态是否可被察觉的问题变成哲学问题。",
        },
        color: "#ff4d9d",
      },
      {
        label: { en: "Philosophical: is this reality now?", zh: "哲学层面：这现在就是现实吗？" },
        speculative: true,
        note: {
          en: "At this point the distinction between 'simulated' and 'real' collapses. This is the philosophical horizon of the simulation hypothesis.",
          zh: "在这一点上，\"模拟\"与\"真实\"的区别消失了。这是模拟假说的哲学视界。",
        },
        color: "#ff4d9d",
      },
    ],
  },
];

// Where today's tech sits
const TODAY_FIDELITY_IDX = 1; // Quest 3 era

/* ── Fidelity canvas visualiser ── */
function FidelityViz({ fidelity, color, speculative }: { fidelity: number; color: string; speculative: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const tRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const CX = W / 2;
    const CY = H / 2;

    function hexRgb(hex: string) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    }
    const { r, g, b } = hexRgb(color);

    const NOISE = Array.from({ length: 512 }, (_, i) => {
      const x = Math.sin(i * 91.7 + 217.3) * 43758.5453;
      return (x - Math.floor(x));
    });
    const n = (i: number) => NOISE[((i | 0) % 512 + 512) % 512];

    function draw(t: number) {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "rgba(6,3,15,0.9)";
      ctx!.fillRect(0, 0, W, H);

      const fi = fidelity / 100;
      const breathe = 1 + Math.sin(t * 1.4) * 0.018;

      // draw concentric capability rings
      const rings = 6;
      for (let ri = rings; ri >= 0; ri--) {
        const ringFi = ri / rings;
        const rr = (ri / rings) * CY * 0.88 * breathe;
        const isUnlocked = fi >= ringFi;
        const alpha = isUnlocked ? 0.12 + ringFi * 0.2 : 0.04;

        ctx!.beginPath();
        ctx!.arc(CX, CY, rr, 0, Math.PI * 2);
        ctx!.strokeStyle = isUnlocked
          ? `rgba(${r},${g},${b},${alpha + Math.sin(t * 0.8 + ri) * 0.04})`
          : "rgba(255,255,255,0.05)";
        ctx!.lineWidth = isUnlocked ? 1.2 : 0.6;
        ctx!.stroke();
      }

      // noise static at low fidelity (seams visualization)
      if (fi < 0.95 && !speculative) {
        const noiseAlpha = (1 - fi) * 0.35;
        for (let nx = 0; nx < W; nx += 3) {
          for (let ny = 0; ny < H; ny += 3) {
            const nv = n(nx * 3 + ny + Math.floor(t * 8) * 17);
            if (nv > 0.85) {
              ctx!.fillStyle = `rgba(255,255,255,${nv * noiseAlpha})`;
              ctx!.fillRect(nx, ny, 2, 2);
            }
          }
        }
      }

      // core glow — expands with fidelity
      const coreR = fi * CY * 0.55 * breathe;
      const coreGrad = ctx!.createRadialGradient(CX, CY, 0, CX, CY, coreR);
      coreGrad.addColorStop(0, `rgba(${r},${g},${b},${0.55 * fi + 0.05})`);
      coreGrad.addColorStop(0.5, `rgba(${r},${g},${b},${0.18 * fi})`);
      coreGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx!.beginPath();
      ctx!.arc(CX, CY, coreR, 0, Math.PI * 2);
      ctx!.fillStyle = coreGrad;
      ctx!.fill();

      // grid lines emanating from center
      const spokes = 8;
      for (let si = 0; si < spokes; si++) {
        const angle = (si / spokes) * Math.PI * 2 + t * 0.08;
        const spokeLen = CY * 0.88 * fi * breathe;
        ctx!.beginPath();
        ctx!.moveTo(CX, CY);
        ctx!.lineTo(CX + Math.cos(angle) * spokeLen, CY + Math.sin(angle) * spokeLen);
        ctx!.strokeStyle = `rgba(${r},${g},${b},${0.12 * fi})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
      }

      // speculative shimmer
      if (speculative) {
        const shimmer = Math.abs(Math.sin(t * 2.3));
        ctx!.beginPath();
        ctx!.arc(CX, CY, CY * 0.9 * breathe, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(255,77,157,${shimmer * 0.6})`;
        ctx!.lineWidth = 2;
        ctx!.stroke();
      }

      // fidelity % label
      ctx!.fillStyle = `rgba(${r},${g},${b},0.9)`;
      ctx!.font = "bold 13px JetBrains Mono, monospace";
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText(`${fidelity}%`, CX, CY);
      ctx!.font = "8px JetBrains Mono, monospace";
      ctx!.fillStyle = `rgba(${r},${g},${b},0.55)`;
      ctx!.fillText("FIDELITY", CX, CY + 16);
    }

    let prev = 0;
    function step(ts: number) {
      const dt = (ts - prev) / 1000;
      prev = ts;
      tRef.current += dt;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(step);
    }
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [fidelity, color, speculative]);

  return (
    <canvas
      ref={canvasRef}
      width={140}
      height={140}
      className="rounded-xl flex-shrink-0"
    />
  );
}

function FidelityLens({ lang }: { lang: string }) {
  const [fidIdx, setFidIdx] = useState(TODAY_FIDELITY_IDX);
  const level = FIDELITY_LEVELS[fidIdx];

  return (
    <div className="space-y-6">
      {/* level tabs */}
      <div className="flex flex-wrap gap-2">
        {FIDELITY_LEVELS.map((fl, i) => (
          <button
            key={fl.id}
            onClick={() => setFidIdx(i)}
            className="rounded-lg border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] transition-all duration-300"
            style={
              i === fidIdx
                ? {
                    borderColor: fl.color + "99",
                    background: fl.color + "1a",
                    color: fl.color,
                    boxShadow: `0 0 14px -4px ${fl.color}66`,
                  }
                : { borderColor: "rgba(255,255,255,0.08)", color: "#797399" }
            }
          >
            {L(fl.label.en, fl.label.zh, lang)}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div>
        <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-500">
          <span>{L("Today's headset", "当今头显", lang)}</span>
          <span style={{ color: level.color }} className="text-[0.75rem]">
            {level.fidelity}%
            {level.speculative && (
              <span className="ml-2 rounded border border-plasm-500/50 bg-plasm-500/10 px-1.5 py-0.5 text-[0.55rem] text-plasm-400">
                {L("SPECULATIVE", "推测性", lang)}
              </span>
            )}
          </span>
          <span>{L("Indistinguishable", "无法区分", lang)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={FIDELITY_LEVELS.length - 1}
          step={1}
          value={fidIdx}
          onChange={(e) => setFidIdx(Number(e.target.value))}
          className="mt-2 w-full accent-iris-400"
        />
        {/* colour track */}
        <div className="relative mt-1 flex h-1.5 w-full gap-0.5">
          {FIDELITY_LEVELS.map((fl, i) => (
            <div
              key={fl.id}
              className="flex-1 rounded-sm transition-all duration-500"
              style={{
                background: i <= fidIdx ? fl.color : "rgba(255,255,255,0.07)",
                opacity: i <= fidIdx ? 0.5 + i * 0.07 : 0.12,
              }}
            />
          ))}
        </div>
        {/* today marker */}
        <div className="mt-1 flex font-mono text-[0.54rem] uppercase tracking-[0.1em] text-ink-500">
          {FIDELITY_LEVELS.map((fl, i) => (
            <div key={fl.id} className="flex-1 text-center">
              {i === TODAY_FIDELITY_IDX && (
                <span className="text-flux-400">▲ {L("today", "当今", lang)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* main info row */}
      <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
        <FidelityViz fidelity={level.fidelity} color={level.color} speculative={level.speculative} />

        {/* unlocked capabilities */}
        <div className="space-y-2 min-w-0">
          <div className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-500 mb-3">
            {L("Capabilities at this fidelity", "此保真度下的能力", lang)}
          </div>
          {level.unlocked.map((cap, ci) => (
            <div
              key={ci}
              className="rounded-xl border p-3 transition-all duration-500"
              style={{
                borderColor: cap.color + "44",
                background: cap.color + "0d",
              }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <div
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${cap.speculative ? "breathe" : "pulse"}`}
                  style={{ background: cap.color, boxShadow: `0 0 6px ${cap.color}88` }}
                />
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.14em]" style={{ color: cap.color }}>
                  {L(cap.label.en, cap.label.zh, lang)}
                </div>
                {cap.speculative && (
                  <span className="rounded border border-plasm-500/50 bg-plasm-500/10 px-1.5 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-plasm-400">
                    {L("Speculative", "推测性", lang)}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-ink-300">
                {L(cap.note.en, cap.note.zh, lang)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   LENS METADATA
   ════════════════════════════════════════════════════════════════════════ */

type LensInfo = {
  id: string;
  index: string;
  name: { en: string; zh: string };
  poleA: { en: string; zh: string };
  poleB: { en: string; zh: string };
  intro: { en: string; zh: string };
  accent: string;
};

const IMMERSION_LENSES: LensInfo[] = [
  {
    id: "ladder",
    index: "A",
    name: { en: "Immersion Ladder", zh: "沉浸阶梯" },
    poleA: { en: "Text", zh: "文字" },
    poleB: { en: "Full-Dive", zh: "全沉浸" },
    intro: {
      en: "Eight rungs from the printed word to speculative full-dive neural interface. Each step up adds sensory channels, increases presence, and eliminates seams — the cues that remind you it's not real. The FOV indicator widens, metrics climb, and at Full-Dive the circle closes.",
      zh: "从印刷文字到推测性全沉浸神经接口的八级阶梯。每向上一级，增加感觉通道、提升临场感，并消除\"缝隙\"——提醒你这不是现实的线索。视场角指示器扩大，各项指标攀升，在全沉浸时圆圈闭合。",
    },
    accent: "#a855f7",
  },
  {
    id: "sensory",
    index: "B",
    name: { en: "Sensory Budget", zh: "感官预算" },
    poleA: { en: "Solved", zh: "已解决" },
    poleB: { en: "Unsolved", zh: "未解决" },
    intro: {
      en: "How well can VR fool each sense today? Vision and hearing are largely solved; haptics and vestibular remain hard open problems. See the real engineering numbers — refresh rates, latencies, actuator densities — and why latency mismatch triggers cybersickness.",
      zh: "VR 今天能在多大程度上欺骗每种感官？视觉和听觉基本已解决；触觉和前庭感觉仍是开放性难题。查看真实的工程参数——刷新率、延迟、执行器密度——以及为什么延迟不匹配会触发网络晕动症。",
    },
    accent: "#22d3ee",
  },
  {
    id: "fidelity",
    index: "C",
    name: { en: "Fidelity → Indistinguishability", zh: "保真度 → 无法区分" },
    poleA: { en: "Today", zh: "当今" },
    poleB: { en: "Indistinguishable", zh: "无法区分" },
    intro: {
      en: "From today's Quest 3 to perceptually indistinguishable reality — what capabilities unlock at each fidelity threshold? The blue marker shows where shipping hardware sits. Capabilities marked speculative are clearly beyond current or near-term engineering.",
      zh: "从当今的 Quest 3 到感知上无法区分的现实——在每个保真度阈值上解锁哪些能力？蓝色标记显示现有硬件所处的位置。标记为推测性的能力明显超出当前或近期工程能力。",
    },
    accent: "#f5c24d",
  },
];

/* ════════════════════════════════════════════════════════════════════════
   COMPOSITE — ImmersionDial
   ════════════════════════════════════════════════════════════════════════ */

export default function ImmersionDial() {
  const { lang } = useLang();
  const [activeId, setActiveId] = useState<string>("ladder");
  const lens = IMMERSION_LENSES.find((l) => l.id === activeId) ?? IMMERSION_LENSES[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* ── Lens selector column ── */}
      <div className="space-y-3">
        {IMMERSION_LENSES.map((l) => {
          const isActive = l.id === activeId;
          return (
            <button
              key={l.id}
              onClick={() => setActiveId(l.id)}
              className={`block w-full rounded-xl border p-4 text-left transition-all duration-300 ${
                isActive
                  ? "border-iris-500/60 bg-void-800/60"
                  : "border-ink-100/10 bg-void-900/30 hover:border-iris-500/30"
              }`}
              style={
                isActive
                  ? {
                      borderColor: l.accent + "90",
                      boxShadow: `0 0 28px -12px ${l.accent}55`,
                    }
                  : {}
              }
            >
              <div
                className="font-mono text-[0.58rem] uppercase tracking-[0.3em]"
                style={{ color: l.accent }}
              >
                {L("Lens", "视角", lang)} {l.index}
              </div>
              <div className="display mt-1 text-sm text-ink-50">
                {L(l.name.en, l.name.zh, lang)}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-500">
                <span>{L(l.poleA.en, l.poleA.zh, lang)}</span>
                <span>→</span>
                <span>{L(l.poleB.en, l.poleB.zh, lang)}</span>
              </div>
            </button>
          );
        })}

        {/* micro legend */}
        <div className="rounded-xl border border-ink-100/6 bg-void-950/60 p-3">
          <div className="mb-2 font-mono text-[0.56rem] uppercase tracking-[0.22em] text-ink-500">
            {L("Status legend", "状态图例", lang)}
          </div>
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-2 py-0.5">
              <div
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ background: meta.color, boxShadow: `0 0 5px ${meta.color}88` }}
              />
              <div className="font-mono text-[0.58rem] text-ink-500">
                {L(meta.en, meta.zh, lang)}
              </div>
            </div>
          ))}
          {/* plasm speculative */}
          <div className="flex items-center gap-2 py-0.5 mt-1">
            <div className="rounded border border-plasm-500/50 bg-plasm-500/10 px-1 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-plasm-400">
              S
            </div>
            <div className="font-mono text-[0.58rem] text-ink-500">
              {L("Speculative", "推测性", lang)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Active lens panel ── */}
      <div className="rounded-2xl border border-ink-100/10 bg-void-900/40 p-5 md:p-7">
        <div className="label-mono" style={{ color: lens.accent }}>
          {L(lens.name.en, lens.name.zh, lang)}
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-300">
          {L(lens.intro.en, lens.intro.zh, lang)}
        </p>
        <div className="mt-5 h-px rule-flux opacity-40" />
        <div className="mt-5">
          {activeId === "ladder" && <ImmersionLadderLens lang={lang} />}
          {activeId === "sensory" && <SensoryBudgetLens lang={lang} />}
          {activeId === "fidelity" && <FidelityLens lang={lang} />}
        </div>
      </div>
    </div>
  );
}
