import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1e3a5f",
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#627d98",
          500: "#486581",
          600: "#334e68",
          700: "#243b53",
          800: "#1e3a5f",
          900: "#102a43",
        },
        brand: {
          orange: "#f97316",
          yellow: "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "float-y": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        "float-y-slow": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-20px)" } },
        "spin-slow": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
        "pulse-ring": { "0%": { transform: "scale(0.95)", opacity: "0.7" }, "100%": { transform: "scale(1.6)", opacity: "0" } },
        "price-flash": { "0%,100%": { color: "#1e3a5f" }, "50%": { color: "#f97316" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "gradient-x": { "0%,100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "float-y": "float-y 4s ease-in-out infinite",
        "float-y-slow": "float-y-slow 6s ease-in-out infinite",
        "spin-slow": "spin-slow 18s linear infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0,0,0.2,1) infinite",
        "price-flash": "price-flash 0.6s ease-in-out",
        shimmer: "shimmer 2.5s linear infinite",
        "gradient-x": "gradient-x 8s ease infinite",
      },
    },
  },
  plugins: [],
};
export default config;
