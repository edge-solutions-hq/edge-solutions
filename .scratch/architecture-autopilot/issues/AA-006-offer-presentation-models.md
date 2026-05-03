# AA-006: Add Offer Presentation Models

Labels: `enhancement`, `ready-for-agent`

## Parent

`docs/prd/architecture-autopilot-2026-05-03.md`

## What To Build

Add pure offer presentation model functions that project header nav items, homepage offer cards, services-hub offer cards, and decision items from the offer catalog while preserving distinct page grammar.

## Acceptance Criteria

- [ ] Offer catalog remains the source of offer identity, order, slugs, paths, message keys, sitemap facts, and AI-first priority role.
- [ ] Header, homepage, and services hub consume offer presentation model functions instead of rebuilding parallel `OFFER_TRACKS.map` arrays inline.
- [ ] Homepage and services hub use distinct projection functions.
- [ ] No visual redesign or route/message-key changes are introduced.
- [ ] Architecture tests guard the presentation seam.

## Blocked By

None - can start immediately.

## Agent Brief

Use grill record candidate 6. Keep `HeaderNav` and `MobileMenu` as rendering Adapters. Verification: `npm run test`, `npm run lint`.
