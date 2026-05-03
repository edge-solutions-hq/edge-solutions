import type {Metadata} from 'next';
import type {OfferTrackSlug} from '@/lib/offer-tracks';
import {
  breadcrumbSchema,
  buildLocalizedPageMetadata,
  serviceSchema,
  servicesItemListSchema,
  webPageSchema,
  websiteSchema,
} from '@/lib/seo';

type LocalizedCopy = Record<string, string>;

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
  metadata: Metadata;
  jsonLd: unknown[];
};

const homeTitle: LocalizedCopy = {
  fr: 'Systèmes IA pragmatiques et delivery fiable pour équipes wallonnes',
  en: 'Pragmatic AI systems and delivery hardening for Belgian teams',
  nl: 'Pragmatische AI-systemen en betrouwbare delivery voor Belgische teams',
};

const homeDescription: LocalizedCopy = {
  fr: 'Edge Solutions aide les équipes à rendre leurs usages IA réellement exploitables, avec revue humaine, garde-fous, intégration web et exécution temps réel quand le produit le demande.',
  en: 'Edge Solutions helps teams turn AI usage into something truly usable, with human review, guardrails, web integration and real-time execution when the product needs it.',
  nl: 'Edge Solutions helpt teams om AI-gebruik echt bruikbaar te maken, met menselijke review, guardrails, webintegratie en realtime uitvoering wanneer het product dat vraagt.',
};

const servicesTitle: LocalizedCopy = {
  fr: 'Services IA-first, web et 3D/VR pour équipes en Wallonie',
  en: 'AI-first services with web and 3D/VR execution in Belgium',
  nl: 'AI-first diensten met web- en 3D/VR-uitvoering in België',
};

const servicesDescription: LocalizedCopy = {
  fr: 'Services Edge Solutions : systèmes IA, automatisation, intégration web, SEO technique et exécution temps réel 3D/VR pour équipes belges qui doivent rendre l’IA réellement exploitable.',
  en: 'Edge Solutions services: AI systems, automation, web integration, technical SEO and real-time 3D/VR execution for Belgian teams that need AI to become truly usable.',
  nl: 'Diensten van Edge Solutions: AI-systemen, automatisatie, webintegratie, technische SEO en realtime 3D/VR-uitvoering voor Belgische teams die AI echt bruikbaar moeten maken.',
};

const contactTitle: LocalizedCopy = {
  fr: 'Contact — projet IA, web ou 3D/VR en Wallonie',
  en: 'Contact — AI, web or 3D/VR project in Belgium',
  nl: 'Contact — AI-, web- of 3D/VR-project in België',
};

const contactDescription: LocalizedCopy = {
  fr: 'Décrivez votre projet (IA, automatisation, web, SEO, 3D/VR) et recevez un retour rapide avec périmètre, délai et prochaines étapes.',
  en: 'Share your project scope (AI, automation, web, SEO, 3D/VR) and get a fast reply with timeline, scope and next steps.',
  nl: 'Beschrijf je project (AI, automatisatie, web, SEO, 3D/VR) en ontvang snel feedback met scope, timing en volgende stappen.',
};

function localized(copy: LocalizedCopy, locale: string) {
  return copy[locale] || copy.en;
}

function metadata(locale: string, pathSuffix: string, title: string, description: string) {
  return buildLocalizedPageMetadata({locale, pathSuffix, title, description});
}

export function getHomePageProfile(locale: string): PageProfile {
  const title = localized(homeTitle, locale);
  const description = localized(homeDescription, locale);

  return {
    title,
    description,
    pathSuffix: '',
    metadata: metadata(locale, '', title, description),
    jsonLd: [websiteSchema(locale), webPageSchema(locale, '', title, description)],
  };
}

export function getServicesPageProfile(
  locale: string,
  options: {offerTracks?: OfferTrackListItem[]; breadcrumbs?: BreadcrumbItem[]} = {}
): PageProfile {
  const title = localized(servicesTitle, locale);
  const description = localized(servicesDescription, locale);
  const jsonLd: unknown[] = [webPageSchema(locale, '/services', title, description)];

  if (options.offerTracks) {
    jsonLd.push(servicesItemListSchema(locale, options.offerTracks));
  }

  if (options.breadcrumbs) {
    jsonLd.push(breadcrumbSchema(locale, options.breadcrumbs));
  }

  return {
    title,
    description,
    pathSuffix: '/services',
    metadata: metadata(locale, '/services', title, description),
    jsonLd,
  };
}

export function getContactPageProfile(locale: string): PageProfile {
  const title = localized(contactTitle, locale);
  const description = localized(contactDescription, locale);

  return {
    title,
    description,
    pathSuffix: '/contact',
    metadata: metadata(locale, '/contact', title, description),
    jsonLd: [webPageSchema(locale, '/contact', title, description)],
  };
}

export function getOfferTrackPageProfile({
  locale,
  slug,
  title,
  description,
  breadcrumbs,
}: {
  locale: string;
  slug: OfferTrackSlug;
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
}): PageProfile {
  const pathSuffix = `/services/${slug}`;
  const jsonLd: unknown[] = [
    webPageSchema(locale, pathSuffix, title, description),
    serviceSchema(locale, slug, title, description),
  ];

  if (breadcrumbs) {
    jsonLd.push(breadcrumbSchema(locale, breadcrumbs));
  }

  return {
    title,
    description,
    pathSuffix,
    metadata: metadata(locale, pathSuffix, title, description),
    jsonLd,
  };
}
