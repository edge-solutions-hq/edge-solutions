import type {Metadata} from 'next';
import {OFFER_TRACKS, type OfferTrackSlug} from './offer-tracks';
import {
  breadcrumbSchema,
  buildAbsoluteLocaleAlternates,
  buildLocalizedPageMetadata,
  serviceSchema,
  servicesItemListSchema,
  webPageSchema,
  websiteSchema,
} from './seo';
import {site} from './site';

type LocalizedCopy = Record<string, string>;
type Translate = (key: string) => string;

type StaticPageId = 'home' | 'services' | 'contact';

type StaticPageDefinition = {
  id: StaticPageId;
  pathSuffix: '' | '/services' | '/contact';
  lastModified: Date;
  sitemapPriority: number;
  title: LocalizedCopy;
  description: LocalizedCopy;
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

type OfferTrackListItem = {
  slug: OfferTrackSlug;
  name: string;
  description: string;
};

type PageProfile = {
  title: string;
  description: string;
  pathSuffix: string;
  lastModified?: Date;
  sitemapPriority?: number;
  metadata: Metadata;
  jsonLd: unknown[];
};

export const STATIC_PAGE_DEFINITIONS: readonly StaticPageDefinition[] = [
  {
    id: 'home',
    pathSuffix: '',
    lastModified: new Date('2026-04-24T10:10:11.000Z'),
    sitemapPriority: 0.7,
    title: {
      fr: 'Systèmes IA pragmatiques et delivery fiable pour équipes wallonnes',
      en: 'Pragmatic AI systems and delivery hardening for Belgian teams',
      nl: 'Pragmatische AI-systemen en betrouwbare delivery voor Belgische teams',
    },
    description: {
      fr: 'Edge Solutions aide les équipes à rendre leurs usages IA réellement exploitables, avec revue humaine, garde-fous, intégration web et exécution temps réel quand le produit le demande.',
      en: 'Edge Solutions helps teams turn AI usage into something truly usable, with human review, guardrails, web integration and real-time execution when the product needs it.',
      nl: 'Edge Solutions helpt teams om AI-gebruik echt bruikbaar te maken, met menselijke review, guardrails, webintegratie en realtime uitvoering wanneer het product dat vraagt.',
    },
  },
  {
    id: 'services',
    pathSuffix: '/services',
    lastModified: new Date('2026-04-27T13:06:04.000Z'),
    sitemapPriority: 0.7,
    title: {
      fr: 'Services IA-first, web et 3D/VR pour équipes en Wallonie',
      en: 'AI-first services with web and 3D/VR execution in Belgium',
      nl: 'AI-first diensten met web- en 3D/VR-uitvoering in België',
    },
    description: {
      fr: 'Services Edge Solutions : systèmes IA, automatisation, intégration web, SEO technique et exécution temps réel 3D/VR pour équipes belges qui doivent rendre l’IA réellement exploitable.',
      en: 'Edge Solutions services: AI systems, automation, web integration, technical SEO and real-time 3D/VR execution for Belgian teams that need AI to become truly usable.',
      nl: 'Diensten van Edge Solutions: AI-systemen, automatisatie, webintegratie, technische SEO en realtime 3D/VR-uitvoering voor Belgische teams die AI echt bruikbaar moeten maken.',
    },
  },
  {
    id: 'contact',
    pathSuffix: '/contact',
    lastModified: new Date('2026-04-05T14:34:58.000Z'),
    sitemapPriority: 0.6,
    title: {
      fr: 'Contact — projet IA, web ou 3D/VR en Wallonie',
      en: 'Contact — AI, web or 3D/VR project in Belgium',
      nl: 'Contact — AI-, web- of 3D/VR-project in België',
    },
    description: {
      fr: 'Décrivez votre projet (IA, automatisation, web, SEO, 3D/VR) et recevez un retour rapide avec périmètre, délai et prochaines étapes.',
      en: 'Share your project scope (AI, automation, web, SEO, 3D/VR) and get a fast reply with timeline, scope and next steps.',
      nl: 'Beschrijf je project (AI, automatisatie, web, SEO, 3D/VR) en ontvang snel feedback met scope, timing en volgende stappen.',
    },
  },
];

function localized(copy: LocalizedCopy, locale: string) {
  return copy[locale] || copy.en;
}

function metadata(locale: string, pathSuffix: string, title: string, description: string) {
  return buildLocalizedPageMetadata({locale, pathSuffix, title, description});
}

function staticPageDefinition(id: StaticPageId) {
  const definition = STATIC_PAGE_DEFINITIONS.find((item) => item.id === id);
  if (!definition) throw new Error(`Unknown static page profile: ${id}`);
  return definition;
}

function staticPageProfile(locale: string, id: StaticPageId, jsonLd: unknown[]): PageProfile {
  const definition = staticPageDefinition(id);
  const title = localized(definition.title, locale);
  const description = localized(definition.description, locale);

  return {
    title,
    description,
    pathSuffix: definition.pathSuffix,
    lastModified: definition.lastModified,
    sitemapPriority: definition.sitemapPriority,
    metadata: metadata(locale, definition.pathSuffix, title, description),
    jsonLd,
  };
}

function offerTrackListItems(translate: Translate): OfferTrackListItem[] {
  return OFFER_TRACKS.map((track) => ({
    slug: track.slug,
    name: translate(track.titleKey),
    description: translate(track.hubDescriptionKey),
  }));
}

export function getHomePageProfile(locale: string): PageProfile {
  const definition = staticPageDefinition('home');
  const title = localized(definition.title, locale);
  const description = localized(definition.description, locale);
  return staticPageProfile(locale, 'home', [
    websiteSchema(locale),
    webPageSchema(locale, definition.pathSuffix, title, description),
  ]);
}

export function getServicesPageProfile(
  locale: string,
  options: {translate?: Translate; offerTracks?: OfferTrackListItem[]; breadcrumbs?: BreadcrumbItem[]} = {}
): PageProfile {
  const definition = staticPageDefinition('services');
  const title = localized(definition.title, locale);
  const description = localized(definition.description, locale);
  const jsonLd: unknown[] = [webPageSchema(locale, definition.pathSuffix, title, description)];
  const offerTracks = options.offerTracks ?? (options.translate ? offerTrackListItems(options.translate) : null);
  const breadcrumbs = options.breadcrumbs ?? (options.translate ? [
    {name: options.translate('nav.home'), path: ''},
    {name: options.translate('services.title'), path: definition.pathSuffix},
  ] : null);

  if (offerTracks) {
    jsonLd.push(servicesItemListSchema(locale, offerTracks));
  }

  if (breadcrumbs) {
    jsonLd.push(breadcrumbSchema(locale, breadcrumbs));
  }

  return staticPageProfile(locale, 'services', jsonLd);
}

export function getContactPageProfile(locale: string): PageProfile {
  const definition = staticPageDefinition('contact');
  const title = localized(definition.title, locale);
  const description = localized(definition.description, locale);
  return staticPageProfile(locale, 'contact', [
    webPageSchema(locale, definition.pathSuffix, title, description),
  ]);
}

export function getOfferTrackPageProfile({
  locale,
  slug,
  title,
  description,
  translate,
  breadcrumbs,
}: {
  locale: string;
  slug: OfferTrackSlug;
  title: string;
  description: string;
  translate?: Translate;
  breadcrumbs?: BreadcrumbItem[];
}): PageProfile {
  const pathSuffix = `/services/${slug}`;
  const derivedBreadcrumbs = breadcrumbs ?? (translate ? [
    {name: translate('nav.home'), path: ''},
    {name: translate('services.title'), path: '/services'},
    {name: title, path: pathSuffix},
  ] : null);
  const jsonLd: unknown[] = [
    webPageSchema(locale, pathSuffix, title, description),
    serviceSchema(locale, slug, title, description),
  ];

  if (derivedBreadcrumbs) {
    jsonLd.push(breadcrumbSchema(locale, derivedBreadcrumbs));
  }

  return {
    title,
    description,
    pathSuffix,
    lastModified: OFFER_TRACKS.find((track) => track.slug === slug)?.lastModified,
    sitemapPriority: OFFER_TRACKS.find((track) => track.slug === slug)?.sitemapPriority,
    metadata: metadata(locale, pathSuffix, title, description),
    jsonLd,
  };
}

export function getLocalizedSitemapEntries(locales: readonly string[]) {
  const base = site.url.replace(/\/$/, '');
  const entries: Array<{path: string; lastModified: Date; priority: number}> = [];

  for (const locale of locales) {
    for (const page of STATIC_PAGE_DEFINITIONS) {
      entries.push({
        path: `/${locale}${page.pathSuffix}`,
        lastModified: page.lastModified,
        priority: page.sitemapPriority,
      });
    }

    for (const track of OFFER_TRACKS) {
      entries.push({
        path: `/${locale}${track.path}`,
        lastModified: track.lastModified,
        priority: track.sitemapPriority,
      });
    }
  }

  return entries.map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: entry.lastModified,
    changeFrequency: 'monthly' as const,
    priority: entry.priority,
    alternates: {
      languages: buildAbsoluteLocaleAlternates(entry.path.replace(/^\/(?:fr|en|nl)/, '')),
    },
  }));
}
