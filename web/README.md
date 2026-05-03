This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set environment variables (copy `env.example` into your local env setup, e.g. `.env.local`) and run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
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

For production rollout, follow `../docs/gtm-ga4-production-readiness.md` and `../docs/conversion-event-taxonomy.md`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
