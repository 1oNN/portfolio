// Flat config, required by ESLint 9+. Next 16 removed `next lint`, so linting
// now runs through the ESLint CLI directly (see the `lint` script).
//
// .eslintrc.json is dead once this file exists - ESLint prefers eslint.config.*
// and ignores the legacy file entirely. Delete it.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**", ".gstack/**"],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      "react/no-unescaped-entities": "off",

      // The base JS rule does not understand TS type signatures and flags
      // interface method parameter names as unused variables. The TS-aware rule
      // replaces it. ^_ is the repo's existing "intentionally unused"
      // convention, and caughtErrors needs its own pattern or `catch (_err)`
      // trips it. Kept at error: an unused import shipping to main is exactly
      // what putting lint in CI was meant to stop.
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // New in eslint-plugin-react-hooks v7, which arrived with Next 16. These
      // two flag long-standing patterns across the project visuals and the
      // typewriter hook - around 90 sites, none of them regressions from this
      // upgrade. Downgraded to warn so they stay visible without blocking the
      // build on day one; they are worth working through properly, because
      // both describe real re-render costs.
      "react-hooks/static-components": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
