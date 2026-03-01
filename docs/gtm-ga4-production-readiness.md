# GTM + GA4 production readiness guide

Last updated: 2026-02-28

## 1) What is implemented in code

- GA4 loader (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) in `web/src/components/analytics/GoogleAnalytics.tsx`
- GTM loader (`NEXT_PUBLIC_GTM_ID`) in `web/src/components/analytics/GoogleTagManager.tsx`
- Conversion events pushed to both `dataLayer` and `gtag` when available (`web/src/lib/analytics/events.ts`)

If env vars are missing, analytics code is a no-op (safe for local/dev).

## 2) Environment variable checklist

Set these in Vercel project settings (Production + Preview as needed):

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (format: `G-XXXXXXXXXX`, non-placeholder value required)
- `NEXT_PUBLIC_GTM_ID` (format: `GTM-XXXXXXX`, non-placeholder value required)

### Preflight validation commands (local/CI)

```bash
cd web
npm run check:analytics-env
npm run check:analytics-env:prod
```

`check:analytics-env:prod` runs strict validation (`--strict`) and fails if GA4/GTM IDs are missing, invalid, or still placeholder values.

### Validation gate checklist

- [ ] Local env includes real GA4 and GTM IDs (not `G-XXXXXXXXXX` / `GTM-XXXXXXX`)
- [ ] `npm run check:analytics-env:prod` exits successfully
- [ ] Same values are configured in Vercel Production environment
- [ ] Production deployment was re-triggered after any env change

## 3) Deploy checklist (copy/paste)

- [ ] GA4 property exists and web stream is configured for `edge-solutions.be`
- [ ] GTM container exists and has published workspace
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` set in Production
- [ ] `NEXT_PUBLIC_GTM_ID` set in Production
- [ ] Production redeploy triggered after env update
- [ ] `npm run check:analytics-env:prod` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

## 4) Post-deploy validation checklist

### Browser/network quick checks

- [ ] Open `/fr`, `/en`, `/nl` in production
- [ ] Confirm `https://www.googletagmanager.com/gtag/js?id=<GA_ID>` loads (status 200)
- [ ] Confirm GTM script loads with the configured container ID
- [ ] Confirm `window.dataLayer` exists in DevTools

### Event flow checks

- [ ] Click "Me contacter" on homepage → `contact_cta_click`
- [ ] Click service cards on homepage/services index → `service_card_click`
- [ ] Submit contact form (attempt) → `contact_form_submit`
- [ ] Successful contact form response → `contact_form_success`
- [ ] Trigger a validation error (e.g., empty required field) → `contact_form_error`

### GA4/GTM dashboards

- [ ] Events visible in GA4 Realtime within a few minutes
- [ ] GTM Preview mode shows expected event names + parameters

## 5) Troubleshooting

- If no events appear in GA4:
  1. Re-check GA4 measurement ID format and environment scope
  2. Verify ad-blockers are disabled during validation
  3. Confirm production build contains correct env vars (redeploy required)
- If only GTM is present but GA4 is empty:
  - Check GTM tags/triggers mapping for the event taxonomy document.

## 6) Ownership / next action

- Owner: Growth iteration loop
- Next review after first full production validation run
