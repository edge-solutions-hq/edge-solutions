# AGENTS.md

## Project

- Public website for Edge Solutions: `edge-solutions.be`.
- Main app: `web/`, a Next.js App Router site with TypeScript, Tailwind CSS, MDX content, FR/EN/NL routes, analytics, and a Resend-backed contact form.
- Personal source material lives in `resources/` and may be used for truthful bios or experience wording.

## Setup Commands

Use pnpm from `web/`; `pnpm-lock.yaml` is the lockfile. If the `pnpm` shim is unavailable, use Corepack: `corepack pnpm ...`.

- Install: `cd web && pnpm install`
- Develop: `cd web && pnpm run dev`
- Unit tests: `cd web && pnpm run test`
- Lint: `cd web && pnpm run lint`
- Build: `cd web && pnpm run build`
- SEO check: `cd web && pnpm run check:seo`
- Full gate: `cd web && pnpm run check`

Node.js 24 is required by `.nvmrc`, `web/package.json`, and CI. Prefer the full gate before finishing code changes. For docs-only edits, run targeted consistency checks instead of the full app gate unless the docs affect behavior.

## Environment

- Copy `web/env.example` to a local env file such as `web/.env.local`.
- Contact delivery uses `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `RESEND_TO_EMAIL`.
- Optional Google tag analytics use `NEXT_PUBLIC_GTM_ID` with a GA4 Measurement ID such as `G-XXXXXXXXXX`.
- Never print or commit secret values.

## Docs To Read

- Start with `WEBSITE.md`; it is the mandatory website work entrypoint and source-of-truth order.
- Owner docs referenced there: `docs/positioning.md`, `DESIGN.md`, `docs/architecture.md`, `docs/analytics/conversion-event-taxonomy.md`, and `docs/tech-stack.md`.

## App Structure

- Routes: `web/src/app/[locale]/...`
- Locales: `fr`, `en`, `nl`; default locale is `fr`; URLs are always prefixed.
- Public service content: `web/src/content/{locale}/services/{slug}.mdx`
- UI messages: `web/messages/{locale}.json`
- Offer tracks: `web/src/lib/offer/offer-tracks.ts`; do not rebuild service order or slugs elsewhere.
- Content registries live under `web/src/lib/content/`.
- Analytics contracts live under `web/src/lib/analytics/` and `docs/analytics/`.
- Shared surface styling lives in `web/src/components/ui/Surface.tsx`; reuse those variants before adding page-specific card or panel shadows.

## Working Rules

- Do not duplicate durable direction. Update the owning doc from `WEBSITE.md`'s source-of-truth order, then point other files to it.
- For shared public copy or layout changes, preserve FR/EN/NL parity unless the task is explicitly scoped as French-only.
- Default public authoring language is French, then translate to EN/NL.
- Keep AI-first acquisition priority intact in offer order and SEO, while treating AI automation and 3D / XR as two clear project families. Do not make realtime work look like a minor add-on or turn the site into a generic agency menu.
- Follow `WEBSITE.md`; do not add fake clients, metrics, client screenshots, logos, testimonials, awards, or case studies. Use only approved source assets from the asset authority registry.
- For external CTA links, reuse `web/src/components/ui/ExternalLinkButton.tsx` instead of adding unicode external-arrow glyphs or one-off button classes.
- Before changing module boundaries, read `docs/architecture.md` and preserve the named ownership seams.

## Agent Skills

### Issue Tracker

Issues and specs are tracked in GitHub Issues for `edge-solutions-hq/edge-solutions`. See `docs/agents/issue-tracker.md`.

### Triage Labels

Use the default triage label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain Docs

Single-context layout: one root `CONTEXT.md` glossary and `docs/adr/`, both created lazily by `/domain-modeling`. See `docs/agents/domain.md`.
