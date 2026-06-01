import type {Metadata} from 'next';
import {routing} from '../i18n/routing';
import {getOfferTrack, OFFER_TRACKS, type OfferTrackSlug} from './offer-tracks';
import {site} from './site';

export const HREFLANG_BY_LOCALE: Record<string, string> = {
  fr: 'fr-BE',
  en: 'en-BE',
  nl: 'nl-BE',
};

function normalizeSuffix(pathSuffix = '') {
  const raw = String(pathSuffix || '').trim();
  if (!raw || raw === '/') return '';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function localizedPath(locale: string, pathSuffix = '') {
  const suffix = normalizeSuffix(pathSuffix);
  return `/${locale}${suffix}`;
}

export function absoluteUrl(path: string) {
  const base = site.url.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

const DEFAULT_SOCIAL_IMAGE = {
  path: '/images/work/rusty-art-showcase.jpg',
  width: 1280,
  height: 700,
};

export function buildLocaleAlternates(locale: string, pathSuffix = ''): NonNullable<Metadata['alternates']> {
  const suffix = normalizeSuffix(pathSuffix);
  const languages: Record<string, string> = {};

  for (const item of routing.locales) {
    const hreflang = HREFLANG_BY_LOCALE[item] || item;
    languages[hreflang] = localizedPath(item, suffix);
  }

  languages['x-default'] = localizedPath(routing.defaultLocale, suffix);

  return {
    canonical: localizedPath(locale, suffix),
    languages,
  };
}

export function buildAbsoluteLocaleAlternates(pathSuffix = '') {
  const suffix = normalizeSuffix(pathSuffix);
  const languages: Record<string, string> = {};

  for (const item of routing.locales) {
    const hreflang = HREFLANG_BY_LOCALE[item] || item;
    languages[hreflang] = absoluteUrl(localizedPath(item, suffix));
  }

  languages['x-default'] = absoluteUrl(localizedPath(routing.defaultLocale, suffix));

  return languages;
}

type LocalizedPageMetadataInput = {
  locale: string;
  pathSuffix?: string;
  title: string;
  description: string;
  type?: 'website' | 'article';
};

export function buildLocalizedPageMetadata({
  locale,
  pathSuffix = '',
  title,
  description,
  type = 'website',
}: LocalizedPageMetadataInput): Metadata {
  const path = localizedPath(locale, pathSuffix);
  const url = absoluteUrl(path);
  const socialImage = {
    url: absoluteUrl(DEFAULT_SOCIAL_IMAGE.path),
    width: DEFAULT_SOCIAL_IMAGE.width,
    height: DEFAULT_SOCIAL_IMAGE.height,
    alt: title,
  };

  return {
    title,
    description,
    alternates: buildLocaleAlternates(locale, pathSuffix),
    openGraph: {
      title,
      description,
      url,
      siteName: site.companyName,
      locale,
      type,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage.url],
    },
  };
}

export const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${site.url}#gil-guminski`,
  name: site.personalBrand,
  url: site.url,
  email: site.contactEmail,
  jobTitle: 'Freelance AI automation and real-time 3D / XR developer',
  worksFor: {
    '@id': `${site.url}#organization`,
  },
  sameAs: Object.values(site.social),
  knowsAbout: [
    'AI automation',
    'LLM-assisted workflows',
    'Business process automation',
    'Real-time 3D applications',
    'XR applications',
    'Virtual reality',
    'Augmented reality',
    'Unity',
    'Unreal Engine',
    'Technical production',
  ],
};

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${site.url}#organization`,
  name: site.companyName,
  legalName: site.companyName,
  url: site.url,
  email: site.contactEmail,
  vatID: site.vatNumber,
  founder: {
    '@id': `${site.url}#gil-guminski`,
  },
  sameAs: Object.values(site.social),
  areaServed: [
    {
      '@type': 'Country',
      name: 'Belgium',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Wallonia',
    },
  ],
  availableLanguage: ['fr', 'en', 'nl'],
  serviceType: OFFER_TRACKS.map((track) => track.schemaServiceType),
};

