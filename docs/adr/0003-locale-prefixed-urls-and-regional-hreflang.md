# 3. Always prefix locale URLs and own hreflang in page metadata

Status: accepted

## Context

The site serves French, English and Dutch for a Belgian audience. next-intl can leave the default locale unprefixed and can emit its own `Link` alternate headers with bare language codes.

## Decision

- `localePrefix: 'always'`: every URL starts with `/fr`, `/en` or `/nl`, the default locale included. One URL shape per language is clearer for visitors and gives search engines one canonical URL per page and language.
- `alternateLinks: false`: next-intl emits no alternates. Page metadata emits hreflang with regional codes (`fr-BE`, `en-BE`, `nl-BE`) through the helpers in `web/src/lib/site/seo.ts`.
- The locale layout calls `setRequestLocale` so next-intl pages can render statically.

## Consequences

hreflang has one owner, `seo.ts`. Changing the locale list or the regional codes happens there and in `web/src/i18n/routing.ts`.
