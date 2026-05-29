"use client";

import { useEffect, useRef, useState } from "react";
import { useLang, T } from "./lang";

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR LAB
   System 06 · Digital Identity, Avatars & Selfhood

   The body you choose in VR is not neutral. The "Proteus effect" (Yee &
   Bailenson, 2007) documents that avatar appearance causally shapes the
   wearer's own behaviour — taller avatars negotiate more assertively, more
   attractive avatars close interpersonal distance and self-disclose more,
   older avatars prompt greater retirement savings.

   Two interactive views:
   A. AVATAR CONFIGURATOR — five trait sliders (height, attractiveness/
      confidence, age, species abstractness, formality). The canvas renders a
      stylised holographic figure that visibly morphs with each slider. A
      Proteus panel shows research-grounded predicted behavioural tendencies.

   B. MULTIPLE SELVES — a single person projecting several simultaneous
      avatar identities into different virtual worlds, each with its own
      relationship graph and reputation ring.

   Closes with the open philosophical question: is the avatar a costume or
   an extension of self? Does the felt boundary of "me" migrate to include
   the rendered body?
   ══════════════════════════════════════════════════════════════════════════ */

// ── palette ───────────────────────────────────────────────────────────────
const C = {
  void950: "#06030f",
  void900: "#0b0620",
  void800: "#120a33",
  void700: "#1a1048",
  flux:    "#4d9bff",   // flux-500
  flux4:   "#93c5ff",   // flux-400
  iris:    "#a855f7",   // iris-500  (identity / self)
  iris4:   "#c98bff",   // iris-400
  holo:    "#22d3ee",   // holo-500 (avatar)
  holo4:   "#67e8f9",   // holo-400
  gold:    "#f5c24d",   // gold-500
  gold4:   "#ffd97a",   // gold-400
  plasm:   "#ff4d9d",   // plasm-500 (behavioural effect highlight)
  plasm4:  "#ff8fc4",   // plasm-400
  ink50:   "#f6f4ff",
  ink300:  "#b3afd8",
  ink500:  "#797399",
};

// ── slider config ─────────────────────────────────────────────────────────
interface SliderCfg {
  key:   keyof AvatarTraits;
  label: { en: string; zh: string };
  lo:    { en: string; zh: string };
  hi:    { en: string; zh: string };
  color: string;
}

const SLIDERS: SliderCfg[] = [
  {
    key:   "height",
    label: { en: "Stature", zh: "身形高度" },
    lo:    { en: "Shorter", zh: "矮小" },
    hi:    { en: "Taller",  zh: "高大" },
    color: C.holo,
  },
  {
    key:   "confidence",
    label: { en: "Attractiveness / Confidence", zh: "吸引力 / 自信度" },
    lo:    { en: "Plain",       zh: "朴素" },
    hi:    { en: "Idealised",   zh: "理想化" },
    color: C.iris4,
  },
  {
    key:   "age",
    label: { en: "Apparent Age", zh: "外观年龄" },
    lo:    { en: "Younger", zh: "年轻" },
    hi:    { en: "Older",   zh: "年长" },
    color: C.gold,
  },
  {
    key:   "abstraction",
    label: { en: "Species / Abstraction", zh: "物种 / 抽象度" },
    lo:    { en: "Human",    zh: "人形" },
    hi:    { en: "Abstract", zh: "抽象体" },
    color: C.plasm4,
  },
  {
    key:   "formality",
    label: { en: "Formality", zh: "正式程度" },
    lo:    { en: "Casual",  zh: "休闲" },
    hi:    { en: "Formal",  zh: "正式" },
    color: C.flux4,
  },
];

// ── avatar traits state ───────────────────────────────────────────────────
interface AvatarTraits {
  height:      number; // 0..100
  confidence:  number; // 0..100
  age:         number; // 0..100
  abstraction: number; // 0..100
  formality:   number; // 0..100
}

const DEFAULT_TRAITS: AvatarTraits = {
  height:      50,
  confidence:  50,
  age:         35,
  abstraction: 10,
  formality:   50,
};

// ── Proteus effect entries ────────────────────────────────────────────────
interface ProteusEntry {
  trait: keyof AvatarTraits;
  threshold: number; // trigger when trait > this
  direction: "above" | "below";
  title:  { en: string; zh: string };
  effect: { en: string; zh: string };
  cite:   string;
  color:  string;
}