export function websiteSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/${locale}#website`,
    name: site.companyName,
    url: absoluteUrl(localizedPath(locale)),
    inLanguage: locale,
    publisher: {
      '@id': `${site.url}#organization`,
    },
  };
}

export function webPageSchema(
  locale: string,
  pathSuffix: string,
  title: string,
  description: string,
  options: {dateModified?: Date} = {}
) {
  const url = absoluteUrl(localizedPath(locale, pathSuffix));

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    ...(options.dateModified ? {dateModified: options.dateModified.toISOString()} : {}),
    inLanguage: locale,
    isPartOf: {
      '@id': `${site.url}/${locale}#website`,
    },
    about: {
      '@id': `${site.url}#organization`,
    },
  };
}

export function offerTrackServiceIdentifier(locale: string, slug: OfferTrackSlug) {
  return `edge-solutions:${locale}:services:${slug}`;
}

type ServiceSchemaDetails = {
  audienceType: string;
  serviceOutput: readonly string[];
  offer: {
    name: string;
    description: string;
  };
};

type LocalizedServiceSchemaDetails = Record<string, ServiceSchemaDetails>;

export const SERVICE_SCHEMA_DETAILS: Record<OfferTrackSlug, LocalizedServiceSchemaDetails> = {
  'ai-automation': {
    fr: {
      audienceType:
        'Équipes belges qui veulent auditer des tâches répétitives et intégrer des automatisations IA utiles',
      serviceOutput: [
        'Audit d\'une tâche répétitive prioritaire',
        'Première version testable sur cas réels',
        'Revue humaine et limites d\'action',
      ],
      offer: {
        name: 'Cycle d\'audit, automatisation et revue humaine',
        description:
          'Accompagnement de l\'audit à une première version testable pour automatiser une tâche répétitive avec assez d\'intelligence et de contrôle.',
      },
    },
    en: {
      audienceType:
        'Belgian teams that want to audit repeated tasks and integrate useful AI automation',
      serviceOutput: [
        'Priority repeated-task audit',
        'First testable version on real examples',
        'Human review and action limits',
      ],
      offer: {
        name: 'AI audit, automation and human review cycle',
        description:
          'Support from audit to a first testable version to automate a repeated task with enough intelligence and control.',
      },
    },
    nl: {
      audienceType:
        'Belgische teams die repetitieve taken willen auditen en bruikbare AI-automatisatie willen integreren',
      serviceOutput: [
        'Audit van een prioritaire repetitieve taak',
        'Eerste testbare versie op echte voorbeelden',
        'Menselijke review en actielimieten',
      ],
      offer: {
        name: 'AI-audit, automatisatie en menselijke review',
        description:
          'Begeleiding van audit tot een eerste testbare versie om een repetitieve taak met genoeg intelligentie en controle te automatiseren.',
      },
    },
  },
  'realtime-games': {
    fr: {
      audienceType:
        'PME, agences, équipes techniques, studios et entreprises belges qui doivent construire une application 3D temps réel ou XR interactive pour configurateurs, simulations, formation, usages industriels, VR ou réalité augmentée',
      serviceOutput: [
        'Build jouable ou montrable sur la plateforme cible',
        'Validation performance, confort et risques techniques',
        'Verdict de production garder, couper ou polir',
      ],
      offer: {
        name: 'Application 3D / XR temps reel',
        description:
          'Creation d\'une base interactive pour valider l\'experience, le risque technique et les prochaines decisions de production.',
      },
    },
    en: {
      audienceType:
        'Belgian SMEs, agencies, technical teams, studios and producers that need to build an interactive real-time 3D or XR application for configurators, simulations, training, industrial uses, VR or augmented reality',
      serviceOutput: [
        'Playable or showable build on the target platform',
        'Performance, comfort and technical-risk validation',
        'Production verdict on what to keep, cut or polish',
      ],
      offer: {
        name: 'Real-time 3D / XR application',
        description:
          'Creation of an interactive base to validate the experience, technical risk and next production decisions.',
      },
    },
    nl: {
      audienceType:
        'Belgische kmo’s, agencies, technische teams, studios en producers die een interactieve realtime 3D- of XR-applicatie moeten bouwen voor configuratoren, simulaties, training, industriële toepassingen, VR of augmented reality',
      serviceOutput: [
        'Speelbare of toonbare build op het doelplatform',
        'Validatie van performance, comfort en technisch risico',
        'Productieverdict over wat te behouden, schrappen of polijsten',
      ],
      offer: {
        name: 'Realtime 3D / XR-applicatie',
        description:
          'Creatie van een interactieve basis om de ervaring, technische risico\'s en volgende productiebeslissingen te valideren.',
      },
    },
  },
};

