/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "var(--midnight)",
        navy: "var(--navy)",
        panel: "var(--panel)",
        border: "var(--border)",
        electric: "var(--electric)",
        electricDim: "var(--electric-dim)",
        amber: "var(--amber)",
        amberDim: "var(--amber-dim)",
        emerald: "var(--emerald)",
        rose: "var(--rose)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textMuted: "var(--text-muted)",
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
