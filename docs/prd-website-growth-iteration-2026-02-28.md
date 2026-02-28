# PRD — Edge Solutions website growth iteration

Date: 2026-02-28  
Owner: Gil / Rusty  
Status: In progress

## 1) Problem
The website has a strong technical baseline (Lighthouse/Core Web Vitals), but growth outcomes are limited by:

1. Missing/partial analytics instrumentation in production,
2. Weak localization depth for FR-first Wallonia SEO,
3. Trust/conversion messaging that is not explicit enough above the fold and on service pages.

## 2) Goals

### Primary goals
- Make measurement trustworthy (GA4-enabled deployment + validation path).
- Improve SEO relevance per locale (FR/EN/NL metadata and hreflang consistency).
- Increase conversion readiness with explicit trust signals and clearer positioning.

### Success criteria (first iteration)
- Locale pages expose correct canonical + hreflang alternates (`fr-BE`, `en-BE`, `nl-BE`, `x-default`).
- EN and NL service routes show real localized content (not FR fallback).
- Homepage includes explicit trust signals section.
- GA4 integration is env-driven and ready for production activation.

## 3) Scope

### In scope (this iteration)
- SEO metadata and alternates for home/services/contact pages.
- Organization JSON-LD on localized layout.
- EN/NL service content activation + localization.
- Homepage trust section copy uplift (FR/EN/NL).
- Turbopack root reliability fix for stable builds in this environment.

### Out of scope (next iteration)
- Full GTM dataLayer strategy (events taxonomy and custom events).
- Deep content expansion per service cluster (case-study pages).
- Full conversion design overhaul (new visual system/components).

## 4) User stories
- As a French-speaking buyer in Wallonia, I want clear localized service messaging so I trust the offer applies to my region.
- As a search engine, I need unambiguous locale alternates and canonical URLs.
- As the business owner, I need usable analytics before judging growth impact.

## 5) Delivery plan

### Phase A — Measurement foundation
- ✅ GA4 integration support in code (env-driven, no-op by default).
- ⏭ Deploy env var in production and verify first page_view events.

### Phase B — SEO localization foundation
- ✅ Localized metadata + hreflang/canonical strategy.
- ✅ EN/NL service content connected and translated.

### Phase C — Conversion readiness baseline
- ✅ Trust-signal section added to homepage.
- ⏭ Add social proof assets (logos/testimonials/case snippets) after stakeholder confirmation.

## 6) KPI framework
- Search visibility: indexed locale service pages + non-zero impressions/clicks in GSC.
- Engagement: non-zero GA4 sessions/users after instrumentation activation.
- Conversion: contact-form submissions and CTA click-through trend (post-event instrumentation).

## 7) Risks and mitigations
- Risk: analytics still shows zero if env not deployed.
  - Mitigation: production env checklist + post-deploy live validation.
- Risk: localized copy quality mismatch.
  - Mitigation: incremental review pass and targeted copy QA.
- Risk: overfitting technical SEO while ignoring conversion UX.
  - Mitigation: pair each SEO change with trust/CTA clarity improvements.

## 8) Immediate next actions (after this PR)
1. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in production and redeploy.
2. Run post-deploy validation crawl for metadata/hreflang on `/fr`, `/en`, `/nl`, and service pages.
3. Prepare trust-signal content pack (logos, client evidence, short proof points).
4. Open follow-up PR for GTM + event taxonomy (contact CTA, form submit, service CTA).
