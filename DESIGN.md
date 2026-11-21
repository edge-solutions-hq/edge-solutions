---
version: beta
name: Edge Solutions
description: Warm dark terminal / editor design system for edge-solutions.be. The terminal is a frame, plain-language copy is the message.
colors:
  background: "#14110e"
  foreground: "#ede6d8"
  heading: "#f8f2e6"
  surface: "#1b1814"
  surface-muted: "#26221c"
  border: "#3d362d"
  border-strong: "#7a6f5d"
  muted-foreground: "#c2b8a6"
  subtle-foreground: "#a0957f"
  primary: "#f0a85a"
  primary-foreground: "#1b1206"
  accent: "#ffc686"
  secondary: "#0d0b09"
  secondary-foreground: "#ede6d8"
  syn-green: "#a8cc7c"
  syn-cyan: "#7fd0c0"
  syn-purple: "#cbaae2"
  syn-red: "#f39581"
  syn-blue: "#93bce4"
typography:
  display: "JetBrains Mono, bold / extrabold, tight tracking, headings and UI chrome"
  body: "IBM Plex Sans, readable paragraphs and form values"
  mono: "JetBrains Mono for prompts, labels, buttons, navigation, paths"
shapes:
  controls: "rounded-md (6px)"
  panels: "rounded-md, 1px borders, no offset shadows"
  media: "rounded-md inside a window frame"
---

# Edge Solutions Design System

## Direction

The site looks like a well-kept code editor and terminal: a warm near-black theme, monospace headings, window chrome, prompt lines, and syntax-highlight accents. It says "a developer built this" before any copy is read.

It is still a freelance site for buyers who may not be technical. The rule that governs every decision: **the terminal is a frame, not the message**. Every heading, paragraph, label and button is plain language. Commands such as `$ whoami` or `$ ls ./services` are small, dim, decorative (`aria-hidden`) lines that sit above a normal heading. Nothing a visitor needs is ever written as code.

## Core Rules

- Copy first. If a terminal detail makes a sentence harder to read, remove the detail.
- One prompt line per section at most, always above a real heading. Never replace a heading with a command.
- Body copy is set in the sans (IBM Plex Sans). Mono is for headings, short labels, buttons, navigation, paths and numbers.
- The site is dark-first and does not switch to a light theme. `color-scheme: dark` is set globally.
- Amber is the only action colour. Syntax colours label and categorise, they never mark a call to action.
- AI automation and 3D / XR always get the same card size and structure. AI comes first; AI is green, 3D / XR is cyan.
- No fake terminal output: no invented logs, metrics, client names, uptime, or version numbers. Decorative paths must be real routes (`./services/ai-automation`) or neutral file names (`profile.yml`, `process.md`).

## Color Use

- `background #14110e`: page base, with a faint dot grid and one soft amber glow at the top right.
- `surface #1b1814`: windows, cards, forms. `surface-muted #26221c`: hover and active rows.
- `secondary #0d0b09`: "terminal black" for the header, footer, title bars, status lines and media wells.
- `border #3d362d`: structural 1px lines. `border-strong #7a6f5d`: form fields and outline buttons, where the edge must be clearly visible.
- `foreground #ede6d8` / `heading #f8f2e6`: text and headings. `muted-foreground #c2b8a6`: paragraphs. `subtle-foreground #a0957f`: prompts, line numbers, placeholders. All pass WCAG AA on `background`, `surface` and `surface-muted`.
- `primary #f0a85a` (amber): primary buttons, prompt sigil `$`, caret, active tab marker, step numbers. `accent #ffc686`: hover and text links that act as CTAs.
- Syntax accents: `syn-green` for `//` comment-style eyebrows, results and the AI family; `syn-cyan` for keys/labels and the 3D / XR family; `syn-purple` for process kickers; `syn-red` for errors; `syn-blue` only in the 3D axis drawing.

Do not put text at reduced opacity on dark surfaces; pick a token instead so contrast stays predictable.

## Typography

`JetBrains Mono` (400/500/700/800) is the display and UI face. Headings use bold or extrabold with `tracking-tight` and a line-height around 1.12 to 1.15. Sizes are fixed per breakpoint, never fluid with viewport width. The hero H1 tops out near 2.85rem because mono is wide.

`IBM Plex Sans` (400 to 700) carries paragraphs, descriptions, form values and long labels at 14 to 18px with relaxed leading.

Eyebrows are written as code comments: `// Méthode` in mono, `syn-green`, sentence case. Do not use uppercase tracking-wide eyebrows.

## Layout

