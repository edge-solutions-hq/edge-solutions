import path from "node:path";

const IDENTIFIER_LIST = String.raw`[\w$]+(?:\s*:\s*(?:readonly|writable|writeable|off|true|false))?(?:\s*,\s*[\w$]+(?:\s*:\s*(?:readonly|writable|writeable|off|true|false))?)*\s*,?`;

const ANY_COMMENT_DIRECTIVE = new RegExp(
  [
    String.raw`^\s*(?:eslint|oxlint)-disable(?:-line|-next-line)?(?:\s|$)`,
    String.raw`^\s*@ts-(?:ignore|expect-error|nocheck|check)\b`,
    String.raw`^\s*(?:istanbul|c8|v8)\s+ignore\b`,
    String.raw`^\s*(?:prettier|biome)-ignore\b`,
  ].join("|")
);

const BLOCK_ONLY_DIRECTIVE = new RegExp(
  [
    String.raw`^\s*(?:eslint|oxlint|stylelint)-(?:disable|enable)(?:\s|$)`,
    String.raw`^\s*stylelint-disable-(?:line|next-line)(?:\s|$)`,
    String.raw`^\s*eslint\s+[@\w/-]+\s*:`,
    String.raw`^\s*eslint-env\s+[\w$]+`,
    String.raw`^\s*globals?\s+${IDENTIFIER_LIST}\s*$`,
    String.raw`^\s*exported\s+${IDENTIFIER_LIST}\s*$`,
    String.raw`^\s*webpack[A-Z]\w*\s*:`,
    String.raw`^\s*@vite-ignore\s*$`,
    String.raw`^\s*[#@]__(?:PURE|NO_SIDE_EFFECTS)__\s*$`,
    String.raw`^\*?\s*@(?:jsx|jsxFrag|jsxImportSource|jsxRuntime)\s+\S+`,
  ].join("|")
);

const TRIPLE_SLASH_DIRECTIVE = /^\/\s*<(?:reference|amd-module|amd-dependency)\b/;

function isMachineDirective(comment) {
  if (comment.type === "Shebang") return true;
  if (ANY_COMMENT_DIRECTIVE.test(comment.value)) return true;
  if (comment.type === "Line") return TRIPLE_SLASH_DIRECTIVE.test(comment.value);
  return BLOCK_ONLY_DIRECTIVE.test(comment.value);
}

const ADR = "docs/adr/0005-ban-code-comments.md";

function humanComments(sourceCode) {
  const comments =
    typeof sourceCode.getAllComments === "function"
      ? sourceCode.getAllComments()
      : sourceCode.comments ?? [];
  return comments.filter((comment) => !isMachineDirective(comment));
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
