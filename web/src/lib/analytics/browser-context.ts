import {LOCALES} from '../../i18n/routing';
import {isOfferTrackSlug, type OfferTrackSlug} from '../offer-tracks';

type BrowserAnalyticsDocument = {
  documentElement?: {
    lang?: string;
  };
  referrer?: string;
  title?: string;
};

type BrowserAnalyticsLocation = {
  href: string;
  pathname: string;
  search: string;
};

type BrowserAnalyticsContextInput = {
  document: BrowserAnalyticsDocument;
  location: BrowserAnalyticsLocation;
  pagePath?: string;
  pathname?: string;
};

export type BrowserAnalyticsContext = {
  page_family: AnalyticsPageFamily;
  page_location: string;
  page_path: string;
  page_referrer?: string;
  page_title?: string;
  site_locale?: string;
  source_offer_track?: OfferTrackSlug;
};

const SUPPORTED_LOCALES = new Set<string>(LOCALES);

export type AnalyticsPageFamily =
  | 'home'
  | 'services_index'
  | 'service_detail'
  | 'contact'
  | 'other';

function normalizeLocale(value: string | undefined) {
  return value?.trim().toLowerCase().split('-')[0];
}

export function resolveBrowserAnalyticsLocale({
  document,
  pathname,
}: {
  document: BrowserAnalyticsDocument;
  pathname: string;
}): string | undefined {
  const htmlLocale = normalizeLocale(document.documentElement?.lang);
  if (htmlLocale && SUPPORTED_LOCALES.has(htmlLocale)) {
    return htmlLocale;
  }

  const pathLocale = pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  if (pathLocale && SUPPORTED_LOCALES.has(pathLocale)) {
    return pathLocale;
  }

  return undefined;
}

function localizedPathSegments(pathname: string) {
  const cleanPath = (pathname.split(/[?#]/, 1)[0] || '/').replace(/\/+$/, '');
  const segments = cleanPath.split('/').filter(Boolean);

  return SUPPORTED_LOCALES.has(segments[0] ?? '') ? segments.slice(1) : segments;
}

export function resolveBrowserAnalyticsPageContext(pathname: string): {
  pageFamily: AnalyticsPageFamily;
  sourceOfferTrack?: OfferTrackSlug;
} {
  const segments = localizedPathSegments(pathname);
  const [section, slug] = segments;

  if (!section) {
    return {pageFamily: 'home'};
  }

  if (section === 'contact') {
    return {pageFamily: 'contact'};
  }

  if (section === 'services') {
    if (!slug) {
      return {pageFamily: 'services_index'};
    }

    if (isOfferTrackSlug(slug)) {
      return {
        pageFamily: 'service_detail',
        sourceOfferTrack: slug,
      };
    }
  }

  return {pageFamily: 'other'};
}

export function createBrowserAnalyticsContext({
  document,
  location,
  pagePath,
  pathname = location.pathname,
}: BrowserAnalyticsContextInput): BrowserAnalyticsContext {
  const title = document.title?.trim();
  const referrer = document.referrer?.trim();
  const pageContext = resolveBrowserAnalyticsPageContext(pathname);

  return {
    page_family: pageContext.pageFamily,
    site_locale: resolveBrowserAnalyticsLocale({document, pathname}),
    source_offer_track: pageContext.sourceOfferTrack,
    page_path: pagePath ?? `${location.pathname}${location.search}`,
    page_location: location.href,
    page_title: title || undefined,
    page_referrer: referrer || undefined,
  };
}

export function currentBrowserPagePath() {
  if (typeof window === 'undefined') return undefined;
  return `${window.location.pathname}${window.location.search}`;
}

export function readBrowserAnalyticsContext({
  pagePath,
  pathname,
}: {
  pagePath?: string;
  pathname?: string;
} = {}) {
  if (typeof window === 'undefined') return undefined;

  return createBrowserAnalyticsContext({
    document,
    location: window.location,
    pagePath,
    pathname,
  });
}
