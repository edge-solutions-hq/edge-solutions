# Conversion event taxonomy (Edge Solutions)

Last updated: 2026-06-01

## Scope

This document defines the canonical event names and parameters emitted by the website for conversion analysis.

Transport layer:

- `window.dataLayer.push({ event, ...params })`
- `window.gtag('event', event, params)`

Both are emitted by `web/src/lib/analytics/events.ts` when available and only
after explicit analytics consent. Google tags, Vercel Web Analytics, and Vercel
Speed Insights do not load or emit while consent is undecided or rejected.
Withdrawing consent updates the persisted browser choice synchronously before
the loaded optional runtimes are removed by a page reload.

## Shared browser context parameters

Every browser-emitted conversion event also includes stable page context from
`web/src/lib/analytics/browser-context.ts`:

- `page_path` (string): localized current path plus query string
- `page_location` (string): full browser URL
- `page_family` (string): `home` | `services_index` | `service_detail` | `contact` | `other`
- `site_locale` (string, optional): `fr` | `en` | `nl`
- `source_offer_track` (string, optional): current service detail track (`ai-automation` | `realtime-games`)
- `page_title` (string, optional): current document title
- `page_referrer` (string, optional): browser referrer
- `ai_referrer` (string, optional): known AI assistant/source referrer (`chatgpt` | `perplexity` | `gemini` | `claude` | `copilot` | `poe`)

When a known AI referrer is detected, `page_referrer` is reduced to the referrer origin before transport so assistant query strings or chat identifiers are not sent.

## Event catalog

### 1) `contact_cta_click`

**Intent:** User clicked a CTA leading to `/contact`.

**Where wired:**

- `web/src/components/ui/Button.tsx` (`ButtonLink`)
- `web/src/components/layout/HeaderNav.tsx` (desktop nav contact item)
- `web/src/components/layout/MobileMenu.tsx` (mobile nav contact item)

**Parameters:**

- `cta_target` (string): target path (typically `/contact`)
- `page_path` (string): current path where click happened
- `placement` (string, optional): source location (`header_cta`, `header_nav`, `mobile_menu_cta`, `mobile_menu_nav`, `home_hero_primary`, `home_process_primary`, `home_bottom_primary`, `service_detail_cta`)
- `cta_label` (string, optional): clicked CTA label

---

### 2) `service_card_click`

**Intent:** User clicked a service card from a listing section.

**Where wired:**

- `web/src/components/ui/TrackedLink.tsx`
- `web/src/app/[locale]/page.tsx`
- `web/src/app/[locale]/services/page.tsx`

**Parameters:**

- `service_slug` (string): `ai-automation` | `realtime-games`
- `placement` (string): `home_services_grid` | `services_index_grid`
- `page_path` (string): current path where click happened
- `link_target` (string): target route (preserves query string/hash when present)
- `link_label` (string, optional): readable card/link label (from `aria-label` or visible text)

---

### 3) `contact_form_submit`

**Intent:** User submitted the contact form (attempt).

**Where wired:**

- `web/src/app/[locale]/contact/ContactForm.tsx` (`onSubmitCapture` and native-invalid `onInvalidCapture`)

**Parameters:**

- `service` (string): `ai` | `realtime` | `unsure`
- `page_path` (string): current path
- `submit_attempt` (number): incremental submit attempt index for the current page session (starts at `1`)

---

### 4) `contact_form_success`

**Intent:** Contact form submission completed successfully.

**Where wired:**

- `web/src/app/[locale]/contact/ContactForm.tsx` (`state.status === 'success'` effect)

**Parameters:**

- `page_path` (string): current path
- `service` (string, optional): submitted service value (`ai` | `realtime` | `unsure`)
- `submit_attempt` (number): submit attempt index linked to the matching `contact_form_submit`

---

### 5) `contact_form_error`

**Intent:** Contact form submission failed.

**Where wired:**

- `web/src/app/[locale]/contact/ContactForm.tsx` (`state.status === 'error'` effect)

**Parameters:**

- `page_path` (string): current path
- `service` (string, optional): submitted service value (`ai` | `realtime` | `unsure`)
- `submit_attempt` (number): submit attempt index linked to the matching `contact_form_submit`
- `error_type` (string): `validation` | `delivery`
- `error_field_count` (number, optional): count of invalid fields when `error_type=validation`

**Emission rule:**

- `contact_form_success` / `contact_form_error` fire once per captured submit attempt, including consecutive attempts with the same final status.
- Browser-blocked native invalid attempts are counted once per user attempt and emit `contact_form_submit` followed by `contact_form_error` with `error_type=validation`, without sending field values.
- `submit_attempt` can be used to join `contact_form_submit` with the final outcome event for that attempt.

---

### 6) `locale_switch`

**Intent:** User clicked a non-active locale switch.

**Where wired:**

- `web/src/components/layout/LocaleSwitch.tsx`

**Parameters:**

- `from_locale` (string): current locale
- `to_locale` (string): requested locale
- `page_path` (string): current path

---

### 7) `service_scroll_depth`

**Intent:** User reached a depth threshold on an offer-track detail page.

**Where wired:**

- `web/src/components/analytics/ServiceScrollDepthTracker.tsx`

**Parameters:**

- `service_slug` (string): `ai-automation` | `realtime-games`
- `scroll_depth_percent` (number): one of `25`, `50`, `75`, `90`, `100`

## GA4 mapping recommendation

The app makes the Google tag available through `gtag.js` when
`NEXT_PUBLIC_GTM_ID` is set to a GA4 Measurement ID such as `G-XXXXXXXXXX`; it
loads only after the visitor explicitly accepts optional analytics.

In GA4, use these custom events:

- `contact_cta_click`
- `service_card_click`
- `contact_form_submit`
- `contact_form_success`
- `contact_form_error`
- `locale_switch`
- `service_scroll_depth`

- Mark `contact_form_success` as a conversion event.
- Keep `contact_form_submit` as an intent signal and `contact_form_error` as a friction signal.
- Use `contact_cta_click` + `placement` to compare where intent starts.
- Use `service_card_click` + `placement` to compare interest from homepage vs services index.
- Use `page_family`, `site_locale`, and `source_offer_track` to interpret low-volume FR/EN/NL conversion paths without relying on URL parsing in reports.
- Register `ai_referrer` as a custom dimension if AI referral analysis becomes useful; keep `page_referrer` secondary because known AI referrers are intentionally stripped to origin.

## Naming rules for new events

- Use `snake_case`.
- Prefix by intent domain when needed (`contact_*`, `service_*`, etc.).
- Add only parameters that are stable and analyzable over time.
- Avoid PII in event payloads.
