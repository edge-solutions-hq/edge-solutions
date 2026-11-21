# 5. Ban code comments

Status: accepted

## Context

Comments drift from the code, restate what the code already says, or excuse a shortcut that then spreads. Decisions worth keeping were scattered across comments where nobody would find them.

## Decision

Code comments are banned in JS, TS, JSX and CSS under `web/`. Express intent through names (variables, functions, small components) instead. Record a non-obvious decision as an ADR in `docs/adr/`, or in the owning doc listed in `WEBSITE.md`.

The ESLint rule `edge-comments/no-comments` (`web/eslint-rules/no-comments.mjs`) enforces it. Machine-read comments stay allowed: `eslint-disable`, `oxlint-disable`, `@ts-*`, `/// <reference>`, shebangs, `@__PURE__` and similar directives.

The ban is a ratchet. `web/eslint-rules/comment-baseline.json` maps a file to the number of comments it may still hold. A file over its baseline fails lint. A file under its baseline also fails (`edge-comments/comment-baseline`) until its entry is lowered, so a removed comment cannot come back. The baseline is empty today; add an entry only when a comment truly cannot be removed yet, and file an issue for it.

## Consequences

Non-code files (`env.example`, `.gitignore`, YAML, Markdown) are not linted. Keep them free of comments that restate their content.
