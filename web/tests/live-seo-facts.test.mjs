import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';

import {getLiveSeoSourceFacts} from '../scripts/seo-source-facts.mjs';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function extractQuotedValues(source) {
  return [...source.matchAll(/'([^']+)'/g)].map((item) => item[1]);
}

describe('live SEO source facts', () => {
  it('derives the live smoke URL matrix from route and profile sources', () => {
    const facts = getLiveSeoSourceFacts({root});

    const routingSource = read('src/i18n/routing.ts');
    const siteSource = read('src/lib/site.ts');
    const seoSource = read('src/lib/seo.ts');
    const pageProfilesSource = read('src/lib/page-profiles.ts');
    const offerTracksSource = read('src/lib/offer-tracks.ts');

    const sourceSiteUrl = siteSource.match(/\burl:\s*'([^']+)'/)?.[1];
    const sourceDefaultLocale = routingSource.match(/\bDEFAULT_LOCALE\s*:[^=]+?=\s*'([^']+)'/)?.[1];
    const sourceLocales = extractQuotedValues(
      routingSource.match(/\bLOCALES\s*=\s*\[([\s\S]*?)\]\s*as const/)?.[1] ?? ''
    );
    const sourceHreflangByLocale = Object.fromEntries(
      [
        ...seoSource
          .match(/\bHREFLANG_BY_LOCALE\b[^=]*=\s*\{([\s\S]*?)\};/)?.[1]
          .matchAll(/([A-Za-z0-9_-]+)\s*:\s*'([^']+)'/g) ?? [],
      ].map((item) => [item[1], item[2]])
    );
    const sourceStaticSuffixes = [
      ...pageProfilesSource
        .match(/\bSTATIC_PAGE_DEFINITIONS\b[^=]*=\s*\[([\s\S]*?)\];/)?.[1]
        .matchAll(/\bpathSuffix:\s*'([^']*)'/g) ?? [],
    ].map((item) => item[1]);
    const sourceServiceSlugs = [
      ...offerTracksSource
        .match(/\bOFFER_TRACKS\b[^=]*=\s*\[([\s\S]*?)\];/)?.[1]
        .matchAll(/\bslug:\s*'([^']+)'/g) ?? [],
    ].map((item) => item[1]);

    assert.deepEqual(facts.locales, sourceLocales);
    assert.equal(facts.siteUrl, sourceSiteUrl);
    assert.equal(facts.defaultLocale, sourceDefaultLocale);
    assert.deepEqual(facts.hreflangByLocale, sourceHreflangByLocale);
    assert.deepEqual(facts.staticPageSuffixes, sourceStaticSuffixes);
    assert.deepEqual(facts.serviceSlugs, sourceServiceSlugs);
    assert.deepEqual(
      facts.pageSuffixes,
      [...sourceStaticSuffixes, ...sourceServiceSlugs.map((slug) => `/services/${slug}`)]
    );

    assert.ok(facts.staticPageSuffixes.includes(''), 'home suffix is covered');
    assert.ok(facts.staticPageSuffixes.includes('/services'), 'services hub suffix is covered');
    assert.ok(facts.staticPageSuffixes.includes('/contact'), 'contact suffix is covered');

    for (const locale of facts.locales) {
      assert.equal(typeof facts.hreflangByLocale[locale], 'string', `${locale} hreflang`);

      for (const suffix of facts.pageSuffixes) {
        const expectedPath = `/${locale}${suffix}`;
        const expectedUrl = `${facts.siteUrl}${expectedPath}`;

        assert.ok(facts.expectedPaths.includes(expectedPath), `${expectedPath} path`);
        assert.ok(facts.expectedUrls.includes(expectedUrl), `${expectedUrl} URL`);
        assert.deepEqual(
          facts.urlChecks.find((check) => check.locale === locale && check.suffix === suffix),
          {locale, suffix, path: expectedPath, url: expectedUrl}
        );
      }
    }

    assert.equal(facts.urlChecks.length, facts.locales.length * facts.pageSuffixes.length);
  });
});
