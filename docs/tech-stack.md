## Stack “Launch fast” (Vercel + Tailwind) — recommandation V1

> Objectif : **site vitrine performant + SEO**, contenu en **Markdown/MDX**, **mise en ligne rapide**, prêt pour **FR → EN → NL**.

### Framework / langage / structure projet

* **Next.js 16 (App Router)** + **React** + **TypeScript**

  * Next.js 16 est le **Active LTS** (bon choix pour un nouveau projet). ([Next.js][1])
  * Minimum Node recommandé côté tooling : **Node 18.17+**. ([Next.js][2])
* Structure simple :

  * `src/app/[locale]/...` (routes i18n)
  * `src/content/{locale}/...` (MDX par langue)
  * `src/components/` (UI)
  * `src/i18n/` (routing + messages UI)

---

## Librairies / technos nécessaires (par catégorie)

### UI & composants (accessibilité)

* **shadcn/ui** (générateur de composants) + **Radix UI** sous le capot (accessibilité) ([Shadcn][3])
* **lucide-react** (icônes) ([Next.js][4])
* (optionnel) **next-themes** si tu veux un dark mode propre ([Shadcn][5])

### Styling Tailwind (plugins, helpers)

* **Tailwind CSS v4** (stable) ([Tailwind CSS][6])

  * ⚠️ Tailwind v4 vise des navigateurs récents (sinon rester en v3.4). ([Tailwind CSS][7])
* Helpers indispensables avec shadcn :

  * `clsx` + `tailwind-merge` + `class-variance-authority` ([Shadcn][8])
* Animations utilitaires (si tu utilises des composants shadcn récents) :

  * `tw-animate-css` (remplace `tailwindcss-animate`) ([Shadcn][9])

### i18n (routes / dictionnaires / fallback)

* **next-intl** (App Router, routing i18n + messages UI) ([Next Intl][10])
* Stratégie “Launch fast” :

  * Routes préfixées : `/fr/...`, `/en/...`, `/nl/...`
  * **Fallback** : si une page MDX EN/NL n’existe pas, tu affiches la FR (logique simple côté loader)

### Gestion de contenu

* **MDX (Markdown + composants)** :

  * Setup officiel via `@next/mdx` + `@mdx-js/*` + `mdx-components.tsx` (requis App Router) ([Next.js][4])
* (recommandé) `remark-gfm` pour tables/strikethrough/task lists ([Next.js][4])

### SEO (metadata, sitemap, schema.org, OG images)

* **Metadata API Next.js** (title/description/canonical/OG/twitter) ([Next.js][11])
* **Sitemap natif App Router** via `app/sitemap.ts` (pas besoin de next-sitemap) ([Next.js][12])
* **robots.txt** via `app/robots.txt` (ou `robots.ts`) ([Next.js][13])
* **Schema.org JSON-LD** : recommandé via un `<script type="application/ld+json">` dans layout/page ([Next.js][14])
* OG images :

  * soit fichier statique `opengraph-image.(png|jpg)`
  * soit génération dynamique via convention Next ([Next.js][15])

### Formulaire & emailing (validation, anti-spam, provider)

* Form UI + validation :

  * **react-hook-form** + **zod** + **@hookform/resolvers** ([GitHub][16])
* Envoi email côté serveur (Vercel-friendly) :

  * **Resend** via **Server Actions** (`"use server"`) ([resend.com][17])
  * Intégration Vercel disponible (simple à brancher) ([Vercel][18])
* Anti-spam (optionnel mais recommandé) :

  * **hCaptcha** + vérif serveur (`siteverify`) ([docs.hcaptcha.com][19])
  * * un champ “honeypot” invisible (gratuit, très efficace)

> À ta question : “est-ce que Vercel peut envoyer un mail vers ma boîte perso ?”
> Oui, **via un provider email API** (ex: Resend). Éviter SMTP direct en V1 : plus fragile, plus de configs/risques de délivrabilité.

### Analytics & RGPD

* V1 ultra simple : **Vercel Web Analytics** (`@vercel/analytics`) ([Vercel][20])
* Alternative privacy-friendly : **Plausible** (cookieless, policy RGPD) ([Plausible Analytics][21])

  * (Tu peux commencer Vercel Analytics → migrer plus tard si besoin.)

