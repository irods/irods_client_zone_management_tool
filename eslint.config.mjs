import globals from "globals";
import react from "eslint-plugin-react";

// this bit fixes the collision with the React definition of React
react["configs"]["recommended"].plugins = { react };
react["configs"]["recommended"].languageOptions = { parserOptions: react["configs"]["recommended"].parserOptions };

// remove this because we are going to create it properly below
delete react["configs"]["recommended"].parserOptions;

export default [
  react["configs"]["recommended"],
  {
    plugins: { react },
    files: ["src/**/*.js*"],
    ignores: ["**/*.config.js", "dist/**/*", "build/**/*", "node_modules/**/*"],
    settings: { react: {version: "18.2.0"} },
    languageOptions: {
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.node, ...globals.browser }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "semi": "warn",
      "prefer-const": "warn",
      "no-dupe-args": "warn",
      "no-dupe-keys": "warn",
      "react/display-name": "off",
      "react/no-is-mounted": "off"
      // ,"no-console": ["error", { allow: ["warn", "error"] }]
    },
    linterOptions: { reportUnusedDisableDirectives: "error" }
  }
];

