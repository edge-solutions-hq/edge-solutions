import type {Metadata} from 'next';
import {OFFER_TRACKS, type OfferTrackSlug} from './offer-tracks';
import {
  breadcrumbSchema,
  buildAbsoluteLocaleAlternates,
  buildLocalizedPageMetadata,
  faqPageSchema,
  serviceSchema,
  servicesItemListSchema,
  webPageSchema,
  websiteSchema,
} from './seo';
import {site} from './site';

type LocalizedCopy = Record<string, string>;
type Translate = (key: string) => string;

type StaticPageId = 'home' | 'services' | 'contact' | 'privacyPolicy';

type StaticPageDefinition = {
  id: StaticPageId;
  pathSuffix: '' | '/services' | '/contact' | '/privacy-policy';
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

type FaqItem = {
  question: string;
  answer: string;
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
    lastModified: new Date('2026-06-01T00:00:00.000Z'),
    sitemapPriority: 0.7,
    title: {
      fr: 'Automatisation IA et applications 3D / XR en Wallonie - Edge Solutions',
      en: 'AI automation and 3D / XR applications in Wallonia and Belgium - Edge Solutions',
      nl: 'AI-automatisatie en 3D / XR-applicaties in Wallonië en België - Edge Solutions',
    },
    description: {
      fr: 'Gil Guminski aide les équipes belges à auditer les tâches répétitives, automatiser avec LLM et développer des applications 3D / XR.',
      en: 'Gil Guminski, near Liège in Wallonia, helps Belgian teams audit repeated tasks, automate with LLMs and build 3D / XR applications.',
      nl: 'Gil Guminski, bij Luik in Wallonië, helpt Belgische teams repetitieve taken te auditen, met LLMs te automatiseren en 3D / XR-applicaties te bouwen.',
    },
  },
  {
    id: 'services',
    pathSuffix: '/services',
    lastModified: new Date('2026-06-01T00:00:00.000Z'),
    sitemapPriority: 0.7,
    title: {
      fr: 'Services IA et 3D / XR en Wallonie',
      en: 'AI and 3D / XR services in Wallonia and Belgium',
      nl: 'AI- en 3D / XR-diensten in Wallonië en België',
    },
    description: {
      fr: 'Pour équipes wallonnes et belges : audit de tâches répétitives, automatisations IA, assistants internes et applications 3D / XR.',
      en: 'Services for Walloon and Belgian teams: repeated-task audits, AI automation, internal assistants and 3D / XR applications.',
      nl: 'Diensten voor Waalse en Belgische teams: audit van repetitieve taken, AI-automatisatie, interne assistenten en 3D / XR-applicaties.',
    },
  },
  {
    id: 'contact',
    pathSuffix: '/contact',
    lastModified: new Date('2026-06-01T00:00:00.000Z'),
    sitemapPriority: 0.6,
    title: {
      fr: 'Contact - projet IA ou 3D / XR en Wallonie',
      en: 'Contact - AI or 3D / XR project in Wallonia or Belgium',
      nl: 'Contact - AI- of 3D / XR-project in Wallonië of België',
    },
    description: {
      fr: 'Décrivez votre projet (IA, automatisation, 3D / XR) et recevez un retour rapide avec périmètre, délai et prochaines étapes.',
      en: 'Share your project scope (AI, automation, 3D / XR) and get a fast reply with timeline, scope and next steps.',
      nl: 'Beschrijf je project (AI, automatisatie, 3D / XR) en ontvang snel feedback met scope, timing en volgende stappen.',
    },
  },
  {
    id: 'privacyPolicy',
    pathSuffix: '/privacy-policy',
    lastModified: new Date('2026-07-29T00:00:00.000Z'),
    sitemapPriority: 0.3,
    title: {
      fr: 'Politique de confidentialité - Edge Solutions',
      en: 'Privacy Policy - Edge Solutions',
      nl: 'Privacybeleid - Edge Solutions',
    },
    description: {
      fr: 'Politique de confidentialité concise pour le site Edge Solutions : contact, cookies, Google tags, analytics et droits RGPD.',
      en: 'Concise privacy policy for the Edge Solutions website: contact, cookies, Google tags, analytics and GDPR rights.',
      nl: 'Beknopt privacybeleid voor de Edge Solutions-website: contact, cookies, Google-tags, analytics en GDPR-rechten.',
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
    webPageSchema(locale, definition.pathSuffix, title, description, {
      dateModified: definition.lastModified,
    }),
  ]);
}

export function getServicesPageProfile(
  locale: string,
  options: {translate?: Translate; offerTracks?: OfferTrackListItem[]; breadcrumbs?: BreadcrumbItem[]} = {}
): PageProfile {
  const definition = staticPageDefinition('services');
  const title = localized(definition.title, locale);
  const description = localized(definition.description, locale);
  const jsonLd: unknown[] = [
    webPageSchema(locale, definition.pathSuffix, title, description, {
      dateModified: definition.lastModified,
    }),
  ];
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
    webPageSchema(locale, definition.pathSuffix, title, description, {
      dateModified: definition.lastModified,
    }),
  ]);
}

export function getPrivacyPolicyPageProfile(locale: string): PageProfile {
  const definition = staticPageDefinition('privacyPolicy');
  const title = localized(definition.title, locale);
  const description = localized(definition.description, locale);
  return staticPageProfile(locale, 'privacyPolicy', [
    webPageSchema(locale, definition.pathSuffix, title, description, {
      dateModified: definition.lastModified,
    }),
  ]);
}

export function getOfferTrackPageProfile({
  locale,
  slug,
  title,
  description,
  translate,
  breadcrumbs,
  faqItems,
}: {
  locale: string;
  slug: OfferTrackSlug;
  title: string;
  description: string;
  translate?: Translate;
  breadcrumbs?: BreadcrumbItem[];
  faqItems?: readonly FaqItem[];
}): PageProfile {
  const pathSuffix = `/services/${slug}`;
  const lastModified = OFFER_TRACKS.find((track) => track.slug === slug)?.lastModified;
  const derivedBreadcrumbs = breadcrumbs ?? (translate ? [
    {name: translate('nav.home'), path: ''},
    {name: translate('services.title'), path: '/services'},
    {name: title, path: pathSuffix},
  ] : null);
  const jsonLd: unknown[] = [
    webPageSchema(locale, pathSuffix, title, description, {dateModified: lastModified}),
    serviceSchema(locale, slug, title, description, {dateModified: lastModified}),
  ];

  if (derivedBreadcrumbs) {
    jsonLd.push(breadcrumbSchema(locale, derivedBreadcrumbs));
  }

  if (faqItems?.length) {
    jsonLd.push(faqPageSchema(locale, slug, faqItems));
  }

  return {
    title,
    description,
    pathSuffix,
    lastModified,
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
