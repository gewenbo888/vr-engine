"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "./lang";

/* ─────────────────────────────────────────────────────────────────────────────
   COLOUR PALETTE (in-file constants for canvas/SVG)
───────────────────────────────────────────────────────────────────────────── */
const C = {
  void950: "#06030f",
  void900: "#0b0620",
  void800: "#120a33",
  void700: "#1a1048",
  flux500: "#4d9bff",
  flux400: "#93c5ff",
  iris500: "#a855f7",
  iris400: "#c98bff",
  holo500: "#22d3ee",
  holo400: "#67e8f9",
  gold500: "#f5c24d",
  gold400: "#ffd97a",
  plasm500: "#ff4d9d",
  ink50:   "#f6f4ff",
  ink300:  "#b3afd8",
  ink500:  "#797399",
};

/* ─────────────────────────────────────────────────────────────────────────────
   SUBSYSTEM DATA
───────────────────────────────────────────────────────────────────────────── */
interface Subsystem {
  id: string;
  color: string;
  colorDim: string;
  label: { en: string; zh: string };
  tagline: { en: string; zh: string };
  detail: { en: string; zh: string };
  specs: { label: { en: string; zh: string }; value: { en: string; zh: string } }[];
  layerY: number;   // nominal Y position in the exploded SVG (0–1)
  icon: string;     // SVG path data for the micro-icon
}

