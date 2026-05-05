import {LOCALES} from '../../i18n/routing';

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
  page_location: string;
  page_path: string;
  page_referrer?: string;
  page_title?: string;
  site_locale?: string;
};

const SUPPORTED_LOCALES = new Set<string>(LOCALES);

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

export function createBrowserAnalyticsContext({
  document,
  location,
  pagePath,
  pathname = location.pathname,
}: BrowserAnalyticsContextInput): BrowserAnalyticsContext {
  const title = document.title?.trim();
  const referrer = document.referrer?.trim();

  return {
    site_locale: resolveBrowserAnalyticsLocale({document, pathname}),
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
