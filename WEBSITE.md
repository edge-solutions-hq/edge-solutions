# Edge Solutions Website Operating System

This is the mandatory entrypoint for website work on `edge-solutions.be`.

This file owns website operating rules: conversion model, source-of-truth order, automation lanes, content rules, SEO rules, proof limits, and escalation. It does not own detailed positioning, visual design, code architecture, or stack choices.

## Website Job

Make the positioning in `docs/positioning.md` concrete on the website and turn qualified Belgian/Wallonia prospects into low-friction contact. The homepage has priority because it must present both Edge Solutions and Gil clearly.

## Conversion Model

- Primary conversion: a relevant prospect starts contact about an AI, workflow, training, internal-tooling, or realtime problem.
- Secondary conversion: the visitor can inspect services, proof, process, and next steps without fake authority signals.
- Measurement: event names and placements must stay aligned with `docs/analytics/conversion-event-taxonomy.md`.

## Source-Of-Truth Order

1. `WEBSITE.md` for website operating rules, proof limits, lanes, source order, and escalation.
2. `docs/positioning.md` for market promise, audience, offer hierarchy, and tone.
3. `DESIGN.md` for visual system, layout language, colors, typography, components, and design guardrails.
4. `docs/architecture.md` for active module ownership and code boundaries.
5. `docs/analytics/conversion-event-taxonomy.md` for analytics behavior.
6. `docs/tech-stack.md` for current stack, commands, setup notes, and runtime assumptions.
7. Active issues, PRs, and PRDs for scoped delivery decisions.

Notion prompt blocks may steer scheduled automation. Stable website strategy belongs in this repo. If Notion feedback conflicts with this file or `docs/positioning.md`, escalate instead of silently rewriting strategy.

## Content Rules

- Use `docs/positioning.md` for audience, offer hierarchy, and tone. Do not redefine those here.
- Default public authoring language is French, then translate shared public changes to EN/NL.
- Preserve FR/EN/NL parity unless the task is explicitly scoped as a French-only SEO experiment.
- Keep service pages compact, buyer-oriented, and proof-led. Prefer clearer next steps over more prose when pages are already healthy.
- Avoid recruiter-facing positioning, generic agency copy, and equal-weight AI/realtime framing.

## Automation Lanes

Website automation and reports use one lane per run:

- `technical_seo_platform`: indexability, canonical/hreflang/schema, sitemap/robots, redirects, measurement integrity, performance, or platform health.
- `content_icp`: offer clarity, Wallonia/FR relevance, internal linking, duplication, stale messaging, or buyer-fit copy.
- `design_conversion`: scanability, mobile-first UX, visual proof, relevant next step, or conversion friction.
- `pr_review`: review, fix, merge, or hold active pull requests before net-new execution.
- `analysis_observation`: facts worth watching but not yet actionable implementation work.

Each automation run should produce at most one PR-sized change, one PR review, one investigation, or one escalation.

Strategic changes spanning multiple slices should become a PRD, issue set, or autopilot handoff.

## SEO Rules

- Wallonia-first, French-first acquisition is the priority.
- Technical SEO hygiene matters, but weak traction alone is only an observation until evidence points to a technical defect, query/page mismatch, local search gap, content opportunity, or indexability issue.
- Never fabricate keyword volume, rankings, competitors, backlinks, query data, or Google/API facts.
- Missing provider access is a setup-required state, not evidence.
- SEO runner tooling belongs in automation, not in production website dependencies.

## Proof And Asset Rules

Allowed proof sources:

- Public, real projects such as Rusty Art.
- Real workflow/process artifacts such as OpenClaw, CrewAI experiments, delivery guardrails, system diagrams, and review flows.
- Repo-owned screenshots, captured renders, approved source assets, and explicit registry entries.

Forbidden without an approved source artifact:

- Client logos, named clients, testimonials, case studies, screenshots, awards, certifications, outcome metrics, conversion lifts, or portfolio claims.
- Generated visuals that imply real client work, real products, real metrics, real screenshots, or third-party marks.

Generated visuals are allowed only as synthetic diagrams, process boards, abstract system visuals, hero/supporting art, or wrappers around approved assets. They are non-authoritative until approved for a scoped public use.

## Escalation Rules

Escalate instead of direct execution when work:

- changes durable positioning or the offer hierarchy,
- touches multiple page families or needs more than one PR-sized slice,
- needs new visual direction or image approval,
- requires paid SEO providers, Google OAuth, image-generation credentials, or cost decisions,
- asks for unsafe proof or unverifiable claims,
- conflicts with this file or `docs/positioning.md`.
