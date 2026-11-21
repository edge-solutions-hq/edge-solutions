import { readFileSync } from "node:fs";
import edgeComments from "./web/eslint-rules/no-comments.mjs";

const commentBaseline = JSON.parse(
  readFileSync(new URL("./web/eslint-rules/comment-baseline.json", import.meta.url), "utf8")
);

export default [
  {
    files: [".claude/**/*.{js,mjs,cjs}", ".githooks/**/*.{js,mjs,cjs}"],
    plugins: { "edge-comments": edgeComments },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "edge-comments/no-comments": ["error", { baseline: commentBaseline }],
      "edge-comments/comment-baseline": ["error", { baseline: commentBaseline }],
    },
  },
  {
    ignores: ["web/**"],
  },
];
