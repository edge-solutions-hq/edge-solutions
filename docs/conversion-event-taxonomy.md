# Conversion event taxonomy (Edge Solutions)

Last updated: 2026-02-28

## Scope

This document defines the canonical event names and parameters emitted by the website for conversion analysis.

Transport layer:

- `window.dataLayer.push({ event, ...params })`
- `window.gtag('event', event, params)`

Both are emitted by `web/src/lib/analytics/events.ts` when available.

## Event catalog

### 1) `contact_cta_click`

**Intent:** User clicked a CTA leading to `/contact`.

**Where wired:**

- `web/src/components/ui/Button.tsx` (`ButtonLink`)

**Parameters:**

- `cta_target` (string): target path (typically `/contact`)
- `page_path` (string): current path where click happened

---

### 2) `service_card_click`

**Intent:** User clicked a service card from a listing section.

**Where wired:**

- `web/src/components/ui/TrackedLink.tsx`
- `web/src/app/[locale]/page.tsx`
- `web/src/app/[locale]/services/page.tsx`

**Parameters:**

- `service_slug` (string): `web-dev` | `realtime-games`
- `placement` (string): `home_services_grid` | `services_index_grid`
- `page_path` (string): current path where click happened
- `link_target` (string): target route

---

### 3) `contact_form_submit`

**Intent:** User submitted the contact form (attempt).

**Where wired:**

- `web/src/app/[locale]/contact/ContactForm.tsx` (`onSubmitCapture`)

**Parameters:**

- `service` (string): `web` | `realtime` | `unsure`
- `page_path` (string): current path

---

### 4) `contact_form_success`

**Intent:** Contact form submission completed successfully.

**Where wired:**

- `web/src/app/[locale]/contact/ContactForm.tsx` (`state.status === 'success'` effect)

**Parameters:**

- `page_path` (string): current path

## GTM/GA4 mapping recommendation

In GTM, create custom event triggers for:

- `contact_cta_click`
- `service_card_click`
- `contact_form_submit`
- `contact_form_success`

In GA4:

- Mark `contact_form_success` as a conversion event.
- Keep `contact_form_submit` as a diagnostic intent signal.
- Use `service_card_click` + `placement` to compare interest from homepage vs services index.

## Naming rules for new events

- Use `snake_case`.
- Prefix by intent domain when needed (`contact_*`, `service_*`, etc.).
- Add only parameters that are stable and analyzable over time.
- Avoid PII in event payloads.
