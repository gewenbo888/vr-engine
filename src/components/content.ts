import { Bi } from "./lang";

export type Panel = { t: Bi; d: Bi };

/* ═══════════════════════════════ THE TEN SYSTEMS ═══════════════════════════════
   Each section is one chamber in the Virtual Reality Engine. id maps to a dedicated
   visualization in VREngine.tsx. The voice is literary and careful: it separates
   shipping technology from research frontier from philosophical speculation, and
   marks speculation as such. */

export interface Section {
  num: string;
  id: string;
  kicker: Bi;
  title: Bi;
  sub: Bi;
  body: Bi;
  ask: Bi;
}

export const SECTIONS: Section[] = [
  {
    num: "01",
    id: "reality",
    kicker: { en: "System I · the substrate", zh: "系统一 · 基底" },
    title: { en: "What Is Reality?", zh: "现实是什么？" },
    sub: { en: "Perception is already a simulation the brain renders", zh: "感知，本就是大脑渲染的一场模拟" },
    body: {
      en: "Before any headset, consider the original virtual reality: the one your brain runs every waking second. You never touch the world directly. Photons strike the retina, pressure waves shake the cochlea, molecules dock on receptors — and from that thin stream of signals the brain constructs a seamless, full-colour, three-dimensional, sound-tracked world that feels like immediate contact with reality itself. It is not. The colours are invented; the visual field has a blind spot you never notice; the felt 'now' is assembled with a delay and back-dated. Perception is a controlled hallucination, constantly corrected against the senses — the brain's best real-time model of what is out there. This is the deep premise of the whole engine: if experience is already a rendered model, then a sufficiently complete signal, delivered to the right places, would be indistinguishable from 'real'. Virtual reality is not the opposite of perception. It is perception's own machinery, fed a different input.",
      zh: "在任何头显之前，先想想那个原初的虚拟现实：你的大脑在每一个清醒的瞬间所运行的那一个。你从未直接触碰世界。光子击中视网膜，压力波摇动耳蜗，分子停靠于受体——而大脑从这一缕稀薄的信号流中，构建出一个无缝的、全彩的、三维的、配有声轨的世界，它感觉起来像是与现实本身的直接接触。它不是。颜色是被发明的；视野中有一个你从未察觉的盲点；那被感到的『此刻』，是带着延迟被组装、再被回溯标注的。感知是一场受控的幻觉，不断地对照感官而被校正——是大脑对『外面有什么』的、最佳的实时模型。这便是整台引擎的深层前提：若经验本就是一个被渲染的模型，那么一束足够完整的信号，送达恰当的位置，便将与『真实』无从分辨。虚拟现实并非感知的反面。它正是感知自身的那套机器，被喂以不同的输入。",
    },
    ask: { en: "If the brain already renders reality, what exactly does 'real' add?", zh: "若大脑本就渲染着现实，『真实』究竟又添了什么？" },
  },
  {
    num: "02",
    id: "history",
    kicker: { en: "System II · the long climb", zh: "系统二 · 漫长的攀升" },
    title: { en: "The History of Virtual Reality", zh: "虚拟现实的历史" },
    sub: { en: "Every medium has reached for deeper immersion", zh: "每一种媒介，都曾伸手探向更深的沉浸" },
    body: {
      en: "Virtual reality did not begin with goggles. It began the first time a human stared at firelit figures on a cave wall and felt transported. Every medium since has been a step up the same ladder, trading away the seams that remind you you're an observer: the theatre put the story in a room; the novel built worlds inside your silent voice; cinema moved and surrounded; the panorama and the stereoscope chased depth; the video game added the one thing all the others lacked — agency, a world that answers when you act. Sutherland's 1968 head-mounted display, the 1990s arcade hype, the long winter, and the Oculus revival are recent chapters, not the origin. Read this way, VR is not a gadget that appeared in 2016. It is the latest position on a curve civilisation has been climbing for forty thousand years: the steady reduction of the distance between a constructed world and a felt one.",
      zh: "虚拟现实并非始于护目镜。它始于人类第一次凝望火光中洞壁上的形象、并感到被带走的那一刻。此后的每一种媒介，都是同一道阶梯上的一阶，不断舍弃那些提醒你『你是旁观者』的接缝：戏剧把故事置入一个房间；小说在你沉默的内心之声里建起世界；电影令其运动、将你环绕；全景画与立体镜追逐着深度；而电子游戏，添上了其余一切所缺的那一样东西——能动性，一个在你行动时会回应的世界。萨瑟兰 1968 年的头戴显示器、1990 年代的街机狂热、那漫长的寒冬，以及 Oculus 的复兴，都是晚近的章节，而非起源。如此读来，VR 并非一件 2016 年才出现的小玩意。它是文明攀爬了四万年的那条曲线上、最新的一个位置：构建之世界与被感之世界之间的距离，那稳步的缩减。",
    },
    ask: { en: "Has every medium been a draft of VR — or is VR just one more medium?", zh: "是每一种媒介都曾是 VR 的草稿——还是 VR 只是又一种媒介？" },
  },
  {
    num: "03",
    id: "hardware",
    kicker: { en: "System III · the apparatus", zh: "系统三 · 那套装置" },
    title: { en: "VR Hardware & Spatial Computing", zh: "VR 硬件与空间计算" },
    sub: { en: "How a machine hijacks the senses convincingly", zh: "一台机器如何令人信服地劫持感官" },
    body: {
      en: "Immersion is an engineering problem with brutal tolerances. To convince the visual system, a headset must render two slightly different images per eye, at 90+ frames a second, tracked to your head's motion within about twenty milliseconds — miss that budget and the inner ear, which disagrees with the eyes, answers with nausea. Around that core sits a stack: lenses and high-pixel-density displays for acuity; inside-out cameras and IMUs for six-degrees-of-freedom tracking; eye-tracking for foveated rendering (sharp only where you look, to save compute); hand and controller tracking for input; spatial audio that changes as you turn; and, increasingly, passthrough that fuses the digital into the real room — the shift the industry now calls spatial computing rather than VR. Haptics, the hardest sense to fake, lags far behind sight and sound; convincing touch is still mostly a research problem. The throughline: each subsystem targets one perceptual channel, and presence — the felt sense of 'being there' — emerges only when enough of them agree.",
      zh: "沉浸，是一个容差极其苛刻的工程问题。为说服视觉系统，一台头显必须为每只眼睛渲染两幅略有差异的图像，以每秒 90 帧以上的速度，并在约二十毫秒之内追随你头部的运动——错过这个预算，与眼睛意见相左的内耳，便会以恶心作答。围绕这一核心，是一整套堆栈：为锐度而设的透镜与高像素密度显示屏；为六自由度追踪而设的由内向外摄像头与惯性测量单元；为注视点渲染而设的眼动追踪（只在你所看之处清晰，以节省算力）；为输入而设的手部与手柄追踪；随你转头而变化的空间音频；以及日益增多的、把数字融入真实房间的透视——业界如今称这一转变为空间计算，而非 VR。触觉，那最难伪造的感官，远远落后于视与听；令人信服的触感，至今仍主要是一个研究问题。贯穿其中的线索是：每一个子系统针对一条感知通道，而临场感——那『身在其中』的被感之感——只在它们之中足够多者达成一致时，才会浮现。",
    },
    ask: { en: "When every sense agrees, is there anything left that says 'this is not real'?", zh: "当每一种感官都达成一致，还剩下什么在说『这不是真的』？" },
  },
  {
    num: "04",
    id: "fulldive",
    kicker: { en: "System IV · the frontier", zh: "系统四 · 那道前沿" },
    title: { en: "Full-Dive VR & Neural Immersion", zh: "全沉浸 VR 与神经沉浸" },
    sub: { en: "Bypassing the senses to write experience directly", zh: "绕过感官，直接写入经验" },
    body: {
      en: "Today's VR still goes through the body — light into eyes, sound into ears. The speculative endpoint, 'full-dive', skips the body entirely: instead of displaying a world to your senses, it would write the world into the neural signals the senses normally produce, and read motor intention back out before it reaches a muscle. Pieces of the read-and-write loop already exist in medicine — cochlear implants inject sound onto the auditory nerve, retinal and cortical implants inject crude vision, motor BCIs decode intended movement. Full-dive would generalise this to all senses at once, at high fidelity. Be clear about the gap: we cannot do this, and may never at the resolution fiction imagines. The brain's sensory codes are individual, distributed and only partly understood; writing a convincing forest into the visual cortex is orders of magnitude beyond injecting a phosphene. Yet the principle is sound — if perception is signals, then sufficiently precise signals are perception. Full-dive is where virtual reality stops being a display technology and becomes, in the most literal sense, experience engineering. It is also where the ethical stakes turn vertical.",
      zh: "今日的 VR 仍要经过身体——光进入眼睛，声进入耳朵。那推测中的终点，『全沉浸』，则完全跳过身体：它不再向你的感官显示一个世界，而是把世界写入感官通常产生的那些神经信号之中，并在运动意图抵达肌肉之前，将其读出。这读写回路的若干部件，已在医学中存在——人工耳蜗把声音注入听神经，视网膜与皮层植入物注入粗糙的视觉，运动脑机接口解码意图中的运动。全沉浸将把这一切，一次性地推广到所有感官，并以高保真度实现。须把差距说清：我们做不到这件事，且或许永远无法达到小说所想象的分辨率。大脑的感官编码是个体的、分布的、且只被部分理解；把一片令人信服的森林写入视觉皮层，比注入一个光幻视要难上若干数量级。然而原理是成立的——若感知即信号，那么足够精确的信号便即是感知。全沉浸，正是虚拟现实不再是一项显示技术、而在最字面的意义上成为『经验工程』的那一处。它也正是伦理的利害变得垂直陡立的那一处。",
    },
    ask: { en: "If a machine writes a world straight into your nerves, whose experience is it?", zh: "若一台机器把一个世界径直写入你的神经，那是谁的经验？" },
  },
  {
    num: "05",
    id: "aiworlds",
    kicker: { en: "System V · the generators", zh: "系统五 · 那些生成者" },
    title: { en: "AI-Generated Worlds & Digital Life", zh: "AI 生成的世界与数字生命" },
    sub: { en: "When worlds write themselves and the inhabitants come alive", zh: "当世界开始自我书写，而居民开始活转过来" },
    body: {
      en: "A virtual world used to be hand-built, every rock and line of dialogue placed by a person. Generative AI breaks that ceiling. Procedural systems already grow near-infinite terrain from a seed; newer models generate environments, textures, objects and entire playable scenes from a prompt, and large language models give non-player characters open-ended speech and goals instead of scripted loops. Push the trajectory and you get worlds that are authored at runtime — environments that reshape around the player, stories with no fixed script, populations of agents that remember, trade, scheme and form their own small histories. At the far end is a real question, not just a marketing one: when a simulated population is complex enough to model its members' interests and act on them, is it still set dressing, or a living computational ecosystem with some claim on our concern? We are nowhere near agents that suffer. But the design choices — how much autonomy, how much memory, what they're for — are being made now, in worlds built for delight and profit, long before the philosophy is settled.",
      zh: "一个虚拟世界过去是手工搭建的，每一块石头、每一行对白，都由某个人摆放。生成式 AI 打破了那道天花板。程序化系统早已能从一颗种子长出近乎无限的地形；更新的模型能从一句提示生成环境、纹理、物体乃至整个可玩的场景，而大语言模型则赋予非玩家角色开放式的言语与目标，取代了写死的循环。把这条轨迹推下去，你便得到在运行时被书写的世界——围绕玩家重塑的环境、没有固定剧本的故事、会记忆、交易、谋算并形成自己微小历史的智能体群落。在那遥远的一端，是一个真实的问题，而不只是一个营销的问题：当一个被模拟的群体，复杂到足以建模其成员的利益、并据此行动，它还是布景，还是一个对我们的关切有某种主张的、活的计算生态？我们离会受苦的智能体还很遥远。但那些设计选择——给多少自主、给多少记忆、它们为何而存在——正在此刻被做出，在为愉悦与利润而建的世界里，远在哲学尘埃落定之前。",
    },
    ask: { en: "At what point does a simulated population stop being scenery?", zh: "在哪一个点上，一个被模拟的群体不再只是布景？" },
  },
  {
    num: "06",
    id: "identity",
    kicker: { en: "System VI · the self", zh: "系统六 · 那个自我" },
    title: { en: "Digital Identity, Avatars & Selfhood", zh: "数字身份、化身与自我" },
    sub: { en: "The body you choose, and what it does to the mind", zh: "你所选择的身体，以及它对心灵之所为" },
    body: {
      en: "In a virtual world you get to choose the body you wear, and the body turns out not to be neutral. The 'Proteus effect' is well documented: give someone a taller avatar and they negotiate more aggressively; a more attractive one and they stand closer and disclose more. We partly become who we appear to be. VR loosens the bindings between self and appearance that the physical world holds fixed — age, face, gender, even species become wardrobe — and lets a person hold several identities at once, each with its own relationships and reputation. For some this is liberation: a chance to inhabit a self the body denied them. For others it is a loss of the single, accountable person that law and trust are built around. The deeper question the engine keeps open is whether an avatar is a costume or an extension — whether, over enough time and immersion, the felt boundary of 'me' migrates outward to include the rendered body, the same way it already includes a tool in your hand or a car you drive. Identity, here, stops being something you have and becomes something you configure.",
      zh: "在一个虚拟世界里，你得以选择自己所穿戴的身体，而身体，原来并非中性。『普罗透斯效应』已有充分记录：给一个人更高的化身，他谈判时更咄咄逼人；更具魅力的化身，他便站得更近、透露得更多。我们在某种程度上，会变成自己看上去的那个样子。VR 松开了物理世界所固定的、自我与外表之间的那些束缚——年龄、面孔、性别、乃至物种，都成了衣橱——并让一个人同时持有数个身份，各有其关系与声誉。对一些人，这是解放：一个去栖居于那个身体曾否认给他的自我的机会。对另一些人，这是那个单一的、可问责的人——法律与信任据以建立者——的丧失。引擎所持续敞开的更深问题是：一个化身，是一套戏服，还是一种延展——会不会，在足够的时间与沉浸之后，『我』那被感到的边界，向外迁移，把那被渲染的身体也纳入其中，正如它早已纳入你手中的工具、或你所驾驶的车。身份，在此，不再是你所拥有之物，而成为你所配置之物。",
    },
    ask: { en: "If you wear a self long enough, does it stop being a costume?", zh: "若你穿戴一个自我足够久，它是否便不再是一套戏服？" },
  },
  {
    num: "07",
    id: "economy",
    kicker: { en: "System VII · the ledger", zh: "系统七 · 那本账簿" },
    title: { en: "Virtual Economies & Post-Physical Labor", zh: "虚拟经济与后物理劳动" },
    sub: { en: "When scarce digital things carry real value", zh: "当稀缺的数字之物，承载起真实的价值" },
    body: {
      en: "Value does not require atoms. Virtual economies are already large and real: players have traded game items for hard currency for two decades; creators sell digital fashion, worlds and experiences; whole livelihoods exist inside platforms whose 'goods' are pure information made artificially scarce. The pattern matters more than any single hype cycle (the speculative excesses of crypto-metaverse land sales are a cautionary footnote, not the thesis). As more of attention, work and status moves into immersive space, the economy tilts from producing things toward producing experiences — and the labour follows: virtual architects, world designers, avatar fashion houses, live-event hosts, AI-content curators, and the vast unpaid 'work' of users whose presence is itself the product. This raises old questions in new clothes. Who owns a world you spent a year building inside someone else's platform? Is digital property real property if a company can delete it? When experience becomes the main thing produced, who captures the value — the creator, the platform, or the attention itself?",
      zh: "价值并不需要原子。虚拟经济早已庞大而真实：玩家把游戏道具兑换为硬通货已有二十年；创作者出售数字时装、世界与体验；一整份份生计存在于某些平台之内，其『商品』是被人为制造出稀缺的、纯粹的信息。这一模式，比任何单一的炒作周期都更要紧（加密元宇宙土地拍卖的投机过热，是一则警示性的脚注，而非论点本身）。随着越来越多的注意力、工作与地位迁入沉浸空间，经济便从生产物品，倾斜向生产体验——而劳动随之而来：虚拟建筑师、世界设计师、化身时装屋、现场活动主持、AI 内容策展人，以及用户那庞大而无偿的『劳动』——他们的在场本身，即是产品。这以新衣裳，提出了一些古老的问题。一个你在别人平台之内花了一年建造的世界，归谁所有？若一家公司能将其删除，数字财产还是真实的财产吗？当体验成为所生产的主要之物，是谁攫取了价值——创作者、平台，还是注意力本身？",
    },
    ask: { en: "If a company can delete it, was it ever really yours?", zh: "若一家公司能将它删除，它可曾真正属于你？" },
  },
  {
    num: "08",
    id: "society",
    kicker: { en: "System VIII · the polity", zh: "系统八 · 那个共同体" },
    title: { en: "Social Systems & Virtual Civilization", zh: "社会系统与虚拟文明" },
    sub: { en: "Persistent worlds where people actually live", zh: "人们真正生活于其中的、持续的世界" },
    body: {
      en: "Spend enough hours somewhere with other people, and rules, customs, status and conflict appear — a society, whether or not it has a charter. Persistent virtual worlds already grow them: guilds with constitutions, in-world courts, economies with central banks, friendships and griefers and the slow accretion of shared history. As immersion deepens and time-in-world rises, the open question sharpens from novelty to structure: if a meaningful share of conscious life is spent inside computational environments, who governs them? A platform's terms of service is not a constitution; a moderation team is not a justice system; and the people who 'live' somewhere they do not own, cannot leave with their belongings, and have no vote in, are in a strange new political position. Some imagine digital citizenship, online nations, even AI-administered governance. The engine takes none of these as inevitable. It only notes that civilisation has always organised itself around where people spend their lives — and that, for the first time, that 'where' might be somewhere that can be edited, paused, or switched off by its owner.",
      zh: "与他人在某处共度足够的时辰，规则、习俗、地位与冲突便会出现——一个社会，无论它是否有一纸章程。持续的虚拟世界早已生长出它们：有宪章的公会、世界之内的法庭、设有中央银行的经济、友谊与捣乱者，以及共享历史的缓慢累积。随着沉浸加深、世界中的时间增长，那个开放的问题，便从新奇锐化为结构：若意识生命中相当可观的一份，是在计算环境之内度过，那么，是谁在治理它们？一个平台的服务条款，并非一部宪法；一支审核团队，并非一套司法系统；而那些『生活』于一个自己并不拥有、无法带着财物离开、亦无投票权之处的人们，正处于一种奇异的、崭新的政治位置。一些人想象着数字公民、在线国度、乃至由 AI 管理的治理。引擎不把这些中的任何一个当作必然。它只是指出：文明向来围绕『人们于何处度过其一生』而组织自身——而如今，头一次，那个『何处』，可能是一个能被其所有者编辑、暂停、或关闭之处。",
    },
    ask: { en: "Can you be a citizen of a place its owner can switch off?", zh: "你能否成为一个、其所有者能将之关闭的地方的公民？" },
  },
  {
    num: "09",
    id: "simulation",
    kicker: { en: "System IX · the mirror", zh: "系统九 · 那面镜子" },
    title: { en: "Simulation Theory & the Nature of Existence", zh: "模拟理论与存在的本性" },
    sub: { en: "If we can build worlds, was ours built?", zh: "若我们能建造世界，我们的世界，可是被建造的？" },
    body: {
      en: "Once you have spent the engine learning how convincingly a reality can be constructed, the oldest question returns with new force: how do you know this one wasn't? The simulation hypothesis argues that if any civilisation ever runs many high-fidelity ancestor-simulations, then simulated observers vastly outnumber original ones, and a random mind should bet it is simulated. It rhymes with two serious ideas from physics, though it is not the same as either: the holographic principle, in which a volume of space can be fully described by information on its boundary; and 'digital physics', the conjecture that nature is, at bottom, computation. Hold the distinctions honestly. The holographic principle is real, hard-won physics. Digital physics is a live but unproven research programme. The simulation argument is philosophy — provocative, hard to test, and easy to overstate. What the engine draws from the cluster is not a verdict but a vantage: building virtual worlds teaches us, from the inside, what it would take to build this one — and makes the boundary between 'simulated' and 'real' feel less like a wall and more like a question of resolution.",
      zh: "一旦你花了这台引擎去学习：一个现实能被多么令人信服地构建，那个最古老的问题，便以新的力量归来：你如何知道，这一个不是被构建的？模拟假说论证道，若有任何文明曾运行许多高保真的祖先模拟，那么被模拟的观察者便远远多于原初的观察者，而一个随机的心灵，理应押注自己是被模拟的。它与物理学中两个严肃的想法押着韵，尽管它与二者皆不相同：全息原理——一块空间体积，可由其边界上的信息完整描述；以及『数字物理』——那个『自然归根结底是计算』的猜想。须诚实地把这些区分持守住。全息原理是真实的、来之不易的物理。数字物理是一个活跃但未经证明的研究纲领。而模拟论证，是哲学——发人深省、难以检验，且容易被夸大。引擎从这一簇想法中所汲取的，并非一个裁决，而是一个视点：建造虚拟世界，从内部教会我们，建造『这一个』将需要什么——并使『被模拟』与『真实』之间的边界，感觉起来不那么像一堵墙，而更像一个关于分辨率的问题。",
    },
    ask: { en: "Is 'simulated vs real' a difference in kind — or only in resolution?", zh: "『被模拟』与『真实』，是种类之别——还是仅仅分辨率之别？" },
  },
  {
    num: "10",
    id: "unified",
    kicker: { en: "System X · the synthesis", zh: "系统十 · 那次综合" },
    title: { en: "The Unified Virtual Reality Model", zh: "统一的虚拟现实模型" },
    sub: { en: "Civilisation learning to engineer experience", zh: "文明，正在学习直接『工程化』经验本身" },
    body: {
      en: "Stand back and one arc connects the chambers. Civilisation has always advanced by extending its reach over the world — first matter (tools, agriculture, cities), then information (writing, computation, the internet). Virtual reality is the candidate next domain: not matter, not data, but experience itself — the engineering of perception, presence and meaning directly. The unified model holds that an immersive civilisation is the sum of perception engineering, AI world-generation, neural interfaces, spatial computing, digital identity, experience economies, collective simulation and consciousness connectivity — and that VR acts on every term at once. Whether this is a flowering of human possibility (worlds without scarcity, bodies without limits, presence across any distance) or a quiet catastrophe (lives spent inside someone else's editable dream, attention farmed, reality outsourced) is not written in the technology. It is a choice about who builds the worlds, who owns them, and what they are for. What seems clear is the direction: having spent millennia rearranging the world outside, civilisation is turning its tools inward, onto the rendering engine of experience itself. The question this engine circles is whether we will live in realities we author together — or ones authored for us.",
      zh: "退后一步，一道弧线把这些密室贯连。文明的前进，向来靠的是把它对世界的触及不断延伸——先是物质（工具、农业、城市），再是信息（文字、计算、互联网）。虚拟现实，是那个候选的下一个领域：不是物质，不是数据，而是经验本身——对感知、临场与意义的、直接的工程。统一的模型主张：一个沉浸的文明，是感知工程、AI 世界生成、神经接口、空间计算、数字身份、体验经济、集体模拟与意识连接的总和——而 VR 同时作用于每一项。这究竟是人类可能性的繁盛（没有稀缺的世界、没有限制的身体、跨越任何距离的临场），还是一场静默的灾难（一生在别人可编辑的梦里度过、注意力被耕作、现实被外包），并未写在技术之中。它是一个选择：关于谁建造那些世界、谁拥有它们、以及它们为何而存在。看来清楚的，是那个方向：在花了千万年重新排布外部世界之后，文明正把它的工具转向内部，对准经验本身的那台渲染引擎。这台引擎所环绕的问题是：我们将生活在我们共同书写的现实之中——还是被替我们书写的现实之中。",
    },
    ask: { en: "Will we author our realities together — or live in ones authored for us?", zh: "我们将共同书写我们的现实——还是生活在被替我们书写的现实里？" },
  },
];

