import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {getLiveSeoSourceFacts} from '../scripts/seo-source-facts.mjs';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function extractQuotedValues(source) {
  return [...source.matchAll(/'([^']+)'/g)].map((item) => item[1]);
}

function copyFixtureFile(fixtureRoot, relativePath) {
  const sourcePath = path.join(root, relativePath);
  const fixturePath = path.join(fixtureRoot, relativePath);

  mkdirSync(path.dirname(fixturePath), {recursive: true});
  copyFileSync(sourcePath, fixturePath);
}

function withSourceFixture(mutate) {
  const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), 'edge-seo-source-facts-'));
  const sourceFiles = [
    'src/lib/site.ts',
    'src/i18n/routing.ts',
    'src/lib/seo.ts',
    'src/lib/page-profiles.ts',
    'src/lib/offer-tracks.ts',
  ];
  const facts = getLiveSeoSourceFacts({root});

  try {
    for (const relativePath of sourceFiles) {
      copyFixtureFile(fixtureRoot, relativePath);
    }

    for (const locale of facts.locales) {
      for (const slug of facts.serviceSlugs) {
        copyFixtureFile(fixtureRoot, `src/content/${locale}/services/${slug}.mdx`);
      }
    }

    mutate({fixtureRoot, facts});
    return getLiveSeoSourceFacts({root: fixtureRoot});
  } finally {
    rmSync(fixtureRoot, {recursive: true, force: true});
  }
}

