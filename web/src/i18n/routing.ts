import {defineRouting} from 'next-intl/routing';

export const LOCALES = ['fr', 'en', 'nl'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // URLs toujours préfixées /fr, /en, /nl (SEO + clarté)
  localePrefix: 'always',
  // HTML metadata owns hreflang output with regional codes (fr-BE/en-BE/nl-BE).
  alternateLinks: false
});
