# Tech Stack

This file owns current implementation tooling for the Edge Solutions web app. It does not define positioning, design, content strategy, or architecture boundaries.

## Runtime Baseline

- App path: `web/`
- Package manager: pnpm (`web/pnpm-lock.yaml`, pinned by `packageManager` in `web/package.json`)
- Build-script approvals: `web/pnpm-workspace.yaml`
- Node.js: 20.9 or newer for Next.js 16
- Framework: Next.js 16 App Router
- React: 19
- Language: TypeScript 5
- Styling: Tailwind CSS v4 through `@tailwindcss/postcss`
- Content: local MDX with `@next/mdx`, `@mdx-js/react`, and `remark-gfm`
- Internationalization: `next-intl` with prefixed `fr`, `en`, and `nl` routes; `fr` is default
- Forms: `react-hook-form`, `zod`, `@hookform/resolvers`
- Email delivery: Resend through server-side contact delivery
- Analytics: Vercel Analytics, Vercel Speed Insights, optional GA4 and GTM runtime IDs

## Commands

Run commands from `web/`.
If the `pnpm` shim is unavailable, prefix commands with `corepack`, for example `corepack pnpm install`.

- Install: `pnpm install`
- Develop: `pnpm run dev`
- Unit tests: `pnpm run test`
- Lint: `pnpm run lint`
- Build: `pnpm run build`
- SEO check: `pnpm run check:seo`
- Live SEO smoke: `pnpm run check:seo:live`
- Analytics env check: `pnpm run check:analytics-env`
- Strict production analytics env check: `pnpm run check:analytics-env:prod`
- Full gate: `pnpm run check`

## Environment Keys

Copy `web/env.example` to a local env file such as `web/.env.local`.

- `RESEND_API_KEY`: required for real contact email delivery.
- `RESEND_FROM_EMAIL`: sender address; use a verified domain for production.
- `RESEND_TO_EMAIL`: destination inbox for contact messages.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: optional GA4 measurement ID.
- `NEXT_PUBLIC_GTM_ID`: optional Google Tag Manager container ID.

## Implementation Notes

- `next.config.ts` enables MDX page extensions, `remark-gfm`, Next Intl, security headers, Turbopack root configuration, and one-day caching for SEO/static endpoints.
- `web/src/i18n/routing.ts` owns locale list, default locale, and always-prefixed locale routing.
- `web/src/lib/runtime-config-core.mjs` owns GA4/GTM ID validation for app runtime and scripts.
- `web/src/lib/runtime-config.ts` adds contact delivery defaults.
- `web/scripts/seo-source-facts.mjs` keeps SEO script facts aligned with app routing and service slugs.
- `pnpm-workspace.yaml` allows required native dependency build scripts for Next/SWC, image handling, and file watching.
