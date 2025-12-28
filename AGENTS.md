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
- `docs/tech-stack.md`: stack choices, Node version, implementation checklist.
- `docs/website_design.md`: UX/layout guidance for dual-service portfolio.
- `docs/website_content_plan.md`: section-by-section content plan and multilingual guidance.
- `docs/arborescence-repo.md`: recommended repo/tree and i18n/MDX conventions.
- Other context: `docs/marketing_strategy.md`, service pages drafts under `docs/page-service-*.md`.

## Personal profile sources
- CVs and LinkedIn profile in `ressources/` (e.g., `CV_Guminski_Gil-Tech Lead-2025-04-17.md`, `Linkedin Profile.md`) for bios, experience highlights, and wording.

## Contribution tips
- When adding copy/features: update MDX for all locales, align `messages/*.json`, and keep slugs stable.
- Run `npm run lint` before delivery.
- Preserve content in Markdown/MDX; default authoring language is French, then translate to EN/NL.
- If expanding services or pages, add corresponding MDX files, metadata, and translations; adjust navigation labels if needed.

