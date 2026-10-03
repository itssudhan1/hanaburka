import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        espresso: "#241C18",
        mocha: "#6F5546",
        ivory: "#FDE5A5",
        rose: "#B98F88",
        gold: "#C9A96E",
        charcoal: "#292522",
        // Small, deliberate accent palette — used only for things that
        // need to grab attention or carry meaning (a discount, an order
        // status), never as a general decoration on top of the core
        // espresso/mocha/gold palette above.
        sale: "#C4432B",
        success: "#3F7A4E",
        warning: "#B8842E",
        danger: "#B23A3A",
        info: "#3A6EA5",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        "scale-in": "scale-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
