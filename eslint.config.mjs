import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Add ignores at the top level
  {
    ignores: [
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
      "*.tsbuildinfo",
      ".env*",
      ".vercel/**",
      "supabase/.branches/**",
      "supabase/.temp/**",
    ],
  },
  
  ...compat.extends("next/core-web-vitals", "prettier"),
  
  {
    rules: {
      // React specific rules
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "react-hooks/exhaustive-deps": "warn",
      
      // General code quality rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "warn",
      "prefer-const": "error",
      "no-var": "error",
      
      // Security rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
    },
  },
];

export default eslintConfig;