### Performance (images, fonts, caching, edge, bundle)

* Images : `next/image`
* Polices : `next/font`
* Pages marketing : privilégier **static rendering** quand possible (par défaut très bon pour CWV)
* Sitemap/robots : routes dédiées **cachées par défaut** côté Next ([Next.js][12])

### Qualité (lint, format, tests)

* ESLint Next (`eslint-config-next`) + Prettier
* `prettier-plugin-tailwindcss` (tri automatique des classes)
* (optionnel V1) **Playwright** : 2 tests “smoke” (home + contact) avant merge

---

## Decision matrix (choix V1)

| Sujet       | Options                          | Avantages                                           | Inconvénients                                                | Coût       | Complexité | Reco V1         |
| ----------- | -------------------------------- | --------------------------------------------------- | ------------------------------------------------------------ | ---------- | ---------- | --------------- |
| UI kit      | shadcn/ui vs “tout à la main”    | shadcn = rapide + accessible ([Shadcn][22])         | un peu de setup                                              | €0         | Faible     | **shadcn/ui**   |
| i18n        | next-intl vs i18n “maison”       | routing + messages propres ([Next Intl][10])        | setup initial                                                | €0         | Moyen      | **next-intl**   |
| Contenu     | MDX local vs CMS                 | MDX = ultra simple & git-based ([Next.js][4])       | pas d’édition via UI                                         | €0         | Faible     | **MDX local**   |
| Formulaire  | mailto vs Formspree vs Resend    | Resend = pro + fiable sur Vercel ([resend.com][17]) | clé API + domaine à vérifier                                 | € / faible | Moyen      | **Resend**      |
| SEO sitemap | next-sitemap vs sitemap.ts natif | natif Next, moins de deps ([Next.js][12])           | un fichier à écrire                                          | €0         | Faible     | **Natif Next**  |
| Analytics   | Vercel vs Plausible              | Vercel = 2 min à activer ([Vercel][20])             | Plausible = plus “privacy-first” ([Plausible Analytics][21]) | € / €€     | Faible     | **Vercel (V1)** |

---

## Recommandation finale (stack choisie) — en 10 lignes

Je recommande **Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui + MDX local + next-intl**.
Tu auras un site **rapide à livrer**, **SEO-friendly** (Metadata API + sitemap/robots natifs), maintenable et facile à faire évoluer. ([Next.js][11])
Le contenu “services” en **MDX** te permet d’écrire vite, avec la possibilité d’insérer des composants (CTA, callouts, badges). ([Next.js][4])
Pour la conversion : formulaire avec **react-hook-form + zod** et envoi via **Resend** (Server Actions) pour que ça arrive directement dans ta boîte mail. ([resend.com][17])
Pour la V1 : analytics via **Vercel Web Analytics** (simple, propre). ([Vercel][20])

---

## Plan d’implémentation (10 étapes : 0 → prod)

1. **Créer le projet** Next.js 16 + TS, repo GitHub, déploiement Vercel (preview auto). ([Vercel][23])
2. Installer **Tailwind v4** + config de base + `prettier-plugin-tailwindcss`. ([Tailwind CSS][6])
3. Initialiser **shadcn/ui** et ajouter 6–8 composants utiles (Button, Card, Badge, Accordion, Tabs, Input, Textarea). ([Shadcn][3])
4. Mettre en place **next-intl** : locales `fr/en/nl`, routes `[locale]`, messages UI (nav, footer, labels). ([Next Intl][10])
5. Activer **MDX** (`@next/mdx`) + `mdx-components.tsx` + `remark-gfm`. ([Next.js][4])
6. Créer les pages “service” en MDX (FR) : `/web-dev`, `/realtime-games` + composants MDX (CTA, sections).
7. SEO : `metadata` global + par page, OG image, `sitemap.ts`, `robots.txt`, JSON-LD “Organization + Services”. ([Next.js][11])
8. Formulaire : UI + validation zod + Server Action `sendContactEmail()` via **Resend**. ([resend.com][17])
9. Analytics : activer **@vercel/analytics**. ([Vercel][20])
10. Déploiement prod : domaine, env vars, tests “smoke”, monitoring des erreurs.

---

## Listing npm (V1)

### Dependencies

