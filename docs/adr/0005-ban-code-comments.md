# 5. Ban code comments

Status: accepted

## Context

Comments drift from the code, restate what the code already says, or excuse a shortcut that then spreads. Decisions worth keeping were scattered across comments where nobody would find them.

## Decision

Code comments are banned in JS and TS (including JSX and TSX) and in CSS under `web/`, and in the JavaScript tooling under `.claude/` and `.githooks/`. Express intent through names (variables, functions, small components) instead. Record a non-obvious decision as an ADR in `docs/adr/`, or in the owning doc listed in `WEBSITE.md`.

The ESLint rule `edge-comments/no-comments` (`web/eslint-rules/no-comments.mjs`) enforces it. `web/eslint.config.mjs` applies it inside `web/`, and the root `eslint.config.mjs` applies it to the repo tooling outside `web/`; `pnpm run lint` in `web/` runs both. Machine-read comments stay allowed: lint, TypeScript, coverage and bundler directives, and shebangs. `isMachineDirective` in that file matches each by its real grammar, so prose that merely starts with a directive word is still banned.

The ban is a ratchet: `web/eslint-rules/comment-baseline.json` caps the comments a file may still hold. `edge-comments/comment-baseline` fails a file over its cap, and also one under it until the cap is lowered, so a removed comment cannot come back. Add an entry only when a comment truly cannot be removed yet, and file an issue for it.

## Consequences

Non-code files (`env.example`, `.gitignore`, YAML, TOML, shell, JSON, Markdown and MDX) are not linted. Keep them free of comments that restate their content. The `# vX.Y.Z` comments after SHA-pinned actions in workflows stay, because Dependabot reads them.
