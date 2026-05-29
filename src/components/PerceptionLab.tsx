"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useLang } from "./lang";

/* ─── palette ─── */
const C = {
  flux500: "#4d9bff",
  flux400: "#93c5ff",
  iris500: "#a855f7",
  iris400: "#c98bff",
  holo500: "#22d3ee",
  holo400: "#67e8f9",
  gold500: "#f5c24d",
  gold400: "#ffd97a",
  plasm500: "#ff4d9d",
  plasm400: "#ff8fc4",
  ink50:   "#f6f4ff",
  ink300:  "#b3afd8",
  ink500:  "#797399",
  void950: "#06030f",
  void900: "#0b0620",
  void800: "#120a33",
  void700: "#1a1048",
};

/* ─── bilingual ─── */
const Lf = (en: string, zh: string, lang: "en" | "zh") => lang === "zh" ? zh : en;

/* ─────────────────────────────────────────────────────────────────────────────
   REALITY PIPELINE — SVG diagram showing World → Senses → Brain → Experience
───────────────────────────────────────────────────────────────────────────── */
function RealityPipeline({ lang }: { lang: "en" | "zh" }) {
  const L = (en: string, zh: string) => Lf(en, zh, lang);

  const stages = [
    {
      id: "world",
      color: C.flux500,
      glow: C.flux400,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12 Q7 8 12 12 Q17 16 21 12" />
          <path d="M3 12 Q7 16 12 12 Q17 8 21 12" opacity="0.5" />
          <line x1="12" y1="3" x2="12" y2="21" opacity="0.3" />
        </svg>
      ),
      label: { en: "Physical World", zh: "物理世界" },
      sub: { en: "Electromagnetic & pressure waves", zh: "电磁波与压力波" },
      bandwidth: { en: "~10¹⁴ bits/sec", zh: "~10¹⁴ 比特/秒" },
    },
    {
      id: "senses",
      color: C.gold500,
      glow: C.gold400,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <ellipse cx="12" cy="12" rx="8" ry="5" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.5" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      ),
      label: { en: "Sense Organs", zh: "感觉器官" },
      sub: { en: "Transducer — sparse sampling", zh: "换能器——稀疏采样" },
      bandwidth: { en: "~11 Mbits/sec", zh: "~1100万 比特/秒" },
    },
    {
      id: "brain",
      color: C.iris500,
      glow: C.iris400,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3 C7 3 4 6 4 10 C4 14 6 16 8 17 L8 20 L16 20 L16 17 C18 16 20 14 20 10 C20 6 17 3 12 3Z" />
          <path d="M8 17 L8 12 M12 3 L12 8" opacity="0.4" />
        </svg>
      ),
      label: { en: "Brain Reconstruction", zh: "大脑重建" },
      sub: { en: "Bayesian inference engine", zh: "贝叶斯推断引擎" },
      bandwidth: { en: "~50 bits/sec conscious", zh: "~50比特/秒 意识层" },
    },
    {
      id: "experience",
      color: C.holo500,
      glow: C.holo400,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" />
          <polygon points="12,7 16,9.5 16,14.5 12,17 8,14.5 8,9.5" opacity="0.5" />
          <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.4" />
        </svg>
      ),
      label: { en: "Experienced World", zh: "主观体验世界" },
      sub: { en: "Rich, seamless — constructed", zh: "丰富连贯——却是构建的" },
      bandwidth: { en: "Feels like everything", zh: "感觉无所不包" },
    },
  ];

  const arrows = [
    { pct: "4000×", label: { en: "4000× attenuation", zh: "衰减4000倍" }, color: C.gold500 },
    { pct: "220,000×", label: { en: "220,000× bottleneck", zh: "瓶颈220,000倍" }, color: C.iris500 },
    { pct: "FILL-IN", label: { en: "cortex fills the gaps", zh: "皮层填补空白" }, color: C.holo500 },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* pipeline row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
        {stages.map((s, i) => (
          <div key={s.id} className="flex sm:flex-col flex-row items-center sm:flex-1 gap-2 sm:gap-0">
            {/* stage card */}
            <div
              className="panel rounded-xl p-3 flex flex-col items-center gap-2 text-center sm:w-full flex-1"
              style={{
                borderColor: `${s.color}35`,
                boxShadow: `0 0 28px -12px ${s.color}55`,
                background: `linear-gradient(160deg, ${s.color}10 0%, ${C.void900} 100%)`,
              }}
            >
              <div style={{ color: s.color }}>{s.icon}</div>
              <div
                className={`display text-xs font-bold leading-tight ${lang === "zh" ? "zh" : ""}`}
                style={{ color: s.glow }}
              >
                {s.label[lang]}
              </div>
              <div
                className={`text-[0.6rem] font-mono leading-snug text-center ${lang === "zh" ? "zh" : ""}`}
                style={{ color: `${s.color}99` }}
              >
                {s.sub[lang]}
              </div>
              <div
                className="label-mono text-[0.52rem] px-2 py-0.5 rounded-full"
                style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}
              >
                {s.bandwidth[lang]}
              </div>
            </div>

            {/* arrow (not after last) */}
            {i < stages.length - 1 && (
              <div className="flex flex-col items-center sm:flex-row sm:w-10 shrink-0 gap-0.5 sm:gap-0">
                <div className="flex sm:flex-row flex-col items-center gap-1">
                  <div
                    className={`text-[0.55rem] font-mono text-center leading-none ${lang === "zh" ? "zh" : ""}`}
                    style={{ color: arrows[i].color, maxWidth: lang === "zh" ? 40 : 52, opacity: 0.85 }}
                  >
                    {arrows[i].label[lang]}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0 sm:rotate-0 rotate-90" aria-hidden="true">
                    <path d="M1 7 H10 M7 3 L11 7 L7 11" stroke={arrows[i].color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* punchline */}
      <div
        className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${lang === "zh" ? "zh" : ""}`}
        style={{
          borderColor: `${C.holo500}25`,
          background: `linear-gradient(90deg, ${C.iris500}08, ${C.holo500}08)`,
          color: C.ink300,
          fontFamily: lang === "zh" ? undefined : '"Spectral", serif',
        }}
      >
        {L(
          "The lush, detailed world you experience is not received — it is generated. Your brain predicts what the world should look like and uses the sparse trickle from the senses only to correct that prediction. This is the \"controlled hallucination\" framing advanced by theorists such as Anil Seth — an influential perspective on consciousness, though not the only one.",
          "你所体验的丰富详尽的世界，不是被动接收的——而是被主动生成的。大脑预测世界应该是什么样子，只用感官传来的稀疏信号来校正这个预测。这是由Anil Seth等理论家提出的「受控幻觉」框架——一个对意识的有影响力的视角，尽管并非唯一的解释。",
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DEMO 1 — BLIND SPOT
   A red dot moves across a canvas. When it crosses the user's blind spot position,
   the brain fills it in and it "disappears". Instructions guide the user.
───────────────────────────────────────────────────────────────────────────── */
function BlindSpotDemo({ lang }: { lang: "en" | "zh" }) {
  const L = (en: string, zh: string) => Lf(en, zh, lang);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const loop = (ts: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { rafRef.current = requestAnimationFrame(loop); return; }
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      ctx.clearRect(0, 0, W, H);

      // background
      const bg = ctx.createLinearGradient(0, 0, W, 0);
      bg.addColorStop(0, C.void900);
      bg.addColorStop(1, C.void800);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // subtle horizontal centre line
      ctx.strokeStyle = `${C.iris500}20`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 8]);
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
      ctx.setLineDash([]);

      const cy = H / 2;
      const SPEED = 0.18; // units per second (fraction of W)
      phaseRef.current = (phaseRef.current + SPEED * (1 / 60)) % 1;
      const dotX = phaseRef.current * W;

      // Blind-spot zone: roughly 15.5° temporal from the fixation point.
      // We place fixation cross at 15% from right, dot starts left, enters zone around 60–70% width
      const fixX = W * 0.82;
      const blindCentreX = fixX - W * 0.21; // ~15.5 deg at ~normal screen viewing
      const blindRadius = W * 0.06;

      const distFromBlind = Math.abs(dotX - blindCentreX);
      const inBlind = distFromBlind < blindRadius;
      const alpha = inBlind
        ? Math.max(0, 1 - (1 - distFromBlind / blindRadius) * 3)
        : 1;

      // Draw red dot (fades in blind zone)
      if (alpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = alpha;
        const dg = ctx.createRadialGradient(dotX, cy, 0, dotX, cy, 10);
        dg.addColorStop(0, C.plasm400);
        dg.addColorStop(0.6, C.plasm500);
        dg.addColorStop(1, `${C.plasm500}00`);
        ctx.fillStyle = dg;
        ctx.shadowColor = C.plasm500;
        ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(dotX, cy, 9, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // Blind spot zone indicator (faint ghost ring)
      ctx.save();
      ctx.strokeStyle = `${C.iris500}28`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.arc(blindCentreX, cy, blindRadius, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // "BLIND SPOT" label below zone
      ctx.save();
      ctx.fillStyle = `${C.iris400}60`;
      ctx.font = `6.5px 'JetBrains Mono', monospace`;
      ctx.textAlign = "center";
      ctx.letterSpacing = "0.12em";
      ctx.fillText("BLIND SPOT", blindCentreX, cy + blindRadius + 14);
      ctx.restore();

      // Fixation cross
      ctx.save();
      ctx.strokeStyle = C.holo400;
      ctx.lineWidth = 2;
      ctx.shadowColor = C.holo500;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(fixX - 8, cy); ctx.lineTo(fixX + 8, cy);
      ctx.moveTo(fixX, cy - 8); ctx.lineTo(fixX, cy + 8);
      ctx.stroke();
      ctx.restore();

      // FIXATION label
      ctx.save();
      ctx.fillStyle = `${C.holo400}80`;
      ctx.font = `6.5px 'JetBrains Mono', monospace`;
      ctx.textAlign = "center";
      ctx.fillText("FIXATE", fixX, cy + 20);
      ctx.restore();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative rounded-xl overflow-hidden border border-iris-500/20"
        style={{ background: C.void900, boxShadow: `0 0 40px -16px ${C.iris500}44` }}
      >
        <div style={{ height: 88 }}>
          <canvas ref={canvasRef} className="w-full h-full" aria-label={L("Blind spot demonstration", "盲点演示")} />
        </div>
        {/* instruction overlay */}
        <div className="absolute top-2 left-3">
          <span className={`text-[0.58rem] font-mono ${lang === "zh" ? "zh" : ""}`} style={{ color: `${C.gold400}90` }}>
            {L("Close right eye · stare at + · watch dot vanish", "闭右眼 · 盯住+ · 观察点消失")}
          </span>
        </div>
      </div>
      <div
        className={`text-[0.75rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}
        style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
      >
        {L(
          "Your retina has no photoreceptors where the optic nerve exits — a real hole in your visual field ~5° across. You never see it because the brain seamlessly fills it using surrounding texture and colour, a process called perceptual completion. Nothing is there; your brain invented it.",
          "视网膜上视神经出口处没有感光细胞——这是视野中约5°的真实盲区。你从未察觉，因为大脑利用周围的纹理和颜色无缝填补它，这一过程称为感知补全。那里什么都没有；是大脑凭空创造了它。",
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DEMO 2 — COLOUR IS INVENTED (checker-shadow illusion & simultaneous contrast)
   Two patches, objectively same luminance, appear radically different.
   Interactive: user can drag a "reveal strip" to show they're the same.
───────────────────────────────────────────────────────────────────────────── */

function ColourDemo({ lang }: { lang: "en" | "zh" }) {
  const L = (en: string, zh: string) => Lf(en, zh, lang);
  const [revealed, setRevealed] = useState(false);
  const [stripX, setStripX] = useState(50); // 0–100% across the panel
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // background fill
    ctx.fillStyle = C.void900;
    ctx.fillRect(0, 0, W, H);

    // === Simultaneous contrast illusion ===
    // Two grey squares, same RGB (~128), but one on a dark bg, one on a light bg
    // They look radically different

    const leftCentreX = W * 0.27;
    const rightCentreX = W * 0.73;
    const cy = H * 0.5;
    const squareSize = Math.min(W * 0.14, H * 0.5);
    const bgSize = squareSize * 1.9;

    // Left bg: very dark (makes inner square look lighter)
    ctx.fillStyle = "#080610";
    ctx.fillRect(leftCentreX - bgSize / 2, cy - bgSize / 2, bgSize, bgSize);

    // Right bg: very bright (makes inner square look darker)
    const rightBg = ctx.createRadialGradient(rightCentreX, cy, 0, rightCentreX, cy, bgSize * 0.7);
    rightBg.addColorStop(0, "#ccc8e8");
    rightBg.addColorStop(1, "#9090b8");
    ctx.fillStyle = rightBg;
    ctx.fillRect(rightCentreX - bgSize / 2, cy - bgSize / 2, bgSize, bgSize);

    // Both inner squares — IDENTICAL grey
    const GREY = "#888098";
    // Left inner
    ctx.fillStyle = GREY;
    ctx.fillRect(leftCentreX - squareSize / 2, cy - squareSize / 2, squareSize, squareSize);
    // Right inner
    ctx.fillStyle = GREY;
    ctx.fillRect(rightCentreX - squareSize / 2, cy - squareSize / 2, squareSize, squareSize);

    // Reveal strip (overlay bridge connecting both squares to show same colour)
    if (revealed) {
      const bridgeLeft = leftCentreX - squareSize / 2;
      const bridgeRight = rightCentreX + squareSize / 2;
      const bridgeY = cy - squareSize * 0.18;
      const bridgeH = squareSize * 0.36;
      const revealWidth = ((stripX / 100) * (bridgeRight - bridgeLeft));

      ctx.save();
      ctx.fillStyle = GREY;
      ctx.fillRect(bridgeLeft, bridgeY, revealWidth, bridgeH);
      // edge fade
      const edgeFade = ctx.createLinearGradient(bridgeLeft + revealWidth - 16, 0, bridgeLeft + revealWidth, 0);
      edgeFade.addColorStop(0, GREY);
      edgeFade.addColorStop(1, `${GREY}00`);
      ctx.fillStyle = edgeFade;
      ctx.fillRect(bridgeLeft + revealWidth - 16, bridgeY, 16, bridgeH);
      ctx.restore();
    }

    // Glow borders on inner squares
    ctx.strokeStyle = `${C.iris500}55`;
    ctx.lineWidth = 1;
    ctx.strokeRect(leftCentreX - squareSize / 2, cy - squareSize / 2, squareSize, squareSize);
    ctx.strokeRect(rightCentreX - squareSize / 2, cy - squareSize / 2, squareSize, squareSize);

    // Labels
    ctx.font = `7px 'JetBrains Mono', monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = `${C.holo400}90`;
    ctx.fillText("IDENTICAL", W * 0.5, cy + squareSize / 2 + 16);
    ctx.fillStyle = `${C.ink500}90`;
    ctx.fillText(lang === "zh" ? "\"深\"" : '"darker"', rightCentreX, cy + squareSize / 2 + 28);
    ctx.fillText(lang === "zh" ? "\"浅\"" : '"lighter"', leftCentreX, cy + squareSize / 2 + 28);

  }, [revealed, stripX, lang]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setStripX(Math.max(0, Math.min(100, x)));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative rounded-xl overflow-hidden border border-iris-500/20"
        style={{ background: C.void900, boxShadow: `0 0 40px -16px ${C.iris500}44` }}
      >
        <div style={{ height: 140 }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ cursor: revealed ? "col-resize" : "default" }}
            onPointerDown={() => { isDragging.current = true; setRevealed(true); }}
            onPointerMove={handlePointerMove}
            onPointerUp={() => { isDragging.current = false; }}
            onPointerLeave={() => { isDragging.current = false; }}
            aria-label={L("Simultaneous contrast illusion", "同时对比错觉")}
          />
        </div>
        {/* control strip */}
        <div className="absolute top-2 right-3 flex gap-2 items-center">
          <button
            onClick={() => setRevealed(r => !r)}
            className="px-2.5 py-1 rounded-full font-mono text-[0.58rem] border transition-all"
            style={{
              borderColor: revealed ? `${C.holo500}60` : `${C.iris500}40`,
              color: revealed ? C.holo400 : C.ink500,
              background: revealed ? `${C.holo500}15` : `${C.iris500}10`,
            }}
          >
            {revealed ? L("hide bridge", "隐藏桥接") : L("reveal truth", "揭示真相")}
          </button>
        </div>
        <div className="absolute top-2 left-3">
          <span className={`text-[0.58rem] font-mono ${lang === "zh" ? "zh" : ""}`} style={{ color: `${C.gold400}90` }}>
            {L("Tap 'reveal' — then drag across", "点击「揭示」——再横向拖动")}
          </span>
        </div>
      </div>
      <div
        className={`text-[0.75rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}
        style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
      >
        {L(
          "Both grey squares have identical RGB values. The brain does not measure absolute luminance — it computes relative contrast with surroundings. Colour and brightness are not properties of the world you detect; they are values the brain assigns. This context-dependence is the very mechanism VR exploits.",
          "两个灰色方块的RGB值完全相同。大脑不测量绝对亮度——它计算与周围环境的相对对比度。颜色和亮度并非你检测到的世界属性，而是大脑赋予的值。这种上下文依赖正是VR所利用的核心机制。",
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DEMO 3 — BISTABLE PERCEPT (Necker-cube style wireframe + ambiguous face/vase)
   Click to flip interpretation. The signal is constant; only the brain's parse changes.
───────────────────────────────────────────────────────────────────────────── */

type CubeState = "front-top-left" | "front-top-right";

function BistableDemo({ lang }: { lang: "en" | "zh" }) {
  const L = (en: string, zh: string) => Lf(en, zh, lang);
  const [cubeFlip, setCubeFlip] = useState<CubeState>("front-top-left");
  const [flipCount, setFlipCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = C.void900;
    ctx.fillRect(0, 0, W, H);

    // === Necker Cube (ambiguous wireframe) ===
    const cx = W * 0.35;
    const cy = H * 0.5;
    const s = Math.min(W * 0.13, H * 0.35);
    const off = s * 0.45; // offset for 3D depth

    // Two interpretations of the front face
    // In "front-top-left": left-bottom-front face is in front
    // In "front-top-right": right-top-front face is in front

    const isFTL = cubeFlip === "front-top-left";

    // cube vertices (isometric-ish)
    const v = {
      // front face (bottom-left cube face)
      ftl: [cx - s * 0.5,        cy - s * 0.5],
      ftr: [cx + s * 0.5,        cy - s * 0.5],
      fbr: [cx + s * 0.5,        cy + s * 0.5],
      fbl: [cx - s * 0.5,        cy + s * 0.5],
      // back face offset
      btl: [cx - s * 0.5 + off, cy - s * 0.5 - off],
      btr: [cx + s * 0.5 + off, cy - s * 0.5 - off],
      bbr: [cx + s * 0.5 + off, cy + s * 0.5 - off],
      bbl: [cx - s * 0.5 + off, cy + s * 0.5 - off],
    } as Record<string, [number, number]>;

    const drawLine = (a: [number, number], b: [number, number], col: string, w = 1.5, dash: number[] = []) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = w;
      ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      ctx.setLineDash([]);
    };

    const FRONT = isFTL ? C.holo400 : `${C.holo400}50`;
    const BACK  = isFTL ? `${C.holo400}40` : C.holo400;
    const GLOW_F = isFTL ? C.holo500 : `${C.holo500}30`;
    const GLOW_B = isFTL ? `${C.holo500}30` : C.holo500;

    ctx.shadowColor = GLOW_F;
    ctx.shadowBlur = 8;

    // "front" face (left quad in isFTL)
    drawLine(v.ftl, v.ftr, FRONT, isFTL ? 2 : 1);
    drawLine(v.ftr, v.fbr, FRONT, isFTL ? 2 : 1);
    drawLine(v.fbr, v.fbl, FRONT, isFTL ? 2 : 1);
    drawLine(v.fbl, v.ftl, FRONT, isFTL ? 2 : 1);

    ctx.shadowColor = GLOW_B;
    // "back" face
    drawLine(v.btl, v.btr, BACK, isFTL ? 1 : 2);
    drawLine(v.btr, v.bbr, BACK, isFTL ? 1 : 2);
    drawLine(v.bbr, v.bbl, BACK, isFTL ? 1 : 2);
    drawLine(v.bbl, v.btl, BACK, isFTL ? 1 : 2);

    ctx.shadowBlur = 0;

    // depth connectors
    const depthColor = `${C.iris400}55`;
    drawLine(v.ftl, v.btl, depthColor, 1);
    drawLine(v.ftr, v.btr, depthColor, 1);
    drawLine(v.fbr, v.bbr, depthColor, 1);
    drawLine(v.fbl, v.bbl, depthColor, 1);

    // highlight front face fill
    if (isFTL) {
      ctx.fillStyle = `${C.holo500}10`;
      ctx.beginPath();
      ctx.moveTo(v.ftl[0], v.ftl[1]);
      ctx.lineTo(v.ftr[0], v.ftr[1]);
      ctx.lineTo(v.fbr[0], v.fbr[1]);
      ctx.lineTo(v.fbl[0], v.fbl[1]);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.fillStyle = `${C.holo500}10`;
      ctx.beginPath();
      ctx.moveTo(v.btl[0], v.btl[1]);
      ctx.lineTo(v.btr[0], v.btr[1]);
      ctx.lineTo(v.bbr[0], v.bbr[1]);
      ctx.lineTo(v.bbl[0], v.bbl[1]);
      ctx.closePath(); ctx.fill();
    }

    // Interpretation label under cube
    ctx.save();
    ctx.font = `7px 'JetBrains Mono', monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = `${C.holo400}80`;
    ctx.fillText(
      isFTL
        ? (lang === "zh" ? "底面在前" : "bottom face forward")
        : (lang === "zh" ? "顶面在前" : "top face forward"),
      cx,
      cy + s * 0.5 + off + 14,
    );
    ctx.restore();

    // === Face / Vase (Rubin's vase, SVG-style drawn via canvas) ===
    const vc = W * 0.72;  // vase centre x
    const vcy = H * 0.5;
    const vw = Math.min(W * 0.13, 44);
    const vh = Math.min(H * 0.7, 78);

    // Rubin's vase profile: outer silhouette
    ctx.save();
    const leftProfile = new Path2D();
    leftProfile.moveTo(vc - vw * 0.2, vcy - vh * 0.5);
    leftProfile.bezierCurveTo(
      vc - vw * 1.0, vcy - vh * 0.3,
      vc - vw * 1.1, vcy - vh * 0.05,
      vc - vw * 0.45, vcy,
    );
    leftProfile.bezierCurveTo(
      vc - vw * 1.1, vcy + vh * 0.05,
      vc - vw * 1.0, vcy + vh * 0.3,
      vc - vw * 0.2, vcy + vh * 0.5,
    );

    const rightProfile = new Path2D();
    rightProfile.moveTo(vc + vw * 0.2, vcy - vh * 0.5);
    rightProfile.bezierCurveTo(
      vc + vw * 1.0, vcy - vh * 0.3,
      vc + vw * 1.1, vcy - vh * 0.05,
      vc + vw * 0.45, vcy,
    );
    rightProfile.bezierCurveTo(
      vc + vw * 1.1, vcy + vh * 0.05,
      vc + vw * 1.0, vcy + vh * 0.3,
      vc + vw * 0.2, vcy + vh * 0.5,
    );

    // vase fill
    const vasePath = new Path2D();
    vasePath.moveTo(vc - vw * 0.2, vcy - vh * 0.5);
    vasePath.bezierCurveTo(vc - vw * 1.0, vcy - vh * 0.3, vc - vw * 1.1, vcy - vh * 0.05, vc - vw * 0.45, vcy);
    vasePath.bezierCurveTo(vc - vw * 1.1, vcy + vh * 0.05, vc - vw * 1.0, vcy + vh * 0.3, vc - vw * 0.2, vcy + vh * 0.5);
    vasePath.lineTo(vc + vw * 0.2, vcy + vh * 0.5);
    vasePath.bezierCurveTo(vc + vw * 1.0, vcy + vh * 0.3, vc + vw * 1.1, vcy + vh * 0.05, vc + vw * 0.45, vcy);
    vasePath.bezierCurveTo(vc + vw * 1.1, vcy - vh * 0.05, vc + vw * 1.0, vcy - vh * 0.3, vc + vw * 0.2, vcy - vh * 0.5);
    vasePath.closePath();

    // top/bottom caps
    ctx.fillStyle = isFTL ? `${C.iris500}28` : `${C.gold500}28`;
    ctx.fill(vasePath);
    ctx.strokeStyle = isFTL ? `${C.iris400}80` : `${C.gold400}80`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = isFTL ? C.iris500 : C.gold500;
    ctx.shadowBlur = 8;
    ctx.stroke(vasePath);
    ctx.shadowBlur = 0;

    // Interpretation label under vase
    ctx.font = `7px 'JetBrains Mono', monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = `${isFTL ? C.iris400 : C.gold400}80`;
    ctx.fillText(
      isFTL
        ? (lang === "zh" ? "看到: 花瓶" : "seeing: vase")
        : (lang === "zh" ? "看到: 两张脸" : "seeing: two faces"),
      vc,
      vcy + vh * 0.5 + 14,
    );

    // Two face silhouettes when isFTL=false
    if (!isFTL) {
      ctx.save();
      ctx.fillStyle = `${C.gold500}22`;
      ctx.beginPath();
      ctx.moveTo(vc - vw * 0.2, vcy - vh * 0.5);
      ctx.bezierCurveTo(vc - vw * 1.0, vcy - vh * 0.3, vc - vw * 1.1, vcy - vh * 0.05, vc - vw * 0.45, vcy);
      ctx.bezierCurveTo(vc - vw * 1.1, vcy + vh * 0.05, vc - vw * 1.0, vcy + vh * 0.3, vc - vw * 0.2, vcy + vh * 0.5);
      ctx.lineTo(vc - vw * 0.2, vcy - vh * 0.5);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // divider between cube and vase
    ctx.save();
    ctx.strokeStyle = `${C.iris500}20`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 6]);
    ctx.beginPath(); ctx.moveTo(W * 0.53, H * 0.08); ctx.lineTo(W * 0.53, H * 0.92); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // flip count indicator
    if (flipCount > 0) {
      ctx.save();
      ctx.font = `7px 'JetBrains Mono', monospace`;
      ctx.textAlign = "right";
      ctx.fillStyle = `${C.iris400}70`;
      ctx.fillText(`×${flipCount} ${lang === "zh" ? "翻转" : "flips"}`, W - 10, H - 8);
      ctx.restore();
    }

  }, [cubeFlip, flipCount, lang]);

  const handleFlip = useCallback(() => {
    setCubeFlip(f => f === "front-top-left" ? "front-top-right" : "front-top-left");
    setFlipCount(n => n + 1);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative rounded-xl overflow-hidden border border-holo-500/20"
        style={{ background: C.void900, boxShadow: `0 0 40px -16px ${C.holo500}44` }}
      >
        <div style={{ height: 160 }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer"
            onClick={handleFlip}
            aria-label={L("Bistable percept — click to flip", "双稳态感知——点击翻转")}
          />
        </div>
        <div className="absolute top-2 left-3">
          <span className={`text-[0.58rem] font-mono ${lang === "zh" ? "zh" : ""}`} style={{ color: `${C.gold400}90` }}>
            {L("Click anywhere to flip interpretation", "点击任意位置翻转解读")}
          </span>
        </div>
        {/* flip button */}
        <div className="absolute bottom-2 right-3">
          <button
            onClick={handleFlip}
            className="px-3 py-1 rounded-full font-mono text-[0.6rem] border transition-all hover:shadow-lg"
            style={{
              borderColor: `${C.holo500}50`,
              color: C.holo400,
              background: `${C.holo500}10`,
            }}
          >
            {L("flip ↺", "翻转 ↺")}
          </button>
        </div>
      </div>
      <div
        className={`text-[0.75rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}
        style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
      >
        {L(
          "The retinal image is fixed — zero photons change. Yet your percept flips between two incompatible 3D interpretations (and the vase/faces). Perception is not a passive readout; it is the brain's active best-guess, a hypothesis about the world's structure. When evidence is ambiguous, the hypothesis cycles.",
          "视网膜图像固定不变——没有任何光子改变。然而你的感知在两种不相容的三维解读之间翻转（以及花瓶/人脸）。感知不是被动读取，而是大脑对世界结构的主动最优猜测——一个假设。当证据模糊时，假设循环切换。",
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   VR BRIDGE — closing framing: the controlled-hallucination → VR premise
───────────────────────────────────────────────────────────────────────────── */
function VRBridge({ lang }: { lang: "en" | "zh" }) {
  const L = (en: string, zh: string) => Lf(en, zh, lang);

  const points = [
    {
      icon: "◈",
      color: C.plasm500,
      head: { en: "Every perception is already a simulation", zh: "每一次感知都已是一种模拟" },
      body: {
        en: "The brain never experiences the physical world directly. It experiences a generative model of that world, continuously updated by sensory prediction-error signals.",
        zh: "大脑从未直接体验物理世界。它体验的是对那个世界的生成模型，由感觉预测误差信号持续更新。",
      },
    },
    {
      icon: "◉",
      color: C.holo500,
      head: { en: "VR substitutes the update signal", zh: "VR替换了更新信号" },
      body: {
        en: "A VR headset re-routes the prediction-error channel: instead of light reflected off real objects, it feeds synthetic patterns crafted to match what the brain expects. If the signal is coherent enough, the brain's model updates as if the virtual world were real.",
        zh: "VR头显重路由了预测误差通道：它不再输入真实物体反射的光，而是输入精心设计、符合大脑预期的合成图案。如果信号足够连贯，大脑模型就会像虚拟世界是真实的一样更新。",
      },
    },
    {
      icon: "◇",
      color: C.iris500,
      head: { en: "The limit is signal fidelity, not metaphysics", zh: "限制是信号保真度，而非形而上学" },
      body: {
        en: "There is no philosophical barrier to a sufficiently complete synthetic signal producing an indistinguishable experience. The engineering challenge is closing the loop on all the senses with enough precision — latency, resolution, proprioception, vestibular coherence.",
        zh: "在哲学上，没有任何障碍阻止足够完整的合成信号产生无法区分的体验。工程挑战是以足够的精度封闭所有感官的反馈回路——延迟、分辨率、本体感觉、前庭一致性。",
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {points.map((p, i) => (
        <div
          key={i}
          className="panel rounded-xl p-4 flex gap-3"
          style={{ borderColor: `${p.color}25`, boxShadow: `0 0 30px -16px ${p.color}40` }}
        >
          <div
            className="shrink-0 text-base w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ color: p.color, background: `${p.color}15`, border: `1px solid ${p.color}30` }}
          >
            {p.icon}
          </div>
          <div className="flex flex-col gap-1">
            <div
              className={`display text-[0.82rem] font-bold ${lang === "zh" ? "zh" : ""}`}
              style={{ color: p.color }}
            >
              {p.head[lang]}
            </div>
            <p
              className={`text-[0.74rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}
              style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
            >
              {p.body[lang]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────────────────── */
export default function PerceptionLab() {
  const { lang } = useLang();
  const L = (en: string, zh: string) => Lf(en, zh, lang);

  const [activeDemo, setActiveDemo] = useState<0 | 1 | 2>(0);

  const demos = [
    { id: 0, label: { en: "Blind Spot", zh: "盲点" }, color: C.plasm500 },
    { id: 1, label: { en: "Colour & Context", zh: "颜色与上下文" }, color: C.iris500 },
    { id: 2, label: { en: "Bistable Percept", zh: "双稳态感知" }, color: C.holo500 },
  ] as const;

  return (
    <div className="w-full flex flex-col gap-8">

      {/* ── section header ── */}
      <div className="flex flex-col gap-3">
        <div className="label-mono" style={{ color: C.flux400 }}>
          {L("System 01 · What Is Reality?", "系统01 · 现实是什么？")}
        </div>
        <h2
          className={`display text-3xl md:text-4xl leading-tight spark-text ${lang === "zh" ? "zh" : ""}`}
        >
          {L("The Perception Lab", "感知实验室")}
        </h2>
        <p
          className={`text-sm leading-relaxed max-w-2xl ${lang === "zh" ? "zh" : ""}`}
          style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
        >
          {L(
            "Reality as you experience it is a rendered model, not a direct feed. Your brain receives a thin trickle of sparse signals and reconstructs a rich, seamless world from them — filling gaps, inferring colours, guessing depth. This is the foundation on which virtual reality stands.",
            "你所体验的现实是一个渲染的模型，而非直接输入。大脑接收稀薄稀疏的信号，从中重建出丰富连贯的世界——填补空白、推断颜色、猜测深度。这正是虚拟现实赖以成立的基础。",
          )}
        </p>
      </div>

      <div className="h-px rule-flux opacity-40 rounded-full" />

      {/* ── PART 1: Reality Pipeline ── */}
      <div className="flex flex-col gap-4">
        <div className="label-mono" style={{ color: C.flux500 }}>
          {L("Part 1 · The Reality Pipeline", "第一部分 · 现实流水线")}
        </div>
        <RealityPipeline lang={lang} />
      </div>

      <div className="h-px rule-flux opacity-25 rounded-full" />

      {/* ── PART 2: Interactive Demonstrations ── */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="label-mono" style={{ color: C.iris500 }}>
            {L("Part 2 · Perception Demonstrations", "第二部分 · 感知演示")}
          </div>
          {/* demo tab switcher */}
          <div className="flex gap-1 flex-wrap">
            {demos.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDemo(d.id)}
                className={`px-3 py-1.5 rounded-full font-mono text-[0.62rem] border transition-all ${lang === "zh" ? "zh" : ""}`}
                style={{
                  borderColor: activeDemo === d.id ? `${d.color}70` : `${d.color}25`,
                  color: activeDemo === d.id ? d.color : C.ink500,
                  background: activeDemo === d.id ? `${d.color}18` : "transparent",
                  boxShadow: activeDemo === d.id ? `0 0 14px -4px ${d.color}60` : "none",
                }}
              >
                {d.label[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* demo panels */}
        <div>
          {activeDemo === 0 && (
            <div className="flex flex-col gap-3">
              <div className="panel panel-plasm rounded-xl p-4 flex gap-3">
                <div className="shrink-0 label-mono text-[0.62rem] w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${C.plasm500}18`, color: C.plasm400, border: `1px solid ${C.plasm500}35` }}>
                  01
                </div>
                <div>
                  <div className={`display text-sm font-bold mb-1 ${lang === "zh" ? "zh" : ""}`} style={{ color: C.plasm400 }}>
                    {L("The Blind Spot — perceptual completion", "盲点——感知补全")}
                  </div>
                  <p className={`text-[0.73rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink500 }}>
                    {L(
                      "The retina has a region with no photoreceptors. The brain fills the gap so seamlessly you never notice.",
                      "视网膜有一片没有感光细胞的区域。大脑如此无缝地填补这一空白，以至于你从未注意到。",
                    )}
                  </p>
                </div>
              </div>
              <BlindSpotDemo lang={lang} />
            </div>
          )}

          {activeDemo === 1 && (
            <div className="flex flex-col gap-3">
              <div className="panel panel-iris rounded-xl p-4 flex gap-3">
                <div className="shrink-0 label-mono text-[0.62rem] w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${C.iris500}18`, color: C.iris400, border: `1px solid ${C.iris500}35` }}>
                  02
                </div>
                <div>
                  <div className={`display text-sm font-bold mb-1 ${lang === "zh" ? "zh" : ""}`} style={{ color: C.iris400 }}>
                    {L("Colour is Invented — simultaneous contrast", "颜色是发明的——同时对比")}
                  </div>
                  <p className={`text-[0.73rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink500 }}>
                    {L(
                      "Two identical grey patches look completely different depending on their surroundings.",
                      "两个完全相同的灰色区域，因周围环境不同而看起来截然不同。",
                    )}
                  </p>
                </div>
              </div>
              <ColourDemo lang={lang} />
            </div>
          )}

          {activeDemo === 2 && (
            <div className="flex flex-col gap-3">
              <div className="panel panel-holo rounded-xl p-4 flex gap-3">
                <div className="shrink-0 label-mono text-[0.62rem] w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${C.holo500}18`, color: C.holo400, border: `1px solid ${C.holo500}35` }}>
                  03
                </div>
                <div>
                  <div className={`display text-sm font-bold mb-1 ${lang === "zh" ? "zh" : ""}`} style={{ color: C.holo400 }}>
                    {L("Bistable Percept — the brain's best guess", "双稳态感知——大脑的最优猜测")}
                  </div>
                  <p className={`text-[0.73rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink500 }}>
                    {L(
                      "The same image supports two equally valid 3D interpretations. The brain cycles between them.",
                      "同一幅图像支持两种同样有效的三维解读。大脑在它们之间循环切换。",
                    )}
                  </p>
                </div>
              </div>
              <BistableDemo lang={lang} />
            </div>
          )}
        </div>
      </div>

      <div className="h-px rule-flux opacity-25 rounded-full" />

      {/* ── PART 3: Controlled Hallucination → VR ── */}
      <div className="flex flex-col gap-5">
        <div className="label-mono" style={{ color: C.holo500 }}>
          {L("Part 3 · The Controlled Hallucination Thesis & VR", "第三部分 · 受控幻觉论题与虚拟现实")}
        </div>

        {/* thesis quote panel */}
        <div
          className="rounded-2xl border px-6 py-5 relative overflow-hidden"
          style={{
            borderColor: `${C.iris500}30`,
            background: `linear-gradient(135deg, ${C.iris500}08 0%, ${C.void900} 60%, ${C.holo500}05 100%)`,
          }}
        >
          {/* decorative quote mark */}
          <div
            className="absolute top-3 left-4 text-5xl font-serif leading-none select-none"
            style={{ color: `${C.iris500}18` }}
            aria-hidden="true"
          >
            "
          </div>
          <blockquote
            className={`relative z-10 text-base leading-relaxed italic ${lang === "zh" ? "zh" : ""}`}
            style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif', paddingLeft: "1.5rem" }}
          >
            {L(
              "Conscious experience is a controlled hallucination — a prediction about the causes of sensory signals, continuously updated by the senses. When the predictions and the signals agree, we call it perceiving. When they don't, we call it hallucination.",
              "有意识的体验是一种受控幻觉——对感觉信号成因的预测，被感官持续校正。当预测与信号一致时，我们称之为感知。当它们不一致时，我们称之为幻觉。",
            )}
          </blockquote>
          <cite
            className={`relative z-10 block mt-3 text-[0.7rem] font-mono not-italic pl-6 ${lang === "zh" ? "zh" : ""}`}
            style={{ color: `${C.iris400}80` }}
          >
            {L(
              "— Anil Seth, 'Being You' (2021) · an influential interpretation, actively debated in philosophy of mind",
              "— Anil Seth，《成为你》（2021）· 一种有影响力的诠释，在心灵哲学界仍在积极讨论中",
            )}
          </cite>
        </div>

        <VRBridge lang={lang} />
      </div>

      {/* ── closing observation ── */}
      <div
        className={`rounded-xl border px-5 py-4 text-sm leading-relaxed ${lang === "zh" ? "zh" : ""}`}
        style={{
          borderColor: `${C.flux500}15`,
          background: `${C.flux500}04`,
          color: C.ink500,
          fontFamily: lang === "zh" ? undefined : '"Spectral", serif',
        }}
      >
        {L(
          "You have never touched the world. You have touched your brain's model of the world. Virtual reality is not a trick played on the senses — it is the normal condition of conscious experience, pointed in a new direction.",
          "你从未触摸过这个世界。你触摸的，是你大脑对这个世界的模型。虚拟现实不是对感官的欺骗——而是有意识体验的正常状态，只是被指向了一个新方向。",
        )}
      </div>
    </div>
  );
}
