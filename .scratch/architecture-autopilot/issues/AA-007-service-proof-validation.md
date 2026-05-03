# AA-007: Strengthen Service Proof Validation

Labels: `enhancement`, `ready-for-agent`

## Parent

`docs/prd/architecture-autopilot-2026-05-03.md`

## What To Build

Strengthen static validation for service proof expectations so proof modules, proof assets, structural counts, CTA presence, and required signals are enforced across localized MDX content.

## Acceptance Criteria

- [ ] Every declared structural count in the proof registry is validated, including nested count rules.
- [ ] Required proof signals are validated against corresponding localized MDX content.
- [ ] Proof profile order still matches offer track order.
- [ ] Each localized MDX page still includes metadata, the expected proof module, expected proof image, and CTA.
- [ ] Tests fail with useful messages when proof drift occurs.

## Blocked By

None - can start immediately.

## Agent Brief

Use grill record candidate 7. Keep MDX and track-specific proof modules; do not create a CMS or generic proof component. Verification: `npm run test`.
