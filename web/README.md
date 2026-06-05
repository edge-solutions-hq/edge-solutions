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

When this variable is present, the app loads `gtag.js` and emits conversion events (`contact_cta_click`, `contact_form_submit`, `contact_form_success`, `contact_form_error`, `service_card_click`, `locale_switch`, `service_scroll_depth`) via `dataLayer` and `gtag` when available.

You can validate variable formats locally with:

```bash
pnpm run check:analytics-env
pnpm run check:analytics-env:prod
```

For event names and parameters, follow `../docs/analytics/conversion-event-taxonomy.md`.

## Quality Gates

```bash
pnpm run test
pnpm run lint
pnpm run build
pnpm run check:seo
pnpm run check
```

Use `pnpm run check:seo:live` only when a change depends on deployed/live SEO behavior.

Website strategy, positioning, design, source material, SEO, and escalation rules live in `../WEBSITE.md` and the owner docs it lists.
