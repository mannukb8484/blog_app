import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    // 1. Target all JavaScript files
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],

    languageOptions: {
      ecmaVersion: "latest",
      // 2. Allow modern 'import' but keep 'require' support
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.commonjs, // Essential for 'require' and 'module.exports'
      },
    },

    rules: {
      // 3. Pull in the baseline "Recommended" rules
      ...js.configs.recommended.rules,

      // 4. Logic & Bug Prevention
      "no-unused-vars": "warn", // Warn if variable is defined but not used
      "no-undef": "error", // Error if variable is used but not defined
      "no-console": "off", // Allow console.log for backend debugging
      "no-const-assign": "error", // Error if you try to change a 'const'
      "no-duplicate-imports": "error", // Error if you import same file twice
    },
  },
  // 5. The Peacekeeper (Must be last)
  eslintConfigPrettier,
];
