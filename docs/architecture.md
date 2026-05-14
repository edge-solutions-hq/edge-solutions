# Edge Solutions website architecture

This note names the main Modules that future iterations should preserve.

## Offer track catalog

`web/src/lib/offer-tracks.ts` owns the AI-first offer-track order, slugs, paths, message-key stems, and sitemap freshness. Public route Modules should consume this catalog instead of rebuilding parallel arrays.

## Offer presentation models

`web/src/lib/offer-presentation.ts` projects the offer-track catalog into header nav items, homepage offer cards, services-hub cards, and decision-strip items. Public route and layout Adapters should consume these models so AI-first ordering stays local without forcing every page to share the same visual grammar.

## Page profiles

`web/src/lib/page-profiles.ts` owns localized public page metadata, JSON-LD graph selection, static page sitemap facts, and localized sitemap entry generation. Route files and `web/src/app/sitemap.ts` should stay as thin Adapters that request the profile or sitemap entries.

## Global site profile

`web/src/lib/site-profile.ts` owns layout-level localized metadata and global structured-data projection. The locale layout should consume this profile instead of owning parallel metadata copy or organization schema facts.

## Localized content registry

`web/src/lib/content/services.ts` loads localized MDX through the offer-track catalog and returns fallback state explicitly. Service pages should use that result instead of calling MDX loaders directly.

## Service page model

`web/src/lib/content/service-page.ts` owns service-detail route facts: static params, valid locale handling, localized content lookup, page-profile creation, metadata defaults, and scroll-tracking identity. The dynamic service route should stay a thin Adapter that renders the returned model or 404s.

## Localized proof registry

`web/src/lib/content/proof-registry.ts` owns the proof Module expected by each offer track, including the proof visual and structural evidence counts. The localized content registry joins MDX content with this proof profile so proof drift is caught at the content seam instead of in route rendering.

## Contact intake

`web/src/lib/contact/intake.ts` owns validation, spam classification, delivery outcome vocabulary, offer values, offer option message keys, and localized field-error keys for the contact path. The contact form should render state and analytics based on the classified outcome.

## Contact form model

`web/src/lib/contact/intake.ts` also owns the contact form model: field names, message keys, defaults, validation hints, submit-service extraction, and feedback-message resolution. The contact form should render this model instead of rebuilding field policy inline.

## Contact attempt tracking

`web/src/lib/contact/contact-attempt-tracker.ts` owns contact form submit-attempt counting and one-outcome-per-attempt completion rules. The contact form should stay a thin Adapter that captures submit events, observes action outcomes, and delegates bookkeeping to this Module.

## Contact delivery

`web/src/lib/contact/delivery.ts` owns the contact submission workflow after intake: delivery configuration, email payload shape, success/error state, and the `ContactDeliveryAdapter` seam. The server action should only provide the concrete Resend Adapter.

## Analytics taxonomy

`web/src/lib/analytics/taxonomy.ts` owns event names, placement values, and scroll-depth thresholds. `web/src/lib/analytics/events.ts` owns named conversion actions and keeps GTM/GA4 as Adapters behind one transport. Callers should use domain-specific tracking functions, not raw event names.

## Browser analytics context

`web/src/lib/analytics/browser-context.ts` owns browser-derived analytics defaults such as page path, page location, page title, page referrer, site locale, page family, and service-detail source track. GA page-view tracking and conversion-event tracking should use this context instead of resolving those facts separately.

## Tracked link targets

`web/src/lib/navigation/tracked-link-target.ts` owns conversion from localized `Link` href values into analytics target strings. UI link Modules should use it instead of duplicating query/hash serialization.

## Header navigation model

`web/src/lib/navigation/header-navigation.ts` owns header navigation item shape, active-state matching, and contact CTA tracking intent. Desktop and mobile nav renderers should consume this model and only supply their surface-specific placement.

## Service scroll depth

`web/src/lib/analytics/service-scroll-depth.ts` owns pure scroll-depth percent calculation and threshold progression. `ServiceScrollDepthTracker` should remain the browser Adapter that reads window/document state and emits named analytics events.

## Runtime config

`web/src/lib/runtime-config-core.mjs` owns analytics runtime ID validation for both the app runtime and `web/scripts/validate-analytics-env.mjs`. `web/src/lib/runtime-config.ts` adds app-specific contact delivery defaults behind `getContactDeliveryConfig`.

## SEO source facts

`web/scripts/seo-source-facts.mjs` owns script-side extraction of site URL, locales, hreflang values, static page suffixes, and service slugs for SEO checks. Live SEO smoke should consume these facts while keeping production HTTP fetching as its Adapter.
