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

## Sales-page rules

1. One page, one sales job.
Each service page should help a buyer quickly answer three things:
- is this my problem?
- can this person handle it credibly?
- what happens if I contact him?

2. Fewer major sections.
Service pages should stay compact.
Aim for roughly 4 meaningful content sections before FAQ and final CTA, not long inventories of everything that could possibly be delivered.

3. Do not repeat generic section titles across tracks.
Avoid using the same headings like "When this is a good fit" or "What I can deliver" on every page.
If a section exists on multiple pages, rename it around the actual buyer decision for that track.

4. Trim inventory copy.
Do not stack multiple long sections that all say roughly the same thing in different words.
If a list exists, it should either qualify, prove, or de-risk the engagement.

5. Homepage should simplify toward the bottom.
The lower the user scrolls, the clearer the next step should become.
Do not increase structural complexity near the bottom of the homepage.

6. Palette logic must be intentional.
Default to a mostly light page.
Use dark surfaces only when they have a clear semantic job:
- operational control / workflow review
- immersive prototype / realtime mood
- high-emphasis proof moment

7. Limit dark emphasis.
One dominant dark proof block per page is usually enough.
Do not mix multiple unrelated dark modules just for variety.

8. Remove non-selling sections.
Large stack lists, exhaustive tech tags, and secondary methodology sections should be cut unless they clearly help a buyer choose or trust the offer.

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
