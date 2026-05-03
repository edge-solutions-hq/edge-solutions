# Edge Solutions website architecture

This note names the main Modules that future iterations should preserve.

## Offer track catalog

`web/src/lib/offer-tracks.ts` owns the AI-first offer-track order, slugs, paths, message-key stems, and sitemap freshness. Public route Modules should consume this catalog instead of rebuilding parallel arrays.

## Page profiles

`web/src/lib/page-profiles.ts` owns localized public page metadata, JSON-LD graph selection, static page sitemap facts, and localized sitemap entry generation. Route files and `web/src/app/sitemap.ts` should stay as thin Adapters that request the profile or sitemap entries.

## Localized content registry

`web/src/lib/content/services.ts` loads localized MDX through the offer-track catalog and returns fallback state explicitly. Service pages should use that result instead of calling MDX loaders directly.

## Localized proof registry

`web/src/lib/content/proof-registry.ts` owns the proof Module expected by each offer track, including the proof visual and structural evidence counts. The localized content registry joins MDX content with this proof profile so proof drift is caught at the content seam instead of in route rendering.

## Contact intake

`web/src/lib/contact/intake.ts` owns validation, spam classification, delivery outcome vocabulary, and offer values for the contact path. The contact form should render state and analytics based on the classified outcome.

## Contact delivery

`web/src/lib/contact/delivery.ts` owns the contact submission workflow after intake: delivery configuration, email payload shape, success/error state, and the `ContactDeliveryAdapter` seam. The server action should only provide the concrete Resend Adapter.

## Analytics taxonomy

`web/src/lib/analytics/taxonomy.ts` owns event names, placement values, and scroll-depth thresholds. `web/src/lib/analytics/events.ts` owns named conversion actions and keeps GTM/GA4 as Adapters behind one transport. Callers should use domain-specific tracking functions, not raw event names.

## Runtime config

`web/src/lib/runtime-config-core.mjs` owns analytics runtime ID validation for both the app runtime and `web/scripts/validate-analytics-env.mjs`. `web/src/lib/runtime-config.ts` adds app-specific contact delivery defaults behind `getContactDeliveryConfig`.
