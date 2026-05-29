"use client";

import { ReactNode } from "react";
import { LangProvider, LangToggle, T, useLang } from "./lang";
import { SECTIONS, PANELS } from "./content";
import VRField from "./VRField";
import ImmersionDial from "./ImmersionDial";
import ImmersionTimeline from "./ImmersionTimeline";
import PerceptionLab from "./PerceptionLab";
import ImmersionLadder from "./ImmersionLadder";
import SpatialStack from "./SpatialStack";
import FullDiveLab from "./FullDiveLab";
import WorldGenLab from "./WorldGenLab";
import AvatarLab from "./AvatarLab";
import VirtualEconomy from "./VirtualEconomy";
import SimulationLab from "./SimulationLab";
import VRAnalyst from "./VRAnalyst";
import ImmersionRadar from "./ImmersionRadar";
import RecursiveVREngine from "./RecursiveVREngine";

function ConceptPanels({ id }: { id: string }) {
  const { lang } = useLang();
  const set = PANELS[id];
  if (!set) return null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {set.map((c, i) => (
        <div key={i} className="panel rounded-xl p-5">
          <div key={lang} className={`display text-base text-holo-400 lang-fade ${lang === "zh" ? "zh" : ""}`}>{c.t[lang]}</div>
          <p key={`d-${lang}`} className={`mt-2 text-sm leading-relaxed text-ink-300 lang-fade ${lang === "zh" ? "zh" : ""}`}>{c.d[lang]}</p>
        </div>
      ))}
    </div>
  );
}

const VIS: Record<string, ReactNode> = {
  reality: <PerceptionLab />,
  history: <ImmersionLadder />,
  hardware: <SpatialStack />,
  fulldive: <FullDiveLab />,
  aiworlds: <WorldGenLab />,
  identity: <AvatarLab />,
  economy: <VirtualEconomy />,
  society: <ConceptPanels id="society" />,
  simulation: <SimulationLab />,
};

