import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// The monorepo's shared @nanofreeze/eslint-config is private, so its rules are
// restated here rather than imported — a fork has to be able to `npm install`.
// The two that carry real weight:
//
//   no-explicit-any        — the engine is typed end to end; the UI has no excuse.
//   no-literal-string      — user-facing copy lives in messages/{es,en}.json, not
//                            in JSX. The monorepo enforces this with
//                            eslint-plugin-i18next; here the plugin isn't a
//                            dependency, so the rule is a review convention. If
//                            you add copy, add it to both bundles.
//
// The monorepo also bans raw Tailwind palette shades and rounded-* utilities in
// favour of design tokens (rounded-card/-control, bg-surface, text-fg…). This app
// follows that by construction — styles/theme.css is the only place a hex lands.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        // The wizard drops keys by destructuring them out (see setAssumptions);
        // an underscore prefix marks the discard as intentional.
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "dist/**", "next-env.d.ts"]),
]);

export default eslintConfig;
