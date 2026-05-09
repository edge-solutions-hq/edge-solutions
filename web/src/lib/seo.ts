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
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

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
    '@type': 'Person',
    name: site.personalBrand,
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

export function webPageSchema(locale: string, pathSuffix: string, title: string, description: string) {
  const url = absoluteUrl(localizedPath(locale, pathSuffix));

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
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
        'Equipes belges qui doivent cadrer, prototyper et integrer des systemes IA utiles avec revue humaine',
      serviceOutput: [
        'Cadrage d\'un cas d\'usage IA prioritaire',
        'Prototype testable sur cas reels',
        'Revue humaine et garde-fous d\'integration',
      ],
      offer: {
        name: 'Cycle de cadrage, prototype et garde-fous IA',
        description:
          'Accompagnement du cadrage au prototype pour rendre un usage IA lisible, testable et decidable avant une integration plus sensible.',
      },
    },
    en: {
      audienceType:
        'Belgian teams that need to scope, prototype and integrate useful AI systems with human review',
      serviceOutput: [
        'Priority AI use-case framing',
        'Prototype tested on real examples',
        'Human review and integration guardrails',
      ],
      offer: {
        name: 'AI scoping, prototype and guardrails cycle',
        description:
          'Support from framing to prototype so an AI workflow becomes readable, testable and decidable before deeper integration.',
      },
    },
    nl: {
      audienceType:
        'Belgische teams die bruikbare AI-systemen willen afbakenen, prototypen en integreren met menselijke review',
      serviceOutput: [
        'Afbakening van een prioritaire AI-use case',
        'Prototype getest op echte voorbeelden',
        'Menselijke review en integratieguardrails',
      ],
      offer: {
        name: 'AI-scoping, prototype en guardrails-cyclus',
        description:
          'Begeleiding van kadering tot prototype zodat een AI-workflow leesbaar, testbaar en beslisbaar wordt voor diepere integratie.',
      },
    },
  },
  'web-dev': {
    fr: {
      audienceType:
        'PME, startups et agences belges qui ont besoin d\'une base web rapide, fiable, trouvable et maintenable',
      serviceOutput: [
        'Site vitrine, landing page ou application web sur-mesure',
        'Structure SEO technique et parcours de conversion lisible',
        'Verification performance, QA et handover',
      ],
      offer: {
        name: 'Livraison web sur-mesure orientee SEO, conversion et maintenance',
        description:
          'Creation ou amelioration d\'une base web avec structure de page, integrations explicites, verification technique et chemin d\'iteration clair.',
      },
    },
    en: {
      audienceType:
        'Belgian SMEs, startups and agencies that need a fast, reliable, findable and maintainable web foundation',
      serviceOutput: [
        'Custom website, landing page or web application',
        'Technical SEO structure and readable conversion path',
        'Performance, QA and handover verification',
      ],
      offer: {
        name: 'Custom web delivery for SEO, conversion and maintainability',
        description:
          'Build or improve a web foundation with clear page structure, explicit integrations, technical verification and a clean next-iteration path.',
      },
    },
    nl: {
      audienceType:
        'Belgische KMO\'s, startups en agencies die een snelle, betrouwbare, vindbare en onderhoudbare webbasis nodig hebben',
      serviceOutput: [
        'Website, landing page of webapplicatie op maat',
        'Technische SEO-structuur en duidelijk conversiepad',
        'Performance, QA en handover-verificatie',
      ],
      offer: {
        name: 'Webdelivery op maat voor SEO, conversie en onderhoudbaarheid',
        description:
          'Bouw of verbetering van een webbasis met duidelijke paginastructuur, expliciete integraties, technische verificatie en een helder iteratiepad.',
      },
    },
  },
  'realtime-games': {
    fr: {
      audienceType:
        'Studios, producteurs et entreprises belges qui doivent valider une experience VR, 3D interactive ou WebGL',
      serviceOutput: [
        'Prototype jouable ou montrable sur la plateforme cible',
        'Validation performance, confort et risques techniques',
        'Verdict de production garder, couper ou polir',
      ],
      offer: {
        name: 'Prototype temps reel VR, 3D interactive ou WebGL',
        description:
          'Creation d\'une base jouable pour valider l\'experience, le risque technique et les prochaines decisions de production.',
      },
    },
    en: {
      audienceType:
        'Belgian studios, producers and teams that need to validate a VR, interactive 3D or WebGL experience',
      serviceOutput: [
        'Playable or showable prototype on the target platform',
        'Performance, comfort and technical-risk validation',
        'Production verdict on what to keep, cut or polish',
      ],
      offer: {
        name: 'Realtime VR, interactive 3D or WebGL prototype',
        description:
          'Creation of a playable base to validate the experience, technical risk and next production decisions.',
      },
    },
    nl: {
      audienceType:
        'Belgische studios, producers en teams die een VR-, interactieve 3D- of WebGL-ervaring moeten valideren',
      serviceOutput: [
        'Speelbaar of toonbaar prototype op het doelplatform',
        'Validatie van performance, comfort en technisch risico',
        'Productieverdict over wat te behouden, schrappen of polijsten',
      ],
      offer: {
        name: 'Realtime VR-, interactieve 3D- of WebGL-prototype',
        description:
          'Creatie van een speelbare basis om de ervaring, technische risico\'s en volgende productiebeslissingen te valideren.',
      },
    },
  },
};

export function getServiceSchemaDetails(locale: string, slug: OfferTrackSlug): ServiceSchemaDetails {
  const localized = SERVICE_SCHEMA_DETAILS[slug];
  return localized[locale] ?? localized.en;
}

export function serviceSchema(locale: string, slug: OfferTrackSlug, title: string, description: string) {
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
