"use client";

import { useRef, useEffect, useState } from "react";
import { useLang } from "./lang";

/* ═══════════════════════════════════════════════════════════════════════════
   VirtualEconomy
   System 07 — Virtual Economies & Post-Physical Labor

   Circular flow canvas: Creators → Digital Goods → Users → Platforms → back
   Plus: category explorer, composition slider, "who captures value?" panel
═══════════════════════════════════════════════════════════════════════════ */

/* ── colour palette (raw hex for canvas / SVG) ─────────────────────────── */
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

/* ── deterministic pseudo-random ────────────────────────────────────────── */
function seeded(seed: number, salt: number = 0): number {
  const x = Math.sin(seed * 9301 + salt * 49297 + 233720) * 43758.5453;
  return x - Math.floor(x);
}

/* ═══════════════════════════════════════════════════════════════════════════
   CIRCULAR FLOW CANVAS
   Four nodes arranged in a ring: Creators → Goods → Users → Platforms → back
   Animated flow particles travel along the arcs.
═══════════════════════════════════════════════════════════════════════════ */

interface FlowParticle {
  arc: number;      // which arc (0–3)
  t: number;        // 0 → 1 position along arc
  speed: number;
  color: string;
  size: number;
}

/* arc definitions: 4 nodes, 4 arcs connecting them clockwise */
const NODE_ANGLES = [
  -Math.PI / 2,            // top: Creators
  0,                       // right: Goods
  Math.PI / 2,             // bottom: Users
  Math.PI,                 // left: Platforms
];

/* arc colours: what flows along each edge */
const ARC_COLORS = [
  C.holo500,   // Creators → Goods   (creative output)
  C.flux500,   // Goods → Users       (consumption/attention)
  C.gold500,   // Users → Platforms   (spend / fee)
  C.iris500,   // Platforms → Creators (payouts / tools)
];

/* arc label keys — bilingual text resolved in the component */
type ArcKey = "creatorToGoods" | "goodsToUsers" | "usersToPlatforms" | "platformsToCreators";
const ARC_KEYS: ArcKey[] = [
  "creatorToGoods",
  "goodsToUsers",
  "usersToPlatforms",
  "platformsToCreators",
];

type NodeKey = "creators" | "goods" | "users" | "platforms";
const NODE_KEYS: NodeKey[] = ["creators", "goods", "users", "platforms"];
const NODE_COLORS: string[] = [C.holo500, C.flux500, C.gold500, C.iris500];

function buildParticles(n: number): FlowParticle[] {
  const out: FlowParticle[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      arc:   i % 4,
      t:     seeded(i, 0),
      speed: 0.18 + seeded(i, 1) * 0.14,
      color: ARC_COLORS[i % 4],
      size:  1.8 + seeded(i, 2) * 2.2,
    });
  }
  return out;
}

/* ── lerp point along a circular arc between two angles ─────────────────── */
function arcPoint(
  cx: number, cy: number, rx: number, ry: number,
  fromAngle: number, toAngle: number, t: number
): [number, number] {
  // interpolate angle (always clockwise)
  let delta = toAngle - fromAngle;
  if (delta <= 0) delta += Math.PI * 2;
  const angle = fromAngle + delta * t;
  return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
}

