# Architecture Autopilot State

## Scope

- Target repo: `/home/winedgeuser/.openclaw/workspace/projects/edge-solutions`
- Target domain: full repo
- Started: 2026-05-03

## Preparation

- Repo instructions: `AGENTS.md`
- Domain docs: no `CONTEXT.md`, no `CONTEXT-MAP.md`, no `docs/adr/`; use repo docs under `docs/` as source of domain language.
- Issue tracker: GitHub Issues for `Gil-1/edge-solutions`.
- Triage labels: defaults from `docs/agents/triage-labels.md`.
- Verification commands: `cd web && npm run test`, `npm run check:analytics-env`, `npm run lint`, `npm run build`, `npm run check:seo`; combined command `cd web && npm run check`.

## Assumptions

- Agent skill setup used GitHub Issues because `origin` points at GitHub.
- Agent skill setup used default triage labels because no repo-specific labels were documented.
- Domain docs use single-context layout because no context map or ADR directory exists.

## Candidate Checkpoint

- Status: awaiting user selection.

### Candidates

1. Contact outcome and offer-intake seam
- Files: `web/src/lib/contact/intake.ts`, `web/src/lib/contact/delivery.ts`, `web/src/app/[locale]/contact/ContactForm.tsx`, `web/messages/*.json`.
- Problem: contact offer values, French delivery labels/messages, form options, and analytics values are split across modules; EN/NL error states can leak French server copy.
- Impact: high user-visible i18n correctness and better contact-flow testability.
- Risk: medium; touches `useActionState` state shape and email payload labels.
- Effort: medium.

2. Contact analytics attempt tracker
- Files: `web/src/app/[locale]/contact/ContactForm.tsx`, `web/src/lib/analytics/events.ts`, `web/tests/architecture.test.mjs`.
- Problem: submit attempt counting, spam suppression, pending-state handling, and outcome emission live inside one client form implementation.
- Impact: high conversion-data confidence and local behavioural tests.
- Risk: medium; React action timing is subtle.
- Effort: medium.

3. Shared tracked-link target module
- Files: `web/src/components/ui/Button.tsx`, `web/src/components/ui/TrackedLink.tsx`.
- Problem: href serialization and contact-target detection are duplicated in two UI modules.
- Impact: low-medium; small change with clear locality gain.
- Risk: low.
- Effort: small.

4. Service scroll-depth module
- Files: `web/src/components/analytics/ServiceScrollDepthTracker.tsx`, `web/src/lib/analytics/taxonomy.ts`.
- Problem: scroll-depth math and threshold progression are buried in the browser adapter and only covered by source-pattern tests.
- Impact: medium analytics correctness; easy behaviour tests.
- Risk: low-medium.
- Effort: small.

5. Route and page-profile seam
- Files: `web/src/i18n/routing.ts`, `web/src/i18n/navigation.ts`, `web/src/lib/seo.ts`, `web/src/lib/page-profiles.ts`, `web/src/components/layout/LocaleSwitch.tsx`, `web/scripts/check-seo.mjs`.
- Problem: stable route suffixes and locale assumptions leak into SEO, breadcrumbs, sitemap, locale switching, and hardcoded check counts.
- Impact: high future-proofing for localized paths/slugs and route growth.
- Risk: medium; current routing is simple and should not become a generic abstraction.
- Effort: medium-large.

6. Offer presentation models
- Files: `web/src/lib/offer-tracks.ts`, `web/src/components/layout/Header.tsx`, `web/src/app/[locale]/page.tsx`, `web/src/app/[locale]/services/page.tsx`, `web/messages/*.json`.
- Problem: the offer catalog is deep, but each consumer remaps it into nav items, homepage cards, services cards, and decision strips.
- Impact: medium; keeps AI-first ordering and offer-card copy local while preserving page variation.
- Risk: medium; over-abstraction could flatten distinct page grammar.
- Effort: medium.