const PROTEUS_EFFECTS: ProteusEntry[] = [
  {
    trait: "height", threshold: 62, direction: "above",
    title:  { en: "Assertive Negotiation", zh: "强势谈判倾向" },
    effect: {
      en: "Taller avatars elicit more assertive negotiation behaviour — wearers claim larger shares in economic bargaining tasks (Yee & Bailenson, 2007).",
      zh: "高大化身引发更强势的谈判行为——穿戴者在经济讨价还价任务中会争取更大份额（Yee & Bailenson，2007）。",
    },
    cite: "Yee & Bailenson (2007)",
    color: C.holo,
  },
  {
    trait: "confidence", threshold: 62, direction: "above",
    title:  { en: "Closer Interpersonal Distance & Self-Disclosure", zh: "更近的社交距离与自我披露" },
    effect: {
      en: "More attractive avatars lead wearers to approach others more closely and to disclose more personal information — in both VR and subsequent face-to-face interactions (Yee & Bailenson, 2007).",
      zh: "更具吸引力的化身使穿戴者更靠近他人，并在VR及后续面对面互动中披露更多个人信息（Yee & Bailenson，2007）。",
    },
    cite: "Yee & Bailenson (2007)",
    color: C.iris4,
  },
  {
    trait: "age", threshold: 65, direction: "above",
    title:  { en: "Future-Self Identification", zh: "与未来自我的认同" },
    effect: {
      en: "Embodying an aged avatar of oneself increases willingness to save for retirement — the older avatar makes the future self psychologically present (Hershfield et al., 2011).",
      zh: "以年老化身体验自身，会增加为退休储蓄的意愿——年长化身使未来的自我在心理上变得真实（Hershfield et al.，2011）。",
    },
    cite: "Hershfield et al. (2011)",
    color: C.gold,
  },
  {
    trait: "abstraction", threshold: 55, direction: "above",
    title:  { en: "Loosened Self-Concept", zh: "自我概念的松动" },
    effect: {
      en: "Non-humanoid or highly abstract avatars weaken the tight coupling between avatar behaviour and real-world self-concept — enabling more experimental, uninhibited action.",
      zh: "非人形或高度抽象的化身会削弱化身行为与现实自我概念之间的紧密联系，从而促成更具探索性和无拘束的行为。",
    },
    cite: "Morie et al. (2009)",
    color: C.plasm4,
  },
  {
    trait: "formality", threshold: 65, direction: "above",
    title:  { en: "Task Performance & Compliance", zh: "任务表现与服从度" },
    effect: {
      en: "Formal avatar attire correlates with improved task performance and greater compliance with rules — appearance primes the social role, and the self adjusts to match.",
      zh: "正式的化身服装与更好的任务表现及更强的规则遵从性相关——外观激活了社会角色，自我随之调整以匹配。",
    },
    cite: "Peña et al. (2009)",
    color: C.flux4,
  },
  {
    trait: "height", threshold: 38, direction: "below",
    title:  { en: "Reduced Negotiation Power", zh: "谈判能力降低" },
    effect: {
      en: "Shorter avatars show reduced assertiveness — wearers accept less favourable outcomes in bargaining without conscious awareness of the cause (Yee & Bailenson, 2007).",
      zh: "矮小化身表现出更低的主张性——穿戴者在谈判中接受更不利的结果，而未意识到原因所在（Yee & Bailenson，2007）。",
    },
    cite: "Yee & Bailenson (2007)",
    color: C.holo,
  },
];

// ── multiple selves data ──────────────────────────────────────────────────
interface IdentityWorld {
  id: number;
  name: { en: string; zh: string };
  role: { en: string; zh: string };
  color: string;
  angle: number;  // radians, deterministic
  reputation: number; // 0..1
  relations: number;  // count
  avatarHue: number;  // degrees for HSL sketch
}

const WORLDS: IdentityWorld[] = [
  { id: 0, name: { en: "Work Metaverse", zh: "职场元宇宙" },   role: { en: "Senior Analyst",   zh: "高级分析师"     }, color: C.flux,  angle: 0,                   reputation: 0.88, relations: 12, avatarHue: 200 },
  { id: 1, name: { en: "Social Hub",     zh: "社交空间"   },   role: { en: "Creator & Friend", zh: "创作者与朋友"   }, color: C.iris4, angle: (Math.PI * 2) / 5,   reputation: 0.72, relations: 47, avatarHue: 280 },
  { id: 2, name: { en: "Gaming Realm",   zh: "游戏世界"   },   role: { en: "Guild Master",     zh: "公会领袖"       }, color: C.plasm4,angle: (Math.PI * 4) / 5,   reputation: 0.95, relations: 8,  avatarHue: 330 },
  { id: 3, name: { en: "Art Space",      zh: "艺术空间"   },   role: { en: "Anonymous Artist", zh: "匿名艺术家"     }, color: C.gold,  angle: (Math.PI * 6) / 5,   reputation: 0.61, relations: 5,  avatarHue: 40  },
  { id: 4, name: { en: "Research Grid",  zh: "研究网格"   },   role: { en: "Peer Reviewer",    zh: "同行评审员"     }, color: C.holo,  angle: (Math.PI * 8) / 5,   reputation: 0.79, relations: 18, avatarHue: 180 },
];

// ── helpers ───────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function hexAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const h = Math.round(a * 255).toString(16).padStart(2, "0");
  return hex + h;
}

