# AA-002: Extract Contact Analytics Attempt Tracker

Labels: `enhancement`, `ready-for-agent`

## Parent

`docs/prd/architecture-autopilot-2026-05-03.md`

## What To Build

Move contact submit-attempt counting and one-outcome-per-attempt logic out of the contact form UI Adapter into a small client-safe tracker Module. Preserve the current analytics event names and payload semantics.

## Acceptance Criteria

- [ ] Contact form no longer owns raw submit/outcome attempt refs directly.
- [ ] Tracker increments submit attempts per captured submit.
- [ ] Tracker allows each attempt to complete once.
- [ ] Repeated effects for the same outcome do not double-track.
- [ ] Spam completes the attempt without emitting an outcome event.
- [ ] Pure tests cover tracker behavior.
- [ ] Architecture tests guard the new seam.

## Blocked By

- AA-001, because both slices touch the contact form state shape.

## Agent Brief

Use grill record candidate 2. Keep analytics event functions in the analytics events Module. Do not introduce new analytics event names or browser storage. Verification: `npm run test`, `npm run lint`.
