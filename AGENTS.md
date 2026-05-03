# AGENTS.md

## Project overview
- Main app in `web/`: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4, MDX content, i18n with `next-intl` (FR default, EN/NL locales), contact email via Resend.
- Support docs in `docs/` (stack, design, content plan, repo arborescence) and personal info in `ressources/` (CVs, LinkedIn).

## Quick start
- Prereq: Node 18.17+ (per `docs/tech-stack.md`). Uses npm (`package-lock.json` present).
- Install: `cd web && npm install`
- Dev: `npm run dev` (http://localhost:3000)
- Lint: `npm run lint`
- Build: `npm run build`; Prod: `npm run start`
- Tests: none defined yet; add before relying on CI.

## Environment
- Copy `web/env.example` to `.env.local` and set:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL` (update after domain verification)
  - `RESEND_TO_EMAIL` (target inbox)
- Keep secrets out of VCS; required for contact form/server action emails.

## App structure & content
- Routing: `src/app/[locale]/...` with locales `fr/en/nl` (see `src/i18n/routing.ts`, `src/proxy.ts`). Default locale FR; URLs are prefixed.
- Content: MDX per locale in `src/content/{locale}/services/{slug}.mdx` (stable slugs: `web-dev`, `realtime-games`). Mirror files across locales when translating.
- UI messages: `messages/{locale}.json`; update when adding copy.
- MDX components available globally via `src/mdx-components.tsx` (CTA, Callout, custom headings/links).
- Key layout/components: `src/components/layout/*`, `src/components/mdx/*`, `src/lib/content/services.ts`.
- SEO: `src/app/robots.ts`, `src/app/sitemap.ts`; keep metadata up to date when adding pages.

## Docs to read first
- `docs/README.md`: documentation map and source-of-truth order.
- `docs/positioning.md`: primary positioning source for website/design/content decisions. Treat Edge Solutions as AI-first, with web/integration/realtime as supporting execution depth rather than equal top-level offers.
- `docs/tech-stack.md`: stack choices, Node version, implementation checklist.
- `docs/design-baseline.md`: current Tailwind Plus-derived design baseline and the signals future cron/design work should preserve.
- `docs/architecture.md`: active Module ownership map.
- Historical planning notes live under `docs/archive/initial-planning/`; use them as context only, not current direction.

## Personal profile sources
- CVs and LinkedIn profile in `ressources/` (e.g., `CV_Guminski_Gil-Tech Lead-2025-04-17.md`, `Linkedin Profile.md`) for bios, experience highlights, and wording.

## Contribution tips
- Before changing layout, typography, section order, or service emphasis, read `docs/positioning.md` and preserve the AI-first hierarchy in the presentation.
- When adding copy/features: update MDX for all locales, align `messages/*.json`, and keep slugs stable.
- Run `npm run lint` before delivery.
- Preserve content in Markdown/MDX; default authoring language is French, then translate to EN/NL.
- If expanding services or pages, add corresponding MDX files, metadata, and translations; adjust navigation labels if needed.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `Gil-1/edge-solutions`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default triage label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Use the single-context layout; read repo docs as the domain source, and consume `CONTEXT.md`/`docs/adr/` if they are added later. See `docs/agents/domain.md`.
