---
version: beta
name: Edge Solutions
description: Simplified cream-and-navy freelance design system for edge-solutions.be.
colors:
  background: "#f2edd7"
  foreground: "#102b4a"
  technical-blue: "#334b72"
  surface: "#f4eed6"
  surface-muted: "#e7dfc4"
  border: "#102b4a"
  muted-foreground: "#273a4d"
  subtle-foreground: "#726a53"
  primary: "#d8bf74"
  primary-foreground: "#102b4a"
  accent: "#c9ad63"
  secondary: "#102b4a"
  secondary-foreground: "#f4eed6"
typography:
  display: "Archivo Narrow, bold, condensed, tight line-height"
  body: "Inter, compact, readable"
  mono: "Fira Code only for technical tokens"
shapes:
  controls: "rounded-md"
  panels: "rounded-lg"
  media: "0.75rem to 1.25rem"
---

# Edge Solutions Design System

## Direction

The site is a clear freelance portfolio for Gil Guminski, not a SaaS landing page. It should feel technical, calm, and approachable: cream background, navy structure, precise typography, restrained gold actions, and a few blueprint-like details.

Use `docs/ai_developer_landing_page.png` as inspiration for the technical/print feeling only. Do not copy the reference literally. The current website direction is simpler than the reference: fewer decorative layers, less contrast where it feels heavy, and more focus on readable sections.

## Core Rules

- Make the page easy to understand before making it decorative.
- Prefer one strong visual idea per section. If the page background already has a grid, do not add another grid inside the section unless it adds clear structure.
- Use navy for structure, borders, labels, body text, and strong bands.
- Use `technical-blue` for large hero/display text and prominent section headings; full navy remains for body text, links, borders, and structure.
- Use gold for primary actions and small accents only. It should feel warm and quiet, not like a dark mustard block.
- Keep work-example and process sections simple. Avoid repeating the same reassurance in multiple panels.
- Keep spacing generous enough to scan, but avoid oversized hero or marketing-style empty space.

## Color Use

- `background #f2edd7`: page base.
- `surface #f4eed6`: cards, forms, panels.
- `surface-muted #e7dfc4`: active nav, quieter hover, inset details.
- `foreground #102b4a`: default text, borders, links, dark sections.
- `technical-blue #334b72`: softer large display text and prominent section headings.
- `primary #d8bf74`: primary buttons and small action accents.
- `accent #c9ad63`: primary hover state and stronger gold details.
- `secondary #102b4a`: dark CTA bands and navy buttons.

The site does not automatically switch to dark mode. Dark navy is a deliberate section treatment only.

## Typography

Use `Archivo Narrow` for hero titles, section headings, and compact card headings. Keep it bold, condensed, and aligned, but do not let it overpower the page.

Use `Inter` for navigation, paragraphs, forms, buttons, and dense content. Body copy should feel direct and readable, not tiny or overly styled.

Do not use negative letter spacing. Do not scale font size with viewport width.

## Layout

The page should feel engineered, but not busy.

- Keep a visible alignment grid across the page.
- Use horizontal structure in the hero and CTA areas, but soften borders when the section starts to feel boxed in.
- Use cards for repeated service/details items, not for every page section.
- Avoid nested cards.
- Let the homepage flow stay simple: hero, services, profile/context, public project, process, final contact.
- On the homepage, the two service cards use equal visual weight. Keep AI first in order, but do not make the 3D / XR card look like a minor secondary option.
- On mobile, preserve the same order and clarity with a single-column layout.

## Patterns And Decoration

The global square background pattern is enough for most pages. Additional internal grids, dashed lines, browser-chrome marks, blueprint strokes, or mechanical details must be subtle and purposeful.

Use decorative marks to support hierarchy or technical identity. Remove them when they compete with the copy.

Avoid gradient blobs, glow effects, decorative orbs, heavy shadows, and generic AI/SaaS visuals.

## Components

**Buttons**

Primary buttons use light gold fill, navy text, a navy border, compact radius, and a small offset shadow. The hover state can use the stronger gold accent, but the default state should stay soft.

Secondary buttons use navy fill with cream text. Outline buttons use a cream surface, navy text, and navy border.

External links that behave like CTAs use `web/src/components/ui/ExternalLinkButton.tsx`: soft gold fill, navy text, compact radius, small offset shadow, and the inline SVG external-link icon. Do not use unicode external-arrow glyphs such as `↗`; they can render like emoji and feel less professional.

**Cards**

Cards use cream surfaces, navy borders, compact headings, and a restrained gold offset shadow. Service cards can use blueprint-style iconography, but the copy must remain the main signal.

Use the shared surface vocabulary in `web/src/components/ui/Surface.tsx` instead of writing new one-off shadows:

- `card`: default repeated item or simple content card.
- `interactive-card`: clickable service, project, or navigation card.
- `panel`: page-level grouped content such as profile, contact form, or final CTA.
- `feature`: higher-emphasis project/process module, still using the same gold offset language.
- `inset`: inner detail area with border and no shadow.
- `media`: framed project, process, or browser-like visual.

Only add custom shadows for tiny controls, focus rings, inset technical details, or intentionally responsive hero behavior. Avoid mixing saturated `var(--primary)` block shadows with softer rgba shadows on ordinary cards.

**Forms**

Forms use cream fields, navy borders, compact labels, and gold focus rings. Error and success messages should be direct and legible.

Contact CTAs open a modal on the current page. Keep the modal visually close to the contact page form: cream surface, navy border, restrained shadow, simple title, clear close button, and no extra marketing copy. On small screens it should behave like a full-screen sheet. The `/contact` page stays available as the fallback.

**Dark Bands**

Use dark navy bands sparingly, mainly for high-emphasis CTA or footer moments. Do not turn the whole site dark-first.

## Copy Fit

Visual design must support the copywriting direction in `docs/positioning.md`: direct, freelance, simple, and grounded.

If a section needs a lot of explanatory text to justify itself, simplify the section. If a visual block repeats a point already made nearby, remove it.
