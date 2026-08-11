// eslint-config-next ships flat configs directly, so no FlatCompat shim —
// the eslintrc bridge crashes under ESLint 10.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...coreWebVitals,
  ...typescript,
  {
    // Pinning the version skips eslint-plugin-react's auto-detection, which
    // uses an API that ESLint 10 no longer provides.
    settings: { react: { version: "19.2" } },
  },
];

export default eslintConfig;
