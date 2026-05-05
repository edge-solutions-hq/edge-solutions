# PRD: Deepen Site Profile, SEO, Analytics, Navigation, Service, And Contact Modules

## Problem Statement

The Edge Solutions site has already moved important policy into named Modules: offer tracks, offer presentation, page profiles, content/proof registry, contact intake and delivery, analytics taxonomy, tracked links, and scroll-depth tracking. The remaining friction is now in second-order callers around those Modules.

Several route, layout, script, browser, navigation, service-page, and form Adapters still know policy that should live behind deeper interfaces:

- Root layout metadata and organization schema duplicate positioning and offer facts outside the profile/catalog seams.
- Live SEO smoke tests hard-code only part of the localized URL surface and can miss production drift on contact and service-detail pages.
- Browser analytics page context is resolved separately for conversion events and GA page views.
- Header navigation renderers know contact CTA tracking policy and active-state rules.
- Service detail routes still orchestrate locale validation, static params, content lookup, metadata/profile construction, and scroll-tracking identity.
- The contact form still owns field rendering facts that can drift from intake validation and analytics mapping.

This makes future AI-first positioning changes, service-track additions, SEO validation, analytics review, and contact-form iteration more fragile than necessary.

## Solution

Deepen the existing architecture without changing the public site strategy, URL shape, MDX authoring model, visual design baseline, or analytics event contract.

The solution is a set of narrow Module improvements:

- A global site profile seam owns root metadata and organization schema projection.
- SEO smoke tooling derives expected localized production URLs from the same route/profile facts as sitemap checks.
- A browser analytics context seam owns page and locale defaults for both page views and conversion events.
- A navigation policy/model seam owns header item identity, active matching, and contact CTA tracking intent.
- A service-page model seam joins route facts, localized content, metadata/profile creation, and tracking identity for service detail pages.
- A contact form model seam owns field definitions, defaults, UI message keys, submit service extraction, and feedback-message resolution.

Each slice should keep route/UI/script files as thin Adapters and preserve current public behavior.

## User Stories

1. As a site owner, I want global metadata to use the same positioning source as page profiles, so that homepage and layout SEO copy do not drift.
2. As a site owner, I want organization schema service facts to follow the offer catalog, so that structured data stays aligned with the AI-first offer hierarchy.
3. As an SEO reviewer, I want live SEO smoke tests to cover every localized public URL, so that production drift is caught on contact and service pages.
4. As an SEO reviewer, I want live URL expectations to derive from source facts, so that adding a page or offer track changes the check automatically.
5. As a maintainer, I want generated and live SEO checks to share route-fact extraction, so that test logic has one place to evolve.
6. As an analytics reviewer, I want GA page views and conversion events to use one browser page context, so that locale and page-path payloads stay consistent.
7. As an analytics reviewer, I want conversion event names and parameters to remain stable, so that GTM/GA4 dashboards do not need remapping.
8. As a maintainer, I want analytics payload defaults testable without a browser, so that regressions are caught quickly.
9. As a visitor, I want desktop and mobile navigation to behave the same as today, so that architecture work does not create UI surprises.
10. As a maintainer, I want contact navigation tracking intent centralized, so that adding or moving nav items does not require duplicate `/contact` checks.
11. As a maintainer, I want active navigation state rules to live behind a small interface, so that desktop and future nav renderers stay consistent.
12. As a content editor, I want service detail pages to derive static params from the offer catalog and locale routing, so that service URLs stay complete.
13. As a content editor, I want service-page metadata and JSON-LD construction to be part of the service-page model, so that route files do not repeat profile assembly.
14. As a maintainer, I want invalid locale and invalid service-slug behavior explicit at the service-page seam, so that 404/fallback behavior stays intentional.
15. As a content editor, I want FR fallback policy to remain visible, so that missing translations do not create ambiguous SEO behavior.
16. As a site visitor, I want the contact form to keep the same fields, feedback, and spam behavior, so that conversion work does not affect usability.
17. As a maintainer, I want contact field definitions and validation constraints to live close to intake parsing, so that UI and server validation do not drift.
18. As an analytics reviewer, I want contact submit service extraction to use the contact Module, so that submit events use the same offer values as validation.
19. As an agent working AFK, I want each slice to have clear acceptance criteria and verification commands, so that work can be completed without new product interviews.
20. As a reviewer, I want tests to exercise Module interfaces and observable behavior, so that future refactors remain safe.

