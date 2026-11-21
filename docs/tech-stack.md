# Tech Stack

This file owns current implementation tooling for the Edge Solutions web app. It does not define positioning, design, content strategy, or architecture boundaries.

## Runtime Baseline

- Package manager: pnpm (`web/pnpm-lock.yaml`, pinned by `packageManager` in `web/package.json`)
- Native dependency build-script approvals and dependency overrides: `web/pnpm-workspace.yaml`
- Node.js: 24 (`.nvmrc`, `web/package.json`, and CI)
- Framework: Next.js 16 App Router
- React: 19
- Language: TypeScript 7 native CLI
- Styling: Tailwind CSS v4 through `@tailwindcss/postcss`
- Content: local MDX with `@next/mdx` and `remark-gfm`
- Internationalization: `next-intl` with prefixed `fr`, `en`, and `nl` routes; `fr` is default
- Email delivery: Resend through server-side contact delivery
- Contact abuse control: `@vercel/firewall` programmatic rate limiting before Resend
- Analytics: Vercel Analytics, Vercel Speed Insights, optional Google tag runtime ID

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

`.github/workflows/ci.yml` runs the full `check` gate on pull requests and pushes to `main` that touch `web/**`, `docs/**`, `.github/**`, `.claude/**`, `.githooks/**` or the root `eslint.config.mjs`, so post-merge drift stays visible. Push runs are keyed by commit SHA, so `main` commits never cancel each other's validation.

`main` has no required checks: CI reports results but does not block merges.

### Secret Scanning

Secret-leak protection has three layers, all reading `.gitleaks.toml` (gitleaks defaults plus rules for Resend, OpenRouter and Vercel keys):

- `.github/workflows/secrets.yml` runs gitleaks over the full git history of every branch on every pull request and every push to `main`, with no path filter. It downloads a pinned gitleaks release and verifies its SHA-256 before running it, on the same `CI_RUNNER` as the main gate.
- `.githooks/pre-commit` scans staged changes. `pnpm install` in `web/` points `core.hooksPath` at `.githooks`. The hook needs a local `gitleaks` binary (`brew install gitleaks`); without one it warns and lets the commit through, and CI still catches the leak.
- `.claude/hooks/secret-guard.mjs`, wired in `.claude/settings.json`, stops Claude Code from sending prompts that contain a key, from reading or searching `.env*` files and private keys, from writing a key into a file, and from running commands that print secrets (`printenv`, bare `env` or `set`, `export -p`, `/proc/*/environ`, `gh auth token`, `echo $SOME_KEY`). `web/tests/secret-guard.test.mjs` covers it. The guard is best-effort: it matches tool inputs and command text, so a shell can still reach a secret file through tools it does not recognize (for example a recursive `rg` or a script). Gitleaks and `.gitignore` are the backstop that keeps secrets out of the repository.

A leaked key must be rotated first. Because the CI scan covers the whole history, a finding keeps failing after the file is fixed: once the key is revoked, add the fingerprint gitleaks prints to `.gitleaksignore`.

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
- Function execution is configured only in `iad1` with zero-config failover disabled, because the managed counter is regional. Changing that topology requires re-evaluating the one-policy guarantee.
- This rule is already published; do not modify Vercel configuration when deploying application changes.

## Implementation Notes

- The limit itself is the `contact-submit` WAF rule above, not application code. A limited attempt returns the localized neutral retry-later form error, stops before Resend, emits no success conversion, and exposes no IP, count, rule, provider, or reset diagnostics.
- The logical counter and storage lifetime is the rule's fixed window. The repository stores no client IP or counter, and makes no claim about Vercel's undocumented physical deletion timing.
- Abuse control fails closed for a missing WAF rule or result, a blocked or unexpected response, a thrown or network failure, or unavailable trusted request context (including unreadable headers). Each case returns the generic safe form error as internal `abuse_control_error` and suppresses delivery before Resend.
- `web/tests/http-contracts.contract.mjs` builds through `test:http`, starts the production server on an isolated localhost port, and verifies routing, status, header, and metadata endpoint contracts.
- `web/e2e/` runs against an already-built production app. Its server-only harness selects no-I/O abuse and delivery adapters only for requests carrying the per-run Playwright token, bypassing both WAF and Resend; test mode otherwise fails closed without provider I/O. These private test values are not application configuration.
- The aggregate `check` command performs one production build, then reuses it for HTTP contracts, Chromium browser tests, and SEO checks.
- `web/package.json` installs TypeScript 7 directly and aliases the same package under Next.js 16's recognized `@typescript/native-preview` name. The build runs the TypeScript 7 CLI before `next build`; Oxlint handles native TypeScript linting, and ESLint uses Next's Babel parser for framework-specific rules.
