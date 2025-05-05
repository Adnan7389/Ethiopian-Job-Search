// ── postcss.config.cjs ──
module.exports = {
  plugins: [
    require('tailwindcss'),   // ← pulls in v3’s bundled plugin
    require('autoprefixer'),
  ],
};
