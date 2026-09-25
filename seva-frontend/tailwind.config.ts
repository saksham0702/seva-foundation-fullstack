import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        // ── Main dashboard palette ────────────────────────────────────
        navy: {
          DEFAULT: "#0B0F1F",
          50: "#111827",
          100: "#0d1424",
          200: "#0B0F1F",
          300: "#090c18",
          400: "#070a14",
          500: "#05070f",
        },

        gold: {
          DEFAULT: "#D4A843",
          light: "#EDC952",
          dark: "#B8922E",
          50: "#FDF8EC",
          100: "#F9EDC8",
          200: "#F3DB8D",
          300: "#EDC952",
          400: "#D4A843",
          500: "#B8922E",
          600: "#8F7022",
          700: "#664E18",
          800: "#3D2C0E",
          900: "#140A04",
        },

        emerald: {
          accent: "#2FCE9A",
          dark: "#1D9E75",
        },

        purple: {
          accent: "#9B95F0",
          dark: "#7F77DD",
        },

        orange: {
          accent: "#EF9F27",
          dark: "#D85A30",
        },

        blue: {
          accent: "#6F93FF",
          dark: "#4D7BFF",
          light: "#1A52F5",
        },

        coral: {
          accent: "#E37A54",
          dark: "#D85A30",
        },

        surface: {
          DEFAULT: "rgba(255,255,255,.03)",
          hover: "rgba(255,255,255,.05)",
          active: "rgba(255,255,255,.06)",
          border: "rgba(255,255,255,.10)",
        },

        // ── Certificate module flat tokens ────────────────────────────
        bg: "#0a0e1a",
        panel: "#10162a",
        border: "#1e2740",
        blueaccent: "#3b82f6",
        muted: "#8892a6",
        faint: "#57617a",
        "text-primary": "#f5f6f8",
      },

      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        serif: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },

      backgroundImage: {
        "gradient-radial":
          "radial-gradient(var(--tw-gradient-stops))",

        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",

        "gold-gradient":
          "linear-gradient(135deg,#D4A843 0%,#B8922E 100%)",

        "hero-glow":
          "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(212,168,67,.15) 0%,transparent 60%)",
      },

      boxShadow: {
        gold: "0 4px 20px rgba(212,168,67,.25)",
        "gold-lg": "0 8px 30px rgba(212,168,67,.35)",
        glow: "0 0 40px rgba(212,168,67,.15)",
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },

      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
    },
  },

  plugins: [tailwindcssAnimate],
};

export default config;