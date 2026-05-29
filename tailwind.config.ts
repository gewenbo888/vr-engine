import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // deep virtual void — black with a purple-blue undertone
        void: {
          950: "#06030f",
          900: "#0b0620",
          800: "#120a33",
          700: "#1a1048",
          600: "#241860",
          500: "#2f2078",
        },
        // spatial neon — electric azure-blue, the grid / structural pole
        flux: {
          600: "#1f6feb",
          500: "#4d9bff",
          400: "#93c5ff",
        },
        // immersion violet — VR purple, the dominant pole (consciousness/experience)
        iris: {
          600: "#7c3aed",
          500: "#a855f7",
          400: "#c98bff",
        },
        // holographic cyan — spatial UI, depth, holograms
        holo: {
          600: "#0891b2",
          500: "#22d3ee",
          400: "#67e8f9",
        },
        // signal amber — highlights / energy / value
        gold: {
          600: "#cf9b2e",
          500: "#f5c24d",
          400: "#ffd97a",
          300: "#ffe9b3",
          200: "#fff3d6",
        },
        // cyberpunk magenta — neon, alert, identity, glow
        plasm: {
          600: "#c81d77",
          500: "#ff4d9d",
          400: "#ff8fc4",
        },
        ink: {
          50: "#f6f4ff",
          100: "#e9e6fb",
          300: "#b3afd8",
          500: "#797399",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Spectral"', "ui-serif", "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        zh: ['"Noto Serif SC"', "serif"],
        zhsans: ['"Noto Sans SC"', "sans-serif"],
      },
      boxShadow: {
        panel: "inset 0 1px 0 rgba(77,155,255,0.08), 0 24px 64px -30px rgba(0,0,0,0.95)",
        glow: "0 0 48px -10px rgba(168,85,247,0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
