# Tech Stack

This file owns current implementation tooling for the Edge Solutions web app. It does not define positioning, design, content strategy, or architecture boundaries.

## Runtime Baseline

- App path: `web/`
- Package manager: pnpm (`web/pnpm-lock.yaml`, pinned by `packageManager` in `web/package.json`)
- Build-script approvals: `web/pnpm-workspace.yaml`
- Node.js: 24 (`.nvmrc`, `web/package.json`, and CI)
- Framework: Next.js 16 App Router
- React: 19
- Language: TypeScript 7 native CLI
- Styling: Tailwind CSS v4 through `@tailwindcss/postcss`
- Content: local MDX with `@next/mdx`, `@mdx-js/react`, and `remark-gfm`
- Internationalization: `next-intl` with prefixed `fr`, `en`, and `nl` routes; `fr` is default
- Forms: `react-hook-form`, `zod`, `@hookform/resolvers`
- Email delivery: Resend through server-side contact delivery
- Contact abuse control: `@vercel/firewall` programmatic rate limiting before Resend
- Analytics: Vercel Analytics, Vercel Speed Insights, optional Google tag runtime ID
- Browser tests: Playwright with one Chromium project and axe-core smoke checks

## Commands

Run commands from `web/`.
If the `pnpm` shim is unavailable, prefix commands with `corepack`, for example `corepack pnpm install`.

- Install dependencies: `pnpm install`
- Install Chromium for browser tests and the full gate (once after dependency installation): `pnpm exec playwright install chromium`
- Develop: `pnpm run dev`
- Unit tests: `pnpm run test`
- Built-server HTTP contracts: `pnpm run test:http`
- Browser tests: `pnpm run test:browser`
- Lint: `pnpm run lint`
- Type-check: `pnpm run typecheck`
- Build: `pnpm run build`
- Dependency security audit: `pnpm run check:security` (manual; not part of the full gate, Dependabot alerts are the signal)
- SEO check: `pnpm run check:seo`
- Live SEO smoke: `pnpm run check:seo:live`
- Analytics env check: `pnpm run check:analytics-env`
- Strict production analytics env check: `pnpm run check:analytics-env:prod`
- Full gate: `pnpm run check`

## Continuous Integration

`.github/workflows/ci.yml` runs the complete `corepack pnpm run check` gate when `web/**`, `docs/**` or `.github/**` changes, for:

- every such pull request, including Dependabot pull requests;
- merge-queue `checks_requested` events; and
- the tip commit of every such push to `main`, so post-merge drift remains visible.

Pull-request concurrency is scoped by event and pull-request number, allowing a newer update to cancel an obsolete run for the same pull request. Merge-group and push concurrency is scoped by event and commit SHA, so unrelated queue candidates or `main` commits cannot cancel each other's validation. The workflow grants only `contents: read`, does not persist checkout credentials, and pins actions to immutable commit revisions.

### Repository Enforcement

Workflow triggers provide validation but do not enforce merging policy. As of 2026-07-30, `main` has no classic branch protection, and repository ruleset `mainruleset` (ID `12598945`) is disabled and contains only deletion and non-fast-forward rules. No status check or merge queue is currently required. The repository's default Actions permission is read-only, and workflows cannot approve pull requests.

An administrator must configure an active ruleset or branch-protection rule targeting `main` and require the `Web check` status before merge if CI should block unvalidated merges. If merge-queue validation is required, the administrator must also enable and require the merge queue; the repository workflow can handle `merge_group` events but cannot enable the account-side queue or cause those events before the queue is used. The `push` trigger reports failures after a commit reaches `main`; it is not a substitute for a required pre-merge status check.

## Environment Keys

Copy `web/env.example` to a local env file such as `web/.env.local`.

- `RESEND_API_KEY`: required for real contact email delivery.
- `RESEND_FROM_EMAIL`: sender address; use a verified domain for production.
- `RESEND_TO_EMAIL`: destination inbox for contact messages.
- `NEXT_PUBLIC_GTM_ID`: optional Google tag / GA4 measurement ID, such as `G-XXXXXXXXXX`; configuration makes it available only after visitor opt-in.

Contact abuse control requires no application environment key, credential, or connected storage. It uses Vercel's system request context and the already-published `contact-submit` WAF rule included with the Hobby plan.

Active deployment state:

- Vercel project `edge-solutions` is on Hobby, whose included use covers the selected programmatic rate limit.
- Exactly one WAF rule is active and no draft changes remain: `Contact submission rate limit`, programmatic ID `contact-submit`.
- Its action is a 600-second fixed window, limit 5, Vercel-managed IP key, with rate-limit / HTTP 429 when exceeded.
- Function execution is configured only in `iad1`; zero-config failover is disabled.
- No application credential or connected store is required. This rule is already published; do not modify Vercel configuration for the application deployment.

## Implementation Notes

- `next.config.ts` enables MDX page extensions, `remark-gfm`, Next Intl, security headers, Turbopack root configuration, and one-day caching for SEO/static endpoints such as `robots.txt`, `sitemap.xml`, and `llms.txt`.
- `web/src/i18n/routing.ts` owns locale list, default locale, and always-prefixed locale routing.
- `web/src/lib/runtime-config-core.mjs` owns Google tag ID validation for app runtime and scripts.
- `web/src/lib/analytics/consent.ts` owns the persisted opt-in policy. Google and optional Vercel measurement runtimes load only after acceptance, and the conversion transport checks the same policy synchronously.
- `web/src/lib/runtime-config.ts` adds contact delivery defaults.
- `web/src/lib/contact/abuse.ts` owns the `contact-submit` rule ID and the contact abuse decision; the limit itself is the WAF rule above. The WAF rule is already active; do not modify Vercel configuration when deploying application changes.
- A limited attempt returns the localized neutral retry-later form error, stops before Resend, emits no success conversion, and exposes no IP, count, rule, provider, or reset diagnostics.
- The logical counter and storage lifetime is the rule's fixed window. The repository stores no client IP or counter, and makes no claim about Vercel's undocumented physical deletion timing.
- Abuse control fails closed for a missing WAF rule or result, a blocked or unexpected response, a thrown or network failure, or unavailable trusted request context (including unreadable headers). Each case returns the generic safe form error as internal `abuse_control_error` and suppresses delivery before Resend.
- The managed counter is regional, so contact function execution must remain restricted to the single `iad1` region with zero-config failover disabled. Changing that deployment topology requires re-evaluating the one-policy guarantee.
- `web/scripts/seo-source-facts.mjs` keeps SEO script facts aligned with app routing and service slugs.
- `web/tests/http-contracts.contract.mjs` builds through `test:http`, starts the production server on an isolated localhost port, and verifies routing, status, header, and metadata endpoint contracts.
- `web/e2e/` runs against an already-built production app. Its server-only harness selects no-I/O abuse and delivery adapters only for requests carrying the per-run Playwright token, bypassing both WAF and Resend; test mode otherwise fails closed without provider I/O. These private test values are not application configuration.
- The aggregate `check` command performs one production build, then reuses it for HTTP contracts, Chromium browser tests, and SEO checks.
- `web/package.json` installs TypeScript 7 directly and aliases the same package under Next.js 16's recognized `@typescript/native-preview` name. The build runs the TypeScript 7 CLI before `next build`; Oxlint handles native TypeScript linting, and ESLint uses Next's Babel parser for framework-specific rules.
- `pnpm-workspace.yaml` allows required native dependency build scripts for Next/SWC, image handling, and file watching.
