# 1. Lint with Oxlint plus ESLint on Next's Babel parser

Status: accepted

## Context

The site is on TypeScript 7, which has no JavaScript compiler API. `typescript-eslint` depends on that API, so it cannot parse our TypeScript.

## Decision

`pnpm run lint` runs Oxlint first for native TypeScript linting, then ESLint for the React, hooks, a11y and Next rules. ESLint parses JS and TS through Next's bundled Babel parser (`next/dist/compiled/babel/eslint-parser.js`) with the `next/babel` preset. Type checking stays with `tsc --noEmit`.

## Consequences

ESLint rules that need type information are not available. Do not add `typescript-eslint` until TypeScript ships a compiler API again.
