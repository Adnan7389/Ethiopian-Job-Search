// ── tailwind.config.cjs ──
module.exports = {
  content: [
    "./index.html",             // ← include your top‐level HTML
    "./src/**/*.{js,jsx,ts,tsx}" // ← your React components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
