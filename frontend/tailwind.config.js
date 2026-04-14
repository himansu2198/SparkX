/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        void: "#03030a",
        surface: "#0d0d1a",
        panel: "#111127",
        border: "#1e1e3a",
        accent: {
          DEFAULT: "#7c6aff",
          soft: "#a89bff",
          glow: "#7c6aff33",
        },
        gold: {
          DEFAULT: "#f5c842",
          soft: "#f5c84233",
        },
        ember: {
          DEFAULT: "#ff6b35",
          soft: "#ff6b3522",
        },
        jade: {
          DEFAULT: "#2dffc0",
          soft: "#2dffc015",
        },
        text: {
          primary: "#f0eeff",
          secondary: "#8888aa",
          muted: "#44445a",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      boxShadow: {
        glow: "0 0 40px #7c6aff22",
        "glow-lg": "0 0 80px #7c6aff33",
        "gold-glow": "0 0 30px #f5c84233",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};