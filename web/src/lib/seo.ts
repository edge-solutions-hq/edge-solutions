import type {Metadata} from 'next';
import {routing} from '../i18n/routing';
import {OFFER_TRACKS} from './offer-tracks';
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

export function serviceSchema(locale: string, slug: string, title: string, description: string) {
  const url = absoluteUrl(localizedPath(locale, `/services/${slug}`));

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: title,
    description,
    url,
    inLanguage: locale,
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
