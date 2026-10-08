import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      keyframes: {
        "red-glow": {
          "0%, 100%": { borderColor: "rgba(239,68,68,0.4)", boxShadow: "0 0 12px rgba(239,68,68,0.15)" },
          "50%": { borderColor: "rgba(239,68,68,0.9)", boxShadow: "0 0 20px rgba(239,68,68,0.35)" },
        },
        "stroke-check": {
          "0%": { strokeDashoffset: "48" },
          "100%": { strokeDashoffset: "0" },
        },
        "scale-check": {
          "0%, 100%": { transform: "none" },
          "50%": { transform: "scale3d(1.1, 1.1, 1)" },
        },
      },
      animation: {
        "red-glow": "red-glow 2.5s infinite ease-in-out",
        "scale-check": "scale-check 0.4s ease-in-out",
        "stroke-check": "stroke-check 0.45s cubic-bezier(0.65, 0, 0.45, 1) 0.15s forwards",
      },
    },
  },
  plugins: [],
};

export default config;
