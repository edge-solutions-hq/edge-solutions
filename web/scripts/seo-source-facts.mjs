import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

const defaultRoot = path.resolve(import.meta.dirname, '..');

function readSource(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function unique(values) {
  return [...new Set(values)];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findMatchingDelimiter(source, startIndex, open, close) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }

    if (character === open) depth += 1;
    if (character === close) depth -= 1;
    if (depth === 0) return index;
  }

  throw new Error(`Could not find matching ${close}`);
}

function extractArrayBody(source, exportName, sourceName) {
  const start = source.indexOf(exportName);
  if (start < 0) throw new Error(`${sourceName} is missing ${exportName}`);

  const assignmentStart = source.indexOf('=', start);
  if (assignmentStart < 0) throw new Error(`${sourceName} is missing ${exportName} assignment`);

  const arrayStart = source.indexOf('[', assignmentStart);
  if (arrayStart < 0) throw new Error(`${sourceName} is missing ${exportName} array`);

  const arrayEnd = findMatchingDelimiter(source, arrayStart, '[', ']');
  return source.slice(arrayStart + 1, arrayEnd);
}

function extractObjectBody(source, propertyName, sourceName) {
  const match = new RegExp(`\\b${escapeRegExp(propertyName)}\\s*:`).exec(source);
  if (!match) throw new Error(`${sourceName} is missing ${propertyName}`);

  const objectStart = source.indexOf('{', match.index);
  if (objectStart < 0) throw new Error(`${sourceName} is missing ${propertyName} body`);

  const objectEnd = findMatchingDelimiter(source, objectStart, '{', '}');
  return source.slice(objectStart + 1, objectEnd);
}

function extractTopLevelObjects(arrayBody) {
  const objects = [];

  for (let index = 0; index < arrayBody.length; index += 1) {
    if (arrayBody[index] !== '{') continue;

    const objectEnd = findMatchingDelimiter(arrayBody, index, '{', '}');
    objects.push(arrayBody.slice(index, objectEnd + 1));
    index = objectEnd;
  }

  return objects;
}

function extractStringProperty(source, propertyName, sourceName) {
  const match = source.match(new RegExp(`\\b${propertyName}\\s*:\\s*(['"])([\\s\\S]*?)\\1`));
  if (!match) throw new Error(`${sourceName} is missing ${propertyName}`);
  return match[2];
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

function parseLocalizedCopy(objectBody, label) {
  const copy = {};
  const entries = [...objectBody.matchAll(/\b([a-z]{2})\s*:\s*(['"])([\s\S]*?)\2\s*,?/g)];

  if (entries.length === 0) throw new Error(`${label} did not contain localized copy`);

  for (const [, locale, , value] of entries) {
    copy[locale] = value;
  }

  return copy;
}

function extractStaticPageDefinitions(source, sourceName) {
  const arrayBody = extractArrayBody(source, 'STATIC_PAGE_DEFINITIONS', sourceName);

  return extractTopLevelObjects(arrayBody).map((item) => {
    const id = extractStringProperty(item, 'id', sourceName);
    const pathSuffix = extractStringProperty(item, 'pathSuffix', sourceName);
    const title = parseLocalizedCopy(extractObjectBody(item, 'title', sourceName), `${id} title`);
    const description = parseLocalizedCopy(extractObjectBody(item, 'description', sourceName), `${id} description`);

    return {
      family: id,
      kind: 'static',
      pathSuffix,
      title,
      description,
    };
  });
}

function extractOfferTrackSlugs(source, sourceName) {
  const tracksMatch = source.match(/\bOFFER_TRACKS\b[^=]*=\s*\[([\s\S]*?)\];/);
  if (!tracksMatch) throw new Error(`${sourceName} is missing OFFER_TRACKS`);

  const slugs = [...tracksMatch[1].matchAll(/\bslug:\s*'([^']+)'/g)].map((item) => item[1]);
  if (slugs.length === 0) throw new Error(`${sourceName} has no offer track slugs`);
  return unique(slugs);
}

function extractOfferTracks(source, sourceName) {
  const arrayBody = extractArrayBody(source, 'OFFER_TRACKS', sourceName);

  return extractTopLevelObjects(arrayBody).map((item) => ({
    family: extractStringProperty(item, 'slug', sourceName),
    kind: 'service',
    slug: extractStringProperty(item, 'slug', sourceName),
    pathSuffix: extractStringProperty(item, 'path', sourceName),
  }));
}

function extractMdxMetadata(root, locale, slug) {
  const relativePath = `src/content/${locale}/services/${slug}.mdx`;
  const absolutePath = path.join(root, relativePath);

  if (!existsSync(absolutePath)) throw new Error(`Missing localized service content: ${relativePath}`);

  const source = readFileSync(absolutePath, 'utf8');
  const metadataStart = source.indexOf('export const metadata');
  if (metadataStart < 0) throw new Error(`${relativePath} is missing metadata export`);

  const objectStart = source.indexOf('{', metadataStart);
  if (objectStart < 0) throw new Error(`${relativePath} is missing metadata object`);

  const objectEnd = findMatchingDelimiter(source, objectStart, '{', '}');
  const metadata = source.slice(objectStart + 1, objectEnd);

  return {
    title: extractStringProperty(metadata, 'title', relativePath),
    description: extractStringProperty(metadata, 'description', relativePath),
  };
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
  const staticPages = extractStaticPageDefinitions(pageProfilesSource, 'src/lib/page-profiles.ts');
  const servicePages = extractOfferTracks(offerTracksSource, 'src/lib/offer-tracks.ts');
  const routeFamilies = [...staticPages, ...servicePages];
  const servicePageSuffixes = serviceSlugs.map((slug) => `/services/${slug}`);
  const pageSuffixes = unique([...staticPageSuffixes, ...servicePageSuffixes]);
  const expectedPaths = pageSuffixes.flatMap((suffix) => locales.map((locale) => localizedPath(locale, suffix)));
  const expectedUrls = expectedPaths.map((item) => `${siteUrl}${item}`);
  const urlChecks = routeFamilies.flatMap((family) =>
    locales.map((locale) => {
      const metadata =
        family.kind === 'service'
          ? extractMdxMetadata(root, locale, family.slug)
          : {
              title: family.title[locale],
              description: family.description[locale],
            };

      if (!metadata.title) throw new Error(`${family.family} is missing ${locale} title`);
      if (!metadata.description) throw new Error(`${family.family} is missing ${locale} description`);

      return {
        family: family.family,
        locale,
        suffix: family.pathSuffix,
        path: localizedPath(locale, family.pathSuffix),
        url: `${siteUrl}${localizedPath(locale, family.pathSuffix)}`,
        title: metadata.title,
        description: metadata.description,
      };
    })
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