// ── avatar canvas drawing ─────────────────────────────────────────────────
function drawAvatar(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  traits: AvatarTraits,
  time: number
) {
  ctx.clearRect(0, 0, w, h);

  // background void
  const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
  bgGrad.addColorStop(0, hexAlpha(C.void800, 0.6));
  bgGrad.addColorStop(0.55, hexAlpha(C.void900, 0.8));
  bgGrad.addColorStop(1, hexAlpha(C.void950, 1.0));
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // subtle grid
  ctx.save();
  ctx.strokeStyle = hexAlpha(C.holo, 0.03);
  ctx.lineWidth = 0.5;
  const gStep = 32;
  for (let x = 0; x < w; x += gStep) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += gStep) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.restore();

  // derive figure metrics from traits
  const ht  = traits.height      / 100; // 0..1
  const cnf = traits.confidence  / 100;
  const age = traits.age         / 100;
  const abs = traits.abstraction / 100;
  const fmt = traits.formality   / 100;

  // figure geometry (all relative to canvas)
  const cx = w * 0.5;
  const baselineY = h * 0.88;
  const figH = lerp(h * 0.42, h * 0.72, ht);
  const topY  = baselineY - figH;
  const bodyW = lerp(w * 0.10, w * 0.16, cnf) * (1 - abs * 0.35);

  // standing-wave ambient oscillation (subtle)
  const sway  = Math.sin(time * 0.7) * (3 * (1 - abs));
  const breathAmp = 0.5 + 0.5 * Math.sin(time * 1.1);

  // primary holo colour — shifts toward iris at high abstraction,
  // gold at high age, plasm at high confidence
  const r0 = parseInt(C.holo.slice(1, 3), 16);
  const g0 = parseInt(C.holo.slice(3, 5), 16);
  const b0 = parseInt(C.holo.slice(5, 7), 16);
  const rIris = parseInt(C.iris.slice(1, 3), 16);
  const gIris = parseInt(C.iris.slice(3, 5), 16);
  const bIris = parseInt(C.iris.slice(5, 7), 16);
  const holoR = Math.round(lerp(r0, rIris, abs * 0.7 + cnf * 0.3));
  const holoG = Math.round(lerp(g0, gIris, abs * 0.6));
  const holoB = Math.round(lerp(b0, bIris, abs * 0.5));
  const holoCol = `#${holoR.toString(16).padStart(2, "0")}${holoG.toString(16).padStart(2, "0")}${holoB.toString(16).padStart(2, "0")}`;

  const baseAlpha = 0.65 + cnf * 0.2 + breathAmp * 0.08;

  // glow aura
  const auraR = figH * (0.6 + cnf * 0.3 + abs * 0.2);
  const aura  = ctx.createRadialGradient(cx, topY + figH * 0.5, 0, cx, topY + figH * 0.5, auraR);
  aura.addColorStop(0,   hexAlpha(holoCol, 0.10 + cnf * 0.08));
  aura.addColorStop(0.5, hexAlpha(holoCol, 0.04));
  aura.addColorStop(1,   "transparent");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, topY + figH * 0.5, auraR, 0, Math.PI * 2);
  ctx.fill();

  // ── floor reflection ──────────────────────────────────────────────────
  const reflGrad = ctx.createLinearGradient(0, baselineY, 0, baselineY + figH * 0.28);
  reflGrad.addColorStop(0, hexAlpha(holoCol, 0.12 + cnf * 0.06));
  reflGrad.addColorStop(1, "transparent");
  ctx.save();
  ctx.scale(1, -0.18);
  const reflY = -(baselineY + figH * 0.28) * 2 - baselineY * (-1 / 0.18 - 1);
  // simpler: just draw a faded ellipse as floor glow
  ctx.restore();
  const ellW = bodyW * 2.5 + ht * bodyW;
  const floorGlow = ctx.createRadialGradient(cx + sway, baselineY, 0, cx + sway, baselineY, ellW);
  floorGlow.addColorStop(0, hexAlpha(holoCol, 0.18 + cnf * 0.08));
  floorGlow.addColorStop(1, "transparent");
  ctx.fillStyle = floorGlow;
  ctx.beginPath();
  ctx.ellipse(cx + sway, baselineY, ellW, ellW * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── figure body segments ──────────────────────────────────────────────
  const headR  = bodyW * (lerp(0.75, 1.0, cnf)) * (1 - age * 0.05) * (abs > 0.4 ? lerp(1.0, 1.5, (abs - 0.4) / 0.6) : 1);
  const headCy = topY + headR + 4;
  const neckH  = figH * 0.05;
  const neckY  = headCy + headR;
  const torsoH = figH * lerp(0.35, 0.42, ht - 0.3);
  const torsoY = neckY + neckH;
  const legH   = figH - (headR * 2 + neckH + torsoH + 4);
  const legW   = bodyW * lerp(0.4, 0.55, ht) * (1 - abs * 0.3);

  // ── draw helper: holographic fill with scan lines ─────────────────────
  function drawHoloShape(
    path: () => void,
    alpha: number = baseAlpha,
    lineW = 1.4
  ) {
    ctx.save();
    // fill
    ctx.globalAlpha = alpha * 0.22;
    ctx.fillStyle = holoCol;
    path();
    ctx.fill();
    // stroke
    ctx.globalAlpha = alpha * 0.85;
    ctx.strokeStyle = holoCol;
    ctx.lineWidth = lineW;
    ctx.shadowColor = holoCol;
    ctx.shadowBlur = 10 + cnf * 8;
    path();
    ctx.stroke();
    ctx.restore();
  }

  // ── torso ──────────────────────────────────────────────────────────────
  const torsoW = bodyW * (1 + fmt * 0.3); // formal = broader shoulders
  drawHoloShape(() => {
    ctx.beginPath();
    const tw = torsoW;
    ctx.moveTo(cx + sway - tw * 0.9, torsoY);
    ctx.bezierCurveTo(
      cx + sway - tw, torsoY + torsoH * 0.3,
      cx + sway - tw * 0.55, torsoY + torsoH,
      cx + sway - tw * 0.35, torsoY + torsoH
    );
    ctx.lineTo(cx + sway + tw * 0.35, torsoY + torsoH);
    ctx.bezierCurveTo(
      cx + sway + tw * 0.55, torsoY + torsoH,
      cx + sway + tw, torsoY + torsoH * 0.3,
      cx + sway + tw * 0.9, torsoY
    );
    ctx.lineTo(cx + sway - tw * 0.9, torsoY);
    ctx.closePath();
  });

  // formality collar line
  if (fmt > 0.5) {
    const colAlpha = (fmt - 0.5) * 2 * 0.8;
    ctx.save();
    ctx.globalAlpha = colAlpha;
    ctx.strokeStyle = C.flux4;
    ctx.lineWidth = 1;
    ctx.shadowColor = C.flux4;
    ctx.shadowBlur = 6;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(cx + sway - torsoW * 0.3, torsoY + 2);
    ctx.lineTo(cx + sway, torsoY + torsoH * 0.22);
    ctx.lineTo(cx + sway + torsoW * 0.3, torsoY + 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ── legs ───────────────────────────────────────────────────────────────
  for (const side of [-1, 1]) {
    const legCx = cx + sway + side * legW * 0.6;
    const legTopY = torsoY + torsoH;
    drawHoloShape(() => {
      ctx.beginPath();
      ctx.moveTo(legCx - legW * 0.45, legTopY);
      ctx.lineTo(legCx + legW * 0.45, legTopY);
      ctx.lineTo(legCx + legW * 0.3,  baselineY);
      ctx.lineTo(legCx - legW * 0.3,  baselineY);
      ctx.closePath();
    }, baseAlpha * 0.9);
  }

  // ── arms ───────────────────────────────────────────────────────────────
  const armW = bodyW * 0.32;
  const armH = torsoH * 0.85;
  for (const side of [-1, 1]) {
    const armCx = cx + sway + side * (torsoW * 0.95 + armW);
    // slight outward drape for confident/formal
    const armDrape = side * (cnf * 4 + fmt * 3);
    drawHoloShape(() => {
      ctx.beginPath();
      ctx.moveTo(armCx - armW * 0.5 + armDrape * 0.5, torsoY + 4);
      ctx.lineTo(armCx + armW * 0.5 + armDrape * 0.5, torsoY + 4);
      ctx.bezierCurveTo(
        armCx + armW + armDrape, torsoY + armH * 0.5,
        armCx + armW * 0.8 + armDrape, torsoY + armH,
        armCx + armDrape, torsoY + armH
      );
      ctx.bezierCurveTo(
        armCx - armW * 0.8 + armDrape, torsoY + armH,
        armCx - armW + armDrape, torsoY + armH * 0.5,
        armCx - armW * 0.5 + armDrape * 0.5, torsoY + 4
      );
      ctx.closePath();
    }, baseAlpha * 0.85);
  }

  // ── neck ───────────────────────────────────────────────────────────────
  if (abs < 0.7) {
    drawHoloShape(() => {
      const nw = bodyW * 0.22;
      ctx.beginPath();
      ctx.rect(cx + sway - nw, neckY, nw * 2, neckH);
    }, baseAlpha * 0.7, 0.8);
  }

  // ── head (morphs with abstraction) ────────────────────────────────────
  if (abs < 0.5) {
    // human / near-human head
    drawHoloShape(() => {
      ctx.beginPath();
      ctx.ellipse(cx + sway, headCy, headR, headR * lerp(1.1, 1.0, age), 0, 0, Math.PI * 2);
    });
    // eyes
    const eyeY = headCy - headR * 0.12;
    const eyeSep = headR * 0.38;
    for (const side of [-1, 1]) {
      const ex = cx + sway + side * eyeSep;
      ctx.save();
      ctx.fillStyle = holoCol;
      ctx.globalAlpha = 0.9 + 0.1 * Math.sin(time * 1.5);
      ctx.shadowColor = holoCol;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, headR * 0.12, headR * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (abs < 0.8) {
    // semi-abstract: geometric head
    const nSides = Math.round(lerp(5, 3, (abs - 0.5) / 0.3));
    drawHoloShape(() => {
      ctx.beginPath();
      for (let i = 0; i <= nSides; i++) {
        const a = (i / nSides) * Math.PI * 2 - Math.PI / 2;
        const hx = cx + sway + Math.cos(a) * headR;
        const hy = headCy + Math.sin(a) * headR;
        if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
    }, baseAlpha * 1.05);
  } else {
    // fully abstract: orbiting particle cluster
    const orbs = 6;
    for (let i = 0; i < orbs; i++) {
      const a = (i / orbs) * Math.PI * 2 + time * 0.4;
      const or = headR * lerp(0.4, 1.0, i / (orbs - 1));
      const ox = cx + sway + Math.cos(a) * or;
      const oy = headCy + Math.sin(a) * or * 0.5;
      ctx.save();
      ctx.fillStyle = holoCol;
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(time + i);
      ctx.shadowColor = holoCol;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ox, oy, headR * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ── scan lines (holographic effect) ──────────────────────────────────
  ctx.save();
  ctx.globalAlpha = 0.06 + abs * 0.04;
  ctx.strokeStyle = holoCol;
  ctx.lineWidth = 0.5;
  const scanStep = lerp(6, 10, abs);
  for (let sy = topY; sy < baselineY; sy += scanStep) {
    ctx.beginPath();
    ctx.moveTo(cx - torsoW * 2, sy);
    ctx.lineTo(cx + torsoW * 2, sy);
    ctx.stroke();
  }
  ctx.restore();

  // ── vertical energy lines (abstract mode) ────────────────────────────
  if (abs > 0.3) {
    const lines = 4;
    for (let i = 0; i < lines; i++) {
      const lx = cx + sway + lerp(-bodyW * 0.7, bodyW * 0.7, i / (lines - 1));
      const prog = ((time * 0.4 + i * 0.25) % 1);
      const ly0 = topY + (baselineY - topY) * prog;
      const ly1 = ly0 + figH * 0.18;
      const lineGrad = ctx.createLinearGradient(lx, ly0, lx, ly1);
      lineGrad.addColorStop(0,   hexAlpha(holoCol, 0));
      lineGrad.addColorStop(0.4, hexAlpha(holoCol, (abs - 0.3) * 0.7));
      lineGrad.addColorStop(1,   hexAlpha(holoCol, 0));
      ctx.save();
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(lx, ly0);
      ctx.lineTo(lx, Math.min(ly1, baselineY));
      ctx.stroke();
      ctx.restore();
    }
  }

  // ── trait badges ──────────────────────────────────────────────────────
  const badgeX = cx + torsoW * 1.8 + 12;
  const badgeStartY = topY + headR * 2 + 8;
  ctx.save();
  ctx.font = `bold 8px "JetBrains Mono", monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const badges: [string, number, string][] = [
    ["HT", ht, C.holo],
    ["CF", cnf, C.iris4],
    ["AG", age, C.gold],
    ["AB", abs, C.plasm4],
    ["FM", fmt, C.flux4],
  ];
  badges.forEach(([key, val, col], i) => {
    const by = badgeStartY + i * 18;
    ctx.fillStyle = hexAlpha(col, 0.55);
    ctx.fillText(key, badgeX, by);
    // mini bar
    const barX = badgeX + 20;
    const barW = 36;
    ctx.fillStyle = hexAlpha(col, 0.15);
    ctx.fillRect(barX, by - 3, barW, 6);
    ctx.fillStyle = hexAlpha(col, 0.7);
    ctx.fillRect(barX, by - 3, barW * val, 6);
  });
  ctx.restore();
}

// ── multiple selves canvas ────────────────────────────────────────────────
function drawMultipleSelves(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  activeWorld: number | null,
  time: number
) {
  ctx.clearRect(0, 0, w, h);

  // dark background
  ctx.fillStyle = C.void950;
  ctx.fillRect(0, 0, w, h);

  // grid
  ctx.save();
  ctx.strokeStyle = hexAlpha(C.iris, 0.04);
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 36) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 36) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.restore();

  const cx = w * 0.5;
  const cy = h * 0.5;
  const orbitR = Math.min(w, h) * 0.33;

  // central self node
  const selfR = 28;
  const selfPulse = 0.85 + 0.15 * Math.sin(time * 1.1);
  const selfGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, selfR * 3.5);
  selfGlow.addColorStop(0, hexAlpha(C.iris, 0.22));
  selfGlow.addColorStop(0.4, hexAlpha(C.iris, 0.08));
  selfGlow.addColorStop(1, "transparent");
  ctx.fillStyle = selfGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, selfR * 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = hexAlpha(C.iris, 0.7 * selfPulse);
  ctx.lineWidth = 1.8;
  ctx.shadowColor = C.iris;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(cx, cy, selfR, 0, Math.PI * 2);
  ctx.stroke();
  // inner fill
  const selfFill = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, selfR);
  selfFill.addColorStop(0, hexAlpha(C.iris, 0.5));
  selfFill.addColorStop(1, hexAlpha(C.iris, 0.1));
  ctx.fillStyle = selfFill;
  ctx.fill();
  ctx.restore();

  // "YOU" label in centre
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = hexAlpha(C.iris4, 0.9);
  ctx.font = `bold 10px "JetBrains Mono", monospace`;
  ctx.shadowColor = C.iris4;
  ctx.shadowBlur = 8;
  ctx.fillText("YOU", cx, cy);
  ctx.restore();

  // orbit ring
  ctx.save();
  ctx.strokeStyle = hexAlpha(C.iris, 0.08);
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 9]);
  ctx.beginPath();
  ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // world nodes
  WORLDS.forEach((world) => {
    const wx = cx + Math.cos(world.angle) * orbitR;
    const wy = cy + Math.sin(world.angle) * orbitR;
    const isActive = activeWorld === world.id;
    const nodeR = 18 + world.reputation * 8;
    const pulse = 0.8 + 0.2 * Math.sin(time * 0.9 + world.id * 1.1);

    // connection line to centre
    const lineAlpha = isActive ? 0.65 : 0.2;
    ctx.save();
    ctx.strokeStyle = hexAlpha(world.color, lineAlpha);
    ctx.lineWidth = isActive ? 2 : 0.8;
    if (!isActive) ctx.setLineDash([4, 7]);
    // animated energy along active line
    if (isActive) {
      const prog = (time * 0.5) % 1;
      const lineGrad = ctx.createLinearGradient(cx, cy, wx, wy);
      lineGrad.addColorStop(0, hexAlpha(world.color, 0.2));
      lineGrad.addColorStop(Math.max(0, prog - 0.1), hexAlpha(world.color, 0.3));
      lineGrad.addColorStop(prog, hexAlpha(world.color, 0.9));
      lineGrad.addColorStop(Math.min(1, prog + 0.1), hexAlpha(world.color, 0.3));
      lineGrad.addColorStop(1, hexAlpha(world.color, 0.2));
      ctx.strokeStyle = lineGrad;
    }
    ctx.shadowColor = world.color;
    ctx.shadowBlur = isActive ? 10 : 0;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(wx, wy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // node halo
    const halo = ctx.createRadialGradient(wx, wy, nodeR * 0.3, wx, wy, nodeR * 2.5);
    halo.addColorStop(0, hexAlpha(world.color, isActive ? 0.2 : 0.08));
    halo.addColorStop(1, "transparent");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(wx, wy, nodeR * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // node ring (reputation arc)
    const repAngle = world.reputation * Math.PI * 2;
    ctx.save();
    ctx.strokeStyle = hexAlpha(world.color, 0.25 + (isActive ? 0.1 : 0));
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(wx, wy, nodeR + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = hexAlpha(world.color, 0.6 * pulse);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = world.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(wx, wy, nodeR + 5, -Math.PI / 2, -Math.PI / 2 + repAngle);
    ctx.stroke();
    ctx.restore();

    // node body
    ctx.save();
    const bodyFill = ctx.createRadialGradient(wx - 5, wy - 5, 0, wx, wy, nodeR);
    bodyFill.addColorStop(0, hexAlpha(world.color, 0.45 + (isActive ? 0.2 : 0)));
    bodyFill.addColorStop(1, hexAlpha(world.color, 0.08));
    ctx.fillStyle = bodyFill;
    ctx.strokeStyle = hexAlpha(world.color, 0.6 * pulse + (isActive ? 0.2 : 0));
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.shadowColor = world.color;
    ctx.shadowBlur = isActive ? 18 : 6;
    ctx.beginPath();
    ctx.arc(wx, wy, nodeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // world initial label inside node
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = hexAlpha(world.color, 0.9);
    ctx.font = `bold ${Math.round(nodeR * 0.7)}px "JetBrains Mono", monospace`;
    ctx.shadowColor = world.color;
    ctx.shadowBlur = 8;
    ctx.fillText(String(world.id + 1), wx, wy);
    ctx.restore();

    // relation dots orbiting node
    if (isActive) {
      const shown = Math.min(world.relations, 8);
      for (let r = 0; r < shown; r++) {
        const ra = (r / shown) * Math.PI * 2 + time * 0.25;
        const rx = wx + Math.cos(ra) * (nodeR + 16);
        const ry = wy + Math.sin(ra) * (nodeR + 16);
        ctx.save();
        ctx.fillStyle = hexAlpha(world.color, 0.55);
        ctx.shadowColor = world.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  });
}

// ── component ─────────────────────────────────────────────────────────────
type ViewMode = "configurator" | "multiself";

export default function AvatarLab() {
  const { lang } = useLang();
  const L = (en: string, zh: string) => lang === "zh" ? zh : en;

  const [view, setView] = useState<ViewMode>("configurator");
  const [traits, setTraits] = useState<AvatarTraits>({ ...DEFAULT_TRAITS });
  const [activeWorld, setActiveWorld] = useState<number | null>(null);

  const traitsRef     = useRef<AvatarTraits>({ ...DEFAULT_TRAITS });
  const activeWorldRef= useRef<number | null>(null);
  const viewRef       = useRef<ViewMode>("configurator");

  const avatarCanvasRef = useRef<HTMLCanvasElement>(null);
  const multiCanvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef          = useRef<number>(0);
  const tRef            = useRef<number>(0);

  // sync refs
  useEffect(() => { traitsRef.current      = traits;      }, [traits]);
  useEffect(() => { activeWorldRef.current = activeWorld; }, [activeWorld]);
  useEffect(() => { viewRef.current        = view;        }, [view]);

  // animation loop
  useEffect(() => {
    let lastTs = 0;

    function frame(ts: number) {
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      tRef.current += dt;
      const t = tRef.current;
      const v = viewRef.current;

      if (v === "configurator") {
        const canvas = avatarCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) drawAvatar(ctx, canvas.width, canvas.height, traitsRef.current, t);
        }
      } else {
        const canvas = multiCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) drawMultipleSelves(ctx, canvas.width, canvas.height, activeWorldRef.current, t);
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // reads everything via refs

  // active Proteus effects
  const activeEffects = PROTEUS_EFFECTS.filter((p) => {
    const v = traits[p.trait];
    return p.direction === "above" ? v > p.threshold : v < p.threshold;
  });

  const featuredEffect = activeEffects[0] ?? null;

  return (
    <section className="w-full space-y-8 py-2">

      {/* ── header ─────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="label-mono">
          <T v={{ en: "System 06 · Digital Identity & Selfhood", zh: "系统 06 · 数字身份与自我" }} />
        </p>
        <h2 className="display text-2xl md:text-3xl spark-text">
          {L("Avatar Lab", "化身实验室")}
        </h2>
        <p className={`text-ink-300 text-sm max-w-2xl leading-relaxed ${lang === "zh" ? "zh" : ""}`}>
          {L(
            "The body you choose in VR is not neutral. The Proteus effect (Yee & Bailenson, 2007) documents that avatar appearance causally reshapes the wearer's own behaviour — before, during, and after immersion.",
            "在虚拟现实中选择的身体并非中立。Proteus效应（Yee & Bailenson，2007）记录了化身外观如何因果性地重塑穿戴者自身的行为——无论是在沉浸前、中还是后。"
          )}
        </p>
      </div>

      {/* ── view toggle ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setView("configurator")}
          className={`px-5 py-2 rounded-full text-[0.78rem] font-mono uppercase tracking-widest border transition-all
            ${view === "configurator"
              ? "bg-holo-500/10 border-holo-500/60 text-holo-400 shadow-[0_0_18px_-6px_#22d3ee]"
              : "border-ink-500/20 text-ink-500 hover:border-holo-500/40 hover:text-holo-400"
            }`}
          style={{ borderColor: view === "configurator" ? hexAlpha(C.holo, 0.55) : undefined, color: view === "configurator" ? C.holo4 : undefined }}
        >
          {L("Avatar Configurator", "化身配置器")}
        </button>
        <button
          onClick={() => setView("multiself")}
          className={`px-5 py-2 rounded-full text-[0.78rem] font-mono uppercase tracking-widest border transition-all
            ${view === "multiself"
              ? "bg-iris-500/10 border-iris-500/60 text-iris-400 shadow-[0_0_18px_-6px_#a855f7]"
              : "border-ink-500/20 text-ink-500 hover:border-iris-500/40 hover:text-iris-400"
            }`}
          style={{ borderColor: view === "multiself" ? hexAlpha(C.iris, 0.55) : undefined, color: view === "multiself" ? C.iris4 : undefined }}
        >
          {L("Multiple Selves", "多重自我")}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          CONFIGURATOR VIEW
         ════════════════════════════════════════════════════════════════ */}
      {view === "configurator" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* ── avatar canvas ── */}
          <div
            className="relative overflow-hidden rounded-2xl border panel"
            style={{ borderColor: hexAlpha(C.holo, 0.18), boxShadow: `0 0 60px -24px ${hexAlpha(C.holo, 0.35)}`, minHeight: 360 }}
          >
            <canvas
              ref={avatarCanvasRef}
              width={600}
              height={440}
              className="block w-full"
              style={{ aspectRatio: "600/440" }}
              aria-label={L("Holographic avatar figure — morphs with trait sliders", "全息化身图形——随属性滑块变化")}
            />
            {/* overlay badges */}
            <div className="pointer-events-none absolute top-3 left-3">
              <span
                className="label-mono px-3 py-1 rounded-full"
                style={{ background: "rgba(6,3,15,0.85)", color: C.holo4, fontSize: "0.58rem", border: `1px solid ${hexAlpha(C.holo, 0.22)}` }}
              >
                {L("HOLOGRAPHIC AVATAR", "全息化身")}
              </span>
            </div>
            {featuredEffect && (
              <div
                className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-xl border px-3 py-2 backdrop-blur-sm"
                style={{ borderColor: hexAlpha(featuredEffect.color, 0.35), background: hexAlpha(C.void900, 0.88) }}
              >
                <p className="font-mono text-[0.58rem] uppercase tracking-widest mb-0.5" style={{ color: hexAlpha(featuredEffect.color, 0.75) }}>
                  {L("Proteus Effect Active", "Proteus效应激活")}
                </p>
                <p className="font-mono text-[0.68rem]" style={{ color: featuredEffect.color }}>
                  {featuredEffect.title[lang as "en" | "zh"]}
                </p>
              </div>
            )}
          </div>

          {/* ── right column: sliders + effects ── */}
          <div className="flex flex-col gap-4">

            {/* sliders */}
            <div className="panel rounded-2xl p-5 space-y-5">
              <p className="label-mono" style={{ color: C.holo4 }}>
                {L("Trait Configuration", "外观特质配置")}
              </p>

              {SLIDERS.map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span
                      className={`text-[0.72rem] font-mono ${lang === "zh" ? "zh" : ""}`}
                      style={{ color: hexAlpha(s.color, 0.85) }}
                    >
                      {s.label[lang as "en" | "zh"]}
                    </span>
                    <span className="font-mono text-[0.65rem] text-ink-500">
                      {traits[s.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={traits[s.key]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTraits((prev) => ({ ...prev, [s.key]: val }));
                    }}
                    className="w-full cursor-pointer"
                    style={{ accentColor: s.color }}
                    aria-label={s.label.en}
                  />
                  <div className="flex justify-between text-[0.6rem] font-mono text-ink-500/60">
                    <span>{s.lo[lang as "en" | "zh"]}</span>
                    <span>{s.hi[lang as "en" | "zh"]}</span>
                  </div>
                </div>
              ))}

              {/* reset button */}
              <button
                onClick={() => setTraits({ ...DEFAULT_TRAITS })}
                className="w-full rounded-lg border text-[0.68rem] font-mono uppercase tracking-widest py-1.5 transition-all border-ink-500/15 text-ink-500 hover:border-holo-500/35 hover:text-holo-400"
              >
                {L("Reset", "重置")}
              </button>
            </div>

            {/* active Proteus effects */}
            <div
              className="panel rounded-2xl p-5 space-y-3 flex-1"
              style={{ borderColor: hexAlpha(C.plasm, 0.2) }}
            >
              <p className="label-mono" style={{ color: C.plasm4 }}>
                {L("Proteus Effect Predictions", "Proteus效应预测")}
              </p>
              {activeEffects.length === 0 ? (
                <p className="text-[0.72rem] text-ink-500 font-mono">
                  {L("Adjust sliders to see research-grounded predictions.", "调整滑块以查看基于研究的预测。")}
                </p>
              ) : (
                <div className="space-y-3">
                  {activeEffects.slice(0, 3).map((eff, i) => (
                    <div
                      key={i}
                      className="rounded-xl border p-3 space-y-1.5"
                      style={{
                        borderColor: hexAlpha(eff.color, 0.3),
                        background: hexAlpha(eff.color, 0.06),
                      }}
                    >
                      <p className="display text-[0.8rem]" style={{ color: eff.color }}>
                        {eff.title[lang as "en" | "zh"]}
                      </p>
                      <p className={`text-[0.7rem] text-ink-300 leading-relaxed ${lang === "zh" ? "zh" : ""}`}>
                        {eff.effect[lang as "en" | "zh"]}
                      </p>
                      <p className="font-mono text-[0.58rem]" style={{ color: hexAlpha(eff.color, 0.55) }}>
                        ◎ {eff.cite}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MULTIPLE SELVES VIEW
         ════════════════════════════════════════════════════════════════ */}
      {view === "multiself" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">

          {/* canvas */}
          <div
            className="relative overflow-hidden rounded-2xl border panel"
            style={{ borderColor: hexAlpha(C.iris, 0.18), boxShadow: `0 0 60px -24px ${hexAlpha(C.iris, 0.35)}`, minHeight: 360 }}
          >
            <canvas
              ref={multiCanvasRef}
              width={640}
              height={440}
              className="block w-full"
              style={{ aspectRatio: "640/440" }}
              aria-label={L("One person projecting multiple avatars into different virtual worlds", "一个人向不同虚拟世界投射多个化身")}
            />
            <div className="pointer-events-none absolute top-3 left-3">
              <span
                className="label-mono px-3 py-1 rounded-full"
                style={{ background: "rgba(6,3,15,0.85)", color: C.iris4, fontSize: "0.58rem", border: `1px solid ${hexAlpha(C.iris, 0.25)}` }}
              >
                {L("ONE PERSON · FIVE WORLDS", "一人 · 五个世界")}
              </span>
            </div>
          </div>

          {/* world list */}
          <div className="flex flex-col gap-3">
            <p className="label-mono" style={{ color: C.iris4 }}>
              {L("Active Identities", "活跃身份")}
            </p>

            {WORLDS.map((world) => {
              const isActive = activeWorld === world.id;
              return (
                <button
                  key={world.id}
                  onClick={() => setActiveWorld(isActive ? null : world.id)}
                  className="w-full text-left rounded-xl border p-4 space-y-2 transition-all"
                  style={{
                    borderColor: hexAlpha(world.color, isActive ? 0.55 : 0.18),
                    background: isActive ? hexAlpha(world.color, 0.08) : hexAlpha(C.void800, 0.4),
                    boxShadow: isActive ? `0 0 28px -10px ${hexAlpha(world.color, 0.5)}` : "none",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="display text-[0.82rem]" style={{ color: world.color }}>
                        {world.name[lang as "en" | "zh"]}
                      </p>
                      <p className={`text-[0.7rem] text-ink-500 mt-0.5 ${lang === "zh" ? "zh" : ""}`}>
                        {world.role[lang as "en" | "zh"]}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full w-6 h-6 flex items-center justify-center font-mono text-[0.65rem] font-bold border"
                      style={{ color: world.color, borderColor: hexAlpha(world.color, 0.4) }}
                    >
                      {world.id + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* reputation bar */}
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[0.58rem] text-ink-500">{L("Rep.", "声誉")}</span>
                        <span className="font-mono text-[0.58rem]" style={{ color: hexAlpha(world.color, 0.7) }}>
                          {Math.round(world.reputation * 100)}%
                        </span>
                      </div>
                      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: hexAlpha(world.color, 0.12) }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${world.reputation * 100}%`, background: world.color }}
                        />
                      </div>
                    </div>
                    <span className="font-mono text-[0.62rem] text-ink-500 shrink-0">
                      {world.relations}{L(" contacts", " 联系人")}
                    </span>
                  </div>
                </button>
              );
            })}

            <p className="text-[0.65rem] font-mono text-ink-500 text-center pt-1">
              {L("Click a world to explore its identity node", "点击世界节点以探索其身份")}
            </p>
          </div>
        </div>
      )}

      {/* ── divider ────────────────────────────────────────────────────── */}
      <div className="w-full h-px rule-flux rounded" />

      {/* ── Proteus effect summary cards ──────────────────────────────── */}
      <div className="space-y-4">
        <p className="label-mono" style={{ color: C.plasm4 }}>
          {L("The Proteus Effect — Documented Research", "Proteus效应 — 有据可查的研究")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: "↑",
              title: { en: "Height → Assertiveness", zh: "身高 → 强势感" },
              body: {
                en: "Taller avatar wearers bargain more assertively and claim larger outcomes — the effect transfers to face-to-face contexts after the headset is removed.",
                zh: "穿戴高大化身的用户谈判更强势，争取更大的利益——这一效应在摘下头显后仍会延续到面对面情境中。",
              },
              color: C.holo,
              cite: "Yee & Bailenson (2007)",
            },
            {
              icon: "◎",
              title: { en: "Attractiveness → Self-Disclosure", zh: "吸引力 → 自我披露" },
              body: {
                en: "More attractive avatars cause wearers to stand closer to others and share more personal information — both in VR and subsequently in real interactions.",
                zh: "更具吸引力的化身使穿戴者靠近他人、分享更多个人信息——在VR中及其后的真实交流中均如此。",
              },
              color: C.iris4,
              cite: "Yee & Bailenson (2007)",
            },
            {
              icon: "⟳",
              title: { en: "Age → Future-Self Investment", zh: "年龄 → 对未来自我的投资" },
              body: {
                en: "Embodying an aged avatar of oneself substantially increases willingness to save for retirement — the future self becomes psychologically present.",
                zh: "以自身年老化身沉浸体验，会显著提升为退休储蓄的意愿——未来的自我在心理上变得真实。",
              },
              color: C.gold,
              cite: "Hershfield et al. (2011)",
            },
          ].map((card, i) => (
            <div key={i} className="panel rounded-xl p-5 space-y-2 panel-iris">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[0.85rem]" style={{ color: card.color }}>{card.icon}</span>
                <h3 className="display text-[0.85rem] leading-snug" style={{ color: card.color }}>
                  {card.title[lang as "en" | "zh"]}
                </h3>
              </div>
              <p className={`text-ink-400 text-[0.76rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}>
                {card.body[lang as "en" | "zh"]}
              </p>
              <p className="text-[0.6rem] font-mono" style={{ color: hexAlpha(card.color, 0.55) }}>
                ◎ {card.cite}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── open question panel ────────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-6 space-y-4"
        style={{
          borderColor: hexAlpha(C.iris, 0.3),
          background: `linear-gradient(160deg, ${hexAlpha(C.iris, 0.06)}, ${hexAlpha(C.void900, 0.95)})`,
          boxShadow: `0 0 60px -24px ${hexAlpha(C.iris, 0.3)}`,
        }}
      >
        <p className="label-mono" style={{ color: C.iris4 }}>
          {L("The Open Question", "开放性问题")}
        </p>
        <h3 className="display text-xl md:text-2xl" style={{ color: C.iris4 }}>
          {L("Costume or Extension of Self?", "服装，还是自我的延伸？")}
        </h3>
        <div className="grid gap-5 md:grid-cols-2">
          <p className={`text-sm text-ink-300 leading-relaxed ${lang === "zh" ? "zh" : ""}`}>
            {L(
              "If the avatar is merely a costume, then the self remains fixed behind it — observing, playing a role, returning intact. But the Proteus effect suggests something stranger: the felt boundary of 'me' migrates toward the rendered body. Behaviours, confidence levels, and interpersonal distances all shift to match the avatar's appearance — not as performance, but as recalibration of self-concept.",
              "如果化身只是一件服装，那么自我便保持固定其后——观察、扮演角色、完好无损地归来。但Proteus效应暗示了某种更奇异的事情：'我'的感知边界向渲染身体迁移。行为、自信程度以及人际距离都随化身外观而转变——这不是表演，而是自我概念的重新校准。"
            )}
          </p>
          <p className={`text-sm leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: hexAlpha(C.iris4, 0.75) }}>
            {L(
              "Multiple simultaneous avatars push the question further: if each identity is real enough to accumulate reputation, relationships, and behavioural tendencies — which one is 'you'? Perhaps the self was never a fixed thing but a dynamic process that now has more surfaces on which to run.",
              "多个同时存在的化身使这个问题更加深刻：如果每个身份都真实到足以积累声誉、关系和行为倾向——哪一个是'你'？也许自我从来就不是一个固定的事物，而是一个动态过程，如今拥有了更多可以运行的表面。"
            )}
          </p>
        </div>
        <div className="h-px mt-2" style={{ background: `linear-gradient(90deg, ${hexAlpha(C.iris, 0.4)}, transparent)` }} />
        <p className="text-[0.72rem] font-mono text-ink-500">
          {L(
            "Research: Yee, N. & Bailenson, J. (2007). The Proteus Effect. Human Communication Research, 33(3), 271–290.",
            "研究来源：Yee, N. & Bailenson, J.（2007）。Proteus效应。《人类传播研究》，33(3)，271–290。"
          )}
        </p>
      </div>

    </section>
  );
}