function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-ink-100/10 bg-void-950/80 px-5 py-3 backdrop-blur md:px-9">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-md border border-iris-500/30 bg-void-800">
          <svg viewBox="0 0 32 32" className="h-5 w-5">
            <rect x="4" y="11" width="24" height="11" rx="5.5" fill="none" stroke="#a855f7" strokeWidth="1.5" />
            <circle cx="11" cy="16.5" r="3" fill="none" stroke="#4d9bff" strokeWidth="1.3" />
            <circle cx="21" cy="16.5" r="3" fill="none" stroke="#22d3ee" strokeWidth="1.3" />
            <path d="M14.5 16.5 h3" stroke="#ff4d9d" strokeWidth="1.2" />
            <circle cx="11" cy="16.5" r="1" fill="#93c5ff" />
            <circle cx="21" cy="16.5" r="1" fill="#67e8f9" />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="display text-base text-ink-50">Virtual Reality Engine</div>
          <div className="zh text-[0.6rem] text-ink-500">虚拟现实引擎</div>
        </div>
      </div>
      <nav className="hidden gap-5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-500 lg:flex">
        <a href="#dial" className="hover:text-holo-400">Dial</a>
        <a href="#fulldive" className="hover:text-holo-400">Full-Dive</a>
        <a href="#aiworlds" className="hover:text-holo-400">AI Worlds</a>
        <a href="#analyst" className="hover:text-holo-400">Analyst</a>
        <a href="#model" className="hover:text-holo-400">Model</a>
        <a href="#unified" className="hover:text-holo-400">Synthesis</a>
      </nav>
      <div className="flex items-center gap-3">
        <LangToggle />
        <a href="https://psyverse.fun" className="hidden font-mono text-[0.6rem] uppercase tracking-[0.18em] text-iris-400 hover:text-iris-400 sm:block">← Psyverse</a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
      <div className="absolute inset-0 z-0">
        <VRField />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-void-950/30 via-transparent to-void-950" />
      <div className="relative z-20 mx-auto w-full max-w-6xl px-6 md:px-12">
        <div className="label-mono">Psyverse · the virtual reality engine</div>
        <div className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ink-500">
          EN · 中文 · perception × immersion × AI worlds × identity × simulation
        </div>
        <h1 className="display mt-6 text-5xl leading-[0.94] text-ink-50 md:text-8xl">
          Virtual <span className="spark-text">Reality</span> Engine
        </h1>
        <h2 className="zh mt-3 text-3xl text-ink-200 md:text-5xl">虚拟现实引擎</h2>

        <p className="mt-9 max-w-2xl font-serif text-lg leading-relaxed text-ink-100 md:text-xl">
          <T v={{
            en: "Perception is already a world your brain renders from a thin stream of signals. Virtual reality is that same machinery, fed a different input. This is an atlas of immersion — from the optics of a headset to full-dive neural VR, AI-generated worlds, avatars, virtual economies and societies, and the question of whether reality itself is computation — careful throughout about what ships today, what is research frontier, and what remains speculation.",
            zh: "感知，本就是你的大脑从一缕稀薄的信号流中渲染出的一个世界。虚拟现实，正是那同一套机器，被喂以不同的输入。这是一张沉浸的图志——从一台头显的光学，到全沉浸的神经 VR、AI 生成的世界、化身、虚拟经济与社会，以及那个问题：现实本身是否即是计算——并全程审慎地标明，哪一处是今日已出货之物，哪一处是研究的前沿，哪一处仍是推测。",
          }} />
        </p>

        <div className="mt-10 max-w-2xl panel rounded-lg p-6">
          <div className="label-mono">Central thesis · 核心论点</div>
          <p className="mt-3 font-serif text-xl leading-relaxed text-ink-50 md:text-2xl">
            <T v={{
              en: "Civilisation has always engineered matter, then information. Virtual reality is the turn to engineering experience itself.",
              zh: "文明向来工程化物质，继而是信息。虚拟现实，是转向对经验本身的工程。",
            }} />
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-500">
          <span>10 systems · 十大系统</span>
          <span>perception → immersion → world → civilisation</span>
          <span>shipping · frontier · speculation, marked as such</span>
        </div>
      </div>
    </section>
  );
}

function SectionBlock({ s, vis }: { s: (typeof SECTIONS)[number]; vis?: ReactNode }) {
  return (
    <section id={s.id} className="relative border-t border-ink-100/8 px-6 py-24 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="label-mono"><T v={s.kicker} /></div>
        <div className="mt-3 flex items-baseline gap-4">
          <span className="display text-5xl text-iris-500/30">{s.num}</span>
          <div>
            <h2 className="display text-3xl text-ink-50 md:text-5xl"><T v={s.title} /></h2>
            <h3 className="mt-1 text-base text-holo-400 md:text-lg"><T v={s.sub} /></h3>
          </div>
        </div>
        <div className="mt-5 h-px rule-flux opacity-60" />
        <p className="mt-8 max-w-3xl font-serif text-lg leading-relaxed text-ink-200"><T v={s.body} /></p>
        <div className="mt-5 flex items-start gap-3 max-w-3xl">
          <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-plasm-400" />
          <p className="font-serif text-base italic leading-relaxed text-plasm-400/90"><T v={s.ask} /></p>
        </div>
        {vis && <div className="mt-12">{vis}</div>}
      </div>
    </section>
  );
}

