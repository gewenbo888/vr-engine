"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "./lang";

/* ─── types ──────────────────────────────────────────────────── */
interface Milestone {
  year: { en: string; zh: string };
  title: { en: string; zh: string };
  leap: { en: string; zh: string };
  detail: { en: string; zh: string };
  era: { en: string; zh: string };
  color: string;
  glyph: string;
  speculative?: boolean;
}

/* ─── helpers ─────────────────────────────────────────────────── */
function L(lang: "en" | "zh", en: string, zh: string): string {
  return lang === "zh" ? zh : en;
}

/* ─── milestone data ──────────────────────────────────────────── */
const MILESTONES: Milestone[] = [
  {
    year: { en: "~40,000 BCE", zh: "约4万年前" },
    title: { en: "Cave Paintings", zh: "洞穴壁画" },
    leap: {
      en: "First transporting images — a world beyond the immediate",
      zh: "首批可令人沉浸其中的图像——超越眼前现实的世界",
    },
    era: { en: "Prehistoric", zh: "史前" },
    detail: {
      en: "Chauvet, Altamira, Lascaux: ochre bison and flickering firelight create the first deliberate illusion of another world. By exploiting the rock's natural contours, painters gave their beasts volume and motion. A viewer crouching in a narrow passage felt not just 'pictures' but presence — the ancient meaning of immersion: a world wrapping around you.",
      zh: "肖维、阿尔塔米拉、拉斯科：赭石野牛在跳动的火光中化为生灵，这是人类第一次有意制造'异世界'的幻象。画师借助岩壁天然轮廓赋予兽形体积与动感。弓身穿过窄道的观者感受到的不只是图画，而是临场感——沉浸的古老含义：一个将你包裹其中的世界。",
    },
    color: "#67e8f9",
    glyph: "◎",
  },
  {
    year: { en: "5th–4th c. BCE", zh: "公元前5—4世纪" },
    title: { en: "Greek Theatre & Panorama", zh: "希腊剧场与全景画" },
    leap: {
      en: "Architecture designed to envelop — acoustic and visual surround",
      zh: "建筑本身成为包围感的设计——视听全景环绕",
    },
    era: { en: "Ancient", zh: "古代" },
    detail: {
      en: "The Greek theatre at Epidaurus (c. 350 BCE) seats 14,000 in a near-perfect semicircle tuned for unamplified voice. The stage, masks, chorus, and shared darkness collude to overwhelm individual consciousness with collective narrative. Two millennia later Robert Barker's 1787 panorama painting coined the word 'panorama' — a 360° painting wrapping the viewer inside the scene: immersion as deliberate visual architecture.",
      zh: "埃皮达鲁斯希腊剧场（约公元前350年）可容纳1.4万人，近乎完美的半圆形设计专为无扩音人声调制。舞台、面具、合唱队与共享的黑暗合谋，以集体叙事淹没个体意识。两千年后，罗伯特·巴克1787年的全景画创造了'panorama'一词——360°画布将观者包裹于场景之内：沉浸成为有意为之的视觉建筑。",
    },
    color: "#67e8f9",
    glyph: "◉",
  },
  {
    year: { en: "15th–19th c.", zh: "15—19世纪" },
    title: { en: "The Novel", zh: "小说" },
    leap: {
      en: "A world built entirely inside the silent inner voice",
      zh: "一个完全在无声内心独白中建构的世界",
    },
    era: { en: "Early modern", zh: "近代早期" },
    detail: {
      en: "Print fiction — from Cervantes's Don Quixote (1605) to the 19th-century realist novel — discovered that the most complete immersion needed no physical apparatus at all. Readers reported losing track of time, mistaking characters for acquaintances, grieving fictional deaths. The novel's trick: direct sensory absence plus linguistic density forces the mind to simulate the world from scratch, producing an experience indistinguishable from vivid memory. Every VR headset that followed is chasing this.",
      zh: "印刷小说——从塞万提斯的《堂吉诃德》（1605年）到19世纪现实主义长篇——发现最完整的沉浸根本不需要任何物理装置。读者报告忘记时间流逝，误将虚构人物当作故交，为小说中的死亡而哀恸。小说的魔法：完全的感官缺席加上语言密度，迫使大脑从零开始模拟世界，产生与鲜活记忆无从区分的体验。此后所有VR头显，不过是在追赶这一效果。",
    },
    color: "#4d9bff",
    glyph: "◈",
  },
  {
    year: { en: "1838", zh: "1838年" },
    title: { en: "Stereoscope", zh: "立体镜" },
    leap: {
      en: "First optical illusion of depth — two flat images fused into one solid world",
      zh: "首次光学深度幻象——两幅平面图像融合为一个立体世界",
    },
    era: { en: "Industrial", zh: "工业时代" },
    detail: {
      en: "Charles Wheatstone's reflecting stereoscope (1838) and David Brewster's popular lenticular version (1849) exploited binocular disparity: feed each eye a slightly offset image and the brain constructs depth that is not physically there. By the 1860s, stereoscope cards of distant lands were mass entertainment. The principle — delivering separate images to separate eyes — is identical to every VR headset built since.",
      zh: "查尔斯·惠斯通的反射式立体镜（1838年）与大卫·布鲁斯特的大众透镜版本（1849年）利用双目视差：向每只眼睛输送略有偏移的图像，大脑便会构建出现实中并不存在的深度感。至19世纪60年代，异域风情的立体镜卡片成为大众娱乐。这一原理——向两眼分别输送独立图像——与此后所有VR头显完全相同。",
    },
    color: "#4d9bff",
    glyph: "◆",
  },
  {
    year: { en: "1895", zh: "1895年" },
    title: { en: "Cinema", zh: "电影" },
    leap: {
      en: "Moving, darkened, collective illusion — 24 frames/sec of continuous presence",
      zh: "运动的、黑暗的、集体的幻象——每秒24帧的持续临场感",
    },
    era: { en: "Industrial", zh: "工业时代" },
    detail: {
      en: "The Lumière brothers' first public screening (Paris, 28 Dec 1895) made audiences duck for an arriving train. Cinema added motion, temporal continuity, and a darkened social space engineered for suspension of disbelief. Montage, close-up, and surround sound (arriving across the next century) each tightened the envelope. Cinema proved that the nervous system can be hijacked into feeling physically present in a filmed space — the first mass-deployed immersive technology.",
      zh: "卢米埃尔兄弟的首次公开放映（巴黎，1895年12月28日）令观众为驶来的火车而侧身躲避。电影叠加了运动感、时间连续性与专为暂停怀疑而设计的黑暗社会空间。蒙太奇、特写与环绕声（在此后一个世纪陆续到来）逐步收紧这层包裹。电影证明：神经系统可以被劫持，令人感受到真实置身于银幕空间之中——这是第一种大规模部署的沉浸式技术。",
    },
    color: "#a855f7",
    glyph: "◉",
  },
  {
    year: { en: "1962", zh: "1962年" },
    title: { en: "Sensorama", zh: "感觉全景仪" },
    leap: {
      en: "Morton Heilig's multisensory arcade booth — smell, wind, vibration added to film",
      zh: "莫顿·海利格的多感官街机舱——气味、风感与振动叠加于电影之上",
    },
    era: { en: "Analogue VR", zh: "模拟VR时代" },
    detail: {
      en: "Morton Heilig, a filmmaker obsessed with 'the cinema of the future,' built the Sensorama in 1962 — a coin-operated, single-viewer arcade cabinet that played stereoscopic 3D film while blowing wind, emitting scents, vibrating the seat, and playing binaural audio. Riders could take a Brooklyn motorcycle ride, complete with exhaust fumes. Heilig patented a 'Telesphere Mask' the same year — a head-mounted display concept. No studio funded it. He had named the destination 50 years early.",
      zh: "痴迷于'未来电影'的电影人莫顿·海利格于1962年制造了感觉全景仪——一台投币单人街机舱，在播放立体3D影片的同时送来气流、释放气味、振动座椅并播放双耳音频。乘坐者可以体验布鲁克林摩托车之旅，包括尾气气味。海利格同年申请了'Telesphere Mask'专利——一个头戴显示器概念。没有制片公司为他投资。他提前50年命名了这个目的地。",
    },
    color: "#a855f7",
    glyph: "◈",
  },
  {
    year: { en: "1968", zh: "1968年" },
    title: { en: "The Sword of Damocles", zh: "达摩克利斯之剑" },
    leap: {
      en: "Ivan Sutherland's first head-mounted display — real-time computer graphics tracking head motion",
      zh: "伊万·萨瑟兰的首台头戴显示器——实时计算机图形跟踪头部运动",
    },
    era: { en: "Analogue VR", zh: "模拟VR时代" },
    detail: {
      en: "Ivan Sutherland and his student Bob Sproull at Harvard/MIT built the first true HMD in 1968 — so heavy it had to be suspended from the ceiling (earning the nickname 'Sword of Damocles'). It tracked head orientation and rendered a simple wireframe room whose perspective updated as the wearer moved. The principle was complete: the display must know where the eyes are pointing. This 56-year-old machine is the direct ancestor of every headset worn today.",
      zh: "伊万·萨瑟兰与其学生鲍勃·斯普劳尔在哈佛/麻省理工于1968年制造了首台真正的头戴显示器——重量过大须悬挂于天花板（因而得名'达摩克利斯之剑'）。它追踪头部朝向并渲染一个简单的线框房间，透视随佩戴者移动实时更新。核心原理已然完备：显示系统必须知道眼睛指向何处。这台56年历史的机器是今天所有头显的直系祖先。",
    },
    color: "#22d3ee",
    glyph: "◆",
  },
  {
    year: { en: "1987", zh: "1987年" },
    title: { en: "VPL Research — “Virtual Reality” Coined", zh: "VPL研究公司——“虚拟现实”命名" },
    leap: {
      en: "Jaron Lanier names, brands, and builds the first commercial VR ecosystem",
      zh: "杰伦·拉尼尔命名、品牌化并构建了首个商业VR生态系统",
    },
    era: { en: "Early VR", zh: "早期VR" },
    detail: {
      en: "Jaron Lanier founded VPL Research and popularised the term 'virtual reality' around 1987. VPL produced the DataGlove (gesture input), the EyePhone HMD, and the DataSuit — a full-body tracking outfit. For the first time, users could look down and see virtual hands responding to their own. VPL's work established the vocabulary still used: presence, embodiment, avatar, cyberspace. The company collapsed in 1990 but had sketched the complete map.",
      zh: "杰伦·拉尼尔于1987年前后创立VPL研究公司并普及了'虚拟现实'这一术语。VPL生产了DataGlove（手势输入）、EyePhone头显与DataSuit——一套全身追踪服。用户首次可以低头看到虚拟双手随自身动作响应。VPL奠定了沿用至今的词汇：临场感、具身性、化身、赛博空间。公司于1990年倒闭，但已勾勒出完整的地图。",
    },
    color: "#22d3ee",
    glyph: "◉",
  },
  {
    year: { en: "1991–1998", zh: "1991—1998年" },
    title: { en: "1990s Arcade VR & the Crash", zh: "1990年代街机VR与泡沫破裂" },
    leap: {
      en: "First public hype cycle — then the 'VR Winter' as hardware failed to deliver",
      zh: "首次公众炒作周期——随后因硬件无法兑现而进入'VR寒冬'",
    },
    era: { en: "Early VR", zh: "早期VR" },
    detail: {
      en: "Virtuality Group's arcade pods, Sega VR, and Nintendo's Virtual Boy (1995) brought VR to malls and living rooms — and immediately disappointed. Screens were low-resolution, tracking was laggy, frame rates were nauseating, and headsets weighed a kilogram. The 'VR winter' from ~1995–2011 saw investment dry up and the term become a punchline. The lesson was quietly noted: presence requires sub-20ms latency, wide FOV, and 60+ FPS. The hardware didn't exist yet.",
      zh: "Virtuality Group的街机舱、世嘉VR与任天堂Virtual Boy（1995年）将VR带入商场与客厅——并立即令人失望。屏幕分辨率低、追踪延迟高、帧率低下令人晕眩、头显重达一公斤。约1995—2011年的'VR寒冬'中投资枯竭，这一词汇沦为笑柄。教训被悄然记录：临场感需要低于20毫秒的延迟、宽广的视场角与60帧以上的帧率。那时的硬件尚不存在。",
    },
    color: "#93c5ff",
    glyph: "◈",
  },
  {
    year: { en: "2000s", zh: "2000年代" },
    title: { en: "MMOs & Persistent Worlds", zh: "大型多人游戏与持久世界" },
    leap: {
      en: "Millions inhabit shared digital spaces with social identity — presence without hardware",
      zh: "数百万人在共享数字空间中拥有社会身份——无需硬件的临场感",
    },
    era: { en: "Digital worlds", zh: "数字世界" },
    detail: {
      en: "World of Warcraft (2004), Second Life (2003), and later Minecraft (2011) proved that screen-flat 2D or 3D environments could generate profound immersion through social continuity and persistent consequence. Players wept for guild-mates they had never met in person, spent real money on virtual land, and maintained second identities across years. Immersion turned out to require less fidelity than feared — what it required was stakes, community, and permanence.",
      zh: "《魔兽世界》（2004年）、《第二人生》（2003年）及后来的《我的世界》（2011年）证明：即便是屏幕上的平面或3D环境，也能通过社会连续性与持久后果产生深刻的沉浸感。玩家为从未谋面的公会成员哭泣，用真实货币购买虚拟土地，并跨越数年维持第二身份。沉浸所需的保真度远低于预期——它真正需要的是利益关系、社群与持久性。",
    },
    color: "#93c5ff",
    glyph: "◉",
  },
  {
    year: { en: "2012 / 2016", zh: "2012年／2016年" },
    title: { en: "Oculus Rift", zh: "Oculus Rift" },
    leap: {
      en: "The modern VR revival — consumer head-tracking HMD at under $2,000",
      zh: "现代VR复兴——低于2000美元的消费级头部追踪头显",
    },
    era: { en: "Modern VR", zh: "现代VR" },
    detail: {
      en: "Palmer Luckey's Oculus Rift DK1 Kickstarter (August 2012, $2.4M raised) used a single high-refresh smartphone display, custom lenses, and IMU head-tracking to achieve the <20ms latency that 1990s hardware could not. The 2016 consumer launch paired with Valve's SteamVR and the HTC Vive demonstrated room-scale tracking. Facebook's $2B acquisition (2014) signalled that the technology had crossed a credibility threshold. The arc from Sutherland's ceiling-hung prototype to Rift took 44 years.",
      zh: "帕尔默·拉基的Oculus Rift DK1 Kickstarter众筹（2012年8月，募得240万美元）以单块高刷新率智能手机屏幕、定制镜片与IMU头部追踪实现了1990年代硬件无法达到的20毫秒以下延迟。2016年消费者版本与Valve SteamVR及HTC Vive联合演示了房间尺度追踪。Facebook以20亿美元收购（2014年）标志着这项技术越过了可信度门槛。从萨瑟兰悬挂于天花板的原型到Rift，历经44年。",
    },
    color: "#f5c24d",
    glyph: "◆",
  },
  {
    year: { en: "2019 +", zh: "2019年起" },
    title: { en: "Meta Quest — Standalone VR", zh: "Meta Quest——独立式VR" },
    leap: {
      en: "Untethered, mass-market — VR without a PC or wires in the floor",
      zh: "无线、大众市场——无需PC与地面线缆的VR",
    },
    era: { en: "Modern VR", zh: "现代VR" },
    detail: {
      en: "Meta Quest (Oculus Quest 1, 2019) moved all compute inside the headset, eliminating the external sensor towers and PC tether that restricted earlier systems. Inside-out tracking via four wide-angle cameras mapped the room without markers. Quest 2 (2020) sold an estimated 15 million units at $299 — the first VR headset to achieve console-scale adoption. The friction barrier dropped from 'requires a $1,500 gaming PC' to 'charge and put it on.' Distribution follows friction.",
      zh: "Meta Quest（Oculus Quest 1，2019年）将所有计算集成于头显内部，消除了限制早期系统的外部传感器塔与PC连线。四摄像头由内向外追踪无需标记物即可完成房间建图。Quest 2（2020年）以299美元的售价销售约1500万台——首款实现主机级普及的VR头显。摩擦门槛从'需要一台1500美元游戏PC'降低为'充电后戴上即用'。普及永远跟随摩擦力的降低。",
    },
    color: "#f5c24d",
    glyph: "◉",
  },
  {
    year: { en: "2024", zh: "2024年" },
    title: { en: "Apple Vision Pro — Spatial Computing", zh: "Apple Vision Pro——空间计算" },
    leap: {
      en: "Passthrough mixed reality — the digital and physical superimposed at retina resolution",
      zh: "透视混合现实——数字与物理世界以视网膜分辨率叠加",
    },
    era: { en: "Spatial computing", zh: "空间计算" },
    detail: {
      en: "Apple Vision Pro (February 2024) introduced high-fidelity video passthrough — the outside world streamed through cameras at sub-millisecond latency and reprojected at 23 megapixels per eye, making virtual objects feel co-present with physical ones. Eye, hand, and voice replaced controllers. The $3,499 price placed it at the developer/prosumer tier, but the interaction model — spatial computing rather than VR isolation — proposed a different thesis: immersion as layering rather than replacement. The next step of the Sensorama's arc.",
      zh: "Apple Vision Pro（2024年2月）引入了高保真视频透视——外部世界以低于毫秒的延迟通过摄像头采集，以每眼2300万像素重投影，使虚拟物体与物理物体感觉共存于同一空间。眼动、手势与语音取代了手柄。3499美元的定价将其定位于开发者/专业消费者层级，但其交互范式——空间计算而非VR隔离——提出了不同的命题：沉浸是叠加而非替换。这是感觉全景仪弧线的下一个节点。",
    },
    color: "#ffd97a",
    glyph: "◈",
  },
  {
    year: { en: "? — Future", zh: "？——未来" },
    title: { en: "Full-Dive / Neural VR", zh: "全沉浸神经VR" },
    leap: {
      en: "SPECULATIVE — Direct neural stimulation bypasses all peripherals; the constructed world is indistinguishable from lived reality",
      zh: "推测性——直接神经刺激绕过所有外设；构建的世界与真实生活无法区分",
    },
    era: { en: "Speculative", zh: "推测性" },
    detail: {
      en: "SPECULATIVE — This node is not history. The logical extrapolation of the immersion curve — each generation reducing the distance between a constructed world and a felt one — points toward interfaces that write directly to sensory cortex. Optogenetics, high-density cortical arrays, and non-invasive focused ultrasound are early probes. The philosophical threshold is not technical resolution but the question of consent, continuity, and what counts as 'real experience.' The cave painters were already there — they just used pigment instead of photons.",
      zh: "推测性内容——此节点并非历史。沉浸曲线的逻辑延伸——每一代都在缩小构建世界与体验世界之间的距离——指向直接向感觉皮层写入的接口。光遗传学、高密度皮层电极阵列与非侵入性聚焦超声是早期探针。哲学门槛并非技术分辨率，而是同意权、连续性以及何为'真实体验'的问题。洞穴画师们早已触及这个问题——他们只是用颜料代替了光子。",
    },
    color: "#ff4d9d",
    glyph: "◇",
    speculative: true,
  },
];

