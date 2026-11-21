# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Layout

This repo uses the single-context layout: one `GLOSSARY.md` and `docs/adr/` at the repo root.

## Before exploring, read these

- `AGENTS.md` for agent-facing setup, checks, and working rules.
- `WEBSITE.md` for source-of-truth order and website operating constraints.
- `GLOSSARY.md` at the repo root and the ADRs in `docs/adr/` that touch the area you're about to work in.

`GLOSSARY.md` doesn't exist yet. Proceed silently: don't flag its absence or suggest creating it upfront. The `/domain-modeling` skill creates it lazily when terms actually get resolved. Number new ADRs after the highest one in `docs/adr/`.

## Use the project's vocabulary

Use `docs/positioning.md` for canonical positioning language; do not redefine it here. Once `GLOSSARY.md` exists, name domain concepts with its terms and don't drift to synonyms it avoids.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding it, and either justify reopening it or mark the relevant work blocked.
