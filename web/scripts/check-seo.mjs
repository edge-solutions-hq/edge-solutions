import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteUrl = 'https://edge-solutions.be';

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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const routingSource = readSource('src/i18n/routing.ts');
const servicesSource = readSource('src/lib/content/services.ts');
const sitemapSource = readSource('src/app/sitemap.ts');
const robotsSource = readSource('src/app/robots.ts');

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

console.log(`SEO check passed: ${expectedUrls.length} localized URLs and robots sitemap URL validated.`);