/* ─── NodeGlow ────────────────────────────────────────────────── */
function NodeGlow({
  color,
  active,
  speculative,
}: {
  color: string;
  active: boolean;
  speculative?: boolean;
}) {
  return (
    <div
      className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300"
      style={{
        background: active
          ? `radial-gradient(circle, ${color}30 0%, ${color}06 70%)`
          : "transparent",
        border: speculative
          ? `2px dashed ${color}`
          : `2px solid ${active ? color : color + "44"}`,
        boxShadow: active
          ? `0 0 20px 5px ${color}55, 0 0 44px 10px ${color}1a`
          : speculative
          ? `0 0 8px 1px ${color}33`
          : "none",
      }}
    >
      <div
        className="h-3 w-3 rounded-full transition-all duration-300"
        style={{
          background: speculative ? "transparent" : color,
          border: speculative ? `1.5px solid ${color}` : "none",
          opacity: active ? 1 : 0.5,
          boxShadow: active && !speculative ? `0 0 10px 4px ${color}88` : "none",
        }}
      />
      {active && (
        <div
          className="absolute inset-0 animate-ping rounded-full"
          style={{ border: `1px solid ${color}44`, animationDuration: "2s" }}
        />
      )}
    </div>
  );
}

/* ─── ConnectorLine ───────────────────────────────────────────── */
function ConnectorLine({
  color,
  nextColor,
  toSpeculative,
}: {
  color: string;
  nextColor: string;
  toSpeculative?: boolean;
}) {
  const gradId = `grad-${color.replace("#", "")}-${nextColor.replace("#", "")}`;
  return (
    <div className="flex flex-shrink-0 items-center" style={{ width: "44px" }}>
      <svg width="44" height="12" viewBox="0 0 44 12" fill="none">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={nextColor} />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="6"
          x2="44"
          y2="6"
          stroke={`url(#${gradId})`}
          strokeWidth="1.5"
          strokeDasharray={toSpeculative ? "4 5" : undefined}
          className={toSpeculative ? "" : "flow"}
        />
      </svg>
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────── */
export default function ImmersionTimeline() {
  const { lang } = useLang();
  const [active, setActive] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Scroll active node into view
  useEffect(() => {
    if (active === null || !trackRef.current) return;
    const nodes = trackRef.current.querySelectorAll("[data-node]");
    const el = nodes[active] as HTMLElement | undefined;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [active]);

  return (
    <section className="w-full">
      {/* ── header ── */}
      <div className="mb-8 text-center">
        <p className="label-mono mb-3">
          {L(lang, "The Long Immersion", "沉浸感的漫长历史")}
        </p>
        <h2 className="display text-2xl text-ink-50 md:text-3xl">
          {L(lang, "Immersion Timeline", "沉浸技术演化时间线")}
        </h2>
        <p className="mt-2 text-sm text-ink-500">
          {L(
            lang,
            "Each step reduced the distance between a constructed world and a felt one.",
            "每一步都在缩短构建的世界与感受到的世界之间的距离。"
          )}
        </p>
        <div className="rule-flux mx-auto mt-4 h-px w-24" />
      </div>

      {/* ── horizontal scrollable track ── */}
      <div
        ref={trackRef}
        className="scrollbar-thin overflow-x-auto pb-4"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        <div
          className="flex items-center"
          style={{ minWidth: "max-content", padding: "20px 32px" }}
        >
          {MILESTONES.map((m, i) => (
            <div key={i} className="flex items-center" data-node={i}>
              {/* node button */}
              <button
                onClick={() => setActive(active === i ? null : i)}
                className="flex flex-shrink-0 flex-col items-center gap-1.5 focus:outline-none"
                style={{ scrollSnapAlign: "center", width: "84px" }}
                aria-label={m.title[lang]}
                aria-pressed={active === i}
              >
                <NodeGlow color={m.color} active={active === i} speculative={m.speculative} />
                <span
                  className="text-center font-mono text-[0.47rem] uppercase leading-tight tracking-wider"
                  style={{ color: active === i ? m.color : "#6b7293", maxWidth: "76px" }}
                >
                  {m.year[lang]}
                </span>
                <span
                  className={`text-center text-[0.62rem] font-semibold leading-tight ${lang === "zh" ? "zh" : ""}`}
                  style={{
                    color: active === i ? m.color : "#a8add0",
                    maxWidth: "76px",
                    filter: active === i ? `drop-shadow(0 0 6px ${m.color}88)` : "none",
                  }}
                >
                  {m.title[lang]}
                </span>
              </button>

              {/* connector */}
              {i < MILESTONES.length - 1 && (
                <ConnectorLine
                  color={m.color}
                  nextColor={MILESTONES[i + 1].color}
                  toSpeculative={MILESTONES[i + 1].speculative}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── expanded detail card ── */}
      <div
        className={`transition-all duration-500 ${
          active !== null ? "mt-6 opacity-100" : "pointer-events-none mt-0 h-0 overflow-hidden opacity-0"
        }`}
      >
        {active !== null && (
          <div
            className="panel mx-auto max-w-2xl rounded-2xl p-6"
            style={{
              borderColor: MILESTONES[active].speculative
                ? `${MILESTONES[active].color}55`
                : `${MILESTONES[active].color}33`,
              boxShadow: `0 0 60px -20px ${MILESTONES[active].color}44`,
            }}
          >
            {/* speculative badge */}
            {MILESTONES[active].speculative && (
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1"
                style={{
                  borderColor: `${MILESTONES[active].color}55`,
                  background: `${MILESTONES[active].color}10`,
                }}
              >
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{ background: MILESTONES[active].color }}
                />
                <span
                  className="font-mono text-[0.58rem] uppercase tracking-widest"
                  style={{ color: MILESTONES[active].color }}
                >
                  {L(lang, "Speculative — not yet history", "推测性内容——尚非历史")}
                </span>
              </div>
            )}

            {/* year */}
            <div
              className="mb-1 font-mono text-[0.58rem] uppercase tracking-[0.2em]"
              style={{ color: MILESTONES[active].color }}
            >
              {MILESTONES[active].year[lang]}
            </div>

            {/* title */}
            <h3
              className={`display text-xl text-ink-50 md:text-2xl ${lang === "zh" ? "zh" : ""}`}
            >
              {MILESTONES[active].title[lang]}
            </h3>

            {/* leap one-liner */}
            <p
              className={`mt-2 text-sm font-medium ${lang === "zh" ? "zh" : ""}`}
              style={{ color: MILESTONES[active].color }}
            >
              {MILESTONES[active].leap[lang]}
            </p>

            {/* era badge */}
            <div
              className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5"
              style={{
                borderColor: `${MILESTONES[active].color}22`,
                background: `${MILESTONES[active].color}08`,
              }}
            >
              <span
                className="font-mono text-[0.52rem] uppercase tracking-widest"
                style={{ color: MILESTONES[active].color }}
              >
                {L(lang, "Era", "时代")}
              </span>
              <span
                className={`text-xs font-semibold ${lang === "zh" ? "zh" : ""}`}
                style={{ color: MILESTONES[active].color }}
              >
                {MILESTONES[active].era[lang]}
              </span>
            </div>

            {/* detail prose */}
            <p
              className={`mt-4 text-sm leading-relaxed text-ink-300 ${lang === "zh" ? "zh" : ""}`}
            >
              {MILESTONES[active].detail[lang]}
            </p>

            {/* milestone dot-nav + close */}
            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-1">
                {MILESTONES.map((ms, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActive(idx)}
                    className="h-1.5 rounded-full transition-all duration-200"
                    style={{
                      width: idx === active ? "24px" : "6px",
                      background:
                        idx === active
                          ? MILESTONES[active].color
                          : idx < active
                          ? `${MILESTONES[idx].color}55`
                          : "#141d44",
                    }}
                    aria-label={ms.title[lang]}
                  />
                ))}
              </div>
              <button
                onClick={() => setActive(null)}
                className="font-mono text-[0.58rem] uppercase tracking-wider text-ink-500 transition hover:text-ink-300"
              >
                {L(lang, "× close", "× 收起")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── legend ── */}
      <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {[
          { color: "#67e8f9", en: "Prehistoric / Ancient", zh: "史前／古代" },
          { color: "#4d9bff", en: "Early modern", zh: "近代早期" },
          { color: "#a855f7", en: "Analogue VR", zh: "模拟VR时代" },
          { color: "#22d3ee", en: "HMD pioneers", zh: "头显先驱" },
          { color: "#93c5ff", en: "Digital worlds", zh: "数字世界" },
          { color: "#f5c24d", en: "Modern VR revival", zh: "现代VR复兴" },
          { color: "#ffd97a", en: "Spatial computing", zh: "空间计算" },
        ].map(({ color, en, zh }) => (
          <div key={en} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
            />
            <span className="font-mono text-[0.58rem] uppercase tracking-wider text-ink-500">
              {L(lang, en, zh)}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ background: "transparent", border: "2px dashed #ff4d9d" }}
          />
          <span className="font-mono text-[0.58rem] uppercase tracking-wider text-ink-500">
            {L(lang, "Speculative", "推测性")}
          </span>
        </div>
      </div>
    </section>
  );
}
