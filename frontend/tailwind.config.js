/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050508",
        foreground: "#ffffff",
        card: {
          DEFAULT: "#0a0a12",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#0f0f1a",
          foreground: "#ffffff",
        },
        primary: {
          DEFAULT: "#FFD700",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#00F0FF",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#1a1a24",
          foreground: "#8a92b8",
        },
        accent: {
          DEFAULT: "#FF4D00",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ff003c",
          foreground: "#ffffff",
        },
        border: "rgba(255, 215, 0, 0.3)",
        input: "#0f0f1a",
        ring: "#ffd700",
      },
      fontFamily: {
        heading: ["Bangers", "system-ui", "sans-serif"],
        body: ["Chakra Petch", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