## Implementation Decisions

- Keep Edge Solutions positioned AI-first, with web, integration, and realtime as supporting execution depth.
- Preserve current prefixed localized URLs, stable service slugs, MDX content files, and FR fallback policy.
- Preserve current public copy unless a move into a profile/model seam requires mechanical relocation.
- Preserve current analytics event names and documented parameter semantics.
- Preserve current contact form field names, message keys, validation limits, honeypot behavior, and Resend delivery workflow.
- Add or extend a global profile Module so layout-level localized metadata is not owned by the layout Adapter.
- Derive organization schema service facts from existing site and offer-track facts rather than a static parallel list.
- Add a script-side route/source-facts seam for SEO scripts because direct TypeScript/MDX runtime imports are not currently part of the script toolchain.
- Keep live SEO fetching as the Adapter; route/profile fact derivation belongs outside the network loop.
- Add a browser analytics context Module used by both conversion-event tracking and GA page-view tracking.
- Keep dataLayer and gtag transports behind the existing analytics event Module.
- Add a navigation model/policy Module for header navigation items, active matching, and contact tracking intent.
- Keep browser tracking calls in client renderers or client tracking helpers, not in server-side navigation builders.
- Add a service-page model seam that joins localized content lookup, route validity, profile creation, metadata defaults, and scroll-tracking identity.
- Keep MDX as the service content implementation and keep proof-profile validation as a content guardrail.
- Add a contact form model behind the contact Module for field definitions, defaults, message keys, submit service extraction, and feedback-message resolution.
- Keep UI components as renderers of models; do not move React rendering into domain Modules unless already established by the app.

## Testing Decisions

- Test Module interfaces and observable behavior, not private implementation details.
- Keep the existing Node test runner as the test harness.
- Add focused pure tests for any new profile, route-fact, browser-context, navigation, service-page, and contact-form model functions.
- Extend architecture tests only where they protect ownership rules and route/UI Adapter thinness.
- Keep generated SEO verification after build as the guard for sitemap, robots, hreflang, JSON-LD, and localized URL output.
- Live SEO smoke should remain opt-in through `npm run check:seo:live`.
- Verification for each slice should include `npm run test` and `npm run lint`; slices that touch SEO generation should also run `npm run build && npm run check:seo` when feasible.
- Final integration should run the repo-level check command from `web/package.json` unless blocked by environment or time.

## Out of Scope

- No visual redesign of homepage, services hub, service detail pages, header, mobile menu, or contact form.
- No public URL shape changes, route localization, or localized service slugs.
- No CMS, database, persisted leads, or lead-management workflow.
- No new analytics event names or GTM/GA4 dashboard changes.
- No production email, analytics credential, legal, or privacy-policy changes.
- No replacement of MDX with another content system.
- No broad rewrite of all tests or introduction of a new test framework.
- No PR or branch orchestration.

## Further Notes

- Assumption: GitHub Issues remains the issue tracker because `docs/agents/issue-tracker.md` and `git remote -v` point at `Gil-1/edge-solutions`.
- Assumption: all six implementation slices are AFK-ready; no human product decision is required.
- Assumption: the previous architecture autopilot PRD from 2026-05-03 is mostly implemented and should not be re-issued except where second-order seams now need deepening.
- Discovery verification: `cd web && npm run test` passed 24 tests on 2026-05-05.
- Discovery warning: Node emits `MODULE_TYPELESS_PACKAGE_JSON` warnings because tests import TypeScript/ES modules while `web/package.json` has no `"type": "module"`; this warning is not blocking this PRD.
