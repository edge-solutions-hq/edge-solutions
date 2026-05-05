# Architecture Autopilot Rerun Issue Manifest

Parent PRD: `docs/prd/architecture-autopilot-2026-05-05-rerun.md`

Publication status: GitHub issue publication blocked by `GraphQL: Resource not accessible by personal access token (createIssue)`. This local manifest is canonical for the run.

| ID | Title | Type | Triage | Status | Blocked by |
| --- | --- | --- | --- | --- | --- |
| AA-RERUN-01 | Deepen public route facts for SEO and scripts | AFK | ready-for-agent | verified | None |
| AA-RERUN-02 | Make localized service content availability explicit | AFK | ready-for-agent | verified | None |
| AA-RERUN-03 | Expose a runtime proof contract through service page models | AFK | ready-for-agent | verified | AA-RERUN-02 |
| AA-RERUN-04 | Split analytics payload policy from browser transport | AFK | ready-for-agent | verified | None |
| AA-RERUN-05 | Deepen contact field policy and bounded analytics values | AFK | ready-for-agent | verified | None |
| AA-RERUN-06 | Deepen header navigation tracking and accessibility | AFK | ready-for-agent | verified | None |
| AA-RERUN-07 | Encode AI-first offer visual hierarchy in presentation models | AFK | ready-for-agent | verified | None |
| AA-RERUN-08 | Move homepage proof, process, and CTA facts into a presentation model | AFK | ready-for-agent | verified | AA-RERUN-07 |
| AA-RERUN-09 | Share proof media frame mechanics across proof modules | AFK | ready-for-agent | verified | AA-RERUN-03 |

## AA-RERUN-01: Deepen Public Route Facts For SEO And Scripts

Labels: `enhancement`, `ready-for-agent`

### What To Build

Make one route-facts Interface describe localized paths, suffixes, URLs, canonical alternates, and route families for sitemap and SEO scripts. Keep build-output and live-network reads as Adapters.

### Acceptance Criteria

- [ ] Generated SEO and live SEO checks derive route matrices from one shared route-facts Interface.
- [ ] Locale stripping and alternate generation do not hard-code `fr|en|nl` in multiple places.
- [ ] Sitemap behavior and public URL shape are unchanged.
- [ ] Existing `check-seo` and live SEO source-facts tests remain meaningful.
- [ ] Tests cover route facts for static pages and offer-track pages.

### Agent Brief

Use grill record candidate 1. Preserve URL shape, service slugs, hreflang values, and current generated/live SEO assertions. Verification: `cd web && npm run test`, `npm run build`, `npm run check:seo`.

## AA-RERUN-02: Make Localized Service Content Availability Explicit

Labels: `enhancement`, `ready-for-agent`

### What To Build

Make localized service content availability states explicit at the content seam so missing localized content, broken loader failures, and FR fallback behavior are distinguishable and testable.

### Acceptance Criteria

- [ ] `getServiceContent` or an adjacent Interface distinguishes localized hit, fallback hit, invalid slug, missing fallback, and loader failure.
- [ ] FR fallback behavior remains intentional.
- [ ] Service page model consumes structured availability state and keeps the route Adapter thin.
- [ ] Tests cover localized success, fallback success, invalid slug, missing fallback, and broken loader cases.
- [ ] Public route behavior remains unchanged for valid existing MDX pages.

### Agent Brief

Use grill record candidate 2. Do not introduce CMS or URL changes. Verification: `cd web && npm run test`, `npm run lint`.

## AA-RERUN-03: Expose A Runtime Proof Contract Through Service Page Models

Labels: `enhancement`, `ready-for-agent`

### What To Build

Make the proof registry a runtime content/render contract exposed through service page models, while keeping MDX as localized content and keeping track-specific proof Modules.

### Acceptance Criteria

- [ ] Service page model exposes proof policy in a structured way.
- [ ] Proof registry structural expectations are typed or validated through a dedicated Interface.
- [ ] Runtime model still joins each offer track to its expected proof profile.
- [ ] Tests validate registry/content conformance through the content seam where practical.
- [ ] Existing MDX pages keep rendering and existing proof requirements remain enforced.

### Blocked By

- AA-RERUN-02.

### Agent Brief

Use grill record candidate 3. Avoid a generic proof component and avoid CMS/generation changes. Verification: `cd web && npm run test`, `npm run lint`.

## AA-RERUN-04: Split Analytics Payload Policy From Browser Transport

Labels: `enhancement`, `ready-for-agent`

### What To Build

Move analytics payload construction into pure helpers while keeping browser transport fanout to `dataLayer` and `gtag` as the Adapter. Derive analytics locale support from the routing Module.

### Acceptance Criteria

- [ ] Browser analytics locale support derives from routing locales.
- [ ] Named analytics actions use pure payload builders before transport fanout.
- [ ] Event names and documented parameters are unchanged.
- [ ] Spam contact outcomes still emit no success/error event.
- [ ] Tests cover contact submit/outcome payloads, offer/contact click payloads, context merge, and transport fanout.

