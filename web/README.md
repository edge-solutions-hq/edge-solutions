# Edge Solutions Web App

Next.js 16 App Router app for `edge-solutions.be`.

Before changing website strategy, copy, design, SEO, proof, or analytics behavior, read `../WEBSITE.md` and `../docs/README.md`.

## Getting Started

First, set environment variables (copy `env.example` into your local env setup, e.g. `.env.local`) and run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Optional analytics setup (GA4 + GTM)

If you want GA4 tracking enabled, set:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

If you want Google Tag Manager enabled, set:

```bash
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

When these variables are present, the app loads GA4/GTM and emits conversion events (`contact_cta_click`, `contact_form_submit`, `contact_form_success`, `contact_form_error`, `service_card_click`, `locale_switch`, `service_scroll_depth`) via `dataLayer` and `gtag` when available.

You can validate variable formats locally with:

```bash
npm run check:analytics-env
npm run check:analytics-env:prod
```

For production rollout, follow `../docs/analytics/gtm-ga4-production-readiness.md` and `../docs/analytics/conversion-event-taxonomy.md`.

## Quality Gates

```bash
npm run test
npm run lint
npm run build
npm run check:seo
npm run check
```

Use `npm run check:seo:live` only when a change depends on deployed/live SEO behavior.

## Website Rules

- Keep the site AI-first: pragmatic AI systems, AI workflow hardening, AI prototypes, AI training, and internal tools are primary.
- Keep web, integration, realtime, analytics, and performance work as supporting proof and execution depth.
- Preserve FR/EN/NL parity for shared user-facing changes unless a task is explicitly scoped as a French-only SEO experiment.
- Do not add client logos, testimonials, named clients, case studies, outcome metrics, screenshots, awards, or certifications without an approved source artifact.
- Treat missing SEO/provider evidence as setup-required, not certainty.
