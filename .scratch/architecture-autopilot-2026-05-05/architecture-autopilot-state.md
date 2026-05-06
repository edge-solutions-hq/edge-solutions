# Architecture Autopilot State

Date: 2026-05-05
Repo: `Gil-1/edge-solutions`
Workspace: `/home/winedgeuser/.openclaw/workspace/projects/edge-solutions`

## Status

- Phase: PRD/issues
- Selection checkpoint: complete
- PRD: `docs/prd/architecture-autopilot-2026-05-05.md`; GitHub publication blocked
- Issues: `docs/prd/architecture-autopilot-2026-05-05-issues.md`; GitHub publication blocked
- Triage: local manifest triaged
- Implementation: complete
- Final verification: complete

## Repo Context

- Main app: `web/` Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, MDX, `next-intl`.
- Domain direction: Edge Solutions is AI-first; web, integration, and realtime are supporting proof of execution depth.
- Issue tracker: GitHub Issues for `Gil-1/edge-solutions` via `gh`.
- Triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`.
- Verification commands: `cd web && npm run test`, `npm run lint`, `npm run build`, `npm run check`; analytics env validation may require configured env values.

## Candidate Discovery Notes

- Read active docs: `docs/README.md`, `docs/positioning.md`, `docs/architecture.md`, `docs/design-baseline.md`, `docs/tech-stack.md`, `docs/agents/*`.
- `CONTEXT.md` and `docs/adr/` are not present, so active docs are the domain source.
- Existing `docs/prd/architecture-autopilot-2026-05-03.md` appears mostly implemented: offer catalog, offer presentation, page profiles, content/proof registry, contact intake/delivery, contact attempt tracking, analytics taxonomy/events, tracked link target, scroll-depth module, and architecture tests exist.
- Verification during discovery: `cd web && npm run test` passed 24 tests. Node emitted `MODULE_TYPELESS_PACKAGE_JSON` warnings because tests import TypeScript/ES modules while `web/package.json` has no `"type": "module"`.

## Architecture Candidates

### 1. Deepen Global Site Profile And Organization Schema

- Files/modules: `web/src/app/[locale]/layout.tsx`, `web/src/lib/seo.ts`, `web/src/lib/site.ts`, `web/src/lib/offer-tracks.ts`, `web/src/lib/page-profiles.ts`.
- Problem: root layout metadata owns a separate localized description, and `organizationSchema.serviceType` owns a separate offer list. That duplicates the AI-first positioning outside the page-profile and offer-track Modules.
- Solution: move global metadata and organization schema facts behind the same profile/catalog seam already used by page metadata and sitemap generation.
- Benefits: better locality for positioning copy, more leverage from the offer catalog, and tests can protect global metadata/schema without route Adapters knowing the policy.
- Impact: Medium.
- Risk: Low to medium; SEO output must stay stable.
- Rough effort: Small to medium.

### 2. Deepen Live SEO Smoke Around Page Profiles

- Files/modules: `web/scripts/check-live-seo.mjs`, `web/scripts/check-seo.mjs`, `web/src/lib/page-profiles.ts`, `web/src/lib/seo.ts`, `web/src/i18n/routing.ts`.
- Problem: generated SEO checks derive expected URLs from source facts, but live SEO smoke still hard-codes `siteUrl`, locales, hreflang values, and only `['', '/services']`. Service detail and contact pages can drift in production without this check noticing.
- Solution: make live SEO consume the same page/profile route facts as sitemap and generated SEO checks, while keeping network fetching as the Adapter.
- Benefits: stronger leverage from page profiles, less stale test data, and production smoke coverage matches the real URL surface.
- Impact: High.
- Risk: Low; mostly check/tooling changes.
- Rough effort: Small.

### 3. Deepen Browser Analytics Context

- Files/modules: `web/src/lib/analytics/events.ts`, `web/src/components/analytics/GoogleAnalytics.tsx`, `web/src/lib/analytics/taxonomy.ts`, `web/src/i18n/routing.ts`.
- Problem: browser analytics context is duplicated. Both conversion events and GA page-view tracking resolve locale/page facts separately, including their own supported-locale set and path handling.
- Solution: concentrate browser page context and locale resolution in one analytics Module, with GA and conversion events using it.
- Benefits: locality for analytics payload defaults, fewer hidden differences between page views and conversion events, and pure tests can cover browser-context behavior.
- Impact: Medium.
- Risk: Low to medium; analytics payloads must stay compatible.
- Rough effort: Small.

### 4. Deepen Navigation Tracking And Active-State Policy

- Files/modules: `web/src/components/layout/Header.tsx`, `web/src/components/layout/HeaderNav.tsx`, `web/src/components/layout/MobileMenu.tsx`, `web/src/components/ui/Button.tsx`, `web/src/lib/offer-presentation.ts`, `web/src/lib/navigation/tracked-link-target.ts`.
- Problem: header nav, mobile menu, and button links each know parts of contact CTA tracking. The nav Modules hard-code `/contact`, target strings, and placements, while offer presentation only supplies label/href for offer-track items.
- Solution: make navigation presentation carry tracking intent and active-state policy so renderers stay thin Adapters for desktop/mobile surfaces.
- Benefits: improved locality for nav behavior, one place for contact/offer tracking semantics, and less duplication when adding navigation items or placements.
- Impact: Medium.
- Risk: Medium; header/mobile behavior and analytics event semantics must stay unchanged.
- Rough effort: Medium.

### 5. Deepen Service Route And Content Orchestration

- Files/modules: `web/src/lib/content/services.ts`, `web/src/app/[locale]/services/[slug]/page.tsx`, `web/src/lib/content/proof-registry.ts`, `web/src/lib/page-profiles.ts`, `web/tests/architecture.test.mjs`.
- Problem: the content registry owns MDX fallback and proof joining, but the service route still composes static params, locale validation, metadata defaults, JSON-LD profile creation, scroll tracking, and rendering policy. Tests also parse MDX/source with brittle regex rather than exercising a content/proof interface.
- Solution: move service route facts and render/profile decisions into the content/page-profile seam, leaving the route as a thin Adapter.
- Benefits: stronger locality around service-page behavior, higher leverage for future offer tracks/locales, and tests can target the real service content interface instead of source-shape details.
- Impact: High.
- Risk: Medium; dynamic MDX import constraints and static generation need care.
- Rough effort: Medium.

### 6. Deepen Contact Form Model

- Files/modules: `web/src/app/[locale]/contact/ContactForm.tsx`, `web/src/lib/contact/intake.ts`, `web/src/lib/contact/contact-attempt-tracker.ts`, `web/src/lib/analytics/events.ts`, `web/src/lib/contact/delivery.ts`.
- Problem: contact intake owns validation and outcomes, but the form Adapter still owns field rendering facts, submit service extraction, feedback rendering, and field-message lookup. The interface between intake, analytics, and UI is deeper than before, but still leaks raw form field details.
- Solution: concentrate field definitions, UI message keys, default values, and submit/outcome mapping behind the contact Module so the form mostly renders a model and wires actions.
- Benefits: better locality for contact changes, less duplicated field knowledge, and tests can cover contact form behavior through a stable model.
- Impact: Medium.
- Risk: Medium; form accessibility, server-action behavior, and analytics attempt semantics must stay intact.
- Rough effort: Medium.

## Recommended Selection

- Recommended: `2, 3, 4, 5`.
- Rationale: these deepen already-established seams with the best payoff for testability and AI-navigability, without turning this run into a broad rewrite.
- Optional later: `1` if SEO/positioning consistency is a priority now; `6` if contact-form iteration is imminent.

## Candidate Selection

- User selected `all` on 2026-05-05.
- Selected candidates: 1, 2, 3, 4, 5, 6.

## Grill Assumptions

### Candidate 1: Global Site Profile And Organization Schema

- Selected design: add a root/global site profile seam that owns layout-level localized metadata and organization schema projection from the site facts plus offer-track catalog.
- Rejected alternatives:
  - Keep root metadata inline in the layout: rejected because it duplicates positioning copy outside the page-profile/profile seam.
  - Keep organization schema as a static constant: rejected because service types drift from the offer-track catalog and AI-first positioning.
  - Introduce CMS-backed metadata: rejected as out of scope for a static MDX site.
- Affected modules: layout Adapter, page/profile Module, SEO schema helpers, site facts, offer-track catalog, architecture tests.
- Assumptions:
  - Root metadata can keep current public copy while moving ownership.
  - Organization service types should be derived from the existing offer-track titles/semantic labels, not a new business taxonomy.
  - No public URL or localized title format changes are intended.
- Blockers: none.
- Test strategy: add behavior/architecture tests proving root metadata/schema are obtained through the profile seam and organization service types follow offer-track order.
- Expected slices: one AFK slice.

### Candidate 2: Live SEO Smoke Around Page Profiles

- Selected design: deepen SEO tooling with a script-side source-facts seam that derives live smoke URLs, locales, hreflang, and site URL from the same source modules used by sitemap/page-profile checks; keep HTTP fetching and HTML assertions as the live Adapter.
- Rejected alternatives:
  - Keep hard-coded live smoke suffixes: rejected because contact and service detail pages stay uncovered.
  - Import TypeScript app modules directly from the Node script: rejected because the repo has no TS runtime loader for scripts and MDX imports make direct runtime imports brittle.
  - Use Playwright for live smoke: rejected as larger tooling scope than needed.
- Affected modules: live SEO script, generated SEO script or shared script helper, route/profile source facts, docs if command semantics change.
- Assumptions:
  - Production live smoke should cover every localized sitemap URL unless future runtime cost becomes a problem.
  - The live check may remain network-only and should not run as part of local `npm run check`.
- Blockers: none.
- Test strategy: add script/helper tests for expected path derivation from source facts and run the existing SEO checks after build if touched.
- Expected slices: one AFK slice.

### Candidate 3: Browser Analytics Context

- Selected design: introduce a browser analytics context seam that owns page path, page location, title, referrer, locale resolution, and compact payload defaults. Conversion events and GA page-view tracking consume that seam.
- Rejected alternatives:
  - Leave duplicate locale resolution in `events` and GA loader: rejected because analytics defaults can diverge silently.
  - Move all analytics to GTM only: rejected because the current transport intentionally emits to both GTM dataLayer and gtag when available.
  - Rename events or payload parameters: rejected as unnecessary and risky for analytics continuity.
- Affected modules: analytics events, GA loader, analytics taxonomy/types, architecture and behavior tests.
- Assumptions:
  - Existing event names and documented payload semantics must remain stable.
  - Browser context can be tested with small fake environment objects rather than a real browser.
- Blockers: none.
- Test strategy: pure tests for locale/page context resolution and payload compaction, plus architecture tests that both page views and conversion events consume the shared seam.
- Expected slices: one AFK slice.

### Candidate 4: Navigation Tracking And Active-State Policy

- Selected design: deepen a navigation presentation/policy seam that owns full header navigation item shape, active-state matching, and contact CTA tracking intent. Header, desktop nav, and mobile menu renderers consume the same item model while passing surface-specific placements.
- Rejected alternatives:
  - Keep `/contact` checks in each renderer: rejected because it leaks tracking policy into UI Adapters.
  - Put browser tracking calls in the server-side header builder: rejected because it would contaminate server Modules with client behavior.
  - Merge desktop and mobile menus into one component: rejected as visual churn rather than architectural leverage.
- Affected modules: offer/navigation presentation, header, desktop nav, mobile menu, tracked-link target, analytics event callers, architecture tests.
- Assumptions:
  - Visual markup should remain functionally unchanged.
  - Contact nav clicks continue to emit `header_nav` and `mobile_menu_nav`; CTA buttons continue using ButtonLink placements.
- Blockers: none.
- Test strategy: behavior tests for active-state matching and tracking payload derivation; architecture tests ensuring renderers no longer hard-code contact tracking target checks.
- Expected slices: one AFK slice.

### Candidate 5: Service Route And Content Orchestration

- Selected design: add a service-page model seam that joins service route facts, localized content resolution, metadata/profile creation, and scroll-tracking identity. The dynamic route remains a thin Adapter that asks for static params and a page model.
- Rejected alternatives:
  - Keep route orchestration in the route file: rejected because it forces every route concern to know content, profile, slug, and tracking details.
  - Move MDX authoring into a CMS or generated manifest: rejected as too broad and contrary to current MDX source-of-truth.
  - Test service content only with source regex: rejected because it protects file shape more than caller-facing behavior.
- Affected modules: service content registry, new/current service page model seam, service detail route, page profile, proof registry, architecture tests.
- Assumptions:
  - Current FR fallback behavior remains intended.
  - Stable service slugs and prefixed localized URLs remain unchanged.
  - Static generation must continue to derive params from routing locales and offer-track slugs.
- Blockers: none.
- Test strategy: tests for static params, invalid locale/slug handling, metadata fallback/default behavior, and route Adapter thinness; keep MDX structural proof tests as guardrails unless a safer parser is introduced.
- Expected slices: one AFK slice.

### Candidate 6: Contact Form Model

- Selected design: deepen the contact Module with a form model that owns field names, message keys, defaults, validation constraints, offer options, submit service extraction, and feedback message resolution. The form Adapter renders the model and wires the server action/tracking.
- Rejected alternatives:
  - Move React rendering into the contact library: rejected because the library should stay UI-framework-light.
  - Keep field metadata inline in the form Adapter: rejected because intake validation and UI facts can drift.
  - Introduce a generated form library: rejected as unnecessary for a small static contact form.
- Affected modules: contact intake/model, contact form Adapter, contact attempt tracker usage, analytics submit/outcome callers, behavior/architecture tests.
- Assumptions:
  - Existing field names and validation limits stay stable for email delivery and analytics.
  - Existing localized message keys stay stable.
  - Honeypot behavior remains invisible and spam outcomes still avoid success/error conversion events.
- Blockers: none.
- Test strategy: pure tests for form model/defaults/submit-service extraction and feedback key resolution; architecture tests that form Adapter consumes the model rather than duplicating field definitions.
- Expected slices: one AFK slice.

## Worker Runs

- `AA-2026-05-05-02` — worker `019df926-7eb9-7ad1-a1c0-e72a42c9fd69` (`Chandrasekhar`) started. Scope: live SEO source facts/check.
- `AA-2026-05-05-03` — worker `019df926-a6cf-7b62-99a3-522788e1c6c0` (`Linnaeus`) started. Scope: browser analytics context.
- `AA-2026-05-05-04` — worker `019df926-cf03-72d1-a7ee-71fd542085aa` (`Carson`) started. Scope: header navigation model.
- `AA-2026-05-05-06` — worker `019df926-f794-7513-a258-b5f7eed4d2d4` (`Leibniz`) started. Scope: contact form model.
- Parent local work: `AA-2026-05-05-01` global site profile and `AA-2026-05-05-05` service page model.
- `AA-2026-05-05-04` completed by worker. Changed header layout/nav/menu, added `header-navigation.ts` and `header-navigation.test.mjs`. Worker reports `npm run test` and `npm run lint` passed.
- `AA-2026-05-05-06` completed by worker. Changed contact intake/form, added `contact-form-model.test.mjs`. Focused tests, lint, and build passed; full test failure was due parent service/profile integration in progress.
- `AA-2026-05-05-02` completed by worker. Changed live SEO script, added `seo-source-facts.mjs` and `live-seo-facts.test.mjs`. Focused test, lint, and live SEO passed; full test failure was due parent service/profile integration in progress.
- `AA-2026-05-05-03` completed by worker. Changed analytics events/GA loader, added `browser-context.ts` and `analytics-browser-context.test.mjs`. Focused test and lint passed; full test failure was due parent service/profile integration in progress.

## Local Issue Manifest

- `AA-2026-05-05-01` — Move Global Site Metadata And Organization Schema Behind A Profile Seam — enhancement, `ready-for-agent`, AFK.
- `AA-2026-05-05-02` — Derive Live SEO Smoke URLs From Route/Profile Facts — enhancement, `ready-for-agent`, AFK.
- `AA-2026-05-05-03` — Share Browser Analytics Context Across Page Views And Conversion Events — enhancement, `ready-for-agent`, AFK.
- `AA-2026-05-05-04` — Centralize Header Navigation Tracking And Active-State Policy — enhancement, `ready-for-agent`, AFK.
- `AA-2026-05-05-05` — Add A Service Page Model For Route, Content, Profile, And Tracking Decisions — enhancement, `ready-for-agent`, AFK.
- `AA-2026-05-05-06` — Move Contact Field And Feedback Facts Into A Contact Form Model — enhancement, `ready-for-agent`, AFK.

## Implementation Status

- `AA-2026-05-05-01` — verified.
- `AA-2026-05-05-02` — verified.
- `AA-2026-05-05-03` — verified.
- `AA-2026-05-05-04` — verified.
- `AA-2026-05-05-05` — verified.
- `AA-2026-05-05-06` — verified.

## Checks

- `cd web && npm run test` passed during candidate discovery.
- `cd web && npm run test` passed after integration: 41 tests.
- `cd web && npm run lint` passed.
- `cd web && npm run build` passed.
- `cd web && npm run check:seo` passed against generated build output: 18 localized URLs.
- `cd web && npm run check` passed.
- `cd web && npm run check:seo:live` passed against production: 18 URLs.

## Blockers / Recovery Notes

- GitHub publication blocked: `gh issue create` failed with `GraphQL: Resource not accessible by personal access token (createIssue)`.
- Recovery: continue with local PRD and local issue manifest; mark GitHub publication as blocked in final summary.
- Temporary state file kept because GitHub publication remains blocked.
