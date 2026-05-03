# AA-004: Extract Service Scroll-Depth Decision Module

Labels: `enhancement`, `ready-for-agent`

## Parent

`docs/prd/architecture-autopilot-2026-05-03.md`

## What To Build

Extract service scroll-depth percent calculation and threshold progression into a pure analytics Module, leaving the React tracker as the browser Adapter.

## Acceptance Criteria

- [ ] Scroll-depth percent calculation is testable without browser globals.
- [ ] Threshold progression returns newly reached thresholds in taxonomy order.
- [ ] Non-scrollable pages still resolve to 100 percent.
- [ ] Fired thresholds are not returned again.
- [ ] Taxonomy remains the owner of threshold values.
- [ ] React tracker still owns event listeners and calls the named analytics action.

## Blocked By

None - can start immediately.

## Agent Brief

Use grill record candidate 4. Do not add throttling, IntersectionObserver, or event-name changes. Verification: `npm run test`, `npm run lint`.