### Agent Brief

Use grill record candidate 4. Do not rename events or parameters. Verification: `cd web && npm run test`, `npm run lint`.

## AA-RERUN-05: Deepen Contact Field Policy And Bounded Analytics Values

Labels: `enhancement`, `ready-for-agent`

### What To Build

Concentrate contact field constraints, field order, bounded submit-service extraction, feedback mapping, and email payload formatting behind contact Modules.

### Acceptance Criteria

- [ ] Contact model includes the constraints rendered by the form and enforced by parsing.
- [ ] Submit-service extraction returns only documented offer values or `undefined`.
- [ ] Contact analytics submit payload cannot carry arbitrary service strings.
- [ ] Email payload subject/body formatting is testable without Resend.
- [ ] Visible feedback continues to prefer localized message keys.
- [ ] Existing contact validation, spam, config error, adapter failure, and success behavior are preserved.

### Agent Brief

Use grill record candidate 5. Keep field names and offer values stable. Verification: `cd web && npm run test`, `npm run lint`.

## AA-RERUN-06: Deepen Header Navigation Tracking And Accessibility

Labels: `enhancement`, `ready-for-agent`

### What To Build

Extend the header navigation model so desktop and mobile renderers consume shared active state, contact tracking payloads, and localized mobile menu accessibility labels.

### Acceptance Criteria

- [ ] Desktop and mobile nav contact tracking payloads are derived from shared navigation metadata.
- [ ] Mobile menu can render active state consistently with desktop nav.
- [ ] Mobile menu open/close labels are localized through messages.
- [ ] Existing header/mobile visual structure remains functionally unchanged.
- [ ] Tests cover active-state and tracking payload parity.

### Agent Brief

Use grill record candidate 6. Preserve placements `header_nav`, `mobile_menu_nav`, and `mobile_menu_cta`. Verification: `cd web && npm run test`, `npm run lint`.

## AA-RERUN-07: Encode AI-First Offer Visual Hierarchy In Presentation Models

Labels: `enhancement`, `ready-for-agent`

### What To Build

Make offer presentation models carry visual role, emphasis, and grouping derived from `priorityRole`, so homepage and services hub can render AI as primary and web/realtime as supporting.

### Acceptance Criteria

- [ ] Offer presentation model identifies exactly one primary offer track.
- [ ] Supporting offer tracks remain visible as execution-depth proof.
- [ ] Homepage and services hub consume role-aware presentation output.
- [ ] Public URLs and message keys remain unchanged.
- [ ] Tests cover AI-first hierarchy and route consumption of role-aware fields.

### Agent Brief

Use grill record candidate 7. Keep visual changes restrained and aligned with `docs/positioning.md`. Verification: `cd web && npm run test`, `npm run lint`, `npm run build`.

## AA-RERUN-08: Move Homepage Proof, Process, And CTA Facts Into A Presentation Model

Labels: `enhancement`, `ready-for-agent`

### What To Build

Add a homepage presentation Module for proof cards, proof signals, process/intervention cards, Rusty Art public proof, and CTA tracking intents. The homepage route should render the model.

### Acceptance Criteria

- [ ] Homepage route no longer owns proof card/signal/process arrays inline.
- [ ] Public proof link and CTA placement values are model-owned and tested.
- [ ] Existing homepage copy keys and visual structure remain recognizable.
- [ ] Tests cover proof counts, process card count, public proof link, and CTA placements.
- [ ] Homepage remains AI-first.

### Blocked By

- AA-RERUN-07.

### Agent Brief

Use grill record candidate 8. Keep Rusty Art as the public proof link. Verification: `cd web && npm run test`, `npm run lint`, `npm run build`.

## AA-RERUN-09: Share Proof Media Frame Mechanics Across Proof Modules

Labels: `enhancement`, `ready-for-agent`

### What To Build

Introduce a small proof media frame Module for repeated browser chrome, image sizing, border/shadow, and tone mechanics across proof visual Modules while preserving track-specific layouts.

### Acceptance Criteria

- [ ] `ShowcasePanel`, `WorkflowSnapshot`, `DeliveryBlueprint`, and `PrototypeSignals` use the shared proof media frame where appropriate.
- [ ] Track-specific proof layouts remain distinct.
- [ ] Image alt text and sizing remain explicit.
- [ ] Existing proof visual classes remain visually close to current output.
- [ ] Structural tests guard usage of the shared frame.

### Blocked By

- AA-RERUN-03.

### Agent Brief

Use grill record candidate 9. Do not flatten all proof Modules into one generic layout. Verification: `cd web && npm run test`, `npm run lint`, `npm run build`.

## Triage Summary

- All local issues are `enhancement`.
- All local issues are AFK and `ready-for-agent`.
- No HITL issues.
- No `needs-info` issues.

## Completion Evidence

- `npm run test`: passed with 65 tests.
- `npm run check:analytics-env`: passed; no analytics IDs configured, valid for local development.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run check:seo`: passed with 18 localized URLs.
- Final combined gate `npm run check`: passed.
