# Architecture Autopilot Rerun PRD

Date: 2026-05-05

## Problem Statement

The Edge Solutions website already has several deep Modules for offer tracks, page profiles, localized service content, analytics, contact intake, navigation, and proof content. The remaining friction is not a lack of Modules; it is that some Interfaces still leak policy back into route Adapters, scripts, source-regex checks, and UI renderers.

That leakage creates drift risk in areas that matter to the site: AI-first positioning, SEO URL and hreflang coverage, localized service fallback behavior, analytics payload quality, contact form correctness, navigation accessibility, and proof visual consistency.

## Solution

Deepen the existing Modules without changing the public URL shape, service slugs, MDX authoring model, event names, or contact delivery provider.

The work should concentrate policy behind narrow Interfaces:

- Public route facts for sitemap and SEO scripts.
- Localized service content availability and fallback state.
- Runtime proof contracts for service pages.
- Analytics payload builders behind browser transport Adapters.
- Contact field policy, bounded analytics values, and delivery payload formatting.
- Header navigation tracking, active state, and localized accessibility labels.
- Offer track visual hierarchy that preserves Edge Solutions as AI-first.
- Homepage presentation facts for proof/process/CTA wiring.
- Shared proof media frame mechanics without erasing track-specific proof Modules.

## User Stories

1. As a site owner, I want SEO route facts to come from one Interface, so that sitemap, generated checks, and live checks do not drift.
2. As an SEO reviewer, I want localized public URLs, canonical URLs, alternates, and hreflang values derived consistently, so that production smoke tests cover the real site surface.
3. As a maintainer, I want script checks to use route facts instead of each parsing source differently, so that adding a page or offer track fails in one meaningful place.
4. As a content editor, I want localized service content fallback reasons to be explicit, so that missing translations and broken MDX imports are not confused.
5. As a content editor, I want FR fallback behavior preserved, so that incomplete EN/NL content can still render intentionally.
6. As an SEO reviewer, I want service-page metadata and JSON-LD behavior to stay intentional under fallback, so that localized pages do not silently degrade.
7. As a maintainer, I want service routes to stay thin Adapters, so that content policy remains testable outside the route file.
8. As a site owner, I want proof requirements to be represented as a runtime content contract, so that proof drift is caught near service content.
9. As a content editor, I want proof module identity and proof images to remain track-specific, so that AI, web, and realtime pages keep distinct proof.
10. As a maintainer, I want proof structural expectations to be typed and validated, so that tests are not only regex checks over MDX text.
11. As an analytics reviewer, I want browser locale resolution to use the same locales as routing, so that analytics payloads cannot drift from the app.
12. As an analytics reviewer, I want named analytics actions to build payloads through pure functions, so that contact, offer, locale, and scroll events can be tested without a browser.
13. As a maintainer, I want transport fanout to GTM and GA4 isolated behind an Adapter, so that payload policy and browser delivery are not mixed.
14. As a site owner, I want analytics event names and documented parameters preserved, so that existing dashboards remain compatible.
15. As a contact lead reviewer, I want contact submit analytics service values bounded to documented offer values, so that tampered form data does not pollute reporting.
16. As a maintainer, I want contact field constraints and rendered controls to share one policy, so that UI hints and server validation stay aligned.
17. As a maintainer, I want contact feedback to prefer localized message keys, so that visible form outcomes stay localized across FR, EN, and NL.
18. As a maintainer, I want contact email payload formatting isolated, so that delivery tests can verify subject/body without invoking Resend.
19. As a mobile visitor, I want the mobile menu to have localized accessibility labels, so that the navigation is understandable outside English.
20. As a visitor, I want desktop and mobile nav active states to behave consistently, so that I can tell where I am in the site.
21. As an analytics reviewer, I want contact nav tracking to be derived from nav item metadata, so that desktop and mobile payloads stay consistent.
22. As a buyer, I want the service presentation to clearly show AI as the primary offer, so that the site does not look like three equal studio services.
23. As a site owner, I want web and realtime offers to remain visible as supporting execution depth, so that they strengthen the AI-first promise rather than compete with it.
24. As a maintainer, I want offer visual hierarchy encoded in presentation models, so that positioning changes are local and testable.
25. As a buyer, I want homepage proof and process sections to stay coherent, so that the site explains how Edge Solutions makes AI usable in real operations.
26. As a maintainer, I want homepage proof cards, proof signals, external proof, process cards, and CTA placements in a model, so that the homepage route stays a rendering Adapter.
27. As a site owner, I want Rusty Art to remain visible as public proof, so that the site relies on real working evidence rather than invented case studies.
28. As a maintainer, I want repeated proof media frame mechanics in one Module, so that image framing, browser chrome, and accessibility improve once.
29. As a designer, I want shared proof media mechanics without a generic proof layout, so that track-specific proof identity remains intact.
30. As a maintainer, I want the full run to preserve lint, build, test, SEO, and analytics-env checks, so that architecture deepening does not regress delivery quality.

## Implementation Decisions

- Preserve the current Next.js App Router and `next-intl` locale prefix strategy.
- Preserve stable offer-track slugs and localized service URLs.
- Preserve MDX as the service content source of truth.
- Preserve FR fallback as the current service content policy.
- Preserve existing analytics event names and parameter names.
- Preserve Resend as the contact delivery Adapter.
- Deepen existing Modules before introducing new broad abstractions.
- Keep route files, browser components, and scripts as Adapters over deeper Interfaces.
- Use pure behavior tests for policy Modules and retain architecture guard tests where they protect ownership.
- Serialize slices that touch the same route/proof/homepage files.
- Keep visual changes restrained and aligned with the AI-first positioning document.

## Testing Decisions

- Good tests should exercise the caller-facing Interface of each Module, not just implementation details.
- Route-fact tests should verify URL, suffix, canonical, alternate, and locale derivation.
- Service content tests should use injectable loaders to exercise localized, fallback, missing, and broken states.
- Proof tests should validate registry/content conformance and service-page model exposure.
- Analytics tests should exercise pure payload builders and browser-context locale derivation.
- Contact tests should cover field policy, bounded submit service extraction, email payload formatting, delivery outcomes, and feedback mapping.
- Navigation tests should cover active state, tracking payload parity, and localized accessibility labels.
- Offer/homepage tests should cover visual role, proof counts, CTA placements, public proof link, and AI-first hierarchy.
- Existing repo-level checks remain the final gate: `npm run test`, `npm run check:analytics-env`, `npm run lint`, `npm run build`, `npm run check:seo`, and final `npm run check`.

## Out of Scope

- No public URL or localized slug rewrite.
- No CMS migration.
- No new analytics provider or event renaming.
- No Resend provider replacement.
- No broad visual redesign or landing-page rebuild.
- No Playwright setup unless a slice proves browser-level verification is required.
- No branch or PR orchestration.

## Further Notes

The active domain source is `docs/positioning.md`: Edge Solutions is AI-first, with web, integration, and realtime work as supporting execution depth. The implementation should preserve that hierarchy in both data models and visible presentation.

GitHub Issues are the configured tracker for this repo. If issue publication is blocked by token permissions, the local issue manifest for this PRD is the canonical recovery artifact for the run.
