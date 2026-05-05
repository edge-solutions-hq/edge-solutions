import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteUrl = 'https://edge-solutions.be';
const hreflangByLocale = {
  fr: 'fr-BE',
  en: 'en-BE',
  nl: 'nl-BE',
};

function readSource(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function extractStringArray(source, exportName) {
  const escapedName = exportName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const assignmentRegex = new RegExp(`${escapedName}\\s*(?::\\s*[^=]+)?\\s*=\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const propertyRegex = new RegExp(`${escapedName}\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const match = source.match(assignmentRegex) ?? source.match(propertyRegex);

  if (!match) {
    throw new Error(`Could not find ${exportName} string array`);
  }

  const values = [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((item) => item[1]);

  if (!values.length) {
    throw new Error(`${exportName} did not contain any string values`);
  }

  return values;
}

function extractStringProperties(source, propertyName) {
  const escapedName = propertyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escapedName}\\s*:\\s*['\"]([^'\"]*)['\"]`, 'g');
  const values = [...source.matchAll(regex)].map((item) => item[1]);
  return [...new Set(values)];
}

function findGeneratedTextFile(directory, filePattern) {
  if (!existsSync(directory)) return null;

  for (const entry of readdirSync(directory)) {
    const entryPath = path.join(directory, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      const found = findGeneratedTextFile(entryPath, filePattern);
      if (found) return found;
    } else if (filePattern.test(entryPath)) {
      return entryPath;
    }
  }

  return null;
}

function findGeneratedTextFiles(directory, filePattern, matches = []) {
  if (!existsSync(directory)) return matches;

  for (const entry of readdirSync(directory)) {
    const entryPath = path.join(directory, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      findGeneratedTextFiles(entryPath, filePattern, matches);
    } else if (filePattern.test(entryPath)) {
      matches.push(entryPath);
    }
  }

  return matches;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertSourceContainsAll(source, values, label) {
  for (const value of values) {
    assert(source.includes(value), `${label} is missing ${value}`);
  }
}

function readGeneratedPage(pathname) {
  const normalized = pathname.replace(/^\//, '');
  const appDirectory = path.join(root, '.next/server/app');
  const candidates = [
    path.join(appDirectory, normalized, 'index.html'),
    path.join(appDirectory, `${normalized}.html`),
    path.join(appDirectory, normalized, 'index.rsc'),
    path.join(appDirectory, `${normalized}.rsc`),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return readFileSync(candidate, 'utf8');
  }

  const generatedPages = findGeneratedTextFiles(
    appDirectory,
    /\.(?:html|rsc|body|txt)$/
  );
  const expectedTail = normalized.replace(/\//g, path.sep);

  for (const candidate of generatedPages) {
    if (candidate.includes(expectedTail)) return readFileSync(candidate, 'utf8');
  }

  return null;
}

function assertPageHasJsonLd(pathname) {
  const generated = readGeneratedPage(pathname);
  assert(
    generated,
    `Generated page ${pathname} was not found. Run npm run build before check:seo.`
  );
  assert(
    generated.includes('application/ld+json'),
    `Generated page ${pathname} is missing JSON-LD`
  );
}

function assertPageHasLocaleAlternates(pathname) {
  const generated = readGeneratedPage(pathname);
  const suffix = pathname.replace(/^\/(?:fr|en|nl)/, '') || '';

  assert(
    generated,
    `Generated page ${pathname} was not found. Run npm run build before check:seo.`
  );

  for (const alternateLocale of locales) {
    const hreflang = hreflangByLocale[alternateLocale] || alternateLocale;
    const href = `${siteUrl}/${alternateLocale}${suffix}`;
    const alternatePattern = new RegExp(
      `<link[^>]+rel=["']alternate["'][^>]+hreflang=["']${escapeRegExp(hreflang)}["'][^>]+href=["']${escapeRegExp(href)}["']|<link[^>]+href=["']${escapeRegExp(href)}["'][^>]+rel=["']alternate["'][^>]+hreflang=["']${escapeRegExp(hreflang)}["']`,
      'i'
    );

    assert(
      alternatePattern.test(generated),
      `Generated ${pathname} is missing ${hreflang} alternate ${href}`
    );
  }

  assert(
    /<link[^>]+rel=["']alternate["'][^>]+hreflang=["']x-default["']/i.test(generated),
    `Generated ${pathname} is missing x-default alternate`
  );
}

function assertServicesHubHasServiceItemList(locale, serviceSlugs) {
  const pathname = `/${locale}/services`;
  const generated = readGeneratedPage(pathname);
  const expectedServiceUrls = serviceSlugs.map((slug) => `${siteUrl}/${locale}/services/${slug}`);

  assert(
    generated,
    `Generated ${pathname} was not found. Run npm run build before check:seo.`
  );
  assert(
    generated.includes('ItemList') && generated.includes('#services-list'),
    `Generated ${pathname} is missing services ItemList JSON-LD`
  );

  for (const expectedUrl of expectedServiceUrls) {
    assert(
      generated.includes(expectedUrl),
      `Generated ${pathname} services ItemList is missing ${expectedUrl}`
    );
  }
}

function assertSitemapUrlHasLocaleAlternates(sitemapXml, pagePath) {
  const pageUrl = `${siteUrl}${pagePath}`;
  const suffix = pagePath.replace(/^\/(?:fr|en|nl)/, '') || '';
  const urlBlock = sitemapXml.match(
    new RegExp(`<url>[\\s\\S]*?<loc>${escapeRegExp(pageUrl)}<\\/loc>[\\s\\S]*?<\\/url>`)
  )?.[0];

  assert(urlBlock, `Generated sitemap is missing URL block for ${pageUrl}`);

  for (const alternateLocale of locales) {
    const hreflang = hreflangByLocale[alternateLocale] || alternateLocale;
    const alternateUrl = `${siteUrl}/${alternateLocale}${suffix}`;

    assert(
      urlBlock.includes(`hreflang="${hreflang}"`) && urlBlock.includes(`href="${alternateUrl}"`),
      `Generated sitemap URL ${pageUrl} is missing ${hreflang} alternate ${alternateUrl}`
    );
  }

  assert(
    urlBlock.includes('hreflang="x-default"') && urlBlock.includes(`href="${siteUrl}/fr${suffix}"`),
    `Generated sitemap URL ${pageUrl} is missing x-default alternate`
  );
}

const routingSource = readSource('src/i18n/routing.ts');
const servicesSource = readSource('src/lib/content/services.ts');
const offerTracksSource = readSource('src/lib/offer-tracks.ts');
const pageProfilesSource = readSource('src/lib/page-profiles.ts');
const sitemapSource = readSource('src/app/sitemap.ts');
const robotsSource = readSource('src/app/robots.ts');
const seoSource = readSource('src/lib/seo.ts');
const homeSource = readSource('src/app/[locale]/page.tsx');
const servicesIndexSource = readSource('src/app/[locale]/services/page.tsx');
const serviceDetailSource = readSource('src/app/[locale]/services/[slug]/page.tsx');
const servicePageModelSource = readSource('src/lib/content/service-page.ts');
const sitemapUsesCentralizedPageProfiles =
  sitemapSource.includes('getLocalizedSitemapEntries') &&
  pageProfilesSource.includes('STATIC_PAGE_DEFINITIONS') &&
  pageProfilesSource.includes('OFFER_TRACKS');

const locales = extractStringArray(routingSource, 'LOCALES');
const serviceSlugs = extractStringProperties(offerTracksSource, 'slug');
const staticSuffixes = extractStringProperties(pageProfilesSource, 'pathSuffix');
const expectedPaths = locales.flatMap((locale) => [
  ...staticSuffixes.map((suffix) => `/${locale}${suffix}`),
  ...serviceSlugs.map((slug) => `/${locale}/services/${slug}`),
]);
const expectedUrls = expectedPaths.map((item) => `${siteUrl}${item}`);
const expectedLocalizedUrlCount = locales.length * (staticSuffixes.length + serviceSlugs.length);

assert(
  expectedUrls.length === expectedLocalizedUrlCount,
  `Expected ${expectedLocalizedUrlCount} localized URLs, got ${expectedUrls.length}`
);
assert(
  /alternateLinks\s*:\s*false/.test(routingSource),
  'next-intl HTTP alternate Link headers must stay disabled; HTML metadata owns hreflang output'
);
assert(sitemapSource.includes("from '@/i18n/routing'"), 'sitemap.ts must derive locales from routing.locales');
assert(
  sitemapUsesCentralizedPageProfiles ||
    (sitemapSource.includes("from '@/lib/offer-tracks'") && sitemapSource.includes('OFFER_TRACKS')),
  'sitemap.ts must derive service routes from OFFER_TRACKS'
);
assert(
  servicesSource.includes('OFFER_TRACK_SLUGS'),
  'content registry must derive service slugs from OFFER_TRACK_SLUGS'
);
assert(robotsSource.includes('/sitemap.xml'), 'robots.ts must point crawlers to sitemap.xml');
assertSourceContainsAll(seoSource, Object.values(hreflangByLocale), 'src/lib/seo.ts hreflang map');
assert(
  seoSource.includes("languages['x-default']"),
  'src/lib/seo.ts must expose an x-default hreflang alternate'
);
assertSourceContainsAll(
  homeSource,
  ['getHomePageProfile', 'profile.jsonLd'],
  'home page JSON-LD'
);
assertSourceContainsAll(
  servicesIndexSource,
  ['getServicesPageProfile', 'profile.jsonLd'],
  'services hub JSON-LD'
);
assertSourceContainsAll(
  pageProfilesSource,
  ['websiteSchema(locale)', 'webPageSchema(', 'servicesItemListSchema(', 'serviceSchema(', 'breadcrumbSchema('],
  'page profile JSON-LD graph helpers'
);
assertSourceContainsAll(
  servicePageModelSource,
  ['getOfferTrackPageProfile', 'const profile ='],
  'service page model JSON-LD'
);
assertSourceContainsAll(
  serviceDetailSource,
  ['getServicePageMetadata', 'model.profile.jsonLd'],
  'service detail route JSON-LD'
);

for (const pagePath of expectedPaths) {
  assertPageHasLocaleAlternates(pagePath);
}

for (const locale of locales) {
  assertPageHasJsonLd(`/${locale}`);
  assertPageHasJsonLd(`/${locale}/services`);
  assertServicesHubHasServiceItemList(locale, serviceSlugs);
  for (const slug of serviceSlugs) {
    assertPageHasJsonLd(`/${locale}/services/${slug}`);
  }
}

const generatedSitemap = findGeneratedTextFile(
  path.join(root, '.next/server/app'),
  /sitemap\.xml(?:\/[^/]+|\.[^/]+)?\.(?:body|txt|xml)$/
);
const generatedRobots = findGeneratedTextFile(
  path.join(root, '.next/server/app'),
  /robots\.txt(?:\/[^/]+|\.[^/]+)?\.(?:body|txt)$/
);

if (generatedSitemap) {
  const sitemapXml = readFileSync(generatedSitemap, 'utf8');
  const urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((item) => item[1]);

  assert(urls.length === expectedUrls.length, `Generated sitemap has ${urls.length} URLs, expected ${expectedUrls.length}`);

  for (const expectedUrl of expectedUrls) {
    assert(urls.includes(expectedUrl), `Generated sitemap is missing ${expectedUrl}`);
  }

  for (const expectedPath of expectedPaths) {
    assertSitemapUrlHasLocaleAlternates(sitemapXml, expectedPath);
  }

  for (const locale of locales) {
    const localeUrls = urls.filter((url) => url.startsWith(`${siteUrl}/${locale}`));
    assert(
      localeUrls.length === staticSuffixes.length + serviceSlugs.length,
      `Generated sitemap has ${localeUrls.length} URLs for ${locale}, expected ${
        staticSuffixes.length + serviceSlugs.length
      }`
    );
  }
} else {
  throw new Error('Generated sitemap.xml was not found. Run npm run build before check:seo.');
}

if (generatedRobots) {
  const robotsTxt = readFileSync(generatedRobots, 'utf8');
  assert(
    robotsTxt.includes(`Sitemap: ${siteUrl}/sitemap.xml`),
    `Generated robots.txt must include Sitemap: ${siteUrl}/sitemap.xml`
  );
} else {
  throw new Error('Generated robots.txt was not found. Run npm run build before check:seo.');
}

console.log(
  `SEO check passed: ${expectedUrls.length} localized URLs, generated hreflang alternates, JSON-LD, and robots sitemap URL validated.`
);
