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
  if (generated) {
    assert(
      generated.includes('application/ld+json'),
      `Generated page ${pathname} is missing JSON-LD`
    );
    return;
  }

  const sourceByPath = new Map([
    ['', 'src/app/[locale]/page.tsx'],
    ['/services', 'src/app/[locale]/services/page.tsx'],
  ]);
  const serviceDetailMatch = pathname.match(/^\/[a-z]{2}\/services\/([^/]+)$/);
  const sourcePath = serviceDetailMatch
    ? 'src/app/[locale]/services/[slug]/page.tsx'
    : sourceByPath.get(pathname.replace(/^\/[a-z]{2}/, ''));
  assert(sourcePath, `No source assertion configured for ${pathname}`);

  const source = readSource(sourcePath);
  assert(
    source.includes('<JsonLd') && source.includes('data='),
    `${sourcePath} must render JSON-LD for ${pathname}`
  );
}

function assertServicesHubHasServiceItemList(locale, serviceSlugs) {
  const pathname = `/${locale}/services`;
  const generated = readGeneratedPage(pathname);
  const expectedServiceUrls = serviceSlugs.map((slug) => `${siteUrl}/${locale}/services/${slug}`);

  if (generated) {
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

    return;
  }

  assertSourceContainsAll(
    servicesIndexSource,
    ['servicesItemListSchema(', 'services.map((service) => ({', 'slug: service.slug'],
    'services hub ItemList JSON-LD'
  );
  assertSourceContainsAll(servicesIndexSource, serviceSlugs, 'services hub ItemList source slugs');
}

const routingSource = readSource('src/i18n/routing.ts');
const servicesSource = readSource('src/lib/content/services.ts');
const sitemapSource = readSource('src/app/sitemap.ts');
const robotsSource = readSource('src/app/robots.ts');
const seoSource = readSource('src/lib/seo.ts');
const homeSource = readSource('src/app/[locale]/page.tsx');
const servicesIndexSource = readSource('src/app/[locale]/services/page.tsx');
const serviceDetailSource = readSource('src/app/[locale]/services/[slug]/page.tsx');

const locales = extractStringArray(routingSource, 'locales');
const serviceSlugs = extractStringArray(servicesSource, 'SERVICE_SLUGS');
const staticSuffixes = ['', '/services', '/contact'];
const expectedPaths = locales.flatMap((locale) => [
  ...staticSuffixes.map((suffix) => `/${locale}${suffix}`),
  ...serviceSlugs.map((slug) => `/${locale}/services/${slug}`),
]);
const expectedUrls = expectedPaths.map((item) => `${siteUrl}${item}`);

assert(expectedUrls.length === 18, `Expected 18 localized URLs, got ${expectedUrls.length}`);
assert(sitemapSource.includes("from '@/i18n/routing'"), 'sitemap.ts must derive locales from routing.locales');
assert(
  sitemapSource.includes("from '@/lib/content/services'") && sitemapSource.includes('SERVICE_SLUGS'),
  'sitemap.ts must derive service routes from SERVICE_SLUGS'
);
assert(robotsSource.includes('/sitemap.xml'), 'robots.ts must point crawlers to sitemap.xml');
assertSourceContainsAll(seoSource, Object.values(hreflangByLocale), 'src/lib/seo.ts hreflang map');
assert(
  seoSource.includes("languages['x-default']"),
  'src/lib/seo.ts must expose an x-default hreflang alternate'
);
assertSourceContainsAll(
  homeSource,
  ['websiteSchema(locale)', "webPageSchema(locale, '', metadataTitle, metadataDescription)"],
  'home page JSON-LD'
);
assertSourceContainsAll(
  servicesIndexSource,
  [
    "webPageSchema(locale, '/services', title, description)",
    'servicesItemListSchema(',
    'breadcrumbSchema(locale, [',
  ],
  'services hub JSON-LD'
);
assertSourceContainsAll(
  seoSource,
  ["'@type': 'ItemList'", "'@id': `${url}#services-list`", "'@type': 'Service'"],
  'services hub ItemList schema helper'
);
assertSourceContainsAll(
  serviceDetailSource,
  ['webPageSchema(locale, `/services/${slug}`, title, description)', 'serviceSchema(locale, slug, title, description)', 'breadcrumbSchema(locale, ['],
  'service detail JSON-LD'
);

for (const slug of serviceSlugs) {
  for (const locale of locales) {
    const pagePath = `/${locale}/services/${slug}`;
    const generated = readGeneratedPage(pagePath);

    if (generated) {
      for (const alternateLocale of locales) {
        const hreflang = hreflangByLocale[alternateLocale] || alternateLocale;
        const href = `${siteUrl}/${alternateLocale}/services/${slug}`;
        const alternatePattern = new RegExp(
          `<link[^>]+rel=["']alternate["'][^>]+hreflang=["']${escapeRegExp(hreflang)}["'][^>]+href=["']${escapeRegExp(href)}["']|<link[^>]+href=["']${escapeRegExp(href)}["'][^>]+rel=["']alternate["'][^>]+hreflang=["']${escapeRegExp(hreflang)}["']`,
          'i'
        );
        assert(
          alternatePattern.test(generated),
          `Generated ${pagePath} is missing ${hreflang} alternate ${href}`
        );
      }
      assert(
        /<link[^>]+rel=["']alternate["'][^>]+hreflang=["']x-default["']/i.test(generated),
        `Generated ${pagePath} is missing x-default alternate`
      );
    } else {
      assert(
        serviceDetailSource.includes('buildLocalizedPageMetadata') &&
          serviceDetailSource.includes('pathSuffix: `/services/${slug}`') &&
          seoSource.includes('buildLocaleAlternates'),
        `Service route source must derive localized alternates for ${pagePath}`
      );
    }
  }
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
  assert(sitemapSource.includes('staticRouteLastModified.home'), 'sitemap.ts must include localized homepage routes');
  assert(sitemapSource.includes('staticRouteLastModified.services'), 'sitemap.ts must include localized services hub routes');
  assert(sitemapSource.includes('staticRouteLastModified.contact'), 'sitemap.ts must include localized contact routes');
  assert(sitemapSource.includes('SERVICE_SLUGS'), 'sitemap.ts must include localized service detail routes');
}

if (generatedRobots) {
  const robotsTxt = readFileSync(generatedRobots, 'utf8');
  assert(
    robotsTxt.includes(`Sitemap: ${siteUrl}/sitemap.xml`),
    `Generated robots.txt must include Sitemap: ${siteUrl}/sitemap.xml`
  );
} else {
  assert(
    robotsSource.includes('sitemap') && robotsSource.includes('/sitemap.xml'),
    'robots.ts must expose the sitemap URL'
  );
}

console.log(
  `SEO check passed: ${expectedUrls.length} localized URLs, service hreflang alternates, JSON-LD, and robots sitemap URL validated.`
);