export function getServiceSchemaDetails(locale: string, slug: OfferTrackSlug): ServiceSchemaDetails {
  const localized = SERVICE_SCHEMA_DETAILS[slug];
  return localized[locale] ?? localized.en;
}

export function serviceSchema(
  locale: string,
  slug: OfferTrackSlug,
  title: string,
  description: string,
  options: {dateModified?: Date} = {}
) {
  const offerTrack = getOfferTrack(slug);
  if (!offerTrack) throw new Error(`Unknown service schema offer track: ${slug}`);

  const url = absoluteUrl(localizedPath(locale, `/services/${slug}`));
  const details = getServiceSchemaDetails(locale, offerTrack.slug);

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: title,
    description,
    url,
    ...(options.dateModified ? {dateModified: options.dateModified.toISOString()} : {}),
    inLanguage: locale,
    serviceType: offerTrack.schemaServiceType,
    category: offerTrack.slug,
    audience: {
      '@type': 'Audience',
      audienceType: details.audienceType,
    },
    serviceOutput: details.serviceOutput.map((name) => ({
      '@type': 'Thing',
      name,
    })),
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'edge-solutions:service-offer-track',
      value: offerTrackServiceIdentifier(locale, offerTrack.slug),
    },
    provider: {
      '@id': `${site.url}#organization`,
    },
    areaServed: [
      {
        '@type': 'Country',
        name: 'Belgium',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Wallonia',
      },
    ],
    offers: {
      '@type': 'Offer',
      name: details.offer.name,
      description: details.offer.description,
      url,
      seller: {
        '@id': `${site.url}#organization`,
      },
      itemOffered: {
        '@id': `${url}#service`,
      },
    },
  };
}

type FaqItem = {
  question: string;
  answer: string;
};

export function faqPageSchema(locale: string, slug: string, faqItems: readonly FaqItem[]) {
  const url = absoluteUrl(localizedPath(locale, `/services/${slug}`));

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    url,
    inLanguage: locale,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

type ServiceListItem = {
  slug: string;
  name: string;
  description: string;
};

export function servicesItemListSchema(locale: string, services: ServiceListItem[]) {
  const url = absoluteUrl(localizedPath(locale, '/services'));

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${url}#services-list`,
    name: 'Edge Solutions services',
    inLanguage: locale,
    itemListElement: services.map((service, index) => {
      const serviceUrl = absoluteUrl(localizedPath(locale, `/services/${service.slug}`));

      return {
        '@type': 'ListItem',
        position: index + 1,
        url: serviceUrl,
        item: {
          '@type': 'Service',
          '@id': `${serviceUrl}#service`,
          name: service.name,
          description: service.description,
          url: serviceUrl,
          provider: {
            '@id': `${site.url}#organization`,
          },
        },
      };
    }),
  };
}

export function breadcrumbSchema(locale: string, items: Array<{name: string; path: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(localizedPath(locale, item.path)),
    })),
  };
}
