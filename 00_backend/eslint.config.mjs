import js from "@eslint/js";
import globals from "globals";

export default [
  {
    // 1. Tell ESLint which files this config applies to
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    
    // 2. Define the language options explicitly
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module", // This allows 'import'
      globals: {
        ...globals.node,
        ...globals.commonjs
      }
    },
    
    // 3. Use the recommended rules
    rules: {
      ...js.configs.recommended.rules,
      "no-console": "off",
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  }
];