- Max content width `max-w-6xl`, aligned with the header and footer.
- Homepage flow: terminal hero, services (two equal cards), profile (`profile.yml` key/value pane), public project, process (`process.md` numbered pane), final contact window.
- The hero is one terminal window: title bar, `$ whoami` typed line, the plain-language intro as its "output", the H1, tagline, two buttons, and a tmux-like status line. On large screens a right column shows two equal split panes with abstract diagrams, one per project family. They are synthetic, decorative and hidden from assistive tech.
- Sections are separated by generous vertical space rather than boxes. Use a window (title bar + border) only for a module that benefits from being read as one object: hero, profile, process, contact, media.
- Avoid nested windows. Inside a window use `inset` surfaces or dividers.
- Mobile is single column in the same order; the split panes are dropped, buttons go full width.

## Patterns And Decoration

- **Logo mark** (`LogoMark`, Hex Edge): a cube seen corner-on, drawn as a hexagon, with one edge from the near vertex at the centre to the upper-right corner. It strokes in `currentColor`, so it takes the surrounding text colour.
- **Window chrome** (`WindowChrome`): 40px title bar, three dots, mono title. Decorative by default.
- **Prompt line** (`PromptLine`): amber `$` plus a dim command. Optional CSS-only typing (`.typed`, width animated in `ch` with `steps()`) and a blinking block caret. The full text is always in the DOM; `prefers-reduced-motion` disables both animations. Use the typed variant once per page, at the top.
- **Gutters**: line numbers or `01 / 02 / 03` step numbers in a darker left column.
- **Status line**: small mono strip with one amber chip, used in the hero and at the bottom of the footer.
- **Editor tabs**: desktop navigation items are tabs; the current page has a 2px amber top marker.
- **Command palette**: `Ctrl K` (or the header chip on wide screens) opens a quick navigation dialog that only re-lists the header navigation plus services index and privacy policy.

Avoid: matrix-green on black, scanlines, CRT glow, ASCII art, glitch effects, fake boot sequences, more than one animated element in view.

## Components

**Buttons**

Mono, bold, 6px radius, no shadow. Primary: amber fill, dark text, lighter amber on hover. Outline: transparent with `border-strong`, amber border on hover. Secondary: terminal black with `border-strong`. Never put glyphs or pseudo-element text inside a button: the visible text is also the tracked label and the accessible name.

External links that behave like CTAs use `web/src/components/ui/ExternalLinkButton.tsx`: amber-tinted fill, amber border, `accent` text and the inline SVG external-link icon. Do not use unicode arrow glyphs for external links.

**Surfaces**

Use the shared vocabulary in `web/src/components/ui/Surface.tsx`. All variants are 1px bordered, 6px radius, flat:

- `card`: default repeated item.
- `interactive-card`: clickable service or project card; border turns amber on hover.
- `panel`: grouped content such as the profile or process pane.
- `feature`: higher-emphasis window (hero, contact, showcase) with one soft, dark drop shadow.
- `inset`: inner detail area on the page background colour.
- `media`: terminal-black frame around an image.

Do not add offset or coloured shadows. Depth comes from borders and the three background levels.

**Forms**

Fields sit on `background` inside a `surface` window, with `border-strong`, an amber focus border and ring. Labels are mono, bold, `syn-cyan`. Errors use `syn-red`, success uses `syn-green`, both as tinted bordered blocks with direct wording.

Contact CTAs open a modal on the current page. The modal is a window: title bar with dots and the real title, clear close button, the same form, no extra marketing copy. On small screens it is a full-screen sheet. The `/contact` page stays available as the fallback.

**Header and footer**

The header is a 56px terminal-black bar: `>_` mark and name, tab navigation (from `lg`), quick-navigation chip (from `xl`), locale switch, primary CTA. Below `lg` the navigation moves into the menu window. The footer is terminal black with `//` column headings and a closing status line carrying the copyright and VAT number.

**Images**

Screenshots and diagrams keep their own colours and are always framed (window dots or a `media` surface) so light assets read as a window on the dark page.

## Accessibility

- Text contrast is AA or better on every surface level; decorative prompts also meet AA.
- Focus is a 2px amber ring on every interactive element.
- Prompts, dots, gutters and diagrams are `aria-hidden`. Headings stay semantic (`h1` to `h3`) and in order.
- All motion (typing, caret, dashed flow lines, hover shifts) stops under `prefers-reduced-motion`.

## Copy Fit

Visual design must support the copywriting direction in `docs/positioning.md`: direct, freelance, simple, and grounded.

If a section needs a command to be understood, the copy is wrong. If a terminal detail repeats or competes with a point made in plain language, remove the detail.
