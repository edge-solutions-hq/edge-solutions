Voici une **arborescence de repo (Next.js App Router + Vercel + Tailwind + next-intl + MDX)** pensée pour **ship vite**, garder le **contenu en Markdown/MDX**, et être **prête pour FR → EN → NL**.

> Notes “fraîches” (important) : avec **Next.js 16**, `middleware.ts` est **déprécié** au profit de **`proxy.ts`**. ([Next.js][1])

---

## 1) Arborescence recommandée (V1 “launch fast”)

```txt
.
├─ messages/
│  ├─ fr.json
│  ├─ en.json
│  └─ nl.json
├─ src/
│  ├─ app/
│  │  └─ [locale]/
│  │     ├─ layout.tsx
│  │     ├─ page.tsx
│  │     ├─ services/
│  │     │  └─ [slug]/
│  │     │     └─ page.tsx
│  │     ├─ contact/
│  │     │  └─ page.tsx
│  │     └─ not-found.tsx
│  ├─ content/
│  │  ├─ fr/
│  │  │  └─ services/
│  │  │     ├─ web-dev.mdx
│  │  │     └─ realtime-games.mdx
│  │  ├─ en/
│  │  │  └─ services/
│  │  │     ├─ web-dev.mdx
│  │  │     └─ realtime-games.mdx
│  │  └─ nl/
│  │     └─ services/
│  │        ├─ web-dev.mdx
│  │        └─ realtime-games.mdx
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ Header.tsx
│  │  │  └─ Footer.tsx
│  │  └─ mdx/
│  │     ├─ CTA.tsx
│  │     └─ Callout.tsx
│  ├─ i18n/
│  │  ├─ routing.ts
│  │  ├─ navigation.ts
│  │  └─ request.ts
│  ├─ lib/
│  │  └─ content/
│  │     └─ services.ts
│  └─ styles/
│     └─ globals.css
├─ src/proxy.ts
├─ src/mdx-components.tsx
├─ next.config.ts
└─ tailwind.config.ts
```

---

## 2) Conventions (pour rester clean + scalable)

### Slugs

* Slugs stables (pas traduits) : `web-dev`, `realtime-games`
* Contenu traduisible par locale : `src/content/{locale}/services/{slug}.mdx`

### MDX “page data”

Dans chaque `.mdx`, on exporte un `metadata` simple (SEO) + le contenu :

* `export const metadata = { title, description }`
* Le body en Markdown/MDX
* Composants MDX (CTA/Callout) utilisables directement via `mdx-components.tsx` (pas besoin d’imports dans chaque mdx)

### i18n

* `next-intl` gère le routing `[locale]` + chargement des messages JSON ([Next Intl][2])
* FR d’abord : `defaultLocale: 'fr'`

---

## 3) Fichiers clés (copier-coller)

### `next.config.ts` (next-intl + MDX)

```ts
import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';
import type {NextConfig} from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withMDX = createMDX({
  extension: /\.mdx?$/
});

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true
};

export default withNextIntl(withMDX(nextConfig));
```

> `mdx-components.tsx` est **requis** avec `@next/mdx` sur App Router. ([Next.js][3])

---

### `src/mdx-components.tsx` (tag styles + composants “globaux”)

```tsx
import type {MDXComponents} from 'mdx/types';
import {CTA} from '@/components/mdx/CTA';
import {Callout} from '@/components/mdx/Callout';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    // Custom components available in MDX without imports
    CTA,
    Callout,

    // Optional: tighten default rendering
    h1: (props) => <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight" {...props} />,
    h2: (props) => <h2 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight" {...props} />,
    a: (props) => <a className="underline underline-offset-4" {...props} />
  };
}
```

---

### `src/proxy.ts` (Next.js 16) — i18n routing

```ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
```

([Next Intl][2])

---

### `src/i18n/routing.ts`

```ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'nl'],
  defaultLocale: 'fr',
  // V1 simple: URLs toujours préfixées /fr, /en, /nl
  localePrefix: 'always'
});
```

([Next Intl][2])

---

### `src/i18n/navigation.ts`

```ts
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
```

([Next Intl][4])

---

### `src/i18n/request.ts` (charge messages JSON)

```ts
import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

([Next Intl][2])

---

### `src/app/[locale]/layout.tsx` (root layout + static rendering)

```tsx
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import '@/styles/globals.css';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  // Enable static rendering with next-intl
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

`setRequestLocale` + `generateStaticParams` sont la voie “safe” pour garder le statique/SEO. ([Next Intl][2])

---

## 4) Loader MDX des services (fallback FR si manquant)

### `src/lib/content/services.ts`

