import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette (PRD §12) — never used for semantic status
        primary: {
          DEFAULT: "#0F6E56",
          foreground: "#FFFFFF",
        },
        graphite: "#444441",
        "gray-50": "#F1EFE8",
        accent: {
          DEFAULT: "#D85A30",
          foreground: "#FFFFFF",
        },
        // Semantic status colors — only for risk ratings / check results
        semantic: {
          success: "#3B6D11",
          warning: "#854F0B",
          danger: "#A32D2D",
          verified: "#534AB7",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
