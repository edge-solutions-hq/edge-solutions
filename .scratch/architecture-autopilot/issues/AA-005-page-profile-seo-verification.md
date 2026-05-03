# AA-005: Tighten Page-Profile SEO Verification Seam

Labels: `enhancement`, `ready-for-agent`

## Parent

`docs/prd/architecture-autopilot-2026-05-03.md`

## What To Build

Keep page profiles as the owner of metadata, JSON-LD, static sitemap facts, and localized sitemap entries while reducing brittle SEO verification assumptions.

## Acceptance Criteria

- [ ] Public route Modules continue to request page profiles for metadata and JSON-LD.
- [ ] Sitemap route remains a thin Adapter over localized sitemap entries.
- [ ] SEO verification no longer relies on a hardcoded localized URL count literal.
- [ ] URL expectations are derived from parsed source facts or page-profile-owned data.
- [ ] Current URL shape and hreflang behavior are unchanged.
- [ ] Architecture and SEO checks cover the seam.

## Blocked By

None - can start immediately.

## Agent Brief

Use grill record candidate 5. Avoid broad route manifest or localized path rewrite. Verification: `npm run test`, `npm run build`, `npm run check:seo`.
