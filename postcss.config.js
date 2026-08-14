// Tailwind 4 moved the PostCSS plugin into its own package, and no longer needs
// autoprefixer: vendor prefixing is handled internally against the browser
// targets Lightning CSS resolves.
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
