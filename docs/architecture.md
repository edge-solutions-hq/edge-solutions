# Architecture Map

This file owns active code ownership boundaries for the Next.js app.

## Rule

Keep route files and UI surfaces thin.

## Module Ownership

| Area | Owner | Boundary |
| --- | --- | --- |
| Offer tracks | `web/src/lib/offer/offer-tracks.ts` | AI-first track order, slugs, paths, message-key stems, and sitemap freshness. |
| Offer presentation | `web/src/lib/offer/offer-presentation.ts` | Header nav items, homepage offer cards, services-hub cards, and decision-strip items derived from offer tracks. |
| Home presentation | `web/src/lib/offer/home-presentation.ts` | Homepage public project model, process cards, and contact CTA placements. |
| Locale routing | `web/src/i18n/routing.ts` | Locale list, default locale, and always-prefixed locale routing. |
| Page profiles | `web/src/lib/site/page-profiles.ts` and `web/src/lib/site/site-profile.ts` | Localized public page metadata, JSON-LD graph selection, static page sitemap facts, and localized sitemap entries; the layout-level profile lives in `site-profile.ts`. |
| SEO helpers and schema | `web/src/lib/site/seo.ts` | Only place that builds localized URLs, hreflang, metadata, and JSON-LD schema; pages do not hand-roll them. |
| AI discovery | `web/src/lib/site/ai-discovery.ts` | `llms.txt` content derived from site profile, localized routes, offer tracks, and claim guardrails. |
| Service content | `web/src/lib/content/services.ts` | Localized MDX loading through the offer-track catalog, with explicit fallback state. |
| Service route model | `web/src/lib/content/service-page.ts` | Service route params, valid locale handling, localized content lookup, metadata defaults, and scroll-tracking identity. |
| Service FAQ | `web/src/lib/content/service-faq.ts` | Localized FAQ copy by locale and offer track for service pages and FAQ JSON-LD. |
| Service evidence registry | `web/src/lib/content/service-evidence-registry.ts` | Evidence module expected by each offer track, including visual asset and evidence counts. |
| Asset authority | `web/src/lib/content/asset-authority.ts` | Approved source asset provenance, usage scopes, and public path authority. |
| Contact intake | `web/src/lib/contact/options.ts` and `web/src/lib/contact/intake.ts` | Lightweight offer options and service-target helpers for client code; validation, spam classification, delivery outcome vocabulary, localized errors, and contact form model in intake. |
| Contact abuse control | `web/src/lib/contact/abuse.ts` | WAF decision and abuse-adapter seam used before delivery; policy and deployment constraints are in `docs/tech-stack.md`. |
| Contact modal | `web/src/components/contact/ContactModalContext.tsx` and `web/src/app/[locale]/contact/ContactModalProvider.tsx` | Modal-first contact CTA behavior, service preselection, focus handling, and page fallback preservation. |
| Contact attempt tracking | `web/src/lib/contact/contact-attempt-tracker.ts` | Submit-attempt counting and one-outcome-per-attempt completion rules. |
| Contact delivery | `web/src/lib/contact/delivery.ts` | Contact workflow after intake, email payload shape, success/error state, and delivery adapter seam. |
| Analytics taxonomy | `web/src/lib/analytics/taxonomy.ts` | Event names, placement values, and scroll-depth thresholds. |
| Analytics events | `web/src/lib/analytics/events.ts` | Named conversion actions and transport adapter boundary for GTM/GA4. |
| Analytics consent | `web/src/lib/analytics/consent.ts` and `web/src/components/analytics/AnalyticsConsentProvider.tsx` | Consent policy in `consent.ts`; localized controls and runtime mounting in the provider. |
| Browser analytics context | `web/src/lib/analytics/browser-context.ts` | Only source of browser page context attached to events; fields are listed in `docs/analytics/conversion-event-taxonomy.md`. |
| Service scroll depth | `web/src/lib/analytics/service-scroll-depth.ts` | Pure scroll-depth percent calculation and threshold progression. |
| Tracked link targets | `web/src/lib/navigation/tracked-link-target.ts` | Conversion from localized link hrefs into analytics target strings. |
| Header navigation | `web/src/lib/navigation/header-navigation.ts` | Header item shape, active-state matching, and contact CTA tracking intent. |
| UI surfaces | `web/src/components/ui/Surface.tsx` | Shared card, interactive-card, panel, feature, inset, and media surface styling. Use this instead of one-off shadows for reusable site surfaces. |
| External CTA links | `web/src/components/ui/ExternalLinkButton.tsx` | Shared external-link CTA styling and SVG icon used for Rusty Art, ArtStation, Vimeo, or similar off-site destinations. |
| Runtime config | `web/src/lib/runtime-config-core.mjs` and `web/src/lib/runtime-config.ts` | Analytics runtime ID validation and contact delivery defaults. |
| SEO source facts | `web/scripts/seo-source-facts.mjs` | Script-side extraction of site URL, locales, hreflang values, static page suffixes, and service slugs for SEO checks. |
