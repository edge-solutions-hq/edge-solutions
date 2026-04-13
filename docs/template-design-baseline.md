# Template Design Baseline

## Why this exists

The site now borrows its public-facing baseline from three Tailwind Plus sources:

- `Studio`: overall shell, restrained typography, editorial spacing, and calm service-business tone.
- `Oatmeal`: richer marketing composition for hero/demo panels, alternating text/media sections, and screenshot-style proof frames.
- `Catalyst UI Kit`: inspected as a source of reusable app primitives, but not used as the main public marketing shell.

This note exists so future edits and future cron critiques judge the site against a stable baseline instead of generic agency-site heuristics.

## What the baseline should preserve

1. AI-first hierarchy.
The homepage should lead with pragmatic AI systems and delivery hardening.
Web and realtime work should appear as supporting execution depth, not equal top-level promises.

2. Visible proof, not placeholder polish.
Use real process proof, public project proof, and bespoke diagrams or assets.
Do not swap in fake SaaS screenshots, fake client logos, or invented case-study visuals.

3. More than text-only service pages.
Each service page should include at least one custom visual proof module.
The page should not rely only on `SectionIntro` plus `GridList` repetition.

4. Distinct section rhythm.
Prefer a mix of:
- editorial intros
- stats
- list/grid explanations
- alternating text/media showcases
- clear CTA blocks

5. Track-specific module identity.
Do not solve every service page with the same proof component.
AI, web, and realtime pages should each keep at least one module type or section treatment that is not shared by all tracks.

6. Language-neutral visuals when possible.
Prefer diagrams and assets that do not depend on embedded text, so they survive FR/EN/NL reuse cleanly.

## Signals the cron should treat as positive

- Homepage contains a real visual proof board or showcase panel, not just text cards.
- Service pages contain custom media assets under `web/public/images/proof/` or equivalent repo-owned proof media.
- Service pages use visual proof modules, but not all with the same module grammar.
- Public proof remains grounded in actual Edge Solutions artifacts like OpenClaw, Rusty Art, delivery guardrails, workflow framing, or real prototype checkpoints.
- Web and realtime depth is visible as supporting proof without overpowering the AI-first message.
- Each service track keeps at least one track-specific presentation module or proof treatment.

## Signals the cron should still flag

- Service pages becoming text-heavy again with no visual proof.
- Repeated layout grammar across all service pages with no section variety.
- The same proof component being reused across all service tracks with only copy changes.
- Homepage drifting into equal-weight three-service marketing.
- Generic stock-looking panels that do not communicate concrete proof.
- Placeholder screenshots or invented portfolio evidence.

## Practical implementation note

When in doubt, prefer importing an idea from `Studio` or `Oatmeal` into the existing app structure instead of copying entire template pages wholesale.
The current app already has its own Next.js, `next-intl`, MDX, and content model; selective grafting is the intended approach.
