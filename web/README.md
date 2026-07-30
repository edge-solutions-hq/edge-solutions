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

Contact abuse protection requires no additional local environment variable, credential, or provider setup. Local browser tests use the repository's no-I/O harness and do not require Vercel or Resend access. See [`docs/tech-stack.md`](../docs/tech-stack.md#environment-keys) for the authoritative abuse policy, deployment state, runtime constraints, and test-harness behavior.

A valid request with trusted Vercel request context performs one managed abuse-control check before delivery. If trusted request context is unavailable, the action fails closed before delivery and may perform no managed check. Honeypot and invalid submissions are rejected before abuse control.

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