const SUBSYSTEMS: Subsystem[] = [
  {
    id: "display",
    color: C.holo500,
    colorDim: "#0e4a52",
    label: { en: "Displays & Lenses", zh: "显示屏与光学镜片" },
    tagline: { en: "Per-eye images · pixel density · FOV", zh: "双眼独立显示 · 像素密度 · 视场角" },
    detail: {
      en: "Each eye receives an independent high-resolution OLED or micro-LED panel. Pancake lenses (Apple Vision Pro) fold the optical path to reduce bulk while achieving ~90° FOV. Meta Quest 3 and PlayStation VR2 hit ~2064×2208 per eye; Apple Vision Pro reaches ~3660×3200. Pixel density above ~25 PPD begins to eliminate the screen-door effect. Fast-switching (90–120 Hz) panels cut motion blur and enable reprojection. The gap between display resolution and the foveal limit (~60 PPD) remains the primary visual quality frontier.",
      zh: "每只眼睛接收一块独立高分辨率OLED或Micro-LED屏幕。煎饼镜（Apple Vision Pro采用）折叠光路以减小体积，同时实现约90°视场角。Meta Quest 3和PlayStation VR2单眼分辨率约2064×2208；Apple Vision Pro高达约3660×3200。像素密度超过约25 PPD可消除纱窗效应。高刷新率（90–120 Hz）面板降低运动模糊并支持重投影。显示分辨率与中央凹极限（约60 PPD）之间的差距，仍是视觉质量的主要突破方向。",
    },
    specs: [
      { label: { en: "Resolution (best)", zh: "最高分辨率" }, value: { en: "3660×3200 per eye (Vision Pro)", zh: "单眼3660×3200（Vision Pro）" } },
      { label: { en: "Refresh rate", zh: "刷新率" }, value: { en: "90–120 Hz (up to 144 Hz PSVR2)", zh: "90–120 Hz（PSVR2最高144 Hz）" } },
      { label: { en: "FOV", zh: "视场角" }, value: { en: "~90°–110° horizontal", zh: "水平约90°–110°" } },
      { label: { en: "Panel type", zh: "面板类型" }, value: { en: "OLED / Micro-OLED / Micro-LED", zh: "OLED / Micro-OLED / Micro-LED" } },
    ],
    layerY: 0.08,
    icon: "M3 5h14v10H3z M5 7h10v6H5z M8 15l1 2h4l1-2",
  },
  {
    id: "headtracking",
    color: C.flux500,
    colorDim: "#0e2a52",
    label: { en: "Head Tracking", zh: "头部追踪" },
    tagline: { en: "IMU + inside-out cameras · 6DoF", zh: "IMU + 内向外摄像头 · 六自由度" },
    detail: {
      en: "Six degrees of freedom (6DoF) tracking combines an IMU (gyroscope + accelerometer, ~1 kHz) with 4–7 visible-light or infrared outward-facing cameras for inside-out SLAM. The cameras anchor the 6DoF pose to the real room without external base stations. Modern SLAM pipelines (Qualcomm Snapdragon XR2+ Gen 2, custom Apple R1) fuse IMU and vision at sub-3 ms prediction latency. Rotation accuracy is typically ±0.05°; positional drift is sub-mm over typical session lengths. Head-tracking errors are the fastest route to cybersickness.",
      zh: "六自由度（6DoF）追踪结合了IMU（陀螺仪+加速度计，约1 kHz）与4–7个向外可见光或红外摄像头，实现内向外SLAM。摄像头将6DoF位姿锚定至真实房间，无需外部基站。现代SLAM管线（高通骁龙XR2+ Gen 2、苹果定制R1芯片）融合IMU与视觉数据，预测延迟低于3毫秒。旋转精度通常约±0.05°；典型会话时长内位置漂移低于毫米级。头部追踪误差是导致晕动症最直接的原因。",
    },
    specs: [
      { label: { en: "DoF", zh: "自由度" }, value: { en: "6DoF (3 rotation + 3 translation)", zh: "6DoF（3旋转 + 3平移）" } },
      { label: { en: "IMU rate", zh: "IMU频率" }, value: { en: "~1 kHz gyroscope", zh: "陀螺仪约1 kHz" } },
      { label: { en: "Pose latency", zh: "位姿延迟" }, value: { en: "<3 ms prediction", zh: "预测延迟<3毫秒" } },
      { label: { en: "Method", zh: "方法" }, value: { en: "Inside-out SLAM (no base stations)", zh: "内向外SLAM（无需基站）" } },
    ],
    layerY: 0.22,
    icon: "M10 2 L10 4 M10 16 L10 18 M2 10 L4 10 M16 10 L18 10 M4.9 4.9 L6.3 6.3 M13.7 13.7 L15.1 15.1 M4.9 15.1 L6.3 13.7 M13.7 6.3 L15.1 4.9 M10 7 a3 3 0 0 1 0 6 a3 3 0 0 1 0-6",
  },
  {
    id: "eyetracking",
    color: C.iris400,
    colorDim: "#2e1248",
    label: { en: "Eye Tracking", zh: "眼球追踪" },
    tagline: { en: "Foveated rendering · gaze input · comfort", zh: "注视点渲染 · 凝视输入 · 视觉舒适度" },
    detail: {
      en: "Near-infrared LED + CMOS cameras inside the lens assembly image the corneal reflection and pupil at 200 Hz. Gaze accuracy of ~0.5–1° of visual angle enables foveated rendering — rendering the foveal region at full resolution and the periphery at up to 4× reduced resolution, cutting GPU load by 50–70%. PSVR2 and Vision Pro ship with integrated eye tracking; Meta uses it for natural avatar gaze. Gaze is also a 0-latency input modality and encodes cognitive load and presence. Vergence-accommodation conflict (VAC) — the eyes focus at panel depth while vergence targets virtual depth — is a fundamental near-field discomfort driver that varifocal / lightfield displays aim to solve.",
      zh: "镜片组件内的近红外LED与CMOS摄像头以200 Hz采集角膜反射和瞳孔图像，注视精度约0.5–1°视角，可实现注视点渲染——以全分辨率渲染中央凹区域，外周分辨率降低最多4倍，GPU负载降低50–70%。PSVR2和Vision Pro内置眼球追踪；Meta用于自然化身注视表达。注视还是零延迟输入模态，并能编码认知负荷与沉浸感。调节与辐辏冲突（VAC）——眼睛聚焦在面板深度而辐辏目标在虚拟深度——是近距离视觉不适的根本原因，可变焦距/光场显示旨在解决这一问题。",
    },
    specs: [
      { label: { en: "Tracking rate", zh: "追踪频率" }, value: { en: "~200 Hz NIR", zh: "约200 Hz近红外" } },
      { label: { en: "Accuracy", zh: "精度" }, value: { en: "~0.5–1° of visual angle", zh: "约0.5–1°视角" } },
      { label: { en: "Benefit", zh: "主要收益" }, value: { en: "50–70% GPU load reduction", zh: "GPU负载降低50–70%" } },
      { label: { en: "Open issue", zh: "待解问题" }, value: { en: "Vergence-accommodation conflict", zh: "调节-辐辏冲突" } },
    ],
    layerY: 0.35,
    icon: "M1 10 C5 4 15 4 19 10 C15 16 5 16 1 10 M10 7 a3 3 0 0 1 0 6 a3 3 0 0 1 0-6 M10 9.5 a0.5 0.5 0 0 1 0 1 a0.5 0.5 0 0 1 0-1",
  },
  {
    id: "handtracking",
    color: C.gold500,
    colorDim: "#3a2d08",
    label: { en: "Hand & Controller Tracking", zh: "手部与控制器追踪" },
    tagline: { en: "Optical hand pose · 6DoF controllers · input", zh: "光学手势追踪 · 6DoF控制器 · 输入" },
    detail: {
      en: "Outward cameras double as hand-tracking sensors: a CNN runs on-device at 30–60 Hz and estimates 21 hand keypoints (MediaPipe Hands or proprietary) with <10 ms pipeline latency at arm's length. 6DoF controllers add electromagnetic or optical IMU fusion for ~1 mm positional precision with physical haptic buttons. Meta Quest 3 supports both simultaneously via sensor fusion. Pinch detection triggers at ~1 mm fingertip separation. Hand occlusion (one hand behind the other) is a key degradation mode. Neural wristbands (EMG, e.g. Ctrl-Labs/Meta) sense motor unit firings before the fingers move — enabling sub-action-resolution gesture detection for future controller-free interaction.",
      zh: "外部摄像头同时作为手部追踪传感器：设备端CNN以30–60 Hz运行，在臂长距离估算21个手部关键点（MediaPipe Hands或专有算法），管线延迟<10毫秒。6DoF控制器增加了电磁或光学IMU融合，实现约1毫米位置精度并配有物理触觉按钮。Meta Quest 3通过传感器融合同时支持两种模式。捏合检测触发于约1毫米指尖间距。手部遮挡（一只手被另一只手遮住）是主要的降质场景。神经腕带（EMG，如Ctrl-Labs/Meta）在手指运动前即感知运动单元放电——实现未来无控制器交互的亚动作级手势识别。",
    },
    specs: [
      { label: { en: "Keypoints", zh: "关键点" }, value: { en: "21 per hand at 30–60 Hz", zh: "每手21个关键点，30–60 Hz" } },
      { label: { en: "Controller precision", zh: "控制器精度" }, value: { en: "~1 mm positional", zh: "约1毫米位置精度" } },
      { label: { en: "Latency", zh: "延迟" }, value: { en: "<10 ms hand-pose pipeline", zh: "手势管线延迟<10毫秒" } },
      { label: { en: "Frontier", zh: "前沿方向" }, value: { en: "EMG wristbands (pre-movement intent)", zh: "EMG腕带（运动前意图）" } },
    ],
    layerY: 0.48,
    icon: "M6 2 L6 10 M4 5 L4 11 M8 4 L8 11 M10 5 L10 11 M12 7 L12 12 C12 15 10 17 7 17 C4 17 2 15 2 12 L2 9",
  },
  {
    id: "audio",
    color: C.holo400,
    colorDim: "#0e3a42",
    label: { en: "Spatial Audio", zh: "空间音频" },
    tagline: { en: "HRTF personalisation · head-tracking reactive", zh: "个性化HRTF · 随头部追踪实时更新" },
    detail: {
      en: "Head-related transfer functions (HRTFs) are unique per-ear filtering characteristics that encode spatial direction — elevation, azimuth, distance — through the shape of your pinna, head, and torso. Rendering audio through a personalised HRTF (or a generalised library HRTF) via binaural convolution creates the illusion of sound in 3D space over headphones. The illusion degrades immediately if head rotation is not reflected in the audio: at 120 fps head tracking, the audio engine must re-render binaural cues within ~8 ms. Apple Vision Pro measures personal HRTFs via in-ear microphones and outward speaker chirps at headset setup. Spatial audio is cheap (CPU, not GPU) and contributes disproportionately to presence — a well-anchored audio source is harder to disbelieve than a visual one.",
      zh: "头相关传递函数（HRTF）是每只耳朵独特的滤波特性，通过耳廓、头部和躯干形状编码空间方向——仰角、方位角和距离。通过个性化HRTF（或通用HRTF库）对双耳音频进行卷积处理，可在耳机上产生三维空间声音幻觉。若头部旋转未及时反映在音频中，幻觉立即崩溃：在120fps头部追踪下，音频引擎必须在约8毫秒内重新渲染双耳线索。Apple Vision Pro在头显设置时通过入耳麦克风和外扬声器啁啾声测量个人HRTF。空间音频计算代价低（CPU而非GPU），对沉浸感的贡献远超其代价——一个锚定良好的音源比视觉更难被大脑质疑。",
    },
    specs: [
      { label: { en: "Method", zh: "方法" }, value: { en: "Binaural HRTF convolution", zh: "双耳HRTF卷积" } },
      { label: { en: "Update rate", zh: "更新频率" }, value: { en: "Tied to head-tracking, <8 ms", zh: "跟随头部追踪，<8毫秒" } },
      { label: { en: "Personalised HRTF", zh: "个性化HRTF" }, value: { en: "Vision Pro measures at setup", zh: "Vision Pro在设置时测量" } },
      { label: { en: "Impact on presence", zh: "对沉浸感影响" }, value: { en: "High — disproportionate to cost", zh: "高——收益远超计算成本" } },
    ],
    layerY: 0.61,
    icon: "M5 8 C5 5.2 7.2 3 10 3 C12.8 3 15 5.2 15 8 C15 10.8 12.8 13 10 13 M10 13 L10 17 M6 13 C4 11.5 3 9.8 3 8 M14 13 C16 11.5 17 9.8 17 8 M7 17 L13 17",
  },
  {
    id: "haptics",
    color: C.plasm500,
    colorDim: "#3a1228",
    label: { en: "Haptics", zh: "触觉反馈" },
    tagline: { en: "Hardest sense — note it lags · LRA · ultrasound", zh: "最难实现的感官——延迟问题突出 · 线性马达 · 超声波" },
    detail: {
      en: "Haptics is the hardest sense to reproduce in VR — and the one most behind the others. Linear resonant actuators (LRAs) in controllers simulate vibration patterns at 150–300 Hz but cannot simulate pressure, texture, or temperature. PS VR2 controllers have adaptive triggers (variable resistance) and finger-touch detection. Gloves with pneumatic bladders, vibrotactile arrays, or shape-memory alloys can simulate grasp but add bulk and cost. Ultrasound mid-air haptics (Ultraleap) create pressure points without contact. Hand-tracking latency for haptic feedback must stay below ~20 ms to maintain the touch/see synchrony: above that, the brain registers the mismatch as unreal. Thermal rendering (heating/cooling patches) is still lab-stage. Force feedback exoskeletons exist but are tethered, heavy, and expensive. Haptics lags vision by roughly a decade.",
      zh: "触觉是VR中最难复现的感官——也是落后其他感官最多的。控制器中的线性共振执行器（LRA）可模拟150–300 Hz振动，但无法模拟压力、纹理或温度。PS VR2控制器具备自适应扳机（可变阻力）和手指触摸检测。配备气动囊、振动触觉阵列或形状记忆合金的手套可模拟抓握，但增加了体积和成本。超声波空中触觉（Ultraleap）无需接触即可产生压力点。触觉反馈的手部追踪延迟必须低于约20毫秒，以维持触觉/视觉同步：超过此阈值，大脑会感知到不匹配并产生虚假感。热感渲染（加热/冷却贴片）仍处于实验室阶段。力反馈外骨骼已存在，但需要连接线缆、体积大且昂贵。触觉技术整体落后视觉技术约十年。",
    },
    specs: [
      { label: { en: "Best today", zh: "目前最优" }, value: { en: "LRA vibration + adaptive triggers", zh: "LRA振动 + 自适应扳机" } },
      { label: { en: "Sync requirement", zh: "同步要求" }, value: { en: "<20 ms touch/visual sync", zh: "触觉/视觉同步<20毫秒" } },
      { label: { en: "Frontier", zh: "前沿方向" }, value: { en: "Ultrasound mid-air, gloves, thermal", zh: "超声波空中触觉、手套、热感" } },
      { label: { en: "Status", zh: "技术现状" }, value: { en: "~10 years behind visual fidelity", zh: "落后视觉保真度约十年" } },
    ],
    layerY: 0.74,
    icon: "M10 2 C13 2 16 5 16 8 C16 11 13 14 10 14 C7 14 4 11 4 8 C4 5 7 2 10 2 M10 6 L10 10 M8 8 L12 8",
  },
  {
    id: "passthrough",
    color: C.iris500,
    colorDim: "#2a0a4a",
    label: { en: "Passthrough & Spatial Mapping", zh: "透视直通与空间映射" },
    tagline: { en: "Fusing digital into the real room → spatial computing", zh: "将数字内容融入真实空间 → 空间计算" },
    detail: {
      en: "Full-colour passthrough cameras (Meta Quest 3: two 18 MP sensors, 4:1 compression) capture the real world at latency ~12 ms and composite virtual objects over it — mixed reality (MR). Stereo depth sensors and LiDAR (Vision Pro) build a live mesh of the room in 3D: floor, walls, furniture, and hands become occluders and colliders for virtual objects. Scene understanding models (ARKit, OpenXR / AR Foundation) label surfaces and objects in real time. Apple Vision Pro uses 12 cameras, 6 microphones, 5 sensors, and LiDAR to generate a dense 3D room mesh. Passthrough quality — colour accuracy, latency, geometric distortion — determines whether virtual objects feel placed in the real world. When spatial mapping is accurate enough, the distinction between the virtual and physical dissolves: this is spatial computing.",
      zh: "全彩透视直通摄像头（Meta Quest 3：两个1800万像素传感器，4:1压缩）以约12毫秒延迟捕捉真实世界，并将虚拟对象合成其上——即混合现实（MR）。立体深度传感器和LiDAR（Vision Pro）实时构建房间的三维网格：地板、墙壁、家具和手部成为虚拟对象的遮挡物和碰撞体。场景理解模型（ARKit、OpenXR/AR Foundation）实时标注表面和物体。Apple Vision Pro使用12个摄像头、6个麦克风、5个传感器和LiDAR生成密集的3D房间网格。直通质量——颜色精度、延迟、几何畸变——决定虚拟对象是否像真正被放置在真实世界中。当空间映射足够精准时，虚拟与物理的界限消融：这就是空间计算。",
    },
    specs: [
      { label: { en: "Quest 3 cameras", zh: "Quest 3摄像头" }, value: { en: "2× 18 MP colour passthrough", zh: "2个1800万像素彩色直通摄像头" } },
      { label: { en: "Passthrough latency", zh: "直通延迟" }, value: { en: "~12 ms (Quest 3)", zh: "约12毫秒（Quest 3）" } },
      { label: { en: "Vision Pro sensors", zh: "Vision Pro传感器" }, value: { en: "12 cameras + 5 sensors + LiDAR", zh: "12个摄像头 + 5个传感器 + LiDAR" } },
      { label: { en: "Output", zh: "输出" }, value: { en: "Live 3D room mesh + surface labels", zh: "实时3D房间网格 + 表面标注" } },
    ],
    layerY: 0.87,
    icon: "M2 2 L8 8 M18 2 L12 8 M2 18 L8 12 M18 18 L12 12 M8 8 L12 8 L12 12 L8 12 Z",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   EXPLODED HEADSET SVG
   A stylised side-view of a VR headset with glowing layers that light up on hover.
───────────────────────────────────────────────────────────────────────────── */

interface HeadsetSVGProps {
  activeId: string | null;
  onLayerClick: (id: string) => void;
  lang: "en" | "zh";
}

function HeadsetSVG({ activeId, onLayerClick, lang }: HeadsetSVGProps) {
  const W = 340, H = 420;

  // Layer rectangles: [id, x, y, w, h, rx]
  const layers: { id: string; x: number; y: number; w: number; h: number; rx: number }[] = [
    { id: "display",      x: 60,  y: 24,  w: 220, h: 42, rx: 8 },
    { id: "headtracking", x: 50,  y: 82,  w: 240, h: 38, rx: 7 },
    { id: "eyetracking",  x: 65,  y: 136, w: 210, h: 36, rx: 7 },
    { id: "handtracking", x: 55,  y: 186, w: 230, h: 34, rx: 6 },
    { id: "audio",        x: 60,  y: 234, w: 220, h: 34, rx: 6 },
    { id: "haptics",      x: 70,  y: 282, w: 200, h: 32, rx: 6 },
    { id: "passthrough",  x: 52,  y: 328, w: 236, h: 36, rx: 7 },
  ];

  // Headset outer body
  const bodyPath =
    "M 44 20 C 44 14 50 10 56 10 L 284 10 C 290 10 296 14 296 20 L 296 370 C 296 376 290 380 284 380 L 56 380 C 50 380 44 376 44 370 Z";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      aria-label={lang === "zh" ? "VR头显分层架构交互图" : "VR headset layered architecture interactive diagram"}
    >
      <defs>
        <radialGradient id="ss-bg" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={C.void800} stopOpacity="0.9" />
          <stop offset="100%" stopColor={C.void950} stopOpacity="1" />
        </radialGradient>
        <filter id="ss-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ss-softglow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="ss-bodyfill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={C.void800} />
          <stop offset="100%" stopColor={C.void950} />
        </linearGradient>
        {SUBSYSTEMS.map((s) => (
          <radialGradient key={`ss-grad-${s.id}`} id={`ss-grad-${s.id}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* body */}
      <path d={bodyPath} fill="url(#ss-bodyfill)" stroke={C.iris500} strokeWidth="1" strokeOpacity="0.18" />

      {/* subtle body scanlines */}
      {Array.from({ length: 18 }).map((_, i) => (
        <line
          key={`scan-${i}`}
          x1={44} y1={30 + i * 20} x2={296} y2={30 + i * 20}
          stroke={C.holo500} strokeWidth="0.3" strokeOpacity="0.05"
        />
      ))}

      {/* lens circles (decorative) */}
      {[110, 230].map((cx, i) => (
        <g key={`lens-${i}`}>
          <ellipse cx={cx} cy={H * 0.5} rx="38" ry="46"
            fill={C.void950} stroke={C.holo500} strokeWidth="0.8" strokeOpacity="0.25" />
          <ellipse cx={cx} cy={H * 0.5} rx="26" ry="32"
            fill="none" stroke={C.holo400} strokeWidth="0.5" strokeOpacity="0.18" />
          <ellipse cx={cx - 8} cy={H * 0.5 - 10} rx="8" ry="10"
            fill="none" stroke={C.ink50} strokeWidth="0.4" strokeOpacity="0.06" />
        </g>
      ))}

      {/* layer rectangles */}
      {layers.map((l) => {
        const sub = SUBSYSTEMS.find((s) => s.id === l.id)!;
        const isActive = l.id === activeId;
        const cx = l.x + l.w / 2;
        const cy = l.y + l.h / 2;
        return (
          <g key={l.id} style={{ cursor: "pointer" }} onClick={() => onLayerClick(l.id)}>
            {/* glow fill */}
            {isActive && (
              <rect
                x={l.x - 8} y={l.y - 6} width={l.w + 16} height={l.h + 12} rx={l.rx + 4}
                fill={`url(#ss-grad-${l.id})`}
              />
            )}
            {/* main rect */}
            <rect
              x={l.x} y={l.y} width={l.w} height={l.h} rx={l.rx}
              fill={isActive ? `${sub.color}18` : `${sub.color}08`}
              stroke={sub.color}
              strokeWidth={isActive ? 1.8 : 0.7}
              strokeOpacity={isActive ? 1 : 0.28}
              style={{
                filter: isActive ? `drop-shadow(0 0 8px ${sub.color}cc)` : "none",
                transition: "stroke-width 0.25s, fill 0.25s",
              }}
            />
            {/* dot indicator */}
            <circle
              cx={l.x + 14} cy={cy} r={isActive ? 4 : 2.5}
              fill={sub.color}
              fillOpacity={isActive ? 1 : 0.45}
              style={{
                filter: isActive ? `drop-shadow(0 0 5px ${sub.color})` : "none",
                transition: "r 0.2s",
              }}
            />
            {/* ring on active */}
            {isActive && (
              <circle cx={l.x + 14} cy={cy} r={9}
                fill="none" stroke={sub.color} strokeWidth="0.8" strokeOpacity="0.35"
                strokeDasharray="3 4"
              />
            )}
            {/* label */}
            <text
              x={l.x + 28} y={cy + 4}
              fill={isActive ? sub.color : `${sub.color}99`}
              fontSize="9.5"
              fontFamily="JetBrains Mono, monospace"
              letterSpacing="0.05em"
              style={{ pointerEvents: "none", transition: "fill 0.25s" }}
            >
              {sub.label[lang]}
            </text>
          </g>
        );
      })}

      {/* right-side "exploded" connecting lines */}
      {layers.map((l, i) => {
        const sub = SUBSYSTEMS.find((s) => s.id === l.id)!;
        const isActive = l.id === activeId;
        const rightX = l.x + l.w;
        const cy = l.y + l.h / 2;
        const labelX = rightX + 18;
        return (
          <g key={`line-${l.id}`}>
            <line
              x1={rightX} y1={cy} x2={labelX} y2={cy}
              stroke={sub.color}
              strokeWidth={isActive ? 1.2 : 0.5}
              strokeOpacity={isActive ? 0.9 : 0.22}
              strokeDasharray={isActive ? "none" : "3 5"}
            />
            <circle cx={labelX} cy={cy} r={isActive ? 3 : 1.8}
              fill={sub.color} fillOpacity={isActive ? 1 : 0.35} />
          </g>
        );
      })}

      {/* title overlay */}
      <text x={W / 2} y={H - 10} textAnchor="middle"
        fill={C.ink500} fontSize="8" fontFamily="JetBrains Mono, monospace"
        letterSpacing="0.18em" opacity="0.4">
        {lang === "zh" ? "点击层级以探索" : "CLICK LAYER TO EXPLORE"}
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MOTION-TO-PHOTON LATENCY DIAGRAM
   Interactive canvas: slider controls total M2P latency.
   Shows the pipeline stages and a comfort/nausea indicator.
───────────────────────────────────────────────────────────────────────────── */

function drawLatencyCanvas(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  latencyMs: number,
  pulsePhase: number,
  lang: "en" | "zh",
) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.void950;
  ctx.fillRect(0, 0, W, H);

  // Pipeline stages: [label_en, label_zh, budgetMs, color]
  const stages: [string, string, number, string][] = [
    ["Sensor read", "传感器读取",  1.5, C.flux400],
    ["Pose predict", "姿态预测",   2.0, C.flux500],
    ["Game logic", "游戏逻辑",     3.5, C.iris400],
    ["GPU render", "GPU渲染",      8.0, C.iris500],
    ["Scanout", "扫描输出",        2.5, C.holo500],
    ["Display settle", "显示响应", 2.5, C.holo400],
  ];

  const TARGET_MS = 20;
  const totalBase = stages.reduce((a, s) => a + s[2], 0); // ~20 ms nominal

  // Scale each stage's actual duration proportionally to latencyMs
  const scale = latencyMs / totalBase;
  const scaledStages = stages.map((s) => ({
    labelEn: s[0], labelZh: s[1], ms: s[2] * scale, color: s[3],
  }));

  const barArea = { x: 20, y: 52, w: W - 40, h: 36 };
  const totalMs = scaledStages.reduce((a, s) => a + s.ms, 0);

  // Draw pipeline bar
  let curX = barArea.x;
  scaledStages.forEach((s) => {
    const segW = (s.ms / totalMs) * barArea.w;
    // segment fill
    ctx.fillStyle = `${s.color}44`;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect?.(curX, barArea.y, segW - 1, barArea.h, 3);
    ctx.fill();
    ctx.stroke();
    // label above
    const labelX = curX + segW / 2;
    ctx.save();
    ctx.font = `7px 'JetBrains Mono', monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = s.color;
    ctx.fillText(lang === "zh" ? s.labelZh : s.labelEn, labelX, barArea.y - 8);
    ctx.fillText(`${s.ms.toFixed(1)}ms`, labelX, barArea.y + barArea.h + 12);
    ctx.restore();
    curX += segW;
  });

  // Total label
  ctx.save();
  ctx.font = `bold 10px 'JetBrains Mono', monospace`;
  ctx.textAlign = "left";
  ctx.fillStyle = latencyMs <= TARGET_MS ? C.holo500 : C.plasm500;
  ctx.shadowColor = latencyMs <= TARGET_MS ? C.holo500 : C.plasm500;
  ctx.shadowBlur = 8;
  ctx.fillText(
    `${latencyMs.toFixed(0)} ms ${lang === "zh" ? "端到端延迟" : "end-to-end"}`,
    barArea.x, barArea.y - 22,
  );
  ctx.restore();

  // Vestibular/comfort meter bar at bottom
  const meterY = H - 54;
  const meterH = 16;
  const comfortRange = [8, 20];   // ms: <= 8 → great presence, >= 20 → nausea onset
  const nauseaRange  = [20, 60];

  // Gradient track
  const grad = ctx.createLinearGradient(barArea.x, 0, barArea.x + barArea.w, 0);
  grad.addColorStop(0,   `${C.holo500}cc`);
  grad.addColorStop(0.35, `${C.gold500}cc`);
  grad.addColorStop(0.7,  `${C.plasm500}cc`);
  grad.addColorStop(1,    `${C.plasm500}ff`);
  ctx.fillStyle = `${C.void800}cc`;
  ctx.beginPath();
  ctx.roundRect?.(barArea.x, meterY, barArea.w, meterH, 4);
  ctx.fill();
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.roundRect?.(barArea.x, meterY, barArea.w, meterH, 4);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Comfort threshold markers
  const threshX20 = barArea.x + (20 / 60) * barArea.w;
  const threshX8  = barArea.x + (8  / 60) * barArea.w;
  ctx.save();
  [
    { x: threshX8,  label: lang === "zh" ? "8ms 存在感" : "8ms presence", color: C.holo400 },
    { x: threshX20, label: lang === "zh" ? "20ms 舒适极限" : "20ms comfort limit", color: C.gold400 },
  ].forEach(({ x, label, color }) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, meterY - 2);
    ctx.lineTo(x, meterY + meterH + 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "7px 'JetBrains Mono', monospace";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(label, x, meterY + meterH + 13);
  });
  ctx.restore();

  // Current latency indicator on the meter
  const indicatorX = barArea.x + Math.min((latencyMs / 60) * barArea.w, barArea.w);
  const meterColor = latencyMs <= 10 ? C.holo500 : latencyMs <= 20 ? C.gold500 : C.plasm500;

  // Pulsing glow
  const glowAlpha = 0.5 + 0.5 * Math.sin(pulsePhase);
  ctx.save();
  ctx.shadowColor = meterColor;
  ctx.shadowBlur  = 12 * glowAlpha;
  ctx.fillStyle   = meterColor;
  ctx.beginPath();
  ctx.arc(indicatorX, meterY + meterH / 2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = C.void950;
  ctx.beginPath();
  ctx.arc(indicatorX, meterY + meterH / 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Status label
  const status = latencyMs <= 10
    ? (lang === "zh" ? "强存在感" : "Strong Presence")
    : latencyMs <= 20
    ? (lang === "zh" ? "舒适区边缘" : "Comfort Boundary")
    : latencyMs <= 35
    ? (lang === "zh" ? "恶心开始" : "Nausea Onset")
    : (lang === "zh" ? "强烈不适" : "Heavy Cybersickness");

  ctx.save();
  ctx.font = `bold 9px 'JetBrains Mono', monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = meterColor;
  ctx.shadowColor = meterColor;
  ctx.shadowBlur = 6;
  ctx.fillText(status, W / 2, meterY - 8);
  ctx.restore();

  // Axis label
  ctx.save();
  ctx.font = "7px 'JetBrains Mono', monospace";
  ctx.fillStyle = C.ink500;
  ctx.textAlign = "left";
  ctx.fillText(lang === "zh" ? "视觉/前庭一致性" : "Visual / Vestibular Agreement", barArea.x, H - 4);
  ctx.textAlign = "right";
  ctx.fillText("0ms → 60ms", barArea.x + barArea.w, H - 4);
  ctx.restore();

  // Unused ranges
  void comfortRange; void nauseaRange;
}

function LatencyCanvas({ latencyMs, lang }: { latencyMs: number; lang: "en" | "zh" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef  = useRef(0);
  const rafRef    = useRef(0);
  const lastTsRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const loop = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
      lastTsRef.current = ts;
      phaseRef.current += dt * 3.0;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        drawLatencyCanvas(ctx, rect.width, rect.height, latencyMs, phaseRef.current, lang);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [latencyMs, lang]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-label={lang === "zh"
        ? "运动到光子延迟管线可视化"
        : "Motion-to-photon latency pipeline visualization"}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PRESENCE METER — shows how many subsystems are "aligned"
   (conceptual: more subsystems at high fidelity = higher presence score)
───────────────────────────────────────────────────────────────────────────── */
function PresenceMeter({ activeCount, lang }: { activeCount: number; lang: "en" | "zh" }) {
  const L = (en: string, zh: string) => lang === "zh" ? zh : en;
  const total = SUBSYSTEMS.length;
  const pct = activeCount / total;
  const color = pct < 0.3 ? C.plasm500 : pct < 0.6 ? C.gold500 : pct < 0.85 ? C.holo500 : C.flux400;
  const label =
    pct < 0.3  ? L("Minimal", "极低")    :
    pct < 0.6  ? L("Partial", "局部")    :
    pct < 0.85 ? L("Emerging", "涌现中") :
                 L("Full Presence", "完全沉浸");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="label-mono" style={{ color }}>
          {L("Presence Score", "沉浸感分数")}
        </span>
        <span className="font-mono text-[0.72rem]" style={{ color }}>
          {activeCount}/{total} {L("systems", "系统")} — {label}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: `${color}18` }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct * 100}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: pct > 0.5 ? `0 0 10px ${color}99` : undefined,
          }}
        />
      </div>
      <p className={`text-[0.7rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink500 }}>
        {L(
          "Presence emerges only when enough subsystems agree — display, tracking, audio, haptics, and mapping must all stay phase-locked within their latency budgets.",
          "只有当足够多的子系统保持一致时，沉浸感才会涌现——显示、追踪、音频、触觉和空间映射必须全部在各自的延迟预算内保持相位锁定。",
        )}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function SpatialStack() {
  const { lang } = useLang();
  const L = (en: string, zh: string) => lang === "zh" ? zh : en;

  const [activeId, setActiveId] = useState<string | null>("display");
  // latency slider: 8–60 ms
  const [latencyMs, setLatencyMs] = useState<number>(20);
  // how many subsystems explored
  const [explored, setExplored] = useState<Set<string>>(new Set(["display"]));

  const activeSystem = SUBSYSTEMS.find((s) => s.id === activeId) ?? null;

  const handleLayerClick = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
    setExplored((prev) => new Set([...prev, id]));
  }, []);

  return (
    <div className="w-full flex flex-col gap-10">

      {/* ── Section header ── */}
      <div className="flex flex-col gap-3">
        <div className="label-mono" style={{ color: C.holo500 }}>
          {L("System 03 · VR Hardware & Spatial Computing", "系统03 · VR硬件与空间计算")}
        </div>
        <h2 className={`display text-3xl md:text-4xl leading-tight spark-text ${lang === "zh" ? "zh" : ""}`}>
          {L("The Spatial Stack", "空间感知技术栈")}
        </h2>
        <p
          className={`text-sm max-w-2xl leading-relaxed ${lang === "zh" ? "zh" : ""}`}
          style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}
        >
          {L(
            "A VR headset is a real-time sensory orchestration machine. Seven subsystems must simultaneously agree — within tight latency budgets — to convince your brain that you are somewhere else. Click any layer to inspect it.",
            "VR头显是一台实时感官协同机器。七个子系统必须在严格的延迟预算内同步一致——才能让你的大脑相信你身处别处。点击任意层级以深入了解。",
          )}
        </p>
      </div>

      <div className="h-px rule-flux opacity-40 rounded-full" />

      {/* ── PART 1: Exploded diagram + info card ── */}
      <div className="flex flex-col gap-5">
        <div className="label-mono" style={{ color: C.holo500 }}>
          {L("Part 1 · Exploded Architecture", "第一部分 · 分解架构图")}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 items-start">

          {/* ─ Headset SVG ─ */}
          <div
            className="relative rounded-2xl overflow-hidden border"
            style={{
              background: `linear-gradient(160deg, ${C.void800} 0%, ${C.void950} 100%)`,
              borderColor: `${C.iris500}20`,
              boxShadow: `0 0 80px -30px ${C.iris500}44`,
            }}
          >
            <div className="absolute top-3 left-4 label-mono opacity-50 z-10" style={{ color: C.flux400, fontSize: "0.56rem" }}>
              {L("EXPLODED · FRONTAL SECTION", "爆炸图 · 正面截面")}
            </div>
            <div className="aspect-[340/420] w-full">
              <HeadsetSVG activeId={activeId} onLayerClick={handleLayerClick} lang={lang} />
            </div>
            <div className="absolute bottom-0 inset-x-0 px-4 py-2 bg-gradient-to-t from-void-950/90 to-transparent">
              <p className="text-[0.58rem] font-mono text-center" style={{ color: C.ink500 + "88" }}>
                {L("click a layer to explore", "点击层级以探索")}
              </p>
            </div>
          </div>

          {/* ─ Info panel ─ */}
          <div className="flex flex-col gap-4">

            {/* Detail card */}
            <div
              className="panel rounded-2xl p-5 min-h-[200px] transition-all duration-300"
              style={{
                borderColor: activeSystem ? `${activeSystem.color}38` : `${C.holo500}14`,
                boxShadow: activeSystem ? `0 0 48px -20px ${activeSystem.color}55` : undefined,
              }}
            >
              {activeSystem ? (
                <div key={activeId} className="lang-fade flex flex-col gap-4">
                  {/* title row */}
                  <div className="flex items-start gap-3 flex-wrap">
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: activeSystem.color, boxShadow: `0 0 8px ${activeSystem.color}` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="label-mono mb-1" style={{ color: activeSystem.color, fontSize: "0.58rem" }}>
                        {L("SUBSYSTEM", "子系统")}
                      </div>
                      <h3 className={`display text-xl font-bold mb-0.5 ${lang === "zh" ? "zh" : ""}`}
                        style={{ color: activeSystem.color }}>
                        {activeSystem.label[lang]}
                      </h3>
                      <p className={`text-[0.72rem] font-mono ${lang === "zh" ? "zh" : ""}`}
                        style={{ color: `${activeSystem.color}88` }}>
                        {activeSystem.tagline[lang]}
                      </p>
                    </div>
                  </div>

                  {/* description */}
                  <p
                    className={`text-[0.8rem] leading-relaxed ${lang === "zh" ? "zh" : ""}`}
                    style={{
                      color: C.ink300,
                      fontFamily: lang === "zh" ? undefined : '"Spectral", serif',
                    }}
                  >
                    {activeSystem.detail[lang]}
                  </p>

                  {/* spec grid */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {activeSystem.specs.map((spec) => (
                      <div
                        key={spec.label.en}
                        className="rounded-lg p-2.5"
                        style={{
                          background: `${activeSystem.color}0a`,
                          border: `1px solid ${activeSystem.color}20`,
                        }}
                      >
                        <div
                          className="font-mono text-[0.56rem] tracking-widest uppercase mb-1"
                          style={{ color: `${activeSystem.color}80` }}
                        >
                          {spec.label[lang]}
                        </div>
                        <div className={`text-[0.72rem] leading-snug ${lang === "zh" ? "zh" : ""}`}
                          style={{ color: C.ink50 }}>
                          {spec.value[lang]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full font-mono text-sm" style={{ color: C.ink500 + "55" }}>
                  {L("select a layer →", "选择一个层级 →")}
                </div>
              )}
            </div>

            {/* Quick-nav chip row */}
            <div className="flex flex-wrap gap-2">
              {SUBSYSTEMS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleLayerClick(s.id)}
                  className={`text-[0.65rem] font-mono px-2.5 py-1 rounded-full border transition-all duration-200 ${lang === "zh" ? "zh" : ""}`}
                  style={{
                    borderColor: s.id === activeId ? `${s.color}88` : `${s.color}28`,
                    color:       s.id === activeId ? s.color : explored.has(s.id) ? `${s.color}88` : C.ink500,
                    background:  s.id === activeId ? `${s.color}18` : "transparent",
                  }}
                >
                  {s.label[lang]}
                </button>
              ))}
            </div>

            {/* Presence meter */}
            <div
              className="panel rounded-xl p-4"
              style={{ borderColor: `${C.holo500}20` }}
            >
              <PresenceMeter activeCount={explored.size} lang={lang} />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px rule-flux opacity-25 rounded-full" />

      {/* ── PART 2: Motion-to-photon latency diagram ── */}
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <div className="label-mono" style={{ color: C.gold500 }}>
              {L("Part 2 · Motion-to-Photon Budget", "第二部分 · 运动到光子延迟预算")}
            </div>
            <h3 className={`display text-xl font-bold ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink50 }}>
              {L("The 20 ms Window", "20毫秒生死线")}
            </h3>
            <p className={`text-[0.78rem] leading-relaxed max-w-xl ${lang === "zh" ? "zh" : ""}`}
              style={{ color: C.ink300, fontFamily: lang === "zh" ? undefined : '"Spectral", serif' }}>
              {L(
                "From the moment your head moves to the moment photons leave the display, the entire pipeline — sensor read, pose prediction, game logic, GPU render, scanout, display settle — must complete within ~20 ms. Exceed it and the vestibular system detects the mismatch: cybersickness follows.",
                "从头部开始运动到光子离开显示屏，整个管线——传感器读取、姿态预测、游戏逻辑、GPU渲染、扫描输出、显示响应——必须在约20毫秒内完成。超出则前庭系统检测到不匹配：晕动症随之而来。",
              )}
            </p>
          </div>
        </div>

        {/* Canvas */}
        <div
          className="relative rounded-2xl overflow-hidden border"
          style={{
            background: C.void950,
            borderColor: `${C.gold500}22`,
            boxShadow: `0 0 60px -28px ${C.gold500}44`,
          }}
        >
          <div style={{ height: 180 }}>
            <LatencyCanvas latencyMs={latencyMs} lang={lang} />
          </div>
        </div>

        {/* Slider */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="label-mono" style={{ color: C.gold500 }}>
              {L("Adjust total M2P latency", "调整运动到光子总延迟")}
            </span>
            <span
              className="font-mono text-sm font-bold"
              style={{
                color: latencyMs <= 10 ? C.holo500 : latencyMs <= 20 ? C.gold400 : C.plasm500,
              }}
            >
              {latencyMs} ms
            </span>
          </div>
          <input
            type="range"
            min={8}
            max={60}
            step={1}
            value={latencyMs}
            onChange={(e) => setLatencyMs(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(90deg, ${C.holo500} 0%, ${C.gold500} 33%, ${C.plasm500} 80%)`,
              accentColor: latencyMs <= 20 ? C.holo500 : C.plasm500,
            }}
            aria-label={lang === "zh" ? "延迟滑块" : "Latency slider"}
          />
          {/* Tick marks */}
          <div className="flex justify-between font-mono text-[0.6rem]" style={{ color: C.ink500 }}>
            <span style={{ color: C.holo400 }}>8ms</span>
            <span style={{ color: C.gold400 }}>20ms {L("comfort limit", "舒适极限")}</span>
            <span style={{ color: C.plasm500 }}>60ms {L("severe", "严重")}</span>
          </div>
        </div>

        {/* Stage breakdown table */}
        <div className="panel rounded-xl overflow-hidden" style={{ borderColor: `${C.gold500}14` }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: `${C.gold500}12` }}>
            <span className="label-mono" style={{ color: C.gold500 }}>
              {L("Pipeline Stage Breakdown", "管线阶段分解")}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.72rem]" style={{ minWidth: 420 }}>
              <thead>
                <tr className="border-b" style={{ borderColor: `${C.ink50}08` }}>
                  <th className="text-left px-4 py-2.5 font-mono text-[0.6rem] uppercase tracking-widest" style={{ color: C.ink500 }}>
                    {L("Stage", "阶段")}
                  </th>
                  <th className="text-left px-4 py-2.5 font-mono text-[0.6rem] uppercase tracking-widest" style={{ color: C.ink500 }}>
                    {L("Budget", "预算")}
                  </th>
                  <th className="text-left px-4 py-2.5 font-mono text-[0.6rem] uppercase tracking-widest" style={{ color: C.ink500 }}>
                    {L("Technique", "优化手段")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    stage:     { en: "Sensor read (IMU + cameras)", zh: "传感器读取（IMU + 摄像头）" },
                    budget:    "~1.5 ms",
                    technique: { en: "1 kHz IMU polling; camera readout at 90+ fps", zh: "1 kHz IMU轮询；摄像头90+帧读出" },
                    color: C.flux400,
                  },
                  {
                    stage:     { en: "Pose prediction", zh: "姿态预测" },
                    budget:    "~2 ms",
                    technique: { en: "Kalman / complementary filter; extrapolates ~20 ms ahead", zh: "卡尔曼/互补滤波；外推约20毫秒" },
                    color: C.flux500,
                  },
                  {
                    stage:     { en: "Game / application logic", zh: "游戏/应用逻辑" },
                    budget:    "~3.5 ms",
                    technique: { en: "Fixed sim tick at render rate; decouple from physics", zh: "以渲染帧率固定仿真节拍；与物理解耦" },
                    color: C.iris400,
                  },
                  {
                    stage:     { en: "GPU render + foveated", zh: "GPU渲染 + 注视点渲染" },
                    budget:    "~8 ms",
                    technique: { en: "Foveated rendering (eye-tracked), reprojection fallback", zh: "注视点渲染（眼动追踪），重投影备用" },
                    color: C.iris500,
                  },
                  {
                    stage:     { en: "Scanout (compositor → display)", zh: "扫描输出（合成器→显示屏）" },
                    budget:    "~2.5 ms",
                    technique: { en: "Timewarp / ATW warps last frame to current head pose", zh: "Timewarp/ATW将最后一帧变换到当前头部姿态" },
                    color: C.holo500,
                  },
                  {
                    stage:     { en: "Display settle (OLED response)", zh: "显示屏响应（OLED）" },
                    budget:    "~2.5 ms",
                    technique: { en: "Low-persistence strobe (<2 ms); BFI on LCD panels", zh: "低持续时间频闪（<2毫秒）；LCD面板黑帧插入" },
                    color: C.holo400,
                  },
                ].map(({ stage, budget, technique, color }, ri) => (
                  <tr key={ri} className="border-b transition-colors hover:bg-white/[0.015]"
                    style={{ borderColor: `${C.ink50}06` }}>
                    <td className="px-4 py-2.5 font-mono text-[0.68rem] whitespace-nowrap" style={{ color }}>
                      {stage[lang]}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-bold text-[0.68rem]" style={{ color: C.gold400 }}>
                      {budget}
                    </td>
                    <td className={`px-4 py-2.5 text-[0.7rem] leading-snug ${lang === "zh" ? "zh" : ""}`}
                      style={{ color: C.ink300 }}>
                      {technique[lang]}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: `${C.gold500}0a` }}>
                  <td className="px-4 py-2.5 font-mono font-bold text-[0.7rem]" style={{ color: C.gold400 }}>
                    {L("TOTAL", "合计")}
                  </td>
                  <td className="px-4 py-2.5 font-mono font-bold text-[0.7rem]" style={{ color: C.gold500 }}>
                    ~20 ms
                  </td>
                  <td className={`px-4 py-2.5 text-[0.7rem] ${lang === "zh" ? "zh" : ""}`} style={{ color: C.ink500 }}>
                    {L("Exceeding this causes vestibular/visual mismatch → cybersickness", "超出此限导致前庭/视觉不匹配 → 晕动症")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ── Closing observation ── */}
      <div
        className={`rounded-xl border px-5 py-4 text-sm leading-relaxed ${lang === "zh" ? "zh" : ""}`}
        style={{
          borderColor: `${C.holo500}14`,
          background: `${C.holo500}05`,
          fontFamily: lang === "zh" ? undefined : '"Spectral", serif',
          color: C.ink300 + "cc",
        }}
      >
        {L(
          "Presence is not a single system — it is consensus. The brain is not fooled by any one subsystem in isolation; it is a Bayesian integrator that cross-checks every sense against every other. A display with perfect resolution but 40 ms head-tracking latency produces nausea, not immersion. When display, tracking, audio, haptics, and spatial mapping all stay within their latency budgets and maintain geometric coherence, the brain stops asking whether it is real — and the boundary dissolves.",
          "沉浸感不是某一个系统——它是共识。大脑不会被任何单一子系统欺骗；它是一个贝叶斯积分器，将每一种感官与其他所有感官交叉比对。一个分辨率完美但头部追踪延迟达40毫秒的头显，产生的是恶心而非沉浸。当显示、追踪、音频、触觉和空间映射全部在各自的延迟预算内保持几何一致性时，大脑便不再追问这是否真实——边界于是消融。",
        )}
      </div>
    </div>
  );
}
