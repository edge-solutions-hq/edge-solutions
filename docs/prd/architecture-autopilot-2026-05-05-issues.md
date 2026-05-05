# Issue Manifest: Architecture Autopilot 2026-05-05

GitHub issue publication is blocked because the available token cannot create issues. This manifest is the local source of truth for the implementation slices from `docs/prd/architecture-autopilot-2026-05-05.md`.

## AA-2026-05-05-01: Move Global Site Metadata And Organization Schema Behind A Profile Seam

Type: AFK
Category: enhancement
State: ready-for-agent
Blocked by: None - can start immediately
Parent: `docs/prd/architecture-autopilot-2026-05-05.md`

### What to build

Root layout metadata and organization schema should be obtained through a global site profile seam instead of being assembled inline or from static parallel offer facts.

### Acceptance criteria

- [ ] Layout-level localized metadata comes from a profile interface rather than inline localized description maps.
- [ ] Organization schema service facts follow the offer-track catalog and preserve AI-first ordering.
- [ ] Existing title, description, canonical, alternate, Open Graph, Twitter, and organization JSON-LD output remains equivalent unless deliberately normalized.
- [ ] Tests cover the global profile/schema behavior and ownership rule.

### Agent Brief

**Category:** enhancement
**Summary:** Move root site metadata and organization schema projection behind a global profile seam.

**Current behavior:** Root layout metadata owns localized description copy directly, and organization schema owns a static list of service types separate from the offer catalog.

**Desired behavior:** A global site profile interface should provide layout metadata and organization schema data. The organization service list should derive from the offer-track catalog or a canonical projection of it.

**Key interfaces:**
- Global site profile function — returns localized metadata inputs and organization schema data.
- Organization schema projection — should derive offer/service facts from the offer catalog rather than a static parallel list.

**Out of scope:**
- Public URL changes.
- Visual layout changes.
- New business positioning copy.

## AA-2026-05-05-02: Derive Live SEO Smoke URLs From Route/Profile Facts

Type: AFK
Category: enhancement
State: ready-for-agent
Blocked by: None - can start immediately
Parent: `docs/prd/architecture-autopilot-2026-05-05.md`

### What to build

The live SEO smoke check should validate every localized public URL derived from routing, static page definitions, and offer-track service pages instead of checking a hard-coded subset.

### Acceptance criteria

- [ ] Live SEO smoke derives site URL, locales, hreflang values, static page suffixes, and service slugs from source facts.
- [ ] Live SEO smoke covers localized home, services hub, contact, and service-detail URLs.
- [ ] Network fetching remains isolated from route-fact derivation.
- [ ] Tests or architecture checks protect the route-fact extraction interface.

### Agent Brief

**Category:** enhancement
**Summary:** Make live SEO smoke derive expected production URLs from the same route/profile facts as sitemap checks.

**Current behavior:** Live SEO smoke hard-codes site URL, locales, hreflang values, and only checks home/services hub paths.

**Desired behavior:** Live SEO smoke should compute all localized public URLs from source route/profile facts and validate each returned page for indexability, canonical, hreflang, title, description, and JSON-LD.

**Key interfaces:**
- SEO source-facts helper — returns site URL, locales, hreflang mapping, static suffixes, service slugs, expected paths, and expected URLs.
- Live SEO check — consumes those facts and performs network/HTML assertions.

**Out of scope:**
- Replacing the live smoke command with Playwright.
- Running live production checks inside the default local check command.

## AA-2026-05-05-03: Share Browser Analytics Context Across Page Views And Conversion Events

Type: AFK
Category: enhancement
State: ready-for-agent
Blocked by: None - can start immediately
Parent: `docs/prd/architecture-autopilot-2026-05-05.md`

### What to build

GA page-view tracking and conversion-event tracking should share one browser analytics context for locale, page path, page location, page title, and referrer defaults.

### Acceptance criteria

- [ ] GA page-view tracking and conversion event tracking use the same browser context interface.
- [ ] Existing event names and payload parameter names remain stable.
- [ ] Locale resolution behavior remains compatible with `html[lang]` and localized path fallback.
- [ ] Pure tests cover browser-context behavior without requiring a real browser.

### Agent Brief

**Category:** enhancement
**Summary:** Concentrate browser analytics page context in one testable interface.

**Current behavior:** Conversion events and GA page-view tracking each resolve locale and page defaults separately.

**Desired behavior:** A browser analytics context interface should provide consistent page path, location, title, referrer, and site locale data to both conversion events and page-view tracking.

**Key interfaces:**
- Browser analytics context function — accepts or reads browser-like state and returns stable analytics defaults.
- Conversion event tracking — merges event-specific payloads with shared context.
- GA page-view tracking — uses shared context for page-view config.