/* ─────────────────────── concept panels (virtual society) ─────────────────── */

export const PANELS: Record<string, Panel[]> = {
  society: [
    {
      t: { en: "Persistent virtual cities", zh: "持续的虚拟城市" },
      d: { en: "Worlds that keep running when you log off accrete shared history — landmarks, neighbourhoods, reputations. People return not to a game but to a place.", zh: "在你登出后仍持续运行的世界，会累积起共享的历史——地标、街区、声誉。人们返回的，不是一个游戏，而是一个地方。" },
    },
    {
      t: { en: "Digital citizenship", zh: "数字公民身份" },
      d: { en: "If you live somewhere you don't own, can't leave with your belongings, and have no vote in, what is your political standing? A new and unsettled category.", zh: "若你生活于一个自己不拥有、无法带着财物离开、亦无投票权之处，你的政治身份是什么？一个崭新而未定的范畴。" },
    },
    {
      t: { en: "AI governance", zh: "AI 治理" },
      d: { en: "Moderation at scale is already algorithmic. Some imagine worlds administered by AI — efficient, tireless, and accountable to whom, exactly?", zh: "规模化的审核，早已是算法化的。一些人想象由 AI 管理的世界——高效、不知疲倦，而它，究竟向谁问责？" },
    },
    {
      t: { en: "Online nations", zh: "在线国度" },
      d: { en: "Communities with constitutions, currencies, courts and borders already form inside platforms. Whether they can hold real sovereignty is an open question.", zh: "有宪章、货币、法庭与边界的社群，早已在平台之内形成。它们能否持有真实的主权，是一个开放的问题。" },
    },
    {
      t: { en: "Virtual communities", zh: "虚拟社群" },
      d: { en: "For many, the people who matter most are met in-world. Belonging migrates from geography to shared space — with all the warmth and exclusion that implies.", zh: "对许多人，最要紧的人是在世界之内相遇的。归属，从地理迁向共享的空间——连同那其中所含的全部温暖与排斥。" },
    },
    {
      t: { en: "A life mostly inside", zh: "大半在内的人生" },
      d: { en: "The open question, not a prediction: if presence, work and friendship are best inside, how much of a conscious life ends up spent in computational environments?", zh: "那个开放的问题，而非一则预言：若临场、工作与友谊在内部最佳，一份意识生命，最终有多少会在计算环境中度过？" },
    },
  ],
};
