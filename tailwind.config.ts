import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#08090A",
        forge: {
          dark: "#050506",
          black: "#0B0C0E",
          card: "#121417",
          cardHover: "#171B20",
          border: "#23272F",
          hairline: "rgba(255, 255, 255, 0.08)",
          orange: "#E87200",
          amber: "#FF7A00",
          bright: "#FFA033",
          glow: "rgba(232, 114, 0, 0.35)",
          muted: "#8E95A5",
          chalk: "#F4F5F7",
        },
        // Water status indicators kept intact and calibrated with Forge styling
        status: {
          safe: "#10B981", // emerald
          moderate: "#FF7A00", // forge amber
          unsafe: "#EF4444", // warning red
        },
      },
      fontFamily: {
        display: ["var(--font-barlow)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "forge-glow": "0 0 35px -5px rgba(232, 114, 0, 0.3)",
        "forge-subtle": "0 10px 40px -10px rgba(0, 0, 0, 0.8)",
        "forge-inset": "inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
      },
      animation: {
        "ticker": "ticker 28s linear infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "radar-sweep": "radar 4s linear infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.8", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" },
        },
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
