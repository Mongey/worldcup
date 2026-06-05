/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "420px",
      },
      colors: {
        // OLD GLORY. No subtlety. No apologies.
        usa: {
          red: "#B22234",       // Old Glory Red
          "red-deep": "#8E1A28",
          white: "#FFFFFF",
          cream: "#FBF5E5",     // aged parchment
          navy: "#3C3B6E",      // Old Glory Blue
          "navy-deep": "#1B1B3A",
          "navy-night": "#0A0E2C",
          gold: "#FCD116",      // Old Glory Gold
          "gold-deep": "#C99A11",
        },
        // legacy aliases used in the source — keep mapped so refactor stays small
        ink: {
          50: "#FBF5E5",
          100: "#F4ECD0",
          200: "#E2D6A8",
          300: "#A39977",
          500: "#5C5A52",
          700: "#1B1B3A",
          800: "#13132B",
          900: "#0A0E2C",
        },
        brick: {
          300: "#FF5263",
          400: "#D4283A",
          500: "#B22234",
          600: "#8E1A28",
          700: "#6E1219",
        },
        flagblue: {
          400: "#5B5BA4",
          500: "#3C3B6E",
          600: "#2A2952",
          700: "#1B1B3A",
        },
      },
      fontFamily: {
        // BIG SLAB VARSITY — for hero/title text
        display: ['Ultra', 'Impact', 'system-ui', 'serif'],
        // MILITARY STENCIL — for column headers, stats, status badges
        stencil: ['"Black Ops One"', 'Impact', 'system-ui', 'sans-serif'],
        // OLD PARCHMENT TYPEWRITER — for body / player names
        sans: ['"Special Elite"', 'ui-serif', 'Georgia', 'serif'],
        // WANTED-POSTER WESTERN — used sparingly for slogans
        western: ['Rye', 'serif'],
        // legacy alias
        mono: ['"Black Ops One"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        huge: "0.28em",
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "skewX(-6deg) translateY(0)" },
          "50%": { transform: "skewX(-6deg) translateY(-1px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(178, 34, 52, 0.9)" },
          "50%": { boxShadow: "0 0 0 6px rgba(178, 34, 52, 0)" },
        },
      },
      animation: {
        wave: "wave 6s ease-in-out infinite",
        siren: "glow 1.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};
