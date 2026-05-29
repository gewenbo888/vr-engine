"use client";

import { useState } from "react";
import { useLang, T } from "./lang";
import type { Bi } from "./lang";

/* ─── data ─────────────────────────────────────────────────────────────────── */

type Expert = {
  id: string;
  role: Bi;
  blurb: Bi;
  /** Full Tailwind classes for the active tab state */
  tabActive: string;
  border: string;
  bgFrom: string;
  textAccent: string;
};

const EXPERTS: Expert[] = [
  {
    id: "architect",
    role:      { en: "VR Architect",             zh: "VR 架构师" },
    blurb:     { en: "what ships today — latency, tracking, optics, haptics",
                 zh: "今日出货——延迟、追踪、光学、触觉" },
    tabActive: "border-flux-500/60 bg-flux-500/10 text-flux-400",
    border:    "border-flux-500/40",
    bgFrom:    "from-flux-500/[0.07]",
    textAccent:"text-flux-400",
  },
  {
    id: "neuro",
    role:      { en: "Neuroscientist",            zh: "神经科学家" },
    blurb:     { en: "perception, presence, the brain's own rendering pipeline",
                 zh: "感知、临场感、大脑的自身渲染管线" },
    tabActive: "border-holo-500/60 bg-holo-500/10 text-holo-400",
    border:    "border-holo-500/40",
    bgFrom:    "from-holo-500/[0.07]",
    textAccent:"text-holo-400",
  },
  {
    id: "philosopher",
    role:      { en: "Philosopher",               zh: "哲学家" },
    blurb:     { en: "real vs virtual, identity, meaning, ontology",
                 zh: "真实与虚拟、身份、意义、本体论" },
    tabActive: "border-iris-500/60 bg-iris-500/10 text-iris-400",
    border:    "border-iris-500/40",
    bgFrom:    "from-iris-500/[0.07]",
    textAccent:"text-iris-400",
  },
  {
    id: "designer",
    role:      { en: "Game-World Designer",       zh: "游戏世界设计师" },
    blurb:     { en: "agency, world-building, what makes a world feel alive",
                 zh: "能动性、世界构建、世界何以感觉有生命" },
    tabActive: "border-gold-500/60 bg-gold-500/10 text-gold-400",
    border:    "border-gold-500/40",
    bgFrom:    "from-gold-500/[0.07]",
    textAccent:"text-gold-400",
  },
  {
    id: "ai",
    role:      { en: "AI Systems Theorist",       zh: "AI 系统理论家" },
    blurb:     { en: "generative worlds, NPC autonomy, compute ceilings",
                 zh: "生成式世界、NPC自主性、算力上限" },
    tabActive: "border-plasm-500/60 bg-plasm-500/10 text-plasm-400",
    border:    "border-plasm-500/40",
    bgFrom:    "from-plasm-500/[0.07]",
    textAccent:"text-plasm-400",
  },
  {
    id: "futurist",
    role:      { en: "Civilisation Futurist",     zh: "文明未来学者" },
    blurb:     { en: "long-term societal and civilisational consequences",
                 zh: "长远的社会与文明后果" },
    tabActive: "border-gold-400/60 bg-gold-400/10 text-gold-300",
    border:    "border-gold-400/40",
    bgFrom:    "from-gold-400/[0.07]",
    textAccent:"text-gold-300",
  },
];

/* ─── questions + expert answers ──────────────────────────────────────────── */

type QA = {
  q: Bi;
  answers: Record<string, Bi>;
};

