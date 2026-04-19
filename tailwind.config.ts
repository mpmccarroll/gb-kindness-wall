import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gb: {
          maroon: "#7B1F32",
          "maroon-dark": "#5A1625",
          "maroon-light": "#9A2840",
          orange: "#E8712B",
          "orange-light": "#F09050",
          "orange-dark": "#C85E20",
          cream: "#FFF8F0",
          black: "#1A1A1A",
        },
      },
      fontFamily: {
        display: ['"Fredoka One"', "cursive"],
        body: ['"Nunito"', "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "pop-in": "popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