7. Localized service content render policy and proof validation
- Files: `web/src/lib/content/services.ts`, `web/src/lib/content/proof-registry.ts`, `web/src/app/[locale]/services/[slug]/page.tsx`, `web/tests/architecture.test.mjs`, `web/src/content/*/services/*.mdx`.
- Problem: content fallback state is returned but not used by routes, and proof validation relies on regex over MDX source rather than the content/proof interface.
- Impact: high SEO/content correctness and stronger design-baseline protection.
- Risk: medium; fallback policy may require deciding between fallback, noindex, or notFound.
- Effort: medium-large.

### Selection

- User selected: all candidates 1-7.

## Grill Records

- Status: complete.

### 1. Contact outcome and offer-intake seam

- Selected design: keep `web/src/lib/contact/intake.ts` as the contact intake Module and single source for offer values, parsed fields, spam classification, validation outcome, and delivery outcome vocabulary; keep `web/src/lib/contact/delivery.ts` as delivery workflow behind `ContactDeliveryAdapter`; render visible form feedback from localized outcome codes in `ContactForm.tsx`.
- Rejected alternatives: validation in `ContactForm.tsx`; offer values only in messages; broad contact domain package; treating spam as success; database-backed intake.
- Assumptions: contact feedback localizes through `messages/*.json`; values stay `ai | web | realtime | unsure`; internal email labels may remain French but should be produced by the contact Module; no new offer value.
- Blockers: none.
- Test strategy: behaviour tests for `parseContactFields` and `submitContactAttempt`; architecture guard that form consumes offer options/outcomes from contact seam.
- Expected slices: contact tests, canonical offer option interface, form option migration, outcome-based localized rendering, seam guards.

### 2. Contact analytics attempt tracker

- Selected design: extract submit-attempt counting and one-outcome-per-attempt logic from `ContactForm.tsx` into a small client-safe tracker Module; keep event taxonomy and GTM/GA4 transport in `events.ts`.
- Rejected alternatives: leave tracker refs in form; move attempt state into `events.ts`; session/global storage; spam error tracking; server-generated attempt IDs.
- Assumptions: attempt numbering resets on component remount; spam increments internal attempt and emits no outcome; submit capture remains correct seam for `contact_form_submit`; no new event names.
- Blockers: none.
- Test strategy: pure tracker tests for incrementing, dedupe, and spam completion; architecture guard that form delegates attempt bookkeeping.
- Expected slices: tracker tests, tracker Module, form integration, architecture guard.

### 3. Shared tracked-link target module

- Selected design: add `web/src/lib/navigation/tracked-link-target.ts` with one target-resolution interface used by `ButtonLink` and `TrackedLink`.
- Rejected alternatives: keep duplicate helpers; move href parsing into `events.ts`; one universal tracked-link wrapper; backward-compatible aliases for private helpers.
- Assumptions: target string format remains pathname + query + hash; no locale normalization; support current `Link` href shape; unsupported href returns `''`.
- Blockers: none.
- Test strategy: focused target-resolution tests and architecture guard against duplicated helper names in UI modules.
- Expected slices: shared Module, migrate `TrackedLink`, migrate `ButtonLink`, guard.

### 4. Service scroll-depth module

- Selected design: add pure analytics Module for scroll-depth calculation and threshold progression; keep React tracker as browser Adapter and `taxonomy.ts` as threshold owner.
- Rejected alternatives: keep all logic in tracker; move thresholds; move event emission; add throttling; replace with IntersectionObserver.
- Assumptions: thresholds stay `[25, 50, 75, 90, 100]`; non-scrollable page returns `100`; thresholds fire once per service lifecycle; payload unchanged.
- Blockers: none.
- Test strategy: pure tests for percent calculation and unfired thresholds; architecture guard that tracker delegates while taxonomy owns thresholds.
- Expected slices: pure Module/tests, tracker delegation, guard.

### 5. Route and page-profile seam

- Selected design: strengthen existing `web/src/lib/page-profiles.ts` seam and keep route files, `sitemap.ts`, and SEO checks as Adapters; avoid broad route manifest rewrite.
- Rejected alternatives: monolithic route manifest; route-owned metadata/JSON-LD/sitemap facts; `seo.ts` owning page profiles; nav components consuming page profiles.
- Assumptions: URL shape unchanged; `alternateLinks: false` remains intentional; service slugs sourced from `OFFER_TRACKS`; no localized paths/slugs now.
- Blockers: none; `check-seo.mjs` hardcoded expected count is brittle.
- Test strategy: architecture guard for page-profile seam; generated SEO check after build; narrow script improvement to derive expected counts.
- Expected slices: reduce fixed SEO assumptions, optional type/interface tightening, keep adapters thin.