const QUESTIONS: QA[] = [
  {
    q: {
      en: "Will VR ever be indistinguishable from physical reality?",
      zh: "VR 能否达到与物理现实无从区分的程度？",
    },
    answers: {
      architect: {
        en: "The two hard engineering bottlenecks today are latency and field of view. Motion-to-photon latency must stay below about 20 ms to avoid vestibular conflict; current standalone headsets (Quest 3, Vision Pro) achieve this for rotational tracking but not yet for full-body positional shifts. Human foveal vision spans roughly 60 degrees at high acuity; shipping headsets cover about 110 degrees with significant peripheral drop-off. Varifocal displays that correctly reproduce depth-of-field cues remain a research prototype as of 2025. Haptics are rudimentary by any measure. 'Indistinguishable from reality' is not currently a credible engineering target; 'convincingly immersive for extended sessions' is already real.",
        zh: "当今两大工程瓶颈是延迟与视场角。运动到光子的延迟必须保持在约20毫秒以下，以避免前庭冲突；目前的独立头显（Quest 3、Vision Pro）对旋转追踪已达标，但对全身位置偏移尚未实现。人类中央凹视觉在高清晰度下覆盖约60度；量产头显覆盖约110度，周边部分明显衰减。能正确再现景深线索的变焦显示器，截至2025年仍是研究原型。触觉反馈在任何评估标准下都极为粗陋。『与现实无从区分』目前不是一个可信的工程目标；『对长时段沉浸式体验具有说服力』已然成真。",
      },
      neuro: {
        en: "The brain does not receive raw reality; it constructs a model from sensory signals weighted by prior expectations — what predictive processing frameworks call the 'controlled hallucination' of perception. This means the relevant question is not whether the VR signal matches physical reality, but whether it is close enough that the brain's error signals remain small. Research on presence shows that even coarse, low-polygon environments can produce strong presence responses — nausea, fear, empathy — when multisensory cues (sound, optical flow, vestibular) are coherent. The physiological data suggest the brain is less demanding than naive intuition implies.",
        zh: "大脑接收的不是原始现实；它从按先验预期加权的感官信号中构建一个模型——预测加工框架称之为感知的『受控幻觉』。这意味着相关问题不是VR信号是否与物理现实匹配，而是它是否足够接近，使得大脑的误差信号保持微小。关于临场感的研究表明，即便是粗糙的、低多边形的环境，当多感官线索（声音、光流、前庭）保持一致时，也能产生强烈的临场感反应——恶心、恐惧、共情。生理学数据表明，大脑的要求比朴素直觉所暗示的更低。",
      },
      philosopher: {
        en: "The question contains a hidden assumption: that physical reality is itself a stable reference point against which virtual reality is measured. But perception is already a representational interface — what Kant would call a phenomenal world — not a direct window onto things-in-themselves. The distinction we are drawing between 'real' and 'virtual' is therefore somewhat arbitrary; it may track causal origin (physics vs. rendering pipeline) rather than experiential quality. If the lived experience in VR is rich, consequential, and emotionally real — and there is evidence it can be — the label 'virtual' may be doing less philosophical work than we assume.",
        zh: "这个问题包含一个隐含的预设：物理现实本身是一个稳定的参照点，虚拟现实以此为尺度被衡量。但感知本已是一个表征界面——康德所谓的现象世界——而非通向物自身的直接窗口。因此，我们在『真实』与『虚拟』之间所划的界线，在某种程度上是任意的；它追踪的或许是因果起源（物理学还是渲染管线），而非体验质量。如果VR中的生活体验是丰富的、有后果的、情感上真实的——有证据表明它可以如此——那么『虚拟』这一标签在哲学上所做的工作，可能比我们所假定的要少。",
      },
      designer: {
        en: "Indistinguishability is the wrong goal for design. Physical reality is mostly empty, slow, and unresponsive — it does not acknowledge the player. A virtual world that is merely indistinguishable from reality is less interesting than a virtual world that is better than reality in the dimensions that matter for human experience: legibility, agency, consequence, story. The most immersive games I have worked on don't fool the senses; they command attention because the world reacts to you. That is a design problem, not a rendering problem.",
        zh: "对于设计而言，『无从区分』是错误的目标。物理现实大多是空洞的、迟缓的、没有回应的——它不会认可玩家的存在。一个仅仅与现实无从区分的虚拟世界，不如一个在对人类体验重要的维度上优于现实的虚拟世界那样有趣：可读性、能动性、后果性、叙事性。我参与过的最具沉浸感的游戏，并不愚弄感官；它们的世界对你的行为有所回应，因而掌控了注意力。这是一个设计问题，而非渲染问题。",
      },
      ai: {
        en: "The compute constraint is the decisive one. High-fidelity real-time rendering of a photorealistic scene at full human retinal resolution (roughly 120 megapixels at 120 Hz per eye) would require sustained throughput orders of magnitude beyond current consumer GPUs. Foveated rendering — concentrating compute on where the eye is pointing — is the principal near-term lever, and it already ships in Vision Pro. AI-assisted upscaling (DLSS-style approaches applied to VR) can push perceived quality beyond native resolution at acceptable cost. The trajectory is clearly toward higher fidelity; whether it reaches perceptual parity in ten or forty years is genuinely uncertain.",
        zh: "算力限制是决定性因素。以全人类视网膜分辨率（每眼大约1.2亿像素，120赫兹）实时渲染照片级逼真场景，需要比当前消费级GPU高出数个数量级的持续吞吐量。注视点渲染——将算力集中于眼睛注视之处——是近期最主要的杠杆，已在Vision Pro中量产。AI辅助超分辨率（类DLSS方法应用于VR）可以在可接受的成本下将感知质量推超过原生分辨率。轨迹显然朝向更高保真度；是否在十年还是四十年内达到感知等效，则真正存在不确定性。",
      },
      futurist: {
        en: "Civilisational history suggests that the bar for 'indistinguishable' is set not by technical fidelity but by social consensus about what counts as real. Cinema was once dismissed as a mere illusion; it became the dominant reality-shaping medium of the 20th century. Television, the internet, and social media each redefined what counted as significant experience. VR does not need perceptual parity with the physical world to become the primary context for social life, commerce, education and governance. The civilisational question is not whether VR can match physical reality but whether it will be treated as its equal before it does.",
        zh: "文明史表明，『无从区分』的门槛，设定者不是技术保真度，而是关于什么算作真实的社会共识。电影曾被斥为纯粹的幻觉；它成了二十世纪塑造现实的主导媒介。电视、互联网和社交媒体，每一样都重新定义了什么算作重要的体验。VR不需要与物理世界的感知等效，就可以成为社会生活、商业、教育和治理的主要场境。文明层面的问题，不是VR能否匹配物理现实，而是在它做到之前，它是否已被当作与物理现实同等的存在。",
      },
    },
  },

  {
    q: {
      en: "If perception is already a simulation, what does 'real' add?",
      zh: "若感知本已是一种模拟，『真实』究竟还添加了什么？",
    },
    answers: {
      architect: {
        en: "From an engineering standpoint, 'real' adds physics. In a physical environment, every sensor on the body receives signals governed by the same consistent laws — inertia, reflection, propagation delay. A VR system must approximate or synthesise these signals independently, introducing inconsistencies that the nervous system eventually detects as artifacts. The vestibular system is especially unforgiving: it cannot be fooled by a rendered image, only by actual head movement or precise galvanic stimulation. The 'realness' of the physical world is a consistency property that rendering pipelines can approximate but not yet match.",
        zh: "从工程角度来看，『真实』添加了物理学。在物理环境中，身体上的每一个传感器都接收受同一套一致定律支配的信号——惯性、反射、传播延迟。VR系统必须独立地近似或合成这些信号，引入神经系统最终会检测为伪影的不一致性。前庭系统尤为苛刻：它无法被渲染的图像所愚弄，只能被实际的头部运动或精确的电流刺激所欺骗。物理世界的『真实性』是一种一致性属性，渲染管线可以近似但尚无法匹配。",
      },
      neuro: {
        en: "Predictive processing accounts suggest that the brain's model of the world is genuinely a simulation — a probabilistic generative model constantly updated by prediction errors. But the physical world adds something precise: it is the source of the prediction errors that calibrate the model. When sensory signals from the physical world arrive, they arrive with a specificity that no internally generated signal can match — they are external constraints that force the model to update. VR provides a source of prediction errors too, but it is an engineered one with limited degrees of freedom. The difference is not phenomenal but functional: physical reality is harder to ignore.",
        zh: "预测加工理论表明，大脑对世界的模型确实是一种模拟——一种由预测误差持续更新的概率生成模型。但物理世界添加了一种精确的东西：它是校准该模型的预测误差的来源。当来自物理世界的感官信号到达时，它们带着任何内部生成的信号都无法匹配的特异性——它们是迫使模型更新的外部约束。VR也提供一个预测误差的来源，但它是一个自由度有限的工程化来源。差异不是现象性的，而是功能性的：物理现实更难被忽视。",
      },
      philosopher: {
        en: "This is exactly the question Descartes posed in the cogito and Putnam revived with the brain-in-a-vat argument. What 'real' adds, on the most defensible philosophical account, is causal connection to a shared public world — a world that exists and has properties independent of any individual's representation of it. Your VR headset can be switched off; the physical world cannot be. The asymmetry is not in the quality of the experience but in its robustness: physical reality is the constraint that prevents all possible worlds from collapsing into one possible world — the one the most powerful system chooses to render.",
        zh: "这正是笛卡尔在我思中提出、普特南用缸中之脑论证复兴的问题。在最站得住脚的哲学论证中，『真实』所添加的，是与一个共享公共世界的因果联结——一个独立于任何个体表征而存在并具有属性的世界。你的VR头显可以被关闭；物理世界不能。这种不对称性不在于体验的质量，而在于其稳健性：物理现实是防止所有可能世界坍缩为一个可能世界——即最强大的系统选择渲染的那个——的约束条件。",
      },
      designer: {
        en: "For a world-builder, 'real' adds consequence. In a physical world, choices accumulate: a building stays built, a relationship scarred, a body aged. In most VR environments today, state persistence is limited — you can quit, respawn, reset. The emotional weight of a virtual world is almost entirely a function of how much it remembers and how much it costs. Games that approach emotional reality — grief, loss, loyalty — are games where choices compound over time and cannot be reversed. 'Real' is a design specification for consequence density, not a statement about rendering fidelity.",
        zh: "对于世界构建者而言，『真实』添加了后果性。在物理世界中，选择会积累：一栋建筑保持建成状态，一段关系留下伤痕，一具身体逐渐老去。在今天的大多数VR环境中，状态持久性是有限的——你可以退出、重生、重置。虚拟世界的情感重量，几乎完全取决于它记住多少以及它的代价有多高。接近情感现实的游戏——悲伤、失去、忠诚——是那些选择随时间复合且无法逆转的游戏。『真实』是后果密度的设计规格，而非关于渲染保真度的陈述。",
      },
      ai: {
        en: "From an information-theoretic standpoint, 'real' adds an uncorrupted ground truth. A physical environment is a source of data that no system designed it to produce — it just is what it is, including all its noise, complexity, and irreducible detail. A simulated environment, however sophisticated, was specified by someone with finite imagination and finite compute. The generative model behind physical reality is effectively infinite; the generative model behind any VR world is a finite approximation. That gap is what current AI is trying to close: neural radiance fields, diffusion models, and neural rendering are all attempts to let reality supervise its own simulation.",
        zh: "从信息论的角度来看，『真实』添加了未经损坏的基准事实。物理环境是一个没有任何系统被设计来产生的数据来源——它就是它本身，包含所有的噪声、复杂性与不可简化的细节。无论多么复杂的模拟环境，都是由拥有有限想象力和有限算力的某人所规定的。物理现实背后的生成模型实际上是无限的；任何VR世界背后的生成模型都是有限的近似。这个差距正是当前AI试图弥合的：神经辐射场、扩散模型、神经渲染，都是让现实监督其自身模拟的尝试。",
      },
      futurist: {
        en: "Every major philosophical school that has examined this — Platonism, phenomenology, pragmatism — gives a different answer, and none has been refuted. What civilisational history adds is a practical observation: communities that lose touch with a shared physical substrate — shared hardship, shared geography, shared mortality — tend to develop coordination failures that communities with those constraints do not. 'Real' may add nothing phenomenally, but it adds a common governor on what strategies are available and what costs they carry. A civilisation that can dissolve into private virtual worlds loses that shared governor — whether that is a liberation or a catastrophe depends on what replaces it.",
        zh: "每一个审视过这个问题的主要哲学流派——柏拉图主义、现象学、实用主义——都给出了不同的答案，而且没有一个被驳倒。文明史所补充的是一个实践性的观察：与共同物理基底——共同的艰辛、共同的地理、共同的死亡——失去联系的共同体，往往会发展出拥有这些约束的共同体所没有的协调失败。『真实』或许在现象上没有添加任何东西，但它添加了一个关于哪些策略是可行的、它们承担何种代价的共同调节器。一个能够溶解进私人虚拟世界的文明，失去了那个共同调节器——这是一种解放还是一场灾难，取决于取而代之的是什么。",
      },
    },
  },

  {
    q: {
      en: "Will people spend most of their lives inside virtual worlds?",
      zh: "人们会将人生的大部分时间花在虚拟世界中吗？",
    },
    answers: {
      architect: {
        en: "The usage data on existing platforms is telling. Meta reported that Quest users average about one to two hours per day in headset — far below the time spent on screens. The principal engineering barriers to longer sessions are thermal (headsets become uncomfortable as they heat), ergonomic (the weight distribution of current devices is poor for extended wear), and visual fatigue (vergence-accommodation conflict causes eye strain at hours-long sessions). Lightweight, all-day wearable form factors are an active R&D frontier; smart glasses and mixed-reality visors are incremental steps in that direction. For most-of-life usage, form factor probably matters more than content.",
        zh: "现有平台的使用数据很能说明问题。Meta报告称Quest用户每天平均在头显中使用约一至两小时——远低于花在屏幕上的时间。阻碍更长时段使用的主要工程障碍是热量（头显发热后会变得不舒适）、人体工学（当前设备的重量分配对于长时间佩戴而言很差）以及视觉疲劳（辐辏-调节冲突在数小时后导致眼睛疲劳）。轻量、全天可穿戴的形态因素是一个活跃的研发前沿；智能眼镜和混合现实目镜是朝这个方向迈出的渐进步骤。对于占据人生大部分时间的使用，形态因素的重要性可能大于内容。",
      },
      neuro: {
        en: "Long-duration VR exposure research is still thin, but what exists is cautionary. Disruption to circadian rhythms, altered body ownership, boundary confusion between virtual and physical spaces, and post-VR reality adjustment are documented effects even at one-to-two-hour sessions. Extended immersion may also alter how memory consolidates, since episodic memory encodes context — a brain that spends most of its time in a single highly consistent VR environment may lose the contextual variety that supports flexible recall. None of these effects are necessarily permanent, but they warrant sustained study before most-of-life usage becomes a social norm.",
        zh: "长时间VR暴露的研究仍然稀少，但现有的研究值得警惕。昼夜节律紊乱、身体所有权改变、虚拟与物理空间之间的边界混淆，以及VR后现实适应，即便在一至两小时的会话中也有记录。延长的沉浸也可能改变记忆的巩固方式，因为情节记忆会编码情境——一个将大部分时间花在单一高度一致的VR环境中的大脑，可能会失去支持灵活回忆的情境多样性。这些影响都不必然是永久性的，但在占据人生大部分时间的使用成为社会规范之前，值得持续研究。",
      },
      philosopher: {
        en: "The question is historically familiar in a different register. Every major absorptive medium — novels in the 18th century, cinema in the 20th, social media in the 21st — prompted the same anxiety: are people retreating from reality into a lesser substitute? In each case the answer was nuanced: the medium did absorb enormous time, it did reshape what people considered significant experience, and it did sometimes crowd out things of value. But people did not stop having bodies, families, or physical needs. The virtual and the physical coexisted and co-shaped each other. VR is likely to follow the same pattern — an additional layer of life, not a replacement.",
        zh: "这个问题在不同语境中历史上已然熟悉。每一种主要的吸收性媒介——18世纪的小说、20世纪的电影、21世纪的社交媒体——都引发了同样的焦虑：人们是否正在从现实撤退进一个更次等的替代品？每次答案都是微妙的：该媒介确实吸收了大量时间，它确实重塑了人们认为重要的体验，它有时确实排挤了有价值的事物。但人们并没有停止拥有身体、家庭或物质需求。虚拟与物理共存，并相互塑造。VR很可能遵循同样的模式——生活的一个附加层，而非替代品。",
      },
      designer: {
        en: "As someone who has spent a career making worlds people want to stay in, I will say this clearly: the best virtual worlds are not designed to maximise time-in-world. They are designed to generate moments worth returning for. The most successful persistent online games have daily active players who average two to four hours, not twelve. Players who try to live entirely inside games burn out because games are not designed to handle the full dynamic range of a human life — boredom, grief, ambiguity, meaningful work. A world that aspires to most-of-life must solve design problems that entertainment games have never had to face.",
        zh: "作为一个职业生涯都在打造人们愿意停留其中的世界的人，我想直说：最好的虚拟世界并非被设计来最大化在世界中的时间。它们被设计来创造值得为之回归的时刻。最成功的持久在线游戏，其日活跃玩家平均游戏时间是两至四小时，而不是十二小时。试图完全生活在游戏中的玩家会精疲力竭，因为游戏并非被设计来处理人类生活的完整动态范围——无聊、悲伤、模糊性、有意义的工作。一个有志于占据人生大部分时间的世界，必须解决娱乐游戏从未必须面对的设计问题。",
      },
      ai: {
        en: "The AI trajectory here is relevant and underappreciated. Procedural generation and early generative AI have already extended the content lifetime of games by orders of magnitude. Large language models integrated into game engines can now power NPCs that hold coherent conversations, adapt to player behaviour, and maintain consistent histories. Within a five-to-ten-year window, it is technically plausible to have virtual worlds that generate genuinely novel, contextually sensitive experiences faster than a single person can consume them. If that crosses a threshold of emotional richness, the time-in-world question becomes urgent — not because of technology push but because of content pull.",
        zh: "AI在这里的轨迹是相关的，且被低估了。程序化生成和早期生成式AI已经将游戏的内容寿命延长了数个数量级。集成到游戏引擎中的大型语言模型，现在可以驱动能够进行连贯对话、适应玩家行为并维持一致历史记录的NPC。在五到十年的窗口内，技术上可行的是拥有能够以比单个人消费更快的速度生成真正新颖、情境敏感体验的虚拟世界。如果这跨越了情感丰富性的某个门槛，在世界中的时间问题就变得紧迫——不是因为技术推动，而是因为内容拉动。",
      },
      futurist: {
        en: "The precedent most worth studying is not cinema or television but the global cities of the 20th century, which absorbed the majority of the world's population because they offered density of opportunity, social contact, and meaning that dispersed rural life could not match. Virtual worlds could do the same at lower physical cost: they offer social density without the spatial and economic requirements of physical cities. If the economic and social life of a civilisation migrates significantly into virtual space — as remote work and e-commerce have already begun — then 'most of a life' in virtual worlds becomes a description of where the things that matter happen, not a retreat from them.",
        zh: "最值得研究的先例不是电影或电视，而是二十世纪的全球城市——它们吸收了世界上大多数人口，因为它们提供了分散的农村生活无法匹敌的机会密度、社会接触和意义。虚拟世界可以以更低的物质成本做到同样的事：它们提供社会密度，而无需物理城市的空间和经济要求。如果一个文明的经济和社会生活大量迁移到虚拟空间——正如远程工作和电子商务已经开始的那样——那么在虚拟世界中度过『人生的大部分时间』，就成了对重要事情发生地点的描述，而非对它们的逃避。",
      },
    },
  },

  {
    q: {
      en: "Are avatars costumes or extensions of the self?",
      zh: "虚拟形象是服装，还是自我的延伸？",
    },
    answers: {
      architect: {
        en: "The engineering reality is that avatar fidelity exists on a spectrum, and that spectrum has measurable effects on behaviour. Full-body inverse-kinematics avatars that mirror real limb movement, combined with accurate hand-tracking, produce stronger identification effects than controller-based puppeted avatars. Photorealistic face avatars with real-time facial expression capture (as shipped experimentally in Meta's Codec Avatars project) produce different social responses than cartoon stand-ins. The avatar is not neutral — its design is a parameter that shapes the interaction. Calling it a costume undersells the engineering: it is an interface between self and social space, and interfaces change what flows through them.",
        zh: "工程现实是，虚拟形象的保真度存在于一个范围上，而该范围对行为有可测量的影响。与控制器操控的木偶式虚拟形象相比，镜像真实肢体运动的全身逆运动学虚拟形象（结合精确的手部追踪）产生更强的认同效应。具有实时面部表情捕捉的照片级逼真面部虚拟形象（如Meta的Codec Avatars项目实验性发布）产生的社交反应，与卡通替代形象不同。虚拟形象不是中性的——它的设计是塑造交互的参数。称其为服装低估了工程意义：它是自我与社交空间之间的界面，而界面改变了流经其中的东西。",
      },
      neuro: {
        en: "The Proteus Effect — Yee and Bailenson's robust finding that avatar appearance changes the behaviour of the person wearing it, not just how others perceive them — is one of the most replicated results in VR psychology. Participants assigned physically imposing avatars behave more aggressively; those assigned to elderly avatars show changed attitudes toward retirement savings; those in avatars of another race report temporary empathy increases. The mechanism appears to involve body schema activation: the brain incorporates the avatar into its model of the body's capabilities and social identity. The costume-versus-extension distinction maps onto weak versus strong avatar embodiment, but even the 'costume' condition changes the wearer.",
        zh: "普罗透斯效应——易和贝伦森关于虚拟形象外观改变佩戴者行为（而不仅仅是他人对其的感知）的稳健发现——是VR心理学中复现最多的结果之一。被分配了体格强壮虚拟形象的参与者表现出更强的攻击性；被分配了老年虚拟形象的参与者对退休储蓄表现出改变的态度；在另一种族虚拟形象中的参与者报告暂时的共情增加。其机制似乎涉及身体图式激活：大脑将虚拟形象纳入其对身体能力和社会身份的模型中。服装与延伸的区分对应于弱与强的虚拟形象具身性，但即便是『服装』条件也会改变佩戴者。",
      },
      philosopher: {
        en: "The costume-versus-extension dichotomy recapitulates one of philosophy of mind's oldest debates: whether the mind stops at the skin. Extended mind theorists (Clark and Chalmers) argue that cognitive processes can genuinely extend into artefacts — a notebook used for memory is not a separate tool but a constitutive part of the cognitive system. On this account, a richly embodied avatar is not a representation of the self but a constitutive part of it during the time of use. The more interesting question is what happens to identity continuity when the avatar can be changed instantly — when the self is multiply instantiable in divergent forms simultaneously.",
        zh: "服装与延伸的二分法重现了心灵哲学中最古老的争论之一：心灵是否止于皮肤。延伸心灵理论家（克拉克和查尔默斯）认为，认知过程可以真正延伸到人工制品中——用于记忆的笔记本不是一个独立的工具，而是认知系统的构成性部分。在这种观点上，一个高度具身的虚拟形象，在使用期间不是自我的表征，而是其构成性部分。更有趣的问题是，当虚拟形象可以即时改变时，当自我可以同时在分歧形式中多重实例化时，身份连续性会发生什么。",
      },
      designer: {
        en: "In practice, avatars are both, and the ratio is a design choice. Games that give players meaningful control over avatar appearance generate strong ownership effects — players protect and invest in characters they have customised. But the most emotionally powerful avatar moments in the games I have worked on are not cosmetic; they are moments when the avatar's situation reflects the player's interior state — when the avatar is vulnerable, or triumphant, or lost, in ways that resonate. The avatar becomes an extension of the self precisely when the world is designed to make the avatar's experience matter. A costume becomes a self when the stakes are real.",
        zh: "在实践中，虚拟形象两者兼是，而比例是一个设计选择。给予玩家对虚拟形象外观有意义控制的游戏，会产生强烈的所有权效应——玩家保护并投资于他们自定义的角色。但我参与过的游戏中，情感上最有力量的虚拟形象时刻，并不是外观方面的；而是虚拟形象的处境反映了玩家内在状态的时刻——虚拟形象在某种共鸣的方式上是脆弱的、或胜利的、或迷失的。当世界被设计成让虚拟形象的体验变得重要时，虚拟形象恰恰成为自我的延伸。当筹码是真实的，一件服装就变成了一个自我。",
      },
      ai: {
        en: "From a systems standpoint, an avatar is the identity token through which an agent acts in a simulated environment. The question of whether it is a costume or extension is a question about the coupling strength between the controlling agent and the token. In games, the coupling is usually loose: the player can detach and create a new character. As AI-mediated social spaces incorporate richer behavioural history, reputation, relationship graphs, and economic stakes into avatar identity, the coupling tightens. A future avatar that carries a person's full social history, credentialled achievements, and AI-assisted persona management is functionally indistinguishable from a legal identity — at which point the costume frame collapses entirely.",
        zh: "从系统角度来看，虚拟形象是智能体在模拟环境中行动的身份令牌。它是服装还是延伸的问题，是关于控制智能体与令牌之间耦合强度的问题。在游戏中，耦合通常是松散的：玩家可以脱离并创建新角色。随着AI中介的社交空间将更丰富的行为历史、声誉、关系图谱和经济筹码纳入虚拟形象身份，耦合便会收紧。一个携带一个人的完整社会历史、经认证的成就和AI辅助人设管理的未来虚拟形象，在功能上与法律身份无从区分——届时，服装框架会完全崩溃。",
      },
      futurist: {
        en: "Identity has always been performed, and performance has always shaped identity — this was the central insight of Goffman's dramaturgical sociology fifty years before VR existed. Avatars accelerate and amplify the performance loop. The civilisational novelty is not that people adopt roles — they always have — but that roles can now be designed with precision, switched instantly, and multiplied across simultaneous contexts. A person who maintains five avatars in five different social worlds does not have five costumes; they have five social selves that are genuinely different and genuinely coherent. What happens to legal accountability, moral responsibility and personal narrative when selfhood is this fluid is an urgent institutional design question.",
        zh: "身份认同从来都是被表演的，而表演从来都在塑造身份认同——这是戈夫曼在VR诞生五十年前的戏剧社会学的核心洞见。虚拟形象加速并放大了这一表演循环。文明层面的新颖性，不在于人们采用角色——他们一直如此——而在于角色现在可以被精确设计、即时切换，并在同时并发的情境中倍增。一个在五个不同社交世界中维持五个虚拟形象的人，拥有的不是五件服装；他们拥有五个真正不同且真正连贯的社会自我。当自我如此流动时，法律责任、道德责任和个人叙事会发生什么，是一个紧迫的制度设计问题。",
      },
    },
  },

  {
    q: {
      en: "Could our own reality be a simulation?",
      zh: "我们自身的现实，有可能是一种模拟吗？",
    },
    answers: {
      architect: {
        en: "As an engineer I have to be direct: this question is outside the scope of engineering verification. A simulation hypothesis makes claims about what runs our substrate, not about what we can build or measure from inside it. What I can say is that every simulation I have ever built has seams — artifacts, resolution limits, edge cases where the model breaks. If our reality is a simulation, it is either running at a fidelity that exceeds anything we can detect with current physics, or the seams are things we mistake for constants of nature. The Planck scale — where smooth spacetime breaks into a discrete structure — is the closest thing physics offers to a resolution limit. Whether that is a clue or a coincidence is not something architecture can answer.",
        zh: "作为工程师，我必须直说：这个问题超出了工程验证的范围。模拟假设的主张关乎什么在运行我们的基底，而非我们能从内部构建或测量什么。我可以说的是，我曾构建过的每一个模拟都有接缝——伪影、分辨率限制、模型崩溃的边缘情形。如果我们的现实是一个模拟，要么它运行在超过我们用当前物理学所能探测的保真度水平，要么接缝是我们误认为自然常数的东西。普朗克尺度——平滑时空分裂成离散结构的地方——是物理学所提供的最接近分辨率限制的东西。这是线索还是巧合，不是架构能够回答的。",
      },
      neuro: {
        en: "The neuroscience adds a peculiar twist. The brain does not have direct access to external reality — it infers it from signals, and those inferences can be systematically wrong. The entire history of perceptual illusions, phantom limbs, and psychedelic experience demonstrates that the brain's model of reality is separable from reality itself. But this observation is neutral on the simulation hypothesis: whether the signals arriving at sensory receptors originate in a physical universe or in a substrate-level computation, the brain's processing is the same. Neuroscience cannot distinguish between a physical and a simulated external world; it can only study the organ that models both.",
        zh: "神经科学增添了一个奇特的转折。大脑没有对外部现实的直接访问——它从信号中推断，而那些推断可能系统性地出错。感知错觉、幻肢和迷幻体验的全部历史，表明大脑对现实的模型可以与现实本身相分离。但这一观察对模拟假设是中性的：无论到达感觉感受器的信号起源于物理宇宙还是基底级计算，大脑的处理都是相同的。神经科学无法区分物理的和模拟的外部世界；它只能研究对两者建模的那个器官。",
      },
      philosopher: {
        en: "Bostrom's simulation argument — that at least one of three propositions must be true (civilisations go extinct before simulation capability, civilisations lose interest in ancestor simulations, or we are in a simulation) — is logically valid but depends on contested assumptions about consciousness running on arbitrary substrates. The harder philosophical point is that the simulation hypothesis, if unfalsifiable, may be a non-question: a claim that cannot in principle be distinguished from its negation by any observation is not a scientific claim and barely a philosophical one. More interesting is what the hypothesis reveals about our assumptions: we instinctively believe there must be a 'base reality', which itself is a metaphysical axiom, not an established fact.",
        zh: "博斯特罗姆的模拟论证——即三个命题中至少一个必为真（文明在获得模拟能力之前灭绝；文明对祖先模拟失去兴趣；或我们在一个模拟中）——逻辑上有效，但依赖于关于意识在任意基底上运行的有争议的假设。更难处理的哲学要点是，模拟假设如果不可证伪，可能是一个非问题：一个原则上无法通过任何观察与其否定相区分的主张，不是一个科学主张，勉强算是哲学主张。更有趣的是这个假设揭示了我们关于什么的假设：我们本能地相信必定存在一个『基础现实』，而这本身是一个形而上学公理，而非已确立的事实。",
      },
      designer: {
        en: "As a world-builder, the simulation hypothesis is professionally interesting because it inverts the design question. If I am designing a simulation, I ask: what rules make it feel real and internally coherent? The striking thing about our reality is that it has exactly the properties a well-designed simulation would have: consistent laws, quantised information, a speed-of-light rendering limit, apparent fine-tuning of constants that permits complexity. Whether this is design or brute fact is not a question design can answer — but working on virtual worlds does make you notice how suspiciously elegant the implementation of physical law actually is.",
        zh: "作为一个世界构建者，模拟假设在职业上很有趣，因为它颠倒了设计问题。如果我在设计一个模拟，我会问：什么样的规则使它感觉真实且内部连贯？我们现实的惊人之处在于，它恰好具有一个精心设计的模拟所应具有的属性：一致的定律、量化的信息、光速渲染限制、允许复杂性的常数表观精调。这是设计还是蛮然事实，是设计无法回答的问题——但研究虚拟世界确实会让你注意到物理定律的实现实际上有多么可疑的优雅。",
      },
      ai: {
        en: "The computationalist version of the simulation hypothesis — that reality is information processing all the way down — is gaining traction in theoretical physics, not just philosophy. Digital physics, loop quantum gravity, and it-from-bit approaches all suggest that space, time, and matter may be emergent from a more fundamental information-theoretic substrate. If that is correct, the question is not whether we are in a simulation but whether there is a meaningful distinction between 'simulation' and 'physical process' at sufficient depth. AI research is relevant here: we are building systems that generate coherent, rule-governed realities from scratch. The question of what distinguishes those from ours grows more interesting as the generated worlds grow more complex.",
        zh: "模拟假设的计算主义版本——现实一路向下都是信息处理——在理论物理学中而非仅仅哲学中正获得关注。数字物理学、圈量子引力以及它来自比特的进路，都表明空间、时间和物质可能是从一个更基础的信息论基底中涌现出来的。如果这是正确的，问题就不是我们是否在一个模拟中，而是在足够深的层次上，『模拟』与『物理过程』之间是否存在有意义的区分。AI研究在此是相关的：我们正在构建从零开始生成连贯的、规则支配的现实的系统。随着生成世界变得更加复杂，区分它们与我们的现实的问题变得越来越有趣。",
      },
      futurist: {
        en: "Whether or not we are in a simulation, the civilisational consequence of believing we might be is already shaping culture. The simulation hypothesis has become the cosmology of Silicon Valley — a frame that naturalises the idea that reality is hackable, that physics is a legacy codebase, that whoever has access to root-level compute has legitimate power. This is not neutral. Every cosmology encodes a politics: the simulation hypothesis encodes the politics of the platform owner. Societies that internalise it may be more tolerant of reality-distorting technologies and less protective of the shared physical substrate that grounds accountability. The hypothesis may be unanswerable, but its social effects are already running.",
        zh: "无论我们是否在一个模拟中，相信我们可能在一个模拟中的文明后果，已经在塑造文化了。模拟假设已成为硅谷的宇宙观——一个将现实可被入侵、物理学是遗留代码库、拥有根级计算访问权者拥有合法权力等观念自然化的框架。这并非中性的。每一种宇宙观都编码了一种政治：模拟假设编码了平台所有者的政治。内化它的社会，可能对扭曲现实的技术更为宽容，对支撑问责制的共同物理基底的保护则更少。这个假设或许无法回答，但它的社会效应已经在运行了。",
      },
    },
  },
];

