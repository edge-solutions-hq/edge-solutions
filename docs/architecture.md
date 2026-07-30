# Architecture Map

This file owns active code ownership boundaries for the Next.js app.

## Rule

Keep route files and UI surfaces thin.

## Module Ownership

| Area | Owner | Boundary |
| --- | --- | --- |
| Offer tracks | `web/src/lib/offer-tracks.ts` | AI-first track order, slugs, paths, message-key stems, and sitemap freshness. |
| Offer presentation | `web/src/lib/offer-presentation.ts` | Header nav items, homepage offer cards, services-hub cards, and decision-strip items derived from offer tracks. |
| Home presentation | `web/src/lib/home-presentation.ts` | Homepage public project model, process cards, and contact CTA placements. |
| Page profiles | `web/src/lib/page-profiles.ts` | Localized public page metadata, JSON-LD graph selection, static page sitemap facts, and localized sitemap entries. |
| Global site profile | `web/src/lib/site-profile.ts` | Layout-level localized metadata and global structured data. |
| Site constants | `web/src/lib/site.ts` | Canonical company URL, contact, VAT, and social references consumed by SEO and profile modules. |
| SEO helpers and schema | `web/src/lib/seo.ts` | Localized URL/hreflang helpers, metadata builder, and reusable Organization/WebSite/WebPage/Service/FAQ/ItemList schema builders. |
| AI discovery | `web/src/lib/ai-discovery.ts` | `llms.txt` content derived from site profile, localized routes, offer tracks, and claim guardrails. |
| Service content | `web/src/lib/content/services.ts` | Localized MDX loading through the offer-track catalog, with explicit fallback state. |
| Service route model | `web/src/lib/content/service-page.ts` | Service route params, valid locale handling, localized content lookup, metadata defaults, and scroll-tracking identity. |
| Service FAQ | `web/src/lib/content/service-faq.ts` | Localized FAQ copy by locale and offer track for service pages and FAQ JSON-LD. |
| Service evidence registry | `web/src/lib/content/service-evidence-registry.ts` | Evidence module expected by each offer track, including visual asset and evidence counts. |
| Asset authority | `web/src/lib/content/asset-authority.ts` | Approved source asset provenance, usage scopes, and public path authority. |
| Contact intake | `web/src/lib/contact/options.ts` and `web/src/lib/contact/intake.ts` | Lightweight offer options and service-target helpers for client code; validation, spam classification, delivery outcome vocabulary, localized errors, and contact form model in intake. |
| Contact abuse control | `web/src/lib/contact/abuse.ts` | Programmatic WAF policy constants, normalized allow/limit/unavailable decisions, and the abuse-adapter seam used before delivery. |
| Contact modal | `web/src/components/contact/ContactModalContext.tsx` and `web/src/app/[locale]/contact/ContactModalProvider.tsx` | Modal-first contact CTA behavior, service preselection, focus handling, and page fallback preservation. |
| Contact attempt tracking | `web/src/lib/contact/contact-attempt-tracker.ts` | Submit-attempt counting and one-outcome-per-attempt completion rules. |
| Contact delivery | `web/src/lib/contact/delivery.ts` | Contact workflow after intake, email payload shape, success/error state, and delivery adapter seam. |
| Analytics taxonomy | `web/src/lib/analytics/taxonomy.ts` | Event names, placement values, and scroll-depth thresholds. |
| Analytics events | `web/src/lib/analytics/events.ts` | Named conversion actions and transport adapter boundary for GTM/GA4. |
| Analytics consent | `web/src/lib/analytics/consent.ts` and `web/src/components/analytics/AnalyticsConsentProvider.tsx` | Versioned browser preference, synchronous optional-transport policy, localized controls, and consent-gated Google/Vercel runtime mounting. |
| Browser analytics context | `web/src/lib/analytics/browser-context.ts` | Browser-derived page path, location, title, sanitized referrer, AI referrer source, locale, family, and service source track. |
| Service scroll depth | `web/src/lib/analytics/service-scroll-depth.ts` | Pure scroll-depth percent calculation and threshold progression. |
| Tracked link targets | `web/src/lib/navigation/tracked-link-target.ts` | Conversion from localized link hrefs into analytics target strings. |
| Header navigation | `web/src/lib/navigation/header-navigation.ts` | Header item shape, active-state matching, and contact CTA tracking intent. |
| UI surfaces | `web/src/components/ui/Surface.tsx` | Shared card, interactive-card, panel, feature, inset, and media surface styling. Use this instead of one-off shadows for reusable site surfaces. |
| External CTA links | `web/src/components/ui/ExternalLinkButton.tsx` | Shared external-link CTA styling and SVG icon used for Rusty Art, ArtStation, Vimeo, or similar off-site destinations. |
| Runtime config | `web/src/lib/runtime-config-core.mjs` and `web/src/lib/runtime-config.ts` | Analytics runtime ID validation and contact delivery defaults. |
| SEO source facts | `web/scripts/seo-source-facts.mjs` | Script-side extraction of site URL, locales, hreflang values, static page suffixes, and service slugs for SEO checks. |
