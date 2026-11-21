import path from "node:path";

const MACHINE_DIRECTIVE =
  /^\s*(?:eslint(?:-disable|-enable|-env)?\b|global(?:s)?\s|exported\s|oxlint-(?:disable|enable)|stylelint-(?:disable|enable)|@ts-|\/\s*<reference\b|istanbul\s|c8\s|v8\s|webpack[A-Z]|@vite-ignore|[#@]__PURE__|@jsx|@refresh|prettier-ignore|biome-ignore)/;

const ADR = "docs/adr/0005-ban-code-comments.md";

function humanComments(sourceCode) {
  const comments =
    typeof sourceCode.getAllComments === "function"
      ? sourceCode.getAllComments()
      : sourceCode.comments ?? [];
  return comments.filter(
    (comment) => comment.type !== "Shebang" && !MACHINE_DIRECTIVE.test(comment.value)
  );
}

function fileKey(context) {
  return path.relative(context.cwd, context.filename).split(path.sep).join("/");
}

function allowance(context) {
  const [{ baseline = {} } = {}] = context.options;
  return baseline[fileKey(context)] ?? 0;
}

const baselineSchema = [
  {
    type: "object",
    properties: {
      baseline: { type: "object", additionalProperties: { type: "integer", minimum: 1 } },
    },
    additionalProperties: false,
  },
];

const noComments = {
  meta: {
    type: "suggestion",
    schema: baselineSchema,
    messages: {
      banned:
        "Code comments are banned (see {{adr}}). Name the code instead, or record the decision in an ADR. This file has {{count}} comment(s); its baseline allows {{allowed}}.",
    },
  },
  create(context) {
    return {
      "Program:exit"() {
        report(context);
      },
      "StyleSheet:exit"() {
        report(context);
      },
    };
  },
};

function report(context) {
  const comments = humanComments(context.sourceCode);
  const allowed = allowance(context);
  if (comments.length <= allowed) return;
  for (const comment of comments) {
    context.report({
      loc: comment.loc,
      messageId: "banned",
      data: { adr: ADR, count: String(comments.length), allowed: String(allowed) },
    });
  }
}

const baselineRatchet = {
  meta: {
    type: "suggestion",
    schema: baselineSchema,
    messages: {
      lower:
        "This file has {{count}} comment(s) but eslint-rules/comment-baseline.json allows {{allowed}}. Lower its entry to {{count}} (delete it at 0) so the ratchet keeps the gain.",
    },
  },
  create(context) {
    function check() {
      const allowed = allowance(context);
      const count = humanComments(context.sourceCode).length;
      if (count >= allowed) return;
      context.report({
        loc: { line: 1, column: 0 },
        messageId: "lower",
        data: { count: String(count), allowed: String(allowed) },
      });
    }
    return { "Program:exit": check, "StyleSheet:exit": check };
  },
};

const edgeComments = {
  meta: { name: "edge-comments" },
  rules: {
    "no-comments": noComments,
    "comment-baseline": baselineRatchet,
  },
};

export default edgeComments;
