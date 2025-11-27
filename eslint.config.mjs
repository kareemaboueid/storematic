import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default defineConfig([
  // 1. Global ignores
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      "coverage",
      "logs",
      "prisma/migrations/**",
      "db/migrations/**", // raw SQL, not JS
    ],
  },

  // 2. Base JS recommended rules
  js.configs.recommended,

  // 3. Disable rules that conflict with Prettier
  eslintConfigPrettier,

  // 4. Project-specific config
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      // Prettier integration: treat formatting issues as ESLint errors:
      "prettier/prettier": "error",

      // General code quality settings:
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-var": "error",
      "prefer-const": "error",

      // Naming conventions:
      // allow:
      //  - snake_case
      //  - UPPER_SNAKE_CASE
      //  - PascalCase (for classes & imports like Joi, UtlApiError)
      camelcase: "off",
      "id-match": [
        "error",
        "^([a-z][a-z0-9]*(?:_[a-z0-9]+)*|[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*|[A-Z][a-zA-Z0-9]*)$",
        {
          properties: false,
          ignoreDestructuring: true,
          onlyDeclarations: false,
        },
      ],
    },
  },
]);
