import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

const TITLE_EN =
  "Virtual Reality Engine · Virtual Worlds, Immersive Consciousness, Digital Reality & Post-Physical Civilization";
const TITLE_ZH =
  "虚拟现实引擎 · 虚拟世界、沉浸意识、数字现实与后物理文明";
const DESC =
  "A civilisation-scale, bilingual exploration of virtual reality — perception and presence, the long history of immersion, spatial computing and haptics, full-dive neural VR, AI-generated worlds, avatars and digital identity, virtual economies, persistent virtual societies, simulation theory, and the question of whether civilisation is learning to engineer subjective experience itself through programmable information environments.";

export const metadata: Metadata = {
  metadataBase: new URL("https://vr-engine.psyverse.fun"),
  title: `${TITLE_EN} | ${TITLE_ZH}`,
  description: DESC,
  keywords: [
    "virtual reality", "VR", "augmented reality", "AR", "mixed reality", "XR", "metaverse",
    "spatial computing", "Apple Vision Pro", "head-mounted display", "HMD", "immersion", "presence",
    "haptics", "eye tracking", "hand tracking", "volumetric rendering", "full-dive VR", "neural immersion",
    "brain-computer interface", "synthetic perception", "AI-generated worlds", "procedural generation",
    "NPC", "digital identity", "avatar", "virtual economy", "digital ownership", "creator economy",
    "virtual society", "virtual civilization", "digital citizenship", "simulation hypothesis",
    "holographic universe", "digital physics", "perception engineering", "post-physical civilization",
    "immersive consciousness", "reality engineering", "experience economy", "game engine", "cybernetics",
    "虚拟现实", "增强现实", "混合现实", "元宇宙", "空间计算", "头显", "沉浸", "临场感", "触觉反馈",
    "眼动追踪", "手部追踪", "体积渲染", "全沉浸VR", "神经沉浸", "脑机接口", "合成感知",
    "AI生成世界", "程序化生成", "数字身份", "虚拟化身", "虚拟经济", "数字所有权", "创作者经济",
    "虚拟社会", "虚拟文明", "数字公民", "模拟假说", "全息宇宙", "数字物理", "感知工程",
    "后物理文明", "沉浸意识", "现实工程", "体验经济", "游戏引擎", "控制论", "数字现实",
  ],
  authors: [{ name: "Gewenbo", url: "https://psyverse.fun" }],
  alternates: { canonical: "/", languages: { en: "/", "zh-CN": "/", "x-default": "/" } },
  openGraph: {
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Virtual Reality Engine · 虚拟现实引擎 — Virtual Worlds, Immersive Consciousness, Digital Reality & Post-Physical Civilization" }],
    title: TITLE_EN,
    description:
      "Civilisation has always engineered matter; virtual reality engineers perception itself. A bilingual atlas of immersion — spatial computing, full-dive VR, AI worlds, avatars, virtual economies, virtual societies, simulation theory and post-physical civilisation.",
    url: "https://vr-engine.psyverse.fun/",
    siteName: "Psyverse",
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
  },
  twitter: {
    images: ["/twitter-image.png"],
    card: "summary_large_image",
    title: TITLE_EN,
    description: "Virtual reality · spatial computing · full-dive VR · AI-generated worlds · avatars · virtual economies · simulation theory · post-physical civilization. A bilingual exploration of engineering experience itself.",
  },
  robots: { index: true, follow: true },
  other: { "theme-color": "#06030f" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@300;400;500&family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: TITLE_EN,
              alternateName: TITLE_ZH,
              description: DESC,
              url: "https://vr-engine.psyverse.fun/",
              inLanguage: ["en", "zh-CN"],
              author: { "@type": "Person", name: "Gewenbo", url: "https://psyverse.fun/" },
              publisher: { "@type": "Organization", name: "Psyverse", url: "https://psyverse.fun/" },
            }),
          }}
        />
      </head>
      <body className="bg-void-950 text-ink-100 antialiased">
        {children}
        <Script src="https://analytics-dashboard-two-blue.vercel.app/tracker.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
