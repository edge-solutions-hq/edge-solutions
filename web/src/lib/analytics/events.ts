'use client';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

const SUPPORTED_LOCALES = new Set(['fr', 'en', 'nl']);

function compactParams(params: EventParams): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number | boolean>;
}

function resolveSiteLocale(): string | undefined {
  const htmlLang = document.documentElement.lang.trim().toLowerCase();
  const normalizedHtmlLang = htmlLang.split('-')[0];
  if (SUPPORTED_LOCALES.has(normalizedHtmlLang)) {
    return normalizedHtmlLang;
  }

  const pathLocale = window.location.pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  if (pathLocale && SUPPORTED_LOCALES.has(pathLocale)) {
    return pathLocale;
  }

  return undefined;
}

export function trackConversionEvent(eventName: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;

  const defaultPath = `${window.location.pathname}${window.location.search}`;
  const pageTitle = document.title.trim();
  const payload = compactParams({
    site_locale: resolveSiteLocale(),
    page_path: defaultPath,
    page_location: window.location.href,
    page_title: pageTitle || undefined,
    ...params,
  });

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...payload,
    });
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  }
}
