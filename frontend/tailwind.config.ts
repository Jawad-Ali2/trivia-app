import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "#6b21a8", // purple-600
          foreground: "#f3e8ff", // lavender
        },
        secondary: {
          DEFAULT: "#3b82f6", // blue-500
          foreground: "#dbeafe", // light blue
        },
        accent: {
          DEFAULT: "#facc15", // yellow-500
          foreground: "#fef9c3", // light yellow
        },
        muted: {
          DEFAULT: "#334155", // gray-800
          foreground: "#94a3b8", // gray-400
        },
        destructive: {
          DEFAULT: "#e11d48", // rose-600
          foreground: "#fef2f2", // light rose
        },
        border: "#475569", // gray-700
        input: "#1f2937", // gray-900
        ring: "#6366f1", // indigo-500
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        slideInRight: "slideInRight 1s ease forwards",
        slideInLeft: "slideInLeft 1s ease forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
