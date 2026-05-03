# PRD: Deepen Architecture Seams For Contact, Analytics, Routing, And Content Proof

## Problem Statement

The public site already has useful architecture Modules for offer tracks, page profiles, localized content, contact intake, contact delivery, analytics taxonomy, and runtime config. The friction is that several seams still leak implementation detail into route/UI Adapters and tests:

- Contact offer values, delivery outcomes, visible messages, and analytics values are split across Modules.
- Contact analytics attempt tracking is hidden inside the contact form UI Adapter.
- Tracked link target normalization is duplicated across UI Modules.
- Service scroll-depth decisions are mixed with browser event handling.
- Route/page-profile assumptions are partly protected by brittle source parsing and fixed counts.
- Offer presentation projections are rebuilt inline in multiple public Adapters.
- Service content/proof validation is static but incomplete, especially for required proof signals and structural counts.

This makes future AI-first offer changes, contact conversion work, analytics checks, localized content changes, and service-proof edits more fragile than they need to be.

## Solution

Deepen the existing Modules with narrow, testable interfaces instead of rewriting the app. The architecture should preserve the current URL shape, copy model, MDX authoring flow, analytics taxonomy, and visual design baseline, while moving repeated policy and state-machine logic behind better seams.

The result should be a site where route files and UI Adapters stay thin, business/content/analytics policy has locality, and tests exercise the interfaces that callers actually depend on.

## User Stories

1. As a site visitor, I want contact form feedback in my selected language, so that the form feels trustworthy in FR, EN, and NL.
2. As a site visitor, I want spam protection to stay invisible, so that real users are not penalized by bot defenses.
3. As a business owner, I want contact submissions to be classified consistently by offer type, so that follow-up can match the user's intent.
4. As the site owner, I want contact emails to keep stable offer labels, so that incoming leads are easy to triage.
5. As the site owner, I want contact success and error analytics to stay aligned with submit attempts, so that conversion data is credible.
6. As the site owner, I want spam submissions excluded from success analytics, so that lead reporting is not inflated.
7. As a maintainer, I want contact attempt tracking outside the form UI, so that the contact form remains a thin Adapter.
8. As a maintainer, I want tracked link targets normalized in one place, so that contact CTA and offer-card analytics do not drift.
9. As an analytics reviewer, I want scroll-depth threshold logic tested without a browser, so that conversion signals remain reliable.
10. As a content editor, I want offer presentation data derived from the offer catalog, so that AI-first ordering and service labels stay consistent.
11. As a designer, I want homepage and services-hub offer cards to keep distinct presentation grammar, so that the design baseline does not become generic.
12. As an SEO reviewer, I want route/page-profile facts to stay centralized, so that sitemap, metadata, hreflang, and JSON-LD stay aligned.
13. As a maintainer, I want SEO checks to derive expected URL counts from source facts, so that adding a page or offer track fails for real drift, not a stale literal.
14. As a content editor, I want service proof expectations enforced across locales, so that visual proof does not become placeholder polish.
15. As a buyer reading a service page, I want each offer track to keep its own proof identity, so that AI, web, and realtime capabilities feel concrete.
16. As a maintainer, I want localized service fallback policy to remain explicit, so that missing translations do not create accidental SEO or content ambiguity.
17. As an agent working AFK, I want each slice to have clear acceptance criteria and verification commands, so that work can be completed without more product interviews.
18. As a reviewer, I want architecture tests to protect seams without overfitting implementation details, so that refactors remain safe.

## Implementation Decisions

- Keep the contact intake Module as the owner of offer values, form parsing, validation, spam classification, and contact attempt outcome vocabulary.
- Keep the contact delivery Module as the owner of delivery configuration, email payload construction, delivery outcomes, and the delivery Adapter seam.
- Add a canonical contact offer option interface consumed by the form Adapter and localized through UI messages.
- Make visible contact feedback derive from stable outcome codes and localized messages rather than server-returned French copy.
- Add a small contact analytics attempt tracker Module that owns attempt numbering, deduplication, and spam completion rules.
- Keep analytics event names, event parameter mapping, and browser transports behind the analytics events/taxonomy Modules.
- Add a shared tracked-link target Module for localized link href serialization.
- Add a pure service scroll-depth Module for percent calculation and threshold progression while keeping the React tracker as the browser Adapter.
- Keep route identity and locale identity in the existing i18n routing Module.
- Keep page metadata, JSON-LD graph selection, static page sitemap facts, and localized sitemap entry generation in the page-profile Module.
- Avoid introducing a broad route manifest or localized path rewrite during this pass.
- Add an offer presentation Module that projects header nav items, homepage offer cards, services-hub cards, and decision items from the existing offer catalog.
- Keep offer identity, order, slugs, paths, message keys, sitemap facts, and AI-first priority role in the offer catalog Module.
- Keep MDX as the authoring implementation for service pages.
- Keep the localized content Module as the owner of valid slug, resolved locale, selected MDX module, fallback state, metadata, and proof attachment.
- Keep the proof registry Module as the owner of expected proof module, proof asset, structural counts, and required signals per offer track.
- Preserve the current public URL shape and stable service slugs.
- Preserve the current analytics event names and documented payload semantics.

## Testing Decisions

- Test module interfaces and observable behavior, not private implementation details.
- Add behaviour tests for contact intake parsing, validation, default offer handling, invalid service handling, and spam classification.
- Add behaviour tests for contact delivery covering validation errors, spam short-circuit, missing config, adapter failure, and adapter success.
- Add pure tests for the contact analytics attempt tracker covering incrementing, one outcome per attempt, repeated effect dedupe, and spam completion without emission.
- Add pure tests for tracked-link target normalization covering string hrefs, object hrefs, query arrays, missing values, hashes, and unsupported values.
- Add pure tests for scroll-depth percent calculation and threshold progression.
- Extend architecture tests to ensure public Adapters consume offer presentation, contact, page-profile, analytics, and content/proof seams.
- Extend proof validation tests so all declared structural counts are enforced, including nested count rules.
- Extend proof validation tests so required proof signals are actually present in localized MDX content.
- Keep generated SEO verification after build as the guard for sitemap, robots, hreflang, JSON-LD, and localized URL output.
- Use the existing Node test runner as prior art for architecture and pure behaviour tests.

## Out of Scope

- No route localization, localized service slugs, or URL-shape changes.
- No CMS, database, persisted contact intake, or lead-management workflow.
- No change to public offer strategy beyond preserving the AI-first hierarchy.
- No new analytics event names unless required by an implementation blocker.
- No visual redesign of homepage, services hub, or service detail pages.
- No replacement of MDX with another content system.
- No production email, analytics, or legal policy changes.
- No PR/branch orchestration.

## Further Notes

- Assumption: GitHub Issues is the issue tracker because the repo remote points at `Gil-1/edge-solutions`.
- Assumption: default triage labels are acceptable because no repo-specific label mapping was documented.
- Assumption: FR fallback for missing localized MDX remains intended unless future product direction changes.
- Assumption: internal contact email labels may remain French during this pass because the recipient is internal; public UI must localize.
- Assumption: all implementation slices are AFK-ready and do not require human decisions unless external credentials or GitHub permissions block publication.
