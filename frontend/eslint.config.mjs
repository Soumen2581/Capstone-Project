import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next ships native flat configs, so no eslintrc compatibility layer.
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "scripts/**",
      // Vendored React Bits sources — keep upstream runtime behavior.
      "components/visuals/backgrounds/DarkVeil.tsx",
      "components/visuals/backgrounds/Threads.tsx",
      "components/visuals/text/GradientText.tsx",
      "components/visuals/interactions/GlareHover.tsx",
      "components/visuals/interactions/AnimatedContent.tsx",
      "components/react-bits/FadeContent.tsx",
    ],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Office data loads in effects and writes state when the response arrives.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