function drawFlow(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  t: number,
  particles: FlowParticle[],
  physicalFrac: number
) {
  ctx.clearRect(0, 0, w, h);

  // background
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.65);
  bg.addColorStop(0,   "rgba(18,10,51,0.96)");
  bg.addColorStop(0.6, "rgba(11,6,32,0.98)");
  bg.addColorStop(1,   "rgba(6,3,15,1)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // starfield
  for (let i = 0; i < 40; i++) {
    const sx = seeded(i, 7) * w;
    const sy = seeded(i, 8) * h;
    const sr = 0.4 + seeded(i, 9) * 0.7;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(179,175,216,${0.05 + seeded(i, 10) * 0.10})`;
    ctx.fill();
  }

  const cx = w * 0.5;
  const cy = h * 0.5;
  const baseRx = Math.min(w, h) * 0.33;
  const baseRy = Math.min(w, h) * 0.28;
  // physical economy squishes the ellipse toward a circle; experience expands it
  const rx = baseRx * (0.88 + 0.12 * physicalFrac);
  const ry = baseRy * (0.88 + 0.12 * (1 - physicalFrac));

  const nodePositions: [number, number][] = NODE_ANGLES.map((a) => [
    cx + Math.cos(a) * rx,
    cy + Math.sin(a) * ry,
  ]);

  // ── orbit ring ──────────────────────────────────────────────────────────
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = C.flux400;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 7]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // ── arc flow lines ───────────────────────────────────────────────────────
  for (let ai = 0; ai < 4; ai++) {
    const fromAngle = NODE_ANGLES[ai];
    const toAngle   = NODE_ANGLES[(ai + 1) % 4];
    const color     = ARC_COLORS[ai];

    // arc path (clockwise segment)
    let delta = toAngle - fromAngle;
    if (delta <= 0) delta += Math.PI * 2;

    ctx.save();
    ctx.strokeStyle = color + "40";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    // draw arc in steps
    const steps = 40;
    for (let si = 0; si <= steps; si++) {
      const frac = si / steps;
      const angle = fromAngle + delta * frac;
      const px = cx + Math.cos(angle) * rx;
      const py = cy + Math.sin(angle) * ry;
      if (si === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ── flow particles ───────────────────────────────────────────────────────
  for (const p of particles) {
    const ai   = p.arc;
    const from = NODE_ANGLES[ai];
    const to   = NODE_ANGLES[(ai + 1) % 4];
    const [px, py] = arcPoint(cx, cy, rx, ry, from, to, p.t);

    // tail
    const tailFrac = Math.max(p.t - 0.07, 0);
    const [tx, ty] = arcPoint(cx, cy, rx, ry, from, to, tailFrac);
    const tailGrad = ctx.createLinearGradient(px, py, tx, ty);
    tailGrad.addColorStop(0, p.color + "bb");
    tailGrad.addColorStop(1, p.color + "00");
    ctx.save();
    ctx.strokeStyle = tailGrad;
    ctx.lineWidth = p.size * 0.6;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.restore();

    // dot
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }

  // ── nodes ─────────────────────────────────────────────────────────────────
  for (let ni = 0; ni < 4; ni++) {
    const [nx, ny] = nodePositions[ni];
    const color = NODE_COLORS[ni];
    const pulse = 0.7 + 0.3 * Math.sin(t * 1.6 + ni * 1.1);
    const r = 18 + 4 * pulse;

    // glow
    ctx.save();
    const glow = ctx.createRadialGradient(nx, ny, r * 0.2, nx, ny, r * 2.6);
    glow.addColorStop(0, color + "55");
    glow.addColorStop(1, color + "00");
    ctx.fillStyle = glow;
    ctx.globalAlpha = pulse * 0.55;
    ctx.beginPath();
    ctx.arc(nx, ny, r * 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // fill
    ctx.save();
    const grad = ctx.createRadialGradient(nx - r * 0.25, ny - r * 0.25, 0, nx, ny, r);
    const a1 = Math.round((0.55 + 0.3 * pulse) * 255).toString(16).padStart(2, "0");
    grad.addColorStop(0, color + a1);
    grad.addColorStop(1, color + "22");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(nx, ny, r, 0, Math.PI * 2);
    ctx.fill();
    // ring
    ctx.strokeStyle = color + "cc";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   VIRTUAL VALUE CATEGORIES
═══════════════════════════════════════════════════════════════════════════ */
interface ValueCategory {
  id: string;
  color: string;
  icon: string;
  label: { en: string; zh: string };
  subtitle: { en: string; zh: string };
  size: { en: string; zh: string };       // market anchoring
  note: { en: string; zh: string };       // grounding note
  maturity: number;   // 0–1 how established this is
}

const CATEGORIES: ValueCategory[] = [
  {
    id: "skins",
    color: C.holo500,
    icon: "M12 2 L22 8.5 V15.5 L12 22 L2 15.5 V8.5 Z",
    label: { en: "Skins & Digital Fashion", zh: "皮肤与数字时尚" },
    subtitle: { en: "Cosmetic items, wearables, avatar clothing", zh: "装饰道具、穿戴品、虚拟服装" },
    size: {
      en: "Fortnite alone earns ~$1B/yr from cosmetics; gaming cosmetics market ~$40B globally",
      zh: "《堡垒之夜》单靠皮肤年收入约10亿美元；全球游戏装饰品市场约400亿美元",
    },
    note: {
      en: "Decades of demonstrated demand: players pay real money for items with no gameplay effect — status and identity are the product.",
      zh: "数十年的需求已被证实：玩家为没有游戏属性的物品付真实货币——地位与身份才是产品。",
    },
    maturity: 0.92,
  },
  {
    id: "items",
    color: C.flux500,
    icon: "M3 17 L12 3 L21 17 H3 Z M12 12 V17",
    label: { en: "In-Game Items & Upgrades", zh: "游戏内道具与升级" },
    subtitle: { en: "Weapons, mounts, power-ups, equipment", zh: "武器、坐骑、加成、装备" },
    size: {
      en: "Loot box / item market: ~$15B; secondary item trading (e.g. CS:GO skins) forms a parallel grey-market economy",
      zh: "战利品箱/道具市场约150亿美元；CS:GO皮肤等二级交易形成平行灰色市场经济",
    },
    note: {
      en: "The oldest segment; pre-dates the internet (shareware add-ons). Durable demand, though loot box regulation is tightening.",
      zh: "最古老的细分市场，早于互联网（共享软件附加内容）。需求持久，但战利品箱监管正在收紧。",
    },
    maturity: 0.88,
  },
  {
    id: "content",
    color: C.iris500,
    icon: "M15 10 L9 6 V18 L15 14 L21 18 V6 Z",
    label: { en: "Creator Content & Commissions", zh: "创作者内容与委托" },
    subtitle: { en: "Video, mods, levels, music, writing, art", zh: "视频、模组、关卡、音乐、写作、艺术" },
    size: {
      en: "Creator economy ~$250B globally; individual platforms: Roblox pays creators $500M+/yr",
      zh: "创作者经济全球约2500亿美元；Roblox等单平台年付创作者逾5亿美元",
    },
    note: {
      en: "Labor that produces no atoms. Roblox's UGC model demonstrates that players build the world — the platform owns the infrastructure.",
      zh: "不产生任何原子的劳动。Roblox的UGC模式证明玩家在建造世界——平台拥有基础设施。",
    },
    maturity: 0.80,
  },
  {
    id: "events",
    color: C.gold500,
    icon: "M12 2 C6.48 2 2 6.48 2 12 S6.48 22 12 22 S22 17.52 22 12 S17.52 2 12 2 Z M12 8 V12 L15 15",
    label: { en: "Live Events & Experiences", zh: "现场活动与体验" },
    subtitle: { en: "Concerts, sports, meets, rituals", zh: "演唱会、体育赛事、聚会、仪式" },
    size: {
      en: "Travis Scott Fortnite concert: 12M concurrent viewers; virtual events market ~$500B by 2030 (estimates vary widely)",
      zh: "Travis Scott堡垒之夜演唱会：1200万并发观众；虚拟活动市场预计2030年达5000亿美元（估算差异较大）",
    },
    note: {
      en: "Presence ≠ physical presence. Real emotional response; shared memory. Scalable past venue capacity. Revenue model still maturing.",
      zh: "临场感不等于物理临场感。真实的情感反应与共同记忆。突破场地容量上限。收入模式仍在发展中。",
    },
    maturity: 0.60,
  },
  {
    id: "land",
    color: C.plasm500,
    icon: "M3 3 H21 V21 H3 Z M3 9 H21 M9 3 V21",
    label: { en: "Virtual Land & Worlds", zh: "虚拟土地与世界" },
    subtitle: { en: "Metaverse parcels, private servers, designed worlds", zh: "元宇宙地块、私服、设计世界" },
    size: {
      en: "Minecraft server hosting: ~$500M market. Crypto-metaverse land peak 2021–2022 saw parcels sell for $4.3M.",
      zh: "Minecraft服务器托管市场约5亿美元。加密元宇宙土地2021-2022年峰值时地块成交价达430万美元。",
    },
    note: {
      en: "⚠ Cautionary: crypto-metaverse land values collapsed 90–98% from 2022 peaks. Server-hosted worlds (Minecraft, Roblox) show more durable demand — the underlying desire to own/build a world is real, but speculative digital real estate carries extra risk.",
      zh: "⚠ 警示：加密元宇宙土地价格自2022年峰值崩跌90–98%。服务器托管世界（Minecraft、Roblox）需求更持久——拥有/建造世界的底层欲望是真实的，但投机性数字房产风险极高。",
    },
    maturity: 0.28,
  },
  {
    id: "worldbuilding",
    color: C.iris400,
    icon: "M12 2 L2 19 H22 Z M12 8 L7 17 H17 Z",
    label: { en: "World-Building Commissions", zh: "世界构建委托" },
    subtitle: { en: "Custom environments, narrative design, UX for virtual spaces", zh: "定制环境、叙事设计、虚拟空间用户体验" },
    size: {
      en: "Emerging category: game-adjacent design & architecture. Virtual architecture studios now take commissions for branded metaverse spaces.",
      zh: "新兴品类：游戏周边设计与建筑。虚拟建筑工作室现已接受品牌元宇宙空间委托。",
    },
    note: {
      en: "Craft that previously had no market (building imaginary architecture for fun) now has paying clients. Post-physical in the literal sense.",
      zh: "之前没有市场的技艺（纯兴趣建造想象建筑）如今有了付费客户。字面意义上的后物理经济。",
    },
    maturity: 0.42,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   WHO CAPTURES VALUE? — open questions
═══════════════════════════════════════════════════════════════════════════ */
interface OpenQuestion {
  q: { en: string; zh: string };
  note: { en: string; zh: string };
  color: string;
}

const QUESTIONS: OpenQuestion[] = [
  {
    q: {
      en: "Who owns a world you built on someone else's platform?",
      zh: "你在别人平台上建造的世界，归谁所有？",
    },
    note: {
      en: "Minecraft's EULA prohibits commercial servers; Roblox owns all UGC at the platform level. Creators hold a license, not property.",
      zh: "Minecraft用户协议禁止商业服务器；Roblox在平台层面拥有所有用户生成内容。创作者持有的是许可证，而非产权。",
    },
    color: C.plasm500,
  },
  {
    q: {
      en: "Is deletable digital property real property?",
      zh: "可被删除的数字财产是真正的财产吗？",
    },
    note: {
      en: "A platform sunset deletes your inventory. Blockchain-based ownership addresses this technically but not legally — and introduces liquidity risk.",
      zh: "平台关闭会删除你的所有物品。基于区块链的所有权从技术上解决了这个问题，但法律上尚未解决——同时引入了流动性风险。",
    },
    color: C.gold500,
  },
  {
    q: {
      en: "When experience is the product, does value flow to creator, platform, or attention itself?",
      zh: "当体验即产品时，价值流向创作者、平台，还是注意力本身？",
    },
    note: {
      en: "YouTube keeps ~45% of ad revenue. Roblox keeps ~75% of Robux. Attention is extracted via time — the most abundant resource creators have.",
      zh: "YouTube保留约45%的广告收入。Roblox保留约75%的Robux。注意力通过时间被提取——而时间是创作者最丰富的资源。",
    },
    color: C.iris500,
  },
  {
    q: {
      en: "Does digital scarcity require artificial enforcement — and is that sustainable?",
      zh: "数字稀缺性需要人为强制执行吗——这种模式可持续吗？",
    },
    note: {
      en: "Scarcity in physical economies is natural. In digital economies it is a policy choice enforced by DRM, platform rules, or smart contracts.",
      zh: "物理经济中的稀缺性是自然的。在数字经济中，稀缺性是通过DRM、平台规则或智能合约强制执行的政策选择。",
    },
    color: C.holo500,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function VirtualEconomy() {
  const { lang } = useLang();
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);

  /* ── state ─────────────────────────────────────────────────────────────── */
  const [physicalFrac, setPhysicalFrac] = useState(0.25);  // 0=experience, 1=physical
  const [selectedCat, setSelectedCat]   = useState(0);
  const [activeQ, setActiveQ]           = useState(0);

  /* ── canvas refs ────────────────────────────────────────────────────────── */
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const tRef         = useRef<number>(0);
  const particlesRef = useRef<FlowParticle[]>(buildParticles(28));
  const physRef      = useRef(physicalFrac);

  useEffect(() => { physRef.current = physicalFrac; }, [physicalFrac]);

  /* ── canvas animation loop ─────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width  = Math.floor(rect.width  * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    let last = 0;
    function tick(ts: number) {
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      tRef.current += dt;
      const t = tRef.current;

      // advance particles
      for (const p of particlesRef.current) {
        p.t += p.speed * dt;
        if (p.t > 1) {
          p.t -= 1;
          p.arc = (p.arc + 1) % 4;  // continue clockwise
        }
      }

      const rect = canvas!.getBoundingClientRect();
      drawFlow(ctx!, rect.width, rect.height, t, particlesRef.current, physRef.current);

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── node label overlay positions (as %) ──────────────────────────────── */
  // Positions match NODE_ANGLES: top, right, bottom, left
  // We use absolute positioning over the canvas container
  const nodeLabels: { en: string; zh: string; top: string; left: string; align: "center" | "left" | "right" }[] = [
    { en: "Creators", zh: "创作者",  top: "4%",  left: "50%", align: "center" },
    { en: "Digital\nGoods",  zh: "数字\n商品",  top: "46%", left: "92%", align: "left"   },
    { en: "Users",   zh: "用户",    top: "88%", left: "50%", align: "center" },
    { en: "Platforms",zh: "平台",   top: "46%", left: "2%",  align: "right"  },
  ];

  const arcLabels: { en: string; zh: string; top: string; left: string }[] = [
    { en: "create & publish",    zh: "创作·发布",   top: "14%", left: "72%" },
    { en: "attention + spend",   zh: "注意力+消费", top: "70%", left: "74%" },
    { en: "platform fees",       zh: "平台费用",    top: "70%", left: "18%" },
    { en: "revenue share",       zh: "收益分成",    top: "14%", left: "14%" },
  ];

  const cat = CATEGORIES[selectedCat];
  const q   = QUESTIONS[activeQ];

  return (
    <div className="w-full space-y-8">
      {/* ── header ──────────────────────────────────────────────────────────── */}
      <div>
        <p className="label-mono mb-1" style={{ color: C.holo500 }}>
          {L("System 07 · Virtual Economies", "系统 07 · 虚拟经济")}
        </p>
        <h3 className={`display text-2xl md:text-3xl leading-tight mb-2 spark-text ${lang === "zh" ? "zh" : ""}`}>
          {L("Post-Physical Labor & Digital Value", "后物理劳动与数字价值")}
        </h3>
        <p className={`text-sm max-w-2xl leading-relaxed mb-3 ${lang === "zh" ? "zh" : ""}`}
           style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}>
          {L(
            "Value doesn't require atoms. As economies shift from producing things to producing experiences, the circular flow of money, attention, and creative labor rewires itself around digital worlds — some of this is decades-old and durable, some is speculative fever.",
            "价值不需要原子。随着经济从生产物品转向生产体验，货币、注意力与创意劳动的循环流动正在围绕数字世界重新布线——其中一些已有数十年历史且经久耐用，一些则是投机热潮。"
          )}
        </p>
        <div className="rule-flux h-px rounded" />
      </div>

      {/* ── two-column: canvas + slider/composition ─────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_260px] gap-6 items-start">

        {/* ── circular flow canvas ──────────────────────────────────────────── */}
        <div
          className="relative rounded-xl overflow-hidden border"
          style={{
            background: C.void900,
            borderColor: `rgba(77,155,255,0.14)`,
            boxShadow: `0 0 60px -20px rgba(34,211,238,0.2)`,
          }}
        >
          <canvas
            ref={canvasRef}
            className="block w-full"
            style={{ aspectRatio: "16/9", minHeight: 220 }}
            aria-label={L("Virtual economy circular flow diagram", "虚拟经济循环流动图")}
          />

          {/* Node labels */}
          {nodeLabels.map((nl, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                top: nl.top,
                left: nl.left,
                transform: nl.align === "center"
                  ? "translateX(-50%)"
                  : nl.align === "right"
                  ? "translateX(-100%)"
                  : "none",
              }}
            >
              <span
                className={`font-mono text-[0.6rem] font-bold tracking-widest uppercase whitespace-pre-line leading-tight block text-${nl.align} ${lang === "zh" ? "zh" : ""}`}
                style={{ color: NODE_COLORS[i] }}
              >
                {nl[lang === "zh" ? "zh" : "en"]}
              </span>
            </div>
          ))}

          {/* Arc labels */}
          {arcLabels.map((al, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{ top: al.top, left: al.left, transform: "translateX(-50%)" }}
            >
              <span
                className={`font-mono text-[0.52rem] tracking-wide opacity-60 whitespace-nowrap ${lang === "zh" ? "zh" : ""}`}
                style={{ color: ARC_COLORS[i] }}
              >
                {al[lang === "zh" ? "zh" : "en"]}
              </span>
            </div>
          ))}

          {/* Flow legend strip */}
          <div className="absolute bottom-2 left-2 flex gap-2 flex-wrap">
            {[
              { color: C.holo500, en: "creative output", zh: "创作输出" },
              { color: C.flux500, en: "consumption",     zh: "消费" },
              { color: C.gold500, en: "spend / fees",    zh: "消费/费用" },
              { color: C.iris500, en: "payouts",         zh: "收益" },
            ].map((fl, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: fl.color }} />
                <span className={`font-mono text-[0.52rem] ${lang === "zh" ? "zh" : ""}`} style={{ color: fl.color + "aa" }}>
                  {fl[lang === "zh" ? "zh" : "en"]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── right controls ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* composition slider */}
          <div className="panel rounded-xl p-5 space-y-4">
            <p className="label-mono" style={{ color: C.holo400 }}>
              {L("Economy Composition", "经济构成")}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-[0.62rem] font-mono">
                <span style={{ color: C.iris400 }}>
                  {L("Experience", "体验")}
                </span>
                <span style={{ color: C.gold400 }}>
                  {L("Physical", "实体")}
                </span>
              </div>
              <input
                type="range" min={0} max={100} step={1}
                value={Math.round(physicalFrac * 100)}
                onChange={(e) => setPhysicalFrac(parseInt(e.target.value) / 100)}
                className="w-full h-1.5 rounded"
                style={{
                  accentColor: physicalFrac > 0.5 ? C.gold500 : C.iris500,
                  background: `linear-gradient(90deg, ${C.iris500} 0%, ${C.flux500} 50%, ${C.gold500} 100%)`,
                }}
                aria-label={L("Physical vs experience economy slider", "实体与体验经济滑块")}
              />
              <div className="flex justify-between text-[0.58rem] font-mono text-ink-500">
                <span>0%</span>
                <span>{Math.round(physicalFrac * 100)}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* composition bars */}
            <div className="space-y-1.5">
              {[
                { label: L("Services & experience", "服务与体验"), frac: 1 - physicalFrac,     color: C.iris500 },
                { label: L("Digital goods",          "数字商品"),   frac: (1 - physicalFrac) * 0.6, color: C.holo500 },
                { label: L("Physical goods",         "实体商品"),   frac: physicalFrac,        color: C.gold500 },
                { label: L("Manufacturing",          "制造业"),     frac: physicalFrac * 0.7,  color: C.flux500 },
              ].map((bar) => (
                <div key={bar.label} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className={`text-[0.6rem] font-mono text-ink-500 ${lang === "zh" ? "zh" : ""}`}>{bar.label}</span>
                    <span className="text-[0.6rem] font-mono" style={{ color: bar.color }}>{Math.round(bar.frac * 100)}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-void-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${bar.frac * 100}%`,
                        background: `linear-gradient(90deg, ${bar.color}88, ${bar.color})`,
                        boxShadow: `0 0 6px ${bar.color}66`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className={`text-[0.65rem] leading-relaxed text-ink-500 ${lang === "zh" ? "zh" : ""}`}
               style={{ fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}>
              {physicalFrac < 0.35
                ? L(
                    "At the experience pole: labor produces no atoms — code, narrative, performance, attention design.",
                    "偏向体验端：劳动不产生任何原子——代码、叙事、表演、注意力设计。"
                  )
                : physicalFrac > 0.65
                ? L(
                    "At the physical pole: value is in material, logistics, manufacturing skill.",
                    "偏向实体端：价值在于材料、物流与制造技能。"
                  )
                : L(
                    "The real 2024 economy: services dominate GDP in wealthy nations; digital goods are a fast-growing layer on top.",
                    "真实的2024年经济：服务主导富裕国家GDP；数字商品是快速增长的叠加层。"
                  )
              }
            </p>
          </div>

          {/* platform capture rates */}
          <div className="panel panel-gold rounded-xl p-4 space-y-3">
            <p className="label-mono" style={{ color: C.gold400 }}>
              {L("Platform Take Rates", "平台抽成比例")}
            </p>
            {[
              { name: "Steam",    rate: 30, color: C.flux500 },
              { name: "Apple App Store", rate: 30, color: C.iris500 },
              { name: "Roblox",   rate: 75, color: C.plasm500 },
              { name: "YouTube",  rate: 45, color: C.gold500 },
              { name: "Substack", rate: 10, color: C.holo500 },
            ].map((p) => (
              <div key={p.name} className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="font-mono text-[0.62rem] text-ink-300">{p.name}</span>
                  <span className="font-mono text-[0.62rem]" style={{ color: p.color }}>{p.rate}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: `${p.color}18` }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${p.rate}%`,
                      background: p.color,
                      boxShadow: `0 0 4px ${p.color}`,
                    }}
                  />
                </div>
              </div>
            ))}
            <p className={`text-[0.62rem] text-ink-500 leading-relaxed ${lang === "zh" ? "zh" : ""}`}>
              {L(
                "Platform take rates are the hidden gravity of virtual economies.",
                "平台抽成是虚拟经济的隐性引力。"
              )}
            </p>
          </div>

        </div>
      </div>

      {/* ── virtual value categories ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <p className="label-mono" style={{ color: C.flux400 }}>
          {L("Categories of Virtual Value", "虚拟价值类别")}
        </p>

        {/* category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(i)}
              className="px-3 py-1.5 rounded-lg font-mono text-[0.62rem] tracking-wide border transition-all duration-200"
              style={{
                borderColor: selectedCat === i ? cat.color : `${cat.color}30`,
                background:  selectedCat === i ? `${cat.color}18` : "transparent",
                color:       selectedCat === i ? cat.color : C.ink500,
                boxShadow:   selectedCat === i ? `0 0 14px -4px ${cat.color}66` : undefined,
              }}
            >
              <span className={lang === "zh" ? "zh" : ""}>{cat.label[lang === "zh" ? "zh" : "en"]}</span>
            </button>
          ))}
        </div>

        {/* selected category detail */}
        <div
          key={cat.id + lang}
          className="panel rounded-xl p-5 grid md:grid-cols-[1fr_1fr] gap-5 rise-in"
          style={{
            borderColor: `${cat.color}30`,
            boxShadow: `0 0 44px -18px ${cat.color}44`,
          }}
        >
          {/* left: overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg
                viewBox="0 0 24 24" width="24" height="24" fill="none"
                stroke={cat.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={cat.icon} />
              </svg>
              <h4 className={`display text-lg leading-tight ${lang === "zh" ? "zh" : ""}`}
                  style={{ color: cat.color }}>
                {cat.label[lang === "zh" ? "zh" : "en"]}
              </h4>
            </div>
            <p className={`text-[0.73rem] text-ink-300 leading-relaxed ${lang === "zh" ? "zh" : ""}`}>
              {cat.subtitle[lang === "zh" ? "zh" : "en"]}
            </p>

            {/* maturity bar */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-mono text-[0.58rem] tracking-widest uppercase text-ink-500">
                  {L("Market Maturity", "市场成熟度")}
                </span>
                <span className="font-mono text-[0.6rem]" style={{ color: cat.color }}>
                  {Math.round(cat.maturity * 100)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${cat.color}18` }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${cat.maturity * 100}%`,
                    background: `linear-gradient(90deg, ${cat.color}77, ${cat.color})`,
                    boxShadow: `0 0 6px ${cat.color}66`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[0.55rem] font-mono text-ink-500">
                <span>{L("Nascent", "初兴")}</span>
                <span>{L("Mature / Durable", "成熟/持久")}</span>
              </div>
            </div>
          </div>

          {/* right: market grounding + note */}
          <div className="space-y-3">
            <div
              className="rounded-lg p-3 space-y-1"
              style={{ background: `${cat.color}0d`, border: `1px solid ${cat.color}22` }}
            >
              <p className="font-mono text-[0.58rem] tracking-widest uppercase" style={{ color: `${cat.color}88` }}>
                {L("Real-World Grounding", "现实世界锚定")}
              </p>
              <p className={`text-[0.7rem] leading-relaxed text-ink-300 ${lang === "zh" ? "zh" : ""}`}>
                {cat.size[lang === "zh" ? "zh" : "en"]}
              </p>
            </div>
            <div
              className="rounded-lg p-3 space-y-1"
              style={{
                background: cat.id === "land" ? "rgba(255,77,157,0.07)" : `${cat.color}07`,
                border: `1px solid ${cat.id === "land" ? "rgba(255,77,157,0.25)" : `${cat.color}18`}`,
              }}
            >
              <p className="font-mono text-[0.58rem] tracking-widest uppercase"
                 style={{ color: cat.id === "land" ? C.plasm500 + "88" : `${cat.color}66` }}>
                {L("Analyst Note", "分析注记")}
              </p>
              <p className={`text-[0.68rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}
                 style={{ color: cat.id === "land" ? "#e07090" : C.ink300 }}>
                {cat.note[lang === "zh" ? "zh" : "en"]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── who captures the value? ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="label-mono" style={{ color: C.plasm500 }}>
            {L("Who Captures the Value?", "价值被谁捕获？")}
          </p>
          <span className="text-[0.62rem] font-mono text-ink-500">
            {L("— open questions —", "— 开放问题 —")}
          </span>
        </div>

        {/* question navigator */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* active question */}
          <div
            key={`q-${activeQ}-${lang}`}
            className="panel panel-plasm rounded-xl p-5 space-y-3 rise-in"
            style={{
              borderColor: `${q.color}30`,
              boxShadow: `0 0 32px -12px ${q.color}44`,
            }}
          >
            <div className="flex items-start gap-2">
              <span style={{ color: q.color, fontSize: "1.1rem", lineHeight: 1, flexShrink: 0 }}>◈</span>
              <p className={`text-[0.82rem] font-medium leading-snug ${lang === "zh" ? "zh" : "display"}`}
                 style={{ color: q.color }}>
                {q.q[lang === "zh" ? "zh" : "en"]}
              </p>
            </div>
            <p className={`text-[0.7rem] leading-relaxed text-ink-400 ${lang === "zh" ? "zh" : ""}`}
               style={{ fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}>
              {q.note[lang === "zh" ? "zh" : "en"]}
            </p>
            {/* dot nav */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setActiveQ((i) => (i - 1 + QUESTIONS.length) % QUESTIONS.length)}
                className="w-6 h-6 flex items-center justify-center rounded-full border transition"
                style={{ borderColor: `${q.color}44`, color: C.ink500 }}
                aria-label={L("Previous question", "上一个问题")}
              >‹</button>
              <div className="flex gap-1.5">
                {QUESTIONS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveQ(i)}
                    className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{
                      background: i === activeQ ? q.color : `${q.color}30`,
                      transform: i === activeQ ? "scale(1.35)" : "scale(1)",
                    }}
                    aria-label={`Question ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveQ((i) => (i + 1) % QUESTIONS.length)}
                className="w-6 h-6 flex items-center justify-center rounded-full border transition"
                style={{ borderColor: `${q.color}44`, color: C.ink500 }}
                aria-label={L("Next question", "下一个问题")}
              >›</button>
            </div>
          </div>

          {/* structural tension card */}
          <div className="panel rounded-xl p-5 space-y-3">
            <p className="label-mono" style={{ color: C.holo400 }}>
              {L("The Structural Tension", "结构性张力")}
            </p>
            <p className={`text-[0.72rem] leading-relaxed text-ink-400 ${lang === "zh" ? "zh" : ""}`}
               style={{ fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}>
              {L(
                "In a physical economy, value roughly tracks material scarcity: rare inputs, skilled fabrication, logistics. In a virtual economy, the inputs are attention and imagination — neither scarce by nature. Scarcity is a policy enforced by platform architectures.",
                "在实体经济中，价值大致跟随物质稀缺性：稀有原料、熟练制造、物流。在虚拟经济中，投入是注意力与想象力——两者本质上都不稀缺。稀缺性是平台架构强制执行的政策。"
              )}
            </p>
            <div className="space-y-2">
              {[
                { en: "Creator invests labor",     zh: "创作者投入劳动",     color: C.holo500 },
                { en: "Platform owns distribution", zh: "平台控制分发",      color: C.iris500 },
                { en: "User pays for access",       zh: "用户为访问付费",    color: C.gold500 },
                { en: "Attention → captured as data", zh: "注意力→数据变现", color: C.flux500 },
              ].map((item) => (
                <div key={item.en} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className={`text-[0.68rem] text-ink-400 ${lang === "zh" ? "zh" : ""}`}>
                    {item[lang === "zh" ? "zh" : "en"]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── closing grounded observation ───────────────────────────────────── */}
      <div
        className="rounded-xl px-5 py-4 flex gap-3"
        style={{
          background: "rgba(34,211,238,0.04)",
          border: "1px solid rgba(34,211,238,0.12)",
        }}
      >
        <span style={{ color: C.holo500, fontSize: "0.9rem", flexShrink: 0, lineHeight: 1.4 }}>◇</span>
        <p className={`text-[0.73rem] leading-relaxed text-ink-400 ${lang === "zh" ? "zh" : ""}`}
           style={{ fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}>
          {L(
            "The durable finding isn't that virtual economies are new — they've existed since shareware in the 1980s — but that the share of economic output composed of intangibles keeps rising, and that the largest platforms in the world (by market cap) produce no physical product whatsoever. The interesting questions are distributional: when creative labor is infinitely copyable and reach depends entirely on algorithm, where does bargaining power live?",
            "持久的发现不是虚拟经济是新事物——它自1980年代的共享软件起便已存在——而是由无形资产构成的经济产出份额持续上升，且世界市值最大的平台（按市值排名）完全不生产任何实体产品。有趣的问题在于分配：当创意劳动可无限复制，触达完全依赖算法时，议价能力究竟在哪里？"
          )}
        </p>
      </div>
    </div>
  );
}
