# AA-001: Localize Contact Outcome And Offer-Intake Seam

Labels: `enhancement`, `ready-for-agent`

## Parent

`docs/prd/architecture-autopilot-2026-05-03.md`

## What To Build

Deepen the contact intake/delivery seam so the contact form renders service options and visible submission feedback from stable contact outcome/offer interfaces and localized messages. Preserve current spam, validation, delivery, and success behavior.

## Acceptance Criteria

- [ ] Contact offer values and option message keys are owned by the contact intake Module, not handcoded in the contact form.
- [ ] Public form success/error feedback is localized through UI messages for FR, EN, and NL.
- [ ] Contact delivery still returns stable structured outcomes for success, validation error, delivery error, and spam.
- [ ] Spam submissions still return idle state and do not create success outcomes.
- [ ] Behaviour tests cover parsing, validation, spam, missing config, adapter failure, and adapter success.
- [ ] Architecture tests guard the intake/delivery seam.

## Blocked By

None - can start immediately.

## Agent Brief

Use grill record candidate 1. Keep `ContactDeliveryAdapter` and runtime config ownership unchanged. Do not add persistence, route changes, or new offer values. Verification: `npm run test`, `npm run lint`.
