import type {Metadata} from 'next';
import {routing} from '@/i18n/routing';

const HREFLANG_BY_LOCALE: Record<string, string> = {
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
