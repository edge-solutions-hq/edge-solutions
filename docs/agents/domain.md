# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Layout

This repo uses the single-context layout: one `GLOSSARY.md` and `docs/adr/` at the repo root. There is no `GLOSSARY-MAP.md`; `web/` is the only app.

```
/
├── GLOSSARY.md       ← domain glossary, created lazily by /domain-modeling
├── docs/adr/         ← architecture decision records, created lazily
│   └── 0001-….md
└── web/
```

## Before exploring, read these

- `AGENTS.md` for agent-facing setup, checks, and working rules.
- `WEBSITE.md` for source-of-truth order and website operating constraints.
- **`GLOSSARY.md`** at the repo root.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. `GLOSSARY.md` and `docs/adr/` don't exist yet: the `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## Use the glossary's vocabulary

`docs/positioning.md` owns canonical positioning language and `docs/architecture.md` owns module names; `GLOSSARY.md` links to them rather than redefining them.

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (…), but worth reopening because…_
