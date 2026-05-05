import {readFileSync} from 'node:fs';
import path from 'node:path';

const defaultRoot = path.resolve(import.meta.dirname, '..');

function readSource(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function unique(values) {
  return [...new Set(values)];
}

function extractStringProperty(source, propertyName, sourceName) {
  const match = source.match(new RegExp(`\\b${propertyName}:\\s*'([^']+)'`));
  if (!match) throw new Error(`${sourceName} is missing ${propertyName}`);
  return match[1];
}

function extractConstStringArray(source, constName, sourceName) {
  const match = source.match(new RegExp(`\\b${constName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*as const`));
  if (!match) throw new Error(`${sourceName} is missing ${constName}`);
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
}

function extractConstString(source, constName, sourceName) {
  const match = source.match(new RegExp(`\\b${constName}\\s*:[^=]+?=\\s*'([^']+)'`));
  if (match) return match[1];

  const fallback = source.match(new RegExp(`\\b${constName}\\s*=\\s*'([^']+)'`));
  if (!fallback) throw new Error(`${sourceName} is missing ${constName}`);
  return fallback[1];
}

function extractStringRecord(source, constName, sourceName) {
  const match = source.match(new RegExp(`\\b${constName}\\b[^=]*=\\s*\\{([\\s\\S]*?)\\};`));
  if (!match) throw new Error(`${sourceName} is missing ${constName}`);

  return Object.fromEntries(
    [...match[1].matchAll(/([A-Za-z0-9_-]+)\s*:\s*'([^']+)'/g)].map((item) => [item[1], item[2]])
  );
}

function extractStaticPageSuffixes(source, sourceName) {
  const definitionMatch = source.match(/\bSTATIC_PAGE_DEFINITIONS\b[^=]*=\s*\[([\s\S]*?)\];/);
  if (!definitionMatch) throw new Error(`${sourceName} is missing STATIC_PAGE_DEFINITIONS`);

  const suffixes = [...definitionMatch[1].matchAll(/\bpathSuffix:\s*'([^']*)'/g)].map((item) => item[1]);
  if (suffixes.length === 0) throw new Error(`${sourceName} has no static page pathSuffix values`);
  return unique(suffixes);
}

function extractOfferTrackSlugs(source, sourceName) {
  const tracksMatch = source.match(/\bOFFER_TRACKS\b[^=]*=\s*\[([\s\S]*?)\];/);
  if (!tracksMatch) throw new Error(`${sourceName} is missing OFFER_TRACKS`);

  const slugs = [...tracksMatch[1].matchAll(/\bslug:\s*'([^']+)'/g)].map((item) => item[1]);
  if (slugs.length === 0) throw new Error(`${sourceName} has no offer track slugs`);
  return unique(slugs);
}

function normalizeSiteUrl(url) {
  return url.replace(/\/$/, '');
}

function localizedPath(locale, suffix) {
  return `/${locale}${suffix}`;
}

export function getLiveSeoSourceFacts({root = defaultRoot} = {}) {
  const siteSource = readSource(root, 'src/lib/site.ts');
  const routingSource = readSource(root, 'src/i18n/routing.ts');
  const seoSource = readSource(root, 'src/lib/seo.ts');
  const pageProfilesSource = readSource(root, 'src/lib/page-profiles.ts');
  const offerTracksSource = readSource(root, 'src/lib/offer-tracks.ts');

  const siteUrl = normalizeSiteUrl(extractStringProperty(siteSource, 'url', 'src/lib/site.ts'));
  const locales = extractConstStringArray(routingSource, 'LOCALES', 'src/i18n/routing.ts');
  const defaultLocale = extractConstString(routingSource, 'DEFAULT_LOCALE', 'src/i18n/routing.ts');
  const hreflangByLocale = extractStringRecord(seoSource, 'HREFLANG_BY_LOCALE', 'src/lib/seo.ts');
  const staticPageSuffixes = extractStaticPageSuffixes(pageProfilesSource, 'src/lib/page-profiles.ts');
  const serviceSlugs = extractOfferTrackSlugs(offerTracksSource, 'src/lib/offer-tracks.ts');
  const servicePageSuffixes = serviceSlugs.map((slug) => `/services/${slug}`);
  const pageSuffixes = unique([...staticPageSuffixes, ...servicePageSuffixes]);
  const expectedPaths = pageSuffixes.flatMap((suffix) => locales.map((locale) => localizedPath(locale, suffix)));
  const expectedUrls = expectedPaths.map((item) => `${siteUrl}${item}`);
  const urlChecks = pageSuffixes.flatMap((suffix) =>
    locales.map((locale) => ({
      locale,
      suffix,
      path: localizedPath(locale, suffix),
      url: `${siteUrl}${localizedPath(locale, suffix)}`,
    }))
  );

  return {
    siteUrl,
    locales,
    defaultLocale,
    hreflangByLocale,
    hreflangValues: locales.map((locale) => hreflangByLocale[locale] ?? locale),
    staticPageSuffixes,
    serviceSlugs,
    servicePageSuffixes,
    pageSuffixes,
    expectedPaths,
    expectedUrls,
    urlChecks,
  };
}
