# Edge Solutions website architecture

This note names the main Modules that future iterations should preserve.

## Offer track catalog

`web/src/lib/offer-tracks.ts` owns the AI-first offer-track order, slugs, paths, message-key stems, and sitemap freshness. Public route Modules should consume this catalog instead of rebuilding parallel arrays.

## Page profiles

`web/src/lib/page-profiles.ts` owns localized public page metadata and JSON-LD graph selection. Route files should stay as thin Adapters that render the page and request the profile.

## Localized content registry

`web/src/lib/content/services.ts` loads localized MDX through the offer-track catalog and returns fallback state explicitly. Service pages should use that result instead of calling MDX loaders directly.

## Contact intake

`web/src/lib/contact/intake.ts` owns validation, spam classification, delivery outcome vocabulary, and offer values for the contact path. The contact form should render state and analytics based on the classified outcome.

## Analytics taxonomy

`web/src/lib/analytics/events.ts` owns named conversion actions and keeps GTM/GA4 as Adapters behind one transport. Callers should use domain-specific tracking functions, not raw event names.
