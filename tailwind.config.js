/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        surface: "#12121A",
        "surface-variant": "#1A1A24",
        primary: "#FFFFFF",
        secondary: "#94A3B8",
        accent: "#a78bfa",
        outline: "rgba(255, 255, 255, 0.1)",
        "clinical-active": "#10B981"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        "margin-desktop": "64px",
        unit: "8px",
        "container-max": "1280px",
        "margin-mobile": "20px",
        "stack-md": "24px",
        "stack-sm": "12px",
        "stack-lg": "48px",
        gutter: "24px",
        "container-padding": "32px"
      },
      fontFamily: {
        sans: ["Geist", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
}
