# Architecture Autopilot Issue Manifest

Parent PRD: `docs/prd/architecture-autopilot-2026-05-03.md`

Publication status: GitHub issue publication blocked by `GraphQL: Resource not accessible by personal access token (createIssue)`. Local issue files are canonical for this run.

| ID | Title | Type | Triage | Status | Blocked by |
| --- | --- | --- | --- | --- | --- |
| AA-001 | Localize contact outcome and offer-intake seam | AFK | ready-for-agent | verified | None |
| AA-002 | Extract contact analytics attempt tracker | AFK | ready-for-agent | verified | AA-001 |
| AA-003 | Share tracked-link target normalization | AFK | ready-for-agent | verified | None |
| AA-004 | Extract service scroll-depth decision module | AFK | ready-for-agent | verified | None |
| AA-005 | Tighten page-profile SEO verification seam | AFK | ready-for-agent | verified | None |
| AA-006 | Add offer presentation models | AFK | ready-for-agent | verified | None |
| AA-007 | Strengthen service proof validation | AFK | ready-for-agent | verified | None |
| AA-008 | Make localized service render policy explicit | AFK | ready-for-agent | verified | AA-007 |

## Completion Evidence

- `npm run test`: passed with 24 tests.
- `npm run check:analytics-env`: passed; local dev has no analytics IDs configured, which is valid.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run check:seo`: passed with 18 localized URLs.
- `npm run check`: passed.

## Verification Commands

- `cd web && npm run test`
- `cd web && npm run check:analytics-env`
- `cd web && npm run lint`
- `cd web && npm run build`
- `cd web && npm run check:seo`
- Final combined gate: `cd web && npm run check`
