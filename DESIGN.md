---
version: alpha
name: Edge Solutions
description: Cream-and-navy technical portfolio design system for edge-solutions.be, updated from docs/ai_developer_landing_page.png.
colors:
  background: "#f2edd7"
  foreground: "#102b4a"
  surface: "#f4eed6"
  surface-muted: "#e7dfc4"
  border: "#102b4a"
  muted-foreground: "#273a4d"
  subtle-foreground: "#726a53"
  primary: "#aa8e4b"
  on-primary: "#102b4a"
  secondary: "#102b4a"
  on-secondary: "#f4eed6"
  accent: "#c2a45b"
  on-accent: "#102b4a"
  link: "#102b4a"
  ring: "#aa8e4b"
  dark-background: "#0f2a52"
  dark-surface: "#12305a"
  dark-surface-muted: "#183962"
  dark-border: "#aa8e4b"
  dark-foreground: "#f2edd7"
  dark-muted-foreground: "#d6cda9"
  dark-subtle-foreground: "#d6cda9"
  dark-link: "#f2edd7"
  navy-deep: "#102b4a"
  technical-blue: "#334b72"
  glass-cyan: "#c8d2cc"
  blueprint-green: "#b8b89a"
  success-background: "#e5ead2"
  success-foreground: "#12391f"
  danger-background: "#ead9d7"
  danger-foreground: "#64212c"
typography:
  display-lg:
    fontFamily: Archivo Narrow
    fontSize: 3rem
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: 0em
  display-md:
    fontFamily: Archivo Narrow
    fontSize: 2.25rem
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: 0em
  headline-md:
    fontFamily: Archivo Narrow
    fontSize: 1.5rem
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0em
  headline-sm:
    fontFamily: Archivo Narrow
    fontSize: 1.125rem
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0em
  label-caps:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.08em
  code-sm:
    fontFamily: Fira Code
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.25rem
  "2xl": 1.5rem
  "3xl": 2rem
  "4xl": 2.5rem
  "5xl": 3rem
  "6xl": 4rem
  page-x: 1.5rem
  page-y: 3rem
  section-gap: 4rem
  max-content: 72rem
  max-readable: 48rem
rounded:
  none: 0px
  sm: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  media-md: 1.25rem
  media-lg: 1.5rem
  media-xl: 2rem
  full: 9999px
components:
  page-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 1.5rem
  muted-panel:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 1.25rem
  subtle-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.subtle-foreground}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.none}"
    padding: 0.25rem
  inline-link:
    backgroundColor: "{colors.background}"
    textColor: "{colors.link}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 0px
  focus-indicator:
    backgroundColor: "{colors.ring}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 0.25rem
  accent-chip:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 0.75rem
  divider:
    backgroundColor: "{colors.border}"
    textColor: "{colors.on-secondary}"
    rounded: "{rounded.none}"
    height: 1px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 1rem
    height: 2.5rem
  button-primary-lg:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 1.25rem
    height: 2.75rem
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 1rem
    height: 2.5rem
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 1rem
    height: 2.5rem
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 1.5rem
  media-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.media-xl}"
    padding: 0.5rem
  technical-panel:
    backgroundColor: "{colors.navy-deep}"
    textColor: "{colors.dark-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.media-xl}"
    padding: 1.75rem
  dark-page-shell:
    backgroundColor: "{colors.dark-background}"
    textColor: "{colors.dark-foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 1.5rem
  dark-surface-panel:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-muted-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 1.5rem
  dark-muted-panel:
    backgroundColor: "{colors.dark-surface-muted}"
    textColor: "{colors.dark-subtle-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 1.25rem
  dark-link-reference:
    backgroundColor: "{colors.dark-background}"
    textColor: "{colors.dark-link}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 0px
  dark-divider:
    backgroundColor: "{colors.dark-border}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.none}"
    height: 1px
  technical-signal:
    backgroundColor: "{colors.technical-blue}"
    textColor: "{colors.dark-foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 0.75rem
  glass-signal:
    backgroundColor: "{colors.glass-cyan}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 0.75rem
  blueprint-signal:
    backgroundColor: "{colors.blueprint-green}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 0.75rem
  success-notice:
    backgroundColor: "{colors.success-background}"
    textColor: "{colors.success-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 1rem
  danger-notice:
    backgroundColor: "{colors.danger-background}"
    textColor: "{colors.danger-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 1rem
  form-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 0.75rem
    height: 2.5rem
---

# Edge Solutions Design System

## Overview

The visual direction is a cream-and-navy technical portfolio system. It combines poster-like display typography, sharp gridded panels, gold action accents, blueprint line work, translucent glass UI, and restrained isometric or mechanical 3D details.

