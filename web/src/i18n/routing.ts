import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en', 'nl'],
  defaultLocale: 'fr',
  // URLs toujours préfixées /fr, /en, /nl (SEO + clarté)
  localePrefix: 'always'
});


