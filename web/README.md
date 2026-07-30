# Edge Solutions Web App

Next.js 16 App Router app for `edge-solutions.be`.

Before changing website strategy, copy, design, SEO, public source material, or analytics behavior, read `../WEBSITE.md`.
Package management uses pnpm. If the `pnpm` shim is unavailable, prefix commands with `corepack`, for example `corepack pnpm install`.

## Getting Started

First, set environment variables (copy `env.example` into your local env setup, e.g. `.env.local`) and run the development server:

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Optional analytics setup (Google tag)

If you want GA4 tracking enabled, set the Google tag ID:

```bash
NEXT_PUBLIC_GTM_ID=G-XXXXXXXXXX
```

When this variable is present, the app can load `gtag.js` after the visitor explicitly accepts optional analytics. It then emits conversion events (`contact_cta_click`, `contact_form_submit`, `contact_form_success`, `contact_form_error`, `service_card_click`, `locale_switch`, `service_scroll_depth`) via `dataLayer` and `gtag` when available. Rejection keeps Google and optional Vercel measurement disabled; the footer analytics settings allow withdrawal.

You can validate variable formats locally with:

```bash
pnpm run check:analytics-env
pnpm run check:analytics-env:prod
```

For event names and parameters, follow `../docs/analytics/conversion-event-taxonomy.md`.

## Contact Abuse Protection

The deployed contact action uses the active Vercel programmatic WAF Rate Limit ID `contact-submit`. The rule uses Vercel's trusted default client-IP key (`x-real-ip`); application code does not accept or construct a rate-limit key. It allows five valid contact attempts per IP in each fixed 600-second window.

Honeypot classification and field validation run first and do not consume quota. Each valid attempt then receives exactly one atomic managed WAF decision before Resend configuration or email delivery is accessed. Allowed attempts remain consumed if later delivery setup or Resend fails; there is no quota refund.

Limited attempts receive a neutral localized retry-later response. A missing rule, absent trusted IP, blocked or unexpected WAF response, or thrown request fails closed with the generic safe form error. Neither path calls Resend or exposes the IP, count, allowance, reset time, rule/provider details, region, or stack diagnostics.

The application's logical counter lifetime is the 600-second window. The repository stores no client IP or counter, adds no application credential or datastore, and makes no claim about Vercel's physical record-deletion timing. The active managed counter is regional, so production function execution must remain pinned only to `iad1` with zero-config failover disabled. The WAF rule is already published on the Hobby project; deployment of this code requires no Vercel configuration change.

The private Playwright browser harness preserves test isolation: a verified per-run marker selects always-allow abuse and successful delivery adapters with no WAF or Resend I/O. Missing, incorrect, or unreadable harness markers fail closed with no provider I/O.

## Quality Gates

After installing dependencies, install Playwright's Chromium binary once before running the browser tests or full gate:

```bash
pnpm exec playwright install chromium
```

```bash
pnpm run test
pnpm run lint
pnpm run build
pnpm run test:browser
pnpm run check:seo
pnpm run check
```

Use `pnpm run check:seo:live` only when a change depends on deployed/live SEO behavior.

Website strategy, positioning, design, source material, SEO, and escalation rules live in `../WEBSITE.md` and the owner docs it lists.