**Out of scope:**
- New analytics event names.
- GTM/GA4 dashboard configuration changes.

## AA-2026-05-05-04: Centralize Header Navigation Tracking And Active-State Policy

Type: AFK
Category: enhancement
State: ready-for-agent
Blocked by: None - can start immediately
Parent: `docs/prd/architecture-autopilot-2026-05-05.md`

### What to build

Header navigation item models should carry tracking intent and active-state policy so desktop and mobile renderers no longer hard-code contact CTA tracking checks.

### Acceptance criteria

- [ ] Header navigation items are built from a shared navigation model.
- [ ] Active-state matching is owned by the navigation policy/model seam.
- [ ] Contact navigation tracking target and eligibility are derived from item metadata, not hard-coded renderer checks.
- [ ] Desktop and mobile navigation preserve current visible behavior and event placements.
- [ ] Tests cover active matching and contact tracking payload derivation.

### Agent Brief

**Category:** enhancement
**Summary:** Move header navigation tracking intent and active-state rules into a shared navigation model.

**Current behavior:** Desktop and mobile navigation renderers check for the contact href and assemble contact tracking payloads themselves.

**Desired behavior:** Navigation renderers should consume shared item metadata and policy helpers for active matching and contact tracking intent, while keeping surface-specific placement names.

**Key interfaces:**
- Header navigation item model — includes href, label, and optional tracking intent.
- Active-state matcher — determines whether an item is active for a pathname.
- Navigation tracking payload helper — returns contact tracking data when an item should be tracked.

**Out of scope:**
- Header redesign.
- Mobile menu redesign.
- New navigation destinations.

## AA-2026-05-05-05: Add A Service Page Model For Route, Content, Profile, And Tracking Decisions

Type: AFK
Category: enhancement
State: ready-for-agent
Blocked by: None - can start immediately
Parent: `docs/prd/architecture-autopilot-2026-05-05.md`

### What to build

Service detail routes should use a service-page model that owns static params, valid route handling, localized content resolution, metadata/profile construction, and scroll-tracking identity.

### Acceptance criteria

- [ ] Service static params are exposed through a service-page route/model interface.
- [ ] Invalid locale and invalid slug behavior is explicit at the service-page seam.
- [ ] Service-page metadata/profile creation happens behind the model seam rather than in the route Adapter.
- [ ] Service route rendering remains visually unchanged.
- [ ] Tests cover static params and route/model behavior without overfitting MDX source shape.

### Agent Brief

**Category:** enhancement
**Summary:** Make service detail routes consume a service-page model instead of orchestrating content/profile/tracking decisions inline.

**Current behavior:** The service detail route builds static params, checks locale validity, loads content, creates metadata/profile data, and wires scroll tracking directly.

**Desired behavior:** A service-page model interface should own those decisions and return the data needed by the route Adapter to render or 404.

**Key interfaces:**
- Service static params function — returns localized service route params from locale routing and offer slugs.
- Service page model function — returns content, metadata/profile data, and tracking identity, or a not-found result.
- Service metadata function — returns metadata for a valid service route.

**Out of scope:**
- MDX replacement.
- Service slug or URL localization.
- Visual service page redesign.

## AA-2026-05-05-06: Move Contact Field And Feedback Facts Into A Contact Form Model

Type: AFK
Category: enhancement
State: ready-for-agent
Blocked by: None - can start immediately
Parent: `docs/prd/architecture-autopilot-2026-05-05.md`

### What to build

The contact form Adapter should render field and feedback facts from the contact Module instead of owning field names, message keys, defaults, validation hints, and submit service extraction inline.

### Acceptance criteria

- [ ] Contact field definitions, message keys, defaults, validation hints, and offer options are exposed through a contact form model.
- [ ] Contact submit analytics service extraction uses a contact Module helper.
- [ ] Feedback message key resolution is centralized behind the contact Module.
- [ ] Honeypot and spam behavior remain unchanged.
- [ ] Tests cover the contact form model behavior and the form Adapter ownership rule.

### Agent Brief

**Category:** enhancement
**Summary:** Move contact form field definitions and feedback mapping into a contact form model.

**Current behavior:** The contact form Adapter owns field names, message keys, defaults, validation hints, submit service extraction, and feedback message selection.

**Desired behavior:** The contact Module should expose a form model and helpers that the form Adapter renders and wires. Server validation, UI fields, and analytics submit service extraction should share the same facts.

**Key interfaces:**
- Contact form model — exposes field definitions, offer options, default values, validation hints, and message keys.
- Submit service helper — extracts the analytics service value from submitted form data.
- Feedback message helper — resolves the localized message key or fallback message for an action state.

**Out of scope:**
- Contact delivery changes.
- New contact fields.
- New spam provider or captcha integration.
