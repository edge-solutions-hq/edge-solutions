import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register('./ts-extension-resolver.mjs', import.meta.url);
const {buildLocaleAlternates, buildAbsoluteLocaleAlternates, buildLocalizedPageMetadata} = await import(
  '../src/lib/site/seo.ts'
);
const {
  STATIC_PAGE_DEFINITIONS,
  getHomePageProfile,
  getServicesPageProfile,
  getOfferTrackPageProfile,
} = await import('../src/lib/site/page-profiles.ts');
const {getRootLayoutProfile} = await import('../src/lib/site/site-profile.ts');
const {OFFER_TRACKS} = await import('../src/lib/offer/offer-tracks.ts');
const {buildLlmsTxt} = await import('../src/lib/site/ai-discovery.ts');
const {default: sitemap} = await import('../src/app/sitemap.ts');
const {default: robots} = await import('../src/app/robots.ts');

const ORIGIN = 'https://edge-solutions.be';

function expectedLanguages(suffix, prefix = '') {
  return {
    'fr-BE': `${prefix}/fr${suffix}`,
    'en-BE': `${prefix}/en${suffix}`,
    'nl-BE': `${prefix}/nl${suffix}`,
    'x-default': `${prefix}/fr${suffix}`,
  };
}

const PAGE_SUFFIXES = [
  ...STATIC_PAGE_DEFINITIONS.map((page) => page.pathSuffix),
  ...OFFER_TRACKS.map((track) => `/services/${track.slug}`),
];

describe('hreflang alternates', () => {
  it('self-canonicalizes each locale and points x-default to the FR page of the same path', () => {
    for (const locale of ['fr', 'en', 'nl']) {
      for (const suffix of ['', '/services', '/services/ai-automation']) {
        assert.deepEqual(buildLocaleAlternates(locale, suffix), {
          canonical: `/${locale}${suffix}`,
          languages: expectedLanguages(suffix),
        });
      }
    }
  });

  it('emits absolute hreflang URLs with the same FR x-default', () => {
    assert.deepEqual(buildAbsoluteLocaleAlternates(''), expectedLanguages('', ORIGIN));
    assert.deepEqual(buildAbsoluteLocaleAlternates('/contact'), expectedLanguages('/contact', ORIGIN));
  });

  it('keeps page metadata canonical, Open Graph URL and locale on the requested locale', () => {
    const metadata = buildLocalizedPageMetadata({
      locale: 'nl',
      pathSuffix: '/contact',
      title: 'T',
      description: 'D',
    });

    assert.equal(metadata.alternates.canonical, '/nl/contact');
    assert.equal(metadata.openGraph.url, `${ORIGIN}/nl/contact`);
    assert.equal(metadata.openGraph.locale, 'nl');
  });

  it('uses the localized title for each static page profile', () => {
    const titles = ['fr', 'en', 'nl'].map((locale) => getHomePageProfile(locale).metadata.title);
    assert.deepEqual(
      titles,
      ['fr', 'en', 'nl'].map((locale) => STATIC_PAGE_DEFINITIONS.find((page) => page.id === 'home').title[locale])
    );
    assert.equal(new Set(titles).size, 3);
  });
});

function collectSiteUrls(value, found = []) {
  if (typeof value === 'string') {
    if (value.startsWith(`${ORIGIN}/`)) found.push(value);
  } else if (value && typeof value === 'object') {
    for (const child of Object.values(value)) collectSiteUrls(child, found);
  }
  return found;
}

function collectLanguages(value, found = []) {
  if (value && typeof value === 'object') {
    if (typeof value.inLanguage === 'string') found.push(value.inLanguage);
    for (const child of Object.values(value)) collectLanguages(child, found);
  }
  return found;
}

describe('localized JSON-LD', () => {
  it('keeps every page URL and inLanguage in the JSON-LD on the requested locale', () => {
    const translate = (key) => `t:${key}`;

    for (const locale of ['fr', 'en', 'nl']) {
      const jsonLd = [
        ...getHomePageProfile(locale).jsonLd,
        ...getServicesPageProfile(locale, {translate}).jsonLd,
        ...getOfferTrackPageProfile({
          locale,
          slug: 'realtime-games',
          title: 'Title',
          description: 'Description',
          translate,
          faqItems: [{question: 'Q', answer: 'A'}],
        }).jsonLd,
      ];
      const urls = collectSiteUrls(jsonLd);
      const types = new Set(jsonLd.map((item) => item['@type']));

      assert.deepEqual(
        [...types].sort(),
        ['BreadcrumbList', 'FAQPage', 'ItemList', 'Service', 'WebPage', 'WebSite']
      );
      assert.ok(urls.length > 10);
      for (const url of urls) {
        assert.ok(url.startsWith(`${ORIGIN}/${locale}`), `${locale} JSON-LD links to ${url}`);
      }
      assert.deepEqual([...new Set(collectLanguages(jsonLd))], [locale]);
    }
  });
});

describe('root layout metadata', () => {
  it('uses the requested locale and falls back to FR for unknown locales', () => {
    const en = getRootLayoutProfile('en').metadata;
    const unknown = getRootLayoutProfile('de').metadata;

    assert.equal(en.alternates.canonical, '/en');
    assert.equal(en.openGraph.locale, 'en');
    assert.equal(en.alternates.languages['x-default'], '/fr');
    assert.equal(unknown.alternates.canonical, '/fr');
    assert.equal(unknown.openGraph.locale, 'fr');
  });
});

describe('sitemap and robots', () => {
  it('lists every page in every locale exactly once with matching hreflang alternates', () => {
    const entries = sitemap();
    const expectedUrls = ['fr', 'en', 'nl'].flatMap((locale) =>
      PAGE_SUFFIXES.map((suffix) => `${ORIGIN}/${locale}${suffix}`)
    );

    assert.deepEqual(
      entries.map((entry) => entry.url).sort(),
      [...expectedUrls].sort()
    );

    for (const entry of entries) {
      const suffix = new URL(entry.url).pathname.replace(/^\/(fr|en|nl)/, '');
      assert.deepEqual(entry.alternates.languages, expectedLanguages(suffix, ORIGIN), entry.url);
    }
  });

  it('allows crawling everything and advertises the absolute sitemap URL', () => {
    assert.deepEqual(robots(), {
      rules: [{userAgent: '*', allow: '/'}],
      sitemap: `${ORIGIN}/sitemap.xml`,
    });
  });
});

describe('llms.txt discovery', () => {
  it('lists each locale canonical URLs with that locale titles', () => {
    const text = buildLlmsTxt();

    for (const locale of ['fr', 'en', 'nl']) {
      const section = text.split(`### ${locale.toUpperCase()} `)[1].split('\n### ')[0].split('\n## ')[0];

      for (const page of STATIC_PAGE_DEFINITIONS) {
        assert.ok(
          section.includes(`- ${ORIGIN}/${locale}${page.pathSuffix} - ${page.title[locale]} - `),
          `${locale} section is missing ${page.id}`
        );
      }

      for (const track of OFFER_TRACKS) {
        assert.ok(section.includes(`- ${ORIGIN}/${locale}/services/${track.slug} - `), `${locale} ${track.slug}`);
      }
    }
  });
});