* `next`, `react`, `react-dom`
* `next-intl`
* `lucide-react`
* `clsx`, `tailwind-merge`, `class-variance-authority`
* `tw-animate-css` (si utilisé par tes composants shadcn) ([Shadcn][9])
* `react-hook-form`, `zod`, `@hookform/resolvers`
* `resend` ([resend.com][17])
* `@vercel/analytics` ([Vercel][20])
* (optionnel) `next-themes` (dark mode) ([Shadcn][5])

### DevDependencies

* `typescript`, `@types/node`, `@types/react`, `@types/react-dom`
* `tailwindcss`, `postcss`, `autoprefixer`
* `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss`
* `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx` ([Next.js][4])
* `remark-gfm`
* (optionnel) `@playwright/test`

---

### Checklist “V1 prête à publier”

* [ ] 2 pages services claires + CTA contact
* [ ] Formulaire fonctionnel (Resend) + anti-spam minimal
* [ ] Metadata + OG + sitemap + robots + JSON-LD
* [ ] i18n prêt (FR complet, EN/NL fallback)
* [ ] Analytics activé
* [ ] Lighthouse / CWV OK sur home + services

Si tu veux, je peux te proposer ensuite une **arborescence de repo** (dossiers + conventions de nommage MDX + loader i18n) prête à copier-coller, adaptée exactement à tes 2 services.

[1]: https://nextjs.org/support-policy?utm_source=chatgpt.com "Support Policy"
[2]: https://nextjs.org/docs/app/guides/migrating/app-router-migration?utm_source=chatgpt.com "Migrating: App Router"
[3]: https://ui.shadcn.com/docs/installation/next?utm_source=chatgpt.com "Next.js - Shadcn UI"
[4]: https://nextjs.org/docs/14/app/building-your-application/configuring/mdx "Configuring: MDX | Next.js"
[5]: https://ui.shadcn.com/docs/dark-mode/next?utm_source=chatgpt.com "Next.js - Shadcn UI"
[6]: https://tailwindcss.com/blog/tailwindcss-v4?utm_source=chatgpt.com "Tailwind CSS v4.0"
[7]: https://tailwindcss.com/docs/upgrade-guide?utm_source=chatgpt.com "Upgrade guide - Getting started"
[8]: https://ui.shadcn.com/docs/installation/manual?utm_source=chatgpt.com "Manual Installation - Shadcn UI"
[9]: https://ui.shadcn.com/docs/tailwind-v4?utm_source=chatgpt.com "Tailwind v4 - Shadcn UI"
[10]: https://next-intl.dev/docs/getting-started/app-router?utm_source=chatgpt.com "App Router - Internationalization (i18n) for Next.js"
[11]: https://nextjs.org/docs/app/getting-started/metadata-and-og-images?utm_source=chatgpt.com "Getting Started: Metadata and OG images"
[12]: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap?utm_source=chatgpt.com "Metadata Files: sitemap.xml"
[13]: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots?utm_source=chatgpt.com "robots.txt - Metadata Files"
[14]: https://nextjs.org/docs/app/guides/json-ld?utm_source=chatgpt.com "Guides: JSON-LD"
[15]: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image?utm_source=chatgpt.com "opengraph-image and twitter-image - Metadata Files"
[16]: https://github.com/react-hook-form/resolvers?utm_source=chatgpt.com "react-hook-form/resolvers"
[17]: https://resend.com/nextjs?utm_source=chatgpt.com "Send emails with Next.js"
[18]: https://vercel.com/integrations/resend?utm_source=chatgpt.com "Resend for Vercel"
[19]: https://docs.hcaptcha.com/?utm_source=chatgpt.com "Developer Guide | hCaptcha"
[20]: https://vercel.com/docs/analytics/quickstart?utm_source=chatgpt.com "Getting started with Vercel Web Analytics"
[21]: https://plausible.io/data-policy?utm_source=chatgpt.com "Plausible: GDPR, CCPA and cookie law compliant site ..."
[22]: https://ui.shadcn.com/docs/installation?utm_source=chatgpt.com "Installation - Shadcn UI"
[23]: https://vercel.com/docs/frameworks/full-stack/nextjs?utm_source=chatgpt.com "Next.js on Vercel"