```ts
export type Locale = 'fr' | 'en' | 'nl';
export type ServiceSlug = 'web-dev' | 'realtime-games';

export const SERVICE_SLUGS: ServiceSlug[] = ['web-dev', 'realtime-games'];

const loaders = {
  fr: {
    'web-dev': () => import('@/content/fr/services/web-dev.mdx'),
    'realtime-games': () => import('@/content/fr/services/realtime-games.mdx')
  },
  en: {
    'web-dev': () => import('@/content/en/services/web-dev.mdx'),
    'realtime-games': () => import('@/content/en/services/realtime-games.mdx')
  },
  nl: {
    'web-dev': () => import('@/content/nl/services/web-dev.mdx'),
    'realtime-games': () => import('@/content/nl/services/realtime-games.mdx')
  }
} as const;

export async function getServiceMdx(locale: string, slug: string) {
  const safeLocale: Locale = (['fr', 'en', 'nl'].includes(locale) ? locale : 'fr') as Locale;

  if (!SERVICE_SLUGS.includes(slug as ServiceSlug)) return null;

  const typedSlug = slug as ServiceSlug;

  const mod =
    (await loaders[safeLocale][typedSlug]().catch(() => null)) ??
    (await loaders.fr[typedSlug]());

  return mod; // { default: Component, metadata?: {...} }
}
```

---

### `src/app/[locale]/services/[slug]/page.tsx` (render MDX + metadata)

```tsx
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';
import {getServiceMdx, SERVICE_SLUGS} from '@/lib/content/services';

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SERVICE_SLUGS.map((slug) => ({locale, slug}))
  );
}

export async function generateMetadata({params}: Props) {
  const {locale, slug} = await params;
  const mdx = await getServiceMdx(locale, slug);
  if (!mdx?.metadata) return {};
  return mdx.metadata;
}

export default async function ServicePage({params}: Props) {
  const {locale, slug} = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const mdx = await getServiceMdx(locale, slug);
  if (!mdx) notFound();

  const Content = mdx.default;

  return (
    <article className="prose prose-neutral max-w-none">
      <Content />
    </article>
  );
}
```

---

## 5) Exemple de contenu MDX (FR)

### `src/content/fr/services/web-dev.mdx`

```mdx
export const metadata = {
  title: "Développement web — sites & apps performantes",
  description: "Next.js, Laravel, WordPress : conception, développement, optimisation SEO/Core Web Vitals."
};

# Développement web

<Callout>
  Je conçois et développe des sites vitrine et apps web rapides, maintenables et orientés conversion.
</Callout>

## Ce que je peux livrer
- Site vitrine (Next.js / Vercel) avec SEO & Core Web Vitals
- Landing pages orientées conversion
- Intégrations CMS (WordPress) si besoin
- Back-office / API (Laravel) si le projet le demande

<CTA title="Parlons de votre projet" href="/contact">
  Décrivez votre besoin (budget, timing, contraintes) et je reviens vers vous rapidement.
</CTA>
```

---

## 6) Petit set de composants MDX (CTA / Callout)

### `src/components/mdx/Callout.tsx`

```tsx
export function Callout({children}: {children: React.ReactNode}) {
  return (
    <div className="not-prose rounded-2xl border p-5">
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
```

### `src/components/mdx/CTA.tsx`

```tsx
import {Link} from '@/i18n/navigation';

export function CTA({
  title,
  href,
  children
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="not-prose mt-8 rounded-2xl border p-6">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-2 text-sm opacity-80">{children}</div>
      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium"
        >
          Me contacter
        </Link>
      </div>
    </div>
  );
}
```

---

## 7) Packages npm (minimum utile pour cette structure)

```bash
npm i next-intl @next/mdx
npm i -D @types/mdx
# Tailwind (si pas déjà installé via create-next-app)
npm i -D tailwindcss postcss autoprefixer
# Optionnel mais recommandé (typo “prose”)
npm i -D @tailwindcss/typography
```

---

## 8) Variante “encore plus simple” (si tu veux zéro loader)

Tu peux mettre les pages directement en MDX :

```txt
src/app/[locale]/services/web-dev/page.mdx
src/app/[locale]/services/realtime-games/page.mdx
```

➡️ Avantage : moins de code.
➡️ Inconvénient : duplication de structure si tu veux une page template unique / metadata homogène.

---

Si tu veux, je peux maintenant te donner une **base de `messages/fr.json`** + un **Header/Footer minimal** (avec switch de langue via `Link locale="en"` etc.), cohérent avec tes inspirations (spatie/tailwindcss/whitecube/dogstudio).

[1]: https://nextjs.org/docs/app/api-reference/file-conventions/proxy "File-system conventions: proxy.js | Next.js"
[2]: https://next-intl.dev/docs/routing/setup "Setup locale-based routing – Internationalization (i18n) for Next.js"
[3]: https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components?utm_source=chatgpt.com "File-system conventions: mdx-components.js"
[4]: https://next-intl.dev/docs/routing/navigation "Navigation APIs – Internationalization (i18n) for Next.js"