Use `docs/ai_developer_landing_page.png` as the new visual direction and inspiration for how the website represents Edge Solutions visually. Treat it as guidance only: do not copy/paste images, schemas, or literal structures from the reference.

The mood is solid, engineered, and reassuring. It should feel distinctive and precise rather than generic, glossy, or overly futuristic.

## Colors

The palette is cream-first and navy-led. Deep navy carries type, borders, dividers, and dark bands. Warm gold is used for actions, accents, offset shadows, and marquee moments. Grey-green glass colors support translucent interface plates and technical illustrations.

- **Background (`#f2edd7`)**: warm cream page base.
- **Surface (`#f4eed6`)**: panels, cards, form fields, and structured blocks.
- **Surface muted (`#e7dfc4`)**: inset areas, hover states, and quieter panels.
- **Foreground (`#102b4a`)**: display type, body text, borders, labels, and links.
- **Primary (`#aa8e4b`)**: gold action fill, offset shadow, and marquee accent.
- **Secondary (`#102b4a`)**: dark navy actions, dark bands, and strong dividers.
- **Accent (`#c2a45b`)**: blueprint strokes, chips, isometric highlights, and mechanical details.
- **Glass colors**: `#c8d2cc` and nearby desaturated greens for translucent UI surfaces.

Avoid bright-blue SaaS palettes, neon AI gradients, and decorative purple surfaces. The accent system should stay warm, technical, and restrained.

## Typography

Use a condensed grotesque display face for the hero, section titles, card headings, and marquee text. `Archivo Narrow` is the preferred tokenized display family. If it is unavailable, use a strong sans-serif with tight line-height and heavy weight.

Use Inter for paragraph text, navigation, controls, and dense card copy. Use Fira Code only for code-like tokens, identifiers, telemetry, or technical snippets.

The type system is compressed and high-contrast. Large headings should stack tightly and feel like a poster or architectural label. Body text should remain compact but legible.

## Layout

Use a structured grid with visible alignment. The page should feel deliberately engineered:

- Split large hero title blocks across the top rather than centering a conventional hero.
- Use strong horizontal sections with cards aligned to a consistent grid.
- Use visible navy panel boundaries.
- Use gold offset shadows to give cards a physical, printed-object quality.
- Keep content blocks dense enough to feel technical, but leave enough breathing room for scanning.
- Place dark navy bands sparingly for strong identity moments, especially near the footer or a final callout.

Mobile should keep the same poster-like identity while stacking into a single column. Do not rely on tiny embedded image text for essential meaning.

## Elevation & Depth

Depth is graphic and mechanical, not soft SaaS elevation.

- Cards use navy outlines and a gold/right-bottom offset shadow.
- Interface mockups use translucent glass panels, muted grey-green fills, and subtle inner shadows.
- Technical illustrations use blueprint strokes, small schematic marks, and isometric block forms.
- Mechanical or crystalline 3D objects can appear as focal accents when they reinforce precision.

Avoid arbitrary glow, blur-only depth, decorative blobs, and heavy gradients.

## Shapes

The shape language is compact, precise, and lightly industrial:

- Buttons, nav items, and form fields use `rounded-md`.
- Cards and standard panels use `rounded-lg`.
- Glass interface modules and media frames can use moderate radii from `0.75rem` to `1.25rem`.
- Chips and small counters can use pill shapes.

Avoid oversized rounded containers for ordinary page sections.

## Components

**Buttons**

Primary buttons use gold fill, navy text, compact radius, medium label weight, and a dark outline or shadow. Secondary buttons use navy fill with cream text. Outline buttons use cream surfaces, navy text, and dark borders.

**Cards**

Cards use cream fill, navy borders, aligned internals, compact headings, blueprint-style iconography, and a gold offset shadow. They should feel like engineered physical panels, not soft floating cards.

**Media Panels**

Media panels may use glassmorphism, blueprint line art, schematic backgrounds, and isometric or mechanical 3D elements. Keep these elements restrained and structural.

**Forms**

Form fields use cream surfaces, navy borders, compact labels, and gold focus rings. Error and success states should stay direct and legible.

**Marquee Bands**

A dark navy band with large condensed gold type can act as a strong identity moment. Use it sparingly so it feels intentional.

## Do's and Don'ts

- Do use a cream page base, deep navy display type, visible grids, gold accents, blueprint line art, glass UI, and subtle 3D/isometric technical objects.
- Do keep headings compressed, bold, and aligned.
- Do use gold for action and physical offset, not as a broad background wash.
- Do make panels feel solid and deliberately placed.
- Do reserve dark navy bands for high-emphasis moments.
- Don't drift into generic bright-blue AI SaaS styling.
- Don't turn the system dark-first; the reference is cream-first with dark navy emphasis.
- Don't use decorative gradient blobs or unrelated glow effects.
- Don't make every visual element look like a dashboard screenshot.
