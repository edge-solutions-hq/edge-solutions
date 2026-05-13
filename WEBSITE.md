# Edge Solutions Website Operating System

This is the mandatory entrypoint for website work. Read it before changing pages, copy, design, SEO, proof, analytics, or automation recommendations for `edge-solutions.be`.

## Site Purpose

Grow qualified inbound interest from Wallonia/Belgium-based teams that need pragmatic AI development, AI workflow hardening, AI training, and reliable surrounding web/integration delivery.

The site should help a prospect answer quickly:

- Can Gil make AI useful in a real operating context?
- Is the work grounded, reviewable, and maintainable?
- What is the low-friction next step to start a useful conversation?

## Target Buyers

- Belgium-first, especially Wallonia-facing teams.
- SMEs, startups, agencies, and technical decision-makers.
- Teams with operational friction around AI adoption, internal tools, automation, data/process handoffs, or unclear delivery systems.

## Offer Hierarchy

1. Primary: pragmatic AI systems, AI workflow hardening, AI prototypes, AI training, and internal tools that survive real use.
2. Supporting proof: web delivery, integrations, productization, realtime/3D prototypes, analytics, and performance work.
3. Tone: concrete, senior, calm, technical, no hype, no fake proof.

Do not present AI, web, and realtime as three equal studio offers. Web/integration/realtime depth should prove execution range without overpowering the AI-first promise.

## Conversion Goals

- Primary: contact from a relevant Belgian/Wallonia prospect with an AI/workflow/training problem.
- Secondary: trust-building exploration of proof, services, public work, and process.
- Measurement: keep conversion event names and placements aligned with `docs/analytics/conversion-event-taxonomy.md`.

## Lane Vocabulary

Website automation and reports use one lane per run:

- `technical_seo_platform`: indexability, canonical/hreflang/schema, sitemap/robots, redirects, measurement integrity, performance, or platform health.
- `content_icp`: offer clarity, Wallonia/FR relevance, internal linking, duplication, stale messaging, or buyer-fit copy.
- `design_conversion`: scanability, trust, visual proof, relevant next step, mobile-first UX, or conversion friction.
- `pr_review`: review, fix, merge, or hold active pull requests before net-new execution.
- `analysis_observation`: facts worth watching but not yet actionable implementation work.

Daily execution should produce at most one PR-sized change, one PR review, one investigation, or one escalation. Strategic changes spanning multiple slices should become a PRD/issues/autopilot handoff.

## Source-Of-Truth Order

1. `WEBSITE.md` for website purpose, lane vocabulary, proof boundaries, and source order.
2. `docs/positioning.md` for AI-first positioning and anti-drift rules.
3. `docs/design-baseline.md` for visual direction and design guardrails.
4. `docs/architecture.md` for active module ownership and code seams.
5. `docs/analytics/conversion-event-taxonomy.md` and `docs/analytics/gtm-ga4-production-readiness.md` for analytics behavior.
6. `docs/tech-stack.md` for stack history and setup notes. Treat stale recommendations there as historical unless the current code confirms them.
7. `docs/prd/` and active issue/PR records for scoped delivery decisions.
8. `docs/archive/` for historical context only.

Notion prompt blocks operate scheduled automation. They may steer a run, but stable website strategy belongs in this repo. If Notion feedback conflicts with this file or `docs/positioning.md`, escalate instead of silently overwriting strategy.

## Content Direction

- Default authoring language is French, then translate to EN/NL when shared public content changes.
- Shared user-facing layout/copy changes should preserve FR/EN/NL parity unless explicitly scoped as a French-only SEO experiment.
- Service pages should stay compact, clear, and buyer-oriented. Prefer proof, scanability, and sharper next steps over adding more prose when pages are already in a healthy length band.
- Avoid recruiter-facing positioning and generic agency fluff.

## Design Direction

- Preserve a mostly light, editorial, professional-services baseline.
- Use dark surfaces only for a clear semantic job: operational control, workflow review, immersive prototype mood, or high-emphasis proof.
- Keep pages visually distinct. Do not solve every service page with the same repeated proof component and copy swap.
- Prefer language-neutral visuals when possible.

## SEO Direction

- Wallonia-first, French-first acquisition is the priority.
- Technical SEO hygiene matters, but weak traction alone is an observation until there is evidence of a technical defect, keyword/page mismatch, local search gap, content opportunity, or indexability issue.
- Never fabricate keyword volume, rankings, competitors, backlinks, query data, or Google/API facts. Missing provider access is a setup-required state.
- SEO runner tooling belongs in automation, not as a production website dependency.

## Proof And Asset Rules

Allowed proof sources:

- Public, real projects such as Rusty Art.
- Real workflow/process artifacts such as OpenClaw, CrewAI experiments, delivery guardrails, system diagrams, and review flows.
- Repo-owned screenshots, captured renders, approved source assets, and explicit registry entries.

Forbidden without an approved source artifact:

- Client logos, named clients, testimonials, case studies, screenshots, awards, certifications, outcome metrics, conversion lifts, or portfolio claims.
- Generated visuals that imply real client work, real products, real metrics, real screenshots, or third-party marks.

Generated visuals are allowed only as synthetic diagrams, process boards, abstract system visuals, hero/supporting art, or wrappers around approved assets. They are non-authoritative until explicitly approved for a scoped public use.

## Escalation Rules

Escalate instead of direct execution when work:

- changes durable positioning or the service hierarchy,
- touches multiple page families or needs more than one PR-sized slice,
- needs new visual direction or image approval,
- requires paid SEO providers, Google OAuth, image-generation credentials, or cost decisions,
- asks for unsafe proof or unverifiable claims,
- conflicts with this file or `docs/positioning.md`.