/* ─── component ─────────────────────────────────────────────────────────────── */

export default function VRAnalyst() {
  const { lang } = useLang();
  const [qi, setQi] = useState(0);
  const [expertId, setExpertId] = useState("architect");

  const q = QUESTIONS[qi];
  const activeExpert = EXPERTS.find((e) => e.id === expertId) ?? EXPERTS[0];

  return (
    <div className="panel rounded-2xl p-5 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">

        {/* ── left: question selector ─────────────────────────────────────── */}
        <div>
          <div className="label-mono mb-4">
            {lang === "zh" ? "选择一个问题" : "choose a question"}
          </div>
          <div className="space-y-2">
            {QUESTIONS.map((item, i) => (
              <button
                key={i}
                onClick={() => setQi(i)}
                className={`block w-full rounded-lg border px-4 py-2.5 text-left text-sm leading-snug transition ${
                  i === qi
                    ? "border-iris-500/50 bg-iris-500/10 text-iris-300"
                    : "border-ink-100/10 text-ink-400 hover:border-iris-500/30 hover:text-ink-200"
                }`}
              >
                <T v={item.q} />
              </button>
            ))}
          </div>
        </div>

        {/* ── right: expert selector + answer ─────────────────────────────── */}
        <div>
          {/* expert tabs */}
          <div className="flex flex-wrap gap-2">
            {EXPERTS.map((expert) => (
              <button
                key={expert.id}
                onClick={() => setExpertId(expert.id)}
                className={`rounded-full border px-3.5 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.1em] transition ${
                  expertId === expert.id
                    ? expert.tabActive
                    : "border-ink-100/10 text-ink-500 hover:text-ink-200"
                }`}
              >
                <T v={expert.role} />
              </button>
            ))}
          </div>

          {/* selected question heading */}
          <h3 className="display mt-5 text-xl leading-snug text-ink-50 md:text-2xl">
            <T v={q.q} />
          </h3>

          {/* answer card */}
          <div
            key={`${qi}-${expertId}`}
            className={`lang-fade mt-4 rounded-xl border ${activeExpert.border} bg-gradient-to-br ${activeExpert.bgFrom} to-transparent p-5`}
          >
            {/* expert label */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`label-mono ${activeExpert.textAccent}`}>
                <T v={activeExpert.role} />
              </span>
              <span className="text-ink-600">·</span>
              <span className="label-mono text-ink-500">
                <T v={activeExpert.blurb} />
              </span>
            </div>

            {/* answer body */}
            <p className="mt-3 font-serif text-base leading-relaxed text-ink-100 md:text-lg">
              <T v={q.answers[activeExpert.id]} />
            </p>
          </div>

          {/* epistemic footnote */}
          <p className="mt-4 text-xs leading-relaxed text-ink-500">
            {lang === "zh"
              ? "每条回答力求忠实于该领域的主流理解，公平地呈现竞争性观点，并明确标注何处仍是开放问题或推测——而非把推测当作定论。六位专家意见一致处，是坚实的地基；意见分歧处，才是真正的前沿。"
              : "Each answer aims to be faithful to the mainstream understanding of its field, to present competing views fairly, and to flag where the question remains genuinely open or speculative — rather than dressing speculation as settled fact. Where the six experts agree, the ground is solid. Where they diverge, that is the real frontier."}
          </p>
        </div>

      </div>
    </div>
  );
}