function rewriteMdxMetadata(relativePath, field, value, fixtureRoot) {
  const filePath = path.join(fixtureRoot, relativePath);
  const source = readFileSync(filePath, 'utf8');
  const nextSource = source.replace(
    new RegExp(`(\\b${field}\\s*:\\s*)(['"])([\\s\\S]*?)\\2`),
    `$1${JSON.stringify(value)}`
  );

  assert.notEqual(nextSource, source, `${relativePath} ${field} was not rewritten`);
  writeFileSync(filePath, nextSource);
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
    assert.equal(facts.routeFamilies.length, sourceStaticSuffixes.length + sourceServiceSlugs.length);
    assert.deepEqual(
      facts.routeFamilies.filter((family) => family.kind === 'static').map((family) => family.pathSuffix),
      sourceStaticSuffixes
    );
    assert.deepEqual(
      facts.routeFamilies.filter((family) => family.kind === 'service').map((family) => family.slug),
      sourceServiceSlugs
    );

    assert.ok(facts.staticPageSuffixes.includes(''), 'home suffix is covered');
    assert.ok(facts.staticPageSuffixes.includes('/services'), 'services hub suffix is covered');
    assert.ok(facts.staticPageSuffixes.includes('/contact'), 'contact suffix is covered');
    assert.ok(facts.servicePageSuffixes.includes('/services/ai-automation'), 'offer track suffix is covered');
    assert.ok(facts.servicePageSuffixes.includes('/services/realtime-games'), 'realtime offer suffix is covered');

    for (const locale of facts.locales) {
      assert.equal(typeof facts.hreflangByLocale[locale], 'string', `${locale} hreflang`);

      for (const suffix of facts.pageSuffixes) {
        const expectedPath = `/${locale}${suffix}`;
        const expectedUrl = `${facts.siteUrl}${expectedPath}`;

        assert.ok(facts.expectedPaths.includes(expectedPath), `${expectedPath} path`);
        assert.ok(facts.expectedUrls.includes(expectedUrl), `${expectedUrl} URL`);
        const urlCheck = facts.urlChecks.find((check) => check.locale === locale && check.suffix === suffix);
        assert.ok(urlCheck, `${expectedUrl} URL check`);
        assert.equal(urlCheck.locale, locale);
        assert.equal(urlCheck.suffix, suffix);
        assert.equal(urlCheck.path, expectedPath);
        assert.equal(urlCheck.url, expectedUrl);
        assert.equal(urlCheck.canonicalUrl, expectedUrl);
        assert.equal(facts.stripLocalizedPathPrefix(expectedPath), suffix);
        assert.equal(typeof urlCheck.title, 'string', `${expectedUrl} title`);
        assert.equal(typeof urlCheck.description, 'string', `${expectedUrl} description`);
        assert.ok(urlCheck.title.length > 0, `${expectedUrl} title is non-empty`);
        assert.ok(urlCheck.description.length > 0, `${expectedUrl} description is non-empty`);

        for (const alternateLocale of facts.locales) {
          const alternate = urlCheck.alternates.byLocale.find((item) => item.locale === alternateLocale);
          const alternatePath = `/${alternateLocale}${suffix}`;

          assert.ok(alternate, `${expectedUrl} ${alternateLocale} alternate`);
          assert.equal(alternate.hreflang, facts.hreflangByLocale[alternateLocale]);
          assert.equal(alternate.path, alternatePath);
          assert.equal(alternate.url, `${facts.siteUrl}${alternatePath}`);
        }

        const defaultPath = `/${facts.defaultLocale}${suffix}`;
        assert.equal(urlCheck.alternates.xDefault.hreflang, 'x-default');
        assert.equal(urlCheck.alternates.xDefault.path, defaultPath);
        assert.equal(urlCheck.alternates.xDefault.url, `${facts.siteUrl}${defaultPath}`);
      }
    }

    assert.equal(facts.urlChecks.length, facts.locales.length * facts.pageSuffixes.length);
    assert.deepEqual(facts.urlChecks, facts.localizedRoutes);
    assert.deepEqual(
      facts.servicesRouteFamilyChecks.map((route) => route.path),
      [
        ...facts.locales.map((locale) => `/${locale}/services`),
        ...sourceServiceSlugs.flatMap((slug) =>
          facts.locales.map((locale) => `/${locale}/services/${slug}`)
        ),
      ]
    );

    for (const route of facts.servicesRouteFamilyChecks) {
      assert.deepEqual(
        route.expectedJsonLdTypes,
        route.kind === 'service'
          ? ['WebPage', 'Service', 'BreadcrumbList', 'FAQPage']
          : ['WebPage', 'ItemList', 'BreadcrumbList'],
        `${route.path} typed JSON-LD contract`
      );
    }

    assert.deepEqual(
      facts.serviceMetadataChecks.map((route) => route.path),
      facts.serviceSlugs.flatMap((slug) =>
        facts.locales.map((locale) => `/${locale}/services/${slug}`)
      )
    );
    assert.equal(facts.serviceMetadataChecks.length, facts.locales.length * facts.serviceSlugs.length);
  });

  it('rejects empty localized service titles and meta descriptions', () => {
    assert.throws(
      () =>
        withSourceFixture(({fixtureRoot}) => {
          rewriteMdxMetadata('src/content/fr/services/ai-automation.mdx', 'title', '   ', fixtureRoot);
        }),
      /\/fr\/services\/ai-automation has empty localized service title/
    );

    assert.throws(
      () =>
        withSourceFixture(({fixtureRoot}) => {
          rewriteMdxMetadata('src/content/nl/services/realtime-games.mdx', 'description', '   ', fixtureRoot);
        }),
      /\/nl\/services\/realtime-games has empty localized service description/
    );
  });

  it('rejects duplicated localized service titles and meta descriptions', () => {
    assert.throws(
      () =>
        withSourceFixture(({fixtureRoot, facts}) => {
          const existingTitle = facts.serviceMetadataChecks.find(
            (route) => route.path === '/fr/services/ai-automation'
          ).title;
          rewriteMdxMetadata('src/content/en/services/realtime-games.mdx', 'title', existingTitle, fixtureRoot);
        }),
      /Duplicate localized service title metadata:/
    );

    assert.throws(
      () =>
        withSourceFixture(({fixtureRoot, facts}) => {
          const existingDescription = facts.serviceMetadataChecks.find(
            (route) => route.path === '/en/services/ai-automation'
          ).description;
          rewriteMdxMetadata(
            'src/content/nl/services/realtime-games.mdx',
            'description',
            existingDescription,
            fixtureRoot
          );
        }),
      /Duplicate localized service description metadata:/
    );
  });

  it('rejects fallback-looking localized service metadata for the full FR/EN/NL route family', () => {
    assert.throws(
      () =>
        withSourceFixture(({fixtureRoot}) => {
          rewriteMdxMetadata('src/content/fr/services/realtime-games.mdx', 'title', 'realtime-games', fixtureRoot);
        }),
      /\/fr\/services\/realtime-games has fallback-looking localized service title/
    );

    assert.throws(
      () =>
        withSourceFixture(({fixtureRoot, facts}) => {
          const fallbackDescription = facts.serviceMetadataChecks.find(
            (route) => route.path === '/fr/services/ai-automation'
          ).description;
          rewriteMdxMetadata(
            'src/content/en/services/ai-automation.mdx',
            'description',
            fallbackDescription,
            fixtureRoot
          );
        }),
      /\/en\/services\/ai-automation has fallback-looking localized service description: it matches \/fr\/services\/ai-automation/
    );
  });
});
