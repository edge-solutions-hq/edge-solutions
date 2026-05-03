# AA-003: Share Tracked-Link Target Normalization

Labels: `enhancement`, `ready-for-agent`

## Parent

`docs/prd/architecture-autopilot-2026-05-03.md`

## What To Build

Create one shared tracked-link target Module used by contact CTA links and offer-track links to serialize localized `Link` href values into analytics target strings.

## Acceptance Criteria

- [ ] `ButtonLink` and `TrackedLink` use the shared target Module.
- [ ] Duplicate private href/query/hash normalization helpers are removed from the UI Modules.
- [ ] Existing target string behavior is preserved for string hrefs and object hrefs.
- [ ] Tests cover string hrefs, object hrefs, query arrays, null/undefined query values, hash normalization, and unsupported href values.
- [ ] Architecture tests guard against reintroducing duplicate target helpers.

## Blocked By

None - can start immediately.

## Agent Brief

Use grill record candidate 3. Keep event functions and route behavior unchanged. Verification: `npm run test`, `npm run lint`.