### 6. Offer presentation models

- Selected design: add `web/src/lib/offer-presentation.ts` with pure projection functions for header nav, homepage cards, services hub cards, and services decision items; keep `offer-tracks.ts` as offer identity source.
- Rejected alternatives: expand `offer-tracks.ts` into presentation dumping ground; keep inline `OFFER_TRACKS.map`; one universal offer card; move copy out of messages.
- Assumptions: pass lightweight `t` function; surface `priorityRole` only as metadata, not a visual redesign; no route/message-key changes.
- Blockers: none.
- Test strategy: architecture guard that public adapters consume presentation model functions and homepage/services page use distinct functions.
- Expected slices: offer-presentation Module, migrate header/home/services adapters, guard.

### 7. Localized service content render policy and proof validation

- Selected design: keep MDX; make `services.ts` the service content render-policy Module and `proof-registry.ts` the proof-policy Module; routes remain thin Adapters.
- Rejected alternatives: CMS; route-level proof validation; one generic proof component; metadata-only registry; runtime-only validation; per-locale proof registry.
- Assumptions: FR fallback is intended; validation remains static-test oriented; next useful depth is validating required proof signals and all structural counts; no authoring UI.
- Blockers: none; current proof tests skip `columnPoints` and only assert `requiredSignals` is non-empty.
- Test strategy: validate all structural counts including `columnPoints`; validate required signals against MDX; guard route uses `getServiceContent` and no direct MDX imports.
- Expected slices: stricter proof tests, fix MDX drift if any, remove unused proof-less interface if safe, optional docs clarification.

## PRD

- Path: `docs/prd/architecture-autopilot-2026-05-03.md`.
- GitHub issue publication: blocked by `gh issue create` returning `GraphQL: Resource not accessible by personal access token (createIssue)`.
- Recovery: continue with local issue manifest under `.scratch/architecture-autopilot/`.

## Issues

- Manifest: `.scratch/architecture-autopilot/issues-manifest.md`.
- GitHub publication: blocked by PRD publication permission failure.
- Local issues:
  - AA-001 `ready-for-agent`: localize contact outcome and offer-intake seam.
  - AA-002 `ready-for-agent`: extract contact analytics attempt tracker. Blocked by AA-001.
  - AA-003 `ready-for-agent`: share tracked-link target normalization.
  - AA-004 `ready-for-agent`: extract service scroll-depth decision Module.
  - AA-005 `ready-for-agent`: tighten page-profile SEO verification seam.
  - AA-006 `ready-for-agent`: add offer presentation models.
  - AA-007 `ready-for-agent`: strengthen service proof validation.
  - AA-008 `ready-for-agent`: make localized service render policy explicit. Blocked by AA-007.

## Triage

- Local triage complete: all issues are `enhancement` and `ready-for-agent`.
- HITL issues: none.
- Needs-info issues: none.

## Worker Runs

- AA-001: verified by parent agent; contact offer/outcome localization seam implemented.
- AA-002: verified by parent agent; contact attempt tracker implemented.
- AA-003: verified by parent agent; tracked-link target Module implemented.
- AA-004: verified by parent agent; service scroll-depth Module implemented.
- AA-005: verified by parent agent; SEO expected URL count now derived.
- AA-006: verified by parent agent; offer presentation models implemented.
- AA-007: verified by parent agent; proof validation strengthened.
- AA-008: verified by parent agent; service content render policy made explicit.

## Verification

- `cd web && npm run test`: passed, 24 tests.
- `cd web && npm run check:analytics-env`: passed.
- `cd web && npm run lint`: passed.
- `cd web && npm run build`: passed.
- `cd web && npm run check:seo`: passed, 18 localized URLs.
- `cd web && npm run check`: passed.

## Blockers

- GitHub PRD/issue publication blocked by `gh issue create`: `GraphQL: Resource not accessible by personal access token (createIssue)`.
- Local PRD and issue manifest were used as recovery artifacts.
