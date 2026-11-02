/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./contexts/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626", // university red
          700: "#b91c1c", // LPU signature deep red
          800: "#991b1b", // deep crimson
          900: "#7f1d1d", // dark burgundy
          950: "#450a0a",
        },
        lpu: {
          red: "#a71d2a",        // official LPU red
          crimson: "#8e1520",    // institutional dark red
          darkred: "#6e0e16",    // university header strip
          accent: "#c52233",     // highlight red
          gold: "#d97706",       // sports trophy gold
          charcoal: "#18181b",   // main heading text
          slate: "#334155",      // body text
          surface: "#f8fafc",    // clean light grey
          border: "#e2e8f0",     // thin institutional divider
        },
        // Mapped neutral palette for clean university light theme
        dark: {
          950: "#090d16",        // deep charcoal footer
          900: "#0f172a",        // dark footer / admin text
          850: "#ffffff",        // card background in light theme
          800: "#f8fafc",        // card elevated / light grey
          750: "#ffffff",        // modal background
          700: "#e2e8f0",        // thin clean border
          600: "#94a3b8",        // muted text
          500: "#64748b",        // secondary text
          400: "#475569",        // strong text
        },
        volt: {
          300: "#fde047",
          400: "#eab308",
          500: "#ca8a04",
        },
        amber: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        razorpay: {
          light: "#528ff0",
          DEFAULT: "#0c2340",
          blue: "#3399cc",
          dark: "#081628",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: [
          "Georgia",
          "Cambria",
          "Times New Roman",
          "Times",
          "serif",
        ],
      },
      boxShadow: {
        "lpu-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "lpu-md": "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
        "lpu-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
        "lpu-card": "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
        "glow-red": "0 0 20px -3px rgba(185, 28, 28, 0.35)",
        "glow-sm": "0 0 12px -2px rgba(185, 28, 28, 0.25)",
      },
    },
  },
  plugins: [],
};
