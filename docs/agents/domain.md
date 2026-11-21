# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Layout

This repo uses the single-context layout: one `CONTEXT.md` and `docs/adr/` at the repo root. There is no `CONTEXT-MAP.md`; `web/` is the only app.

```
/
├── CONTEXT.md        ← domain glossary, created lazily by /domain-modeling
├── docs/adr/         ← architecture decision records, created lazily
└── web/
```

## Before exploring, read these

- `AGENTS.md` for agent-facing setup, checks, and working rules.
- `WEBSITE.md` for source-of-truth order and website operating constraints.
- `CONTEXT.md` at the repo root.
- The ADRs in `docs/adr/` that touch the area you're about to work in.

`CONTEXT.md` and `docs/adr/` don't exist yet. Proceed silently: don't flag their absence or suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## Use the project's vocabulary

`docs/positioning.md` owns canonical positioning language and `docs/architecture.md` owns module names; do not redefine either in `CONTEXT.md`, link to them instead. Once `CONTEXT.md` exists, name domain concepts (in an issue title, a refactor proposal, a hypothesis, a test name) with its terms and don't drift to synonyms it avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding it:

> _Contradicts ADR-0007 (…), but worth reopening because…_