function Body() {
  const { lang } = useLang();
  const unified = SECTIONS.find((s) => s.id === "unified")!;
  const rest = SECTIONS.filter((s) => s.id !== "unified");

  return (
    <main className="relative bg-void-950 text-ink-100">
      <Header />
      <Hero />

      {/* historical climb */}
      <section className="relative border-t border-ink-100/8 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="label-mono">The long climb · 漫长的攀升</div>
          <h2 className="display mt-3 text-4xl text-ink-50 md:text-5xl">
            <T v={{ en: "From the cave wall to the headset", zh: "从洞壁，到头显" }} />
          </h2>
          <p className="mt-6 max-w-3xl font-serif text-lg leading-relaxed text-ink-200">
            <T v={{
              en: "Every medium has reached for deeper immersion — trading away the seams that remind you you're only watching. VR is read here as the latest position on a curve civilisation has climbed for forty thousand years, not a gadget that arrived in 2016.",
              zh: "每一种媒介，都曾伸手探向更深的沉浸——舍弃那些提醒你『你只是在观看』的接缝。VR 在此被读作文明攀爬了四万年的那条曲线上、最新的一个位置，而非一件 2016 年才到来的小玩意。",
            }} />
          </p>
          <div className="mt-12"><ImmersionTimeline /></div>
        </div>
      </section>

      {/* ticker */}
      <div className="border-y border-ink-100/10 bg-void-900 py-2.5 overflow-hidden">
        <div className="whitespace-nowrap font-mono text-[0.65rem] uppercase tracking-[0.3em] text-holo-400/80">
          {(lang === "zh"
            ? "感知即渲染 · 洞壁 · 戏剧 · 电影 · 游戏 · 头显 · 空间计算 · 临场感 · 触觉 · 全沉浸 · 神经接口 · AI 生成的世界 · 化身 · 虚拟经济 · 虚拟文明 · 模拟假说 · 全息原理 · 文明正转向工程经验本身 · "
            : "PERCEPTION IS RENDERING · CAVE WALL · THEATRE · CINEMA · GAMES · HEADSET · SPATIAL COMPUTING · PRESENCE · HAPTICS · FULL-DIVE · NEURAL INTERFACE · AI-GENERATED WORLDS · AVATARS · VIRTUAL ECONOMIES · VIRTUAL CIVILISATION · SIMULATION HYPOTHESIS · HOLOGRAPHIC PRINCIPLE · CIVILISATION TURNS TO ENGINEERING EXPERIENCE ITSELF · ").repeat(2)}
        </div>
      </div>

      {/* Feature — the immersion dial */}
      <section id="dial" className="relative border-t border-ink-100/8 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="label-mono">The immersion dial · 沉浸旋钮</div>
          <h2 className="display mt-3 text-4xl text-ink-50 md:text-5xl">
            <T v={{ en: "Turn the dial, climb into the world", zh: "转动旋钮，爬入那个世界" }} />
          </h2>
          <p className="mt-6 max-w-3xl font-serif text-lg leading-relaxed text-ink-200">
            <T v={{
              en: "Three lenses on what immersion costs and buys. Slide a medium from text to cinema to game to VR to full-dive and watch presence, sensory channels and agency rise together. Inspect the hardware budget a convincing headset must hit. Then scale fidelity and see where today's technology ends and speculation begins.",
              zh: "对『沉浸的代价与所得』的三道透镜。把一种媒介从文字滑向电影、游戏、VR、全沉浸，看临场、感官通道与能动性一同升起。检视一台令人信服的头显所必须命中的硬件预算。再缩放保真度，看今日的技术在何处终结、推测又在何处开始。",
            }} />
          </p>
          <div className="mt-10"><ImmersionDial /></div>
        </div>
      </section>

      {/* Sections 01–09 */}
      {rest.map((s) => (
        <SectionBlock key={s.id} s={s} vis={VIS[s.id]} />
      ))}

      {/* The VR Analyst — AI layer */}
      <section id="analyst" className="relative border-t border-ink-100/8 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="label-mono">The VR analyst · 虚拟现实分析者</div>
          <h2 className="display mt-3 text-4xl text-ink-50 md:text-5xl">
            <T v={{ en: "Ask the open questions", zh: "追问那些开放的问题" }} />
          </h2>
          <p className="mt-6 max-w-3xl font-serif text-lg leading-relaxed text-ink-200">
            <T v={{
              en: "The hardest questions about virtual reality don't have one answer — they have several, depending on whom you ask. Pose a question, then hear it from a VR architect, a neuroscientist, a philosopher, a game-world designer, an AI systems theorist and a civilisation futurist in turn. Where they agree is solid ground; where they diverge is the live frontier.",
              zh: "关于虚拟现实最困难的问题，并没有单一的答案——而是有数个，取决于你问的是谁。提出一个问题，再依次听一位 VR 架构师、一位神经科学家、一位哲学家、一位游戏世界设计师、一位 AI 系统理论家与一位文明未来学者作答。他们一致之处，是坚实的地面；他们分歧之处，便是活跃的前沿。",
            }} />
          </p>
          <div className="mt-10"><VRAnalyst /></div>
        </div>
      </section>

      {/* Meta-model — the immersive civilisation radar */}
      <section id="model" className="relative border-t border-ink-100/8 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="label-mono">Meta-model · 元模型</div>
          <h2 className="display mt-3 text-4xl text-ink-50 md:text-5xl">
            <T v={{ en: "The architecture of immersive civilisation", zh: "沉浸文明的建构" }} />
          </h2>
          <p className="mt-6 max-w-3xl font-serif text-lg leading-relaxed text-ink-200">
            <T v={{
              en: "If an immersive civilisation has an anatomy, it has ingredients. Score each era across eight of them — perception engineering, AI world-generation, neural interfaces, spatial computing, digital identity, experience economies, collective simulation and consciousness connectivity — and a distinctive shape appears. The pre-screen world, the screen age, today's headset VR and the full-dive futures each trace a very different polygon.",
              zh: "如果一个沉浸文明有一套解剖结构，它便有其成分。把每一个时代，在八者上打分——感知工程、AI 世界生成、神经接口、空间计算、数字身份、体验经济、集体模拟与意识连接——一个独特的形状便会显现。屏幕之前的世界、屏幕时代、今日的头显 VR，与全沉浸的诸般未来，各自描出截然不同的多边形。",
            }} />
          </p>
          <div className="mt-6 max-w-3xl rounded-lg border border-iris-500/20 bg-void-900/50 p-4 font-mono text-[0.7rem] leading-relaxed text-holo-400/90">
            {lang === "zh"
              ? "沉浸文明 = 感知工程 + AI 世界生成 + 神经接口 + 空间计算 + 数字身份 + 体验经济 + 集体模拟 + 意识连接"
              : "Immersive Civilisation = Perception Engineering + AI World-Generation + Neural Interfaces + Spatial Computing + Digital Identity + Experience Economies + Collective Simulation + Consciousness Connectivity"}
          </div>
          <div className="mt-12"><ImmersionRadar /></div>
        </div>
      </section>

      {/* Section 10 — the unified VR model */}
      <section id={unified.id} className="relative border-t border-ink-100/8 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="label-mono"><T v={unified.kicker} /></div>
          <div className="mt-3 flex items-baseline gap-4">
            <span className="display text-5xl text-iris-500/30">{unified.num}</span>
            <div>
              <h2 className="display text-3xl text-ink-50 md:text-5xl"><T v={unified.title} /></h2>
              <h3 className="mt-1 text-base text-holo-400 md:text-lg"><T v={unified.sub} /></h3>
            </div>
          </div>
          <div className="mt-5 h-px rule-flux opacity-60" />
          <p className="mt-8 max-w-3xl font-serif text-lg leading-relaxed text-ink-200"><T v={unified.body} /></p>
          <div className="mt-5 flex items-start gap-3 max-w-3xl">
            <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-plasm-400" />
            <p className="font-serif text-base italic leading-relaxed text-plasm-400/90"><T v={unified.ask} /></p>
          </div>
          <div className="mt-12"><RecursiveVREngine /></div>
        </div>
      </section>

      {/* Closing */}
      <section className="relative border-t border-ink-100/8 px-6 py-32 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="display text-4xl leading-snug text-ink-50 md:text-6xl">
            <T v={{ en: "Perception was always a rendered world. We are learning to build the renderer.", zh: "感知，向来就是一个被渲染的世界。我们正在学习建造那台渲染器。" }} />
          </h2>
          <p className="mx-auto mt-8 max-w-2xl font-serif text-lg leading-relaxed text-ink-300">
            <T v={{
              en: "Civilisation extended its reach first over matter, then over information. Virtual reality is the turn inward — onto experience itself. Whether that becomes a flowering of human possibility or a quiet outsourcing of reality is not written in the technology; it is a choice about who builds the worlds, who owns them, and what they are for. The direction of the arc seems clear; the destination does not.",
              zh: "文明先是把它的触及延伸至物质，继而是信息。虚拟现实，是那向内的一转——对准经验本身。这究竟成为人类可能性的繁盛，还是现实的一场静默外包，并未写在技术之中；它是一个选择：关于谁建造那些世界、谁拥有它们、以及它们为何而存在。那道弧线的方向看来清楚；它的终点，并不。",
            }} />
          </p>
          <div className="mx-auto mt-10 max-w-xl rounded-lg border border-iris-500/25 bg-void-900 p-5">
            <p className="text-xs leading-relaxed text-ink-500">
              <T v={{
                en: "A conceptual, educational resource synthesising perception science, display and interface engineering, AI, game systems, economics, philosophy and civilisation theory. Interpretive, not the last word — shipping technology, research frontier and speculation are distinguished throughout, and speculation is marked as such.",
                zh: "一份概念性、教育性的资料，综合了感知科学、显示与界面工程、AI、游戏系统、经济学、哲学与文明理论。它是诠释，而非定论——已出货的技术、研究的前沿与推测，全篇皆有区分，推测之处亦已如实标明。",
              }} />
            </p>
          </div>
          <div className="mx-auto mt-12 h-px w-40 rule-flux" />
          <p className="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.4em] text-iris-400/70">
            Virtual Reality Engine · 虚拟现实引擎 · Psyverse · 2026
          </p>
        </div>
      </section>

      <footer className="border-t border-ink-100/10 bg-void-950 px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <div className="display text-xl text-ink-50">Virtual Reality Engine</div>
            <div className="zh mt-1 text-sm text-ink-300">虚拟现实引擎</div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
              <T v={{ en: "Perception and presence, the history of immersion, spatial computing, full-dive VR, AI-generated worlds, avatars, virtual economies and societies, and simulation theory — and the question of whether civilisation is learning to engineer experience itself.", zh: "感知与临场、沉浸的历史、空间计算、全沉浸 VR、AI 生成的世界、化身、虚拟经济与社会，以及模拟理论——还有那个问题：文明是否正在学习工程经验本身。" }} />
            </p>
          </div>
          <div>
            <div className="label-mono">Systems · 系统</div>
            <ul className="mt-4 space-y-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ink-500">
              {SECTIONS.slice(0, 6).map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="hover:text-holo-400">{s.num} · <T v={s.title} /></a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="label-mono">Companion archives</div>
            <ul className="mt-4 space-y-1.5 text-sm text-ink-300">
              <li><a href="https://bci-engine.psyverse.fun" className="hover:text-holo-400">BCI Engine · 脑机接口引擎</a></li>
              <li><a href="https://consciousness.psyverse.fun" className="hover:text-holo-400">Consciousness · 意识</a></li>
              <li><a href="https://quantum-reality.psyverse.fun" className="hover:text-holo-400">Quantum Reality · 量子现实</a></li>
              <li><a href="https://information-engine.psyverse.fun" className="hover:text-holo-400">Information Engine · 信息引擎</a></li>
              <li className="pt-3"><a href="https://psyverse.fun" className="text-iris-400 hover:text-holo-400">↩ All Psyverse archives</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 h-px max-w-7xl rule-flux" />
        <div className="mx-auto mt-6 flex max-w-7xl items-center justify-between text-[0.58rem] uppercase tracking-[0.3em] text-ink-500">
          <div>© 2026 Gewenbo · Psyverse</div>
          <div>EN · 中文 · educational</div>
        </div>
      </footer>
    </main>
  );
}

export default function VREngine() {
  return (
    <LangProvider>
      <Body />
    </LangProvider>
  );
}
