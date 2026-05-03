# AA-008: Make Localized Service Render Policy Explicit

Labels: `enhancement`, `ready-for-agent`

## Parent

`docs/prd/architecture-autopilot-2026-05-03.md`

## What To Build

Make the localized service content render policy explicit at the content seam so route Adapters consume content state without making hidden fallback or proof decisions.

## Acceptance Criteria

- [ ] Service content result exposes an explicit render policy or equivalent structured state.
- [ ] Service route consumes the explicit content state when building metadata, JSON-LD, and render output.
- [ ] Route module does not import MDX directly or select proof profiles directly.
- [ ] FR fallback behavior remains intentional and test-covered.
- [ ] Any proof-less content loader interface is removed if unused or documented if retained.
- [ ] Architecture tests guard route Adapter thinness.

## Blocked By

- AA-007, because proof validation should land before changing content render-policy shape.

## Agent Brief

Use grill record candidate 7. Avoid changing public URL shape, MDX authoring, or fallback product policy. Verification: `npm run test`, `npm run lint`.
