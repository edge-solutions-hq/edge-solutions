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

function extractDateIsoProperty(source, propertyName, sourceName) {
  const match = source.match(new RegExp(`\\b${propertyName}\\s*:\\s*new Date\\((['"])([\\s\\S]*?)\\1\\)`));
  if (!match) throw new Error(`${sourceName} is missing ${propertyName}`);
  return new Date(match[2]).toISOString();
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
    const lastModified = extractDateIsoProperty(item, 'lastModified', sourceName);
    const title = parseLocalizedCopy(extractObjectBody(item, 'title', sourceName), `${id} title`);
    const description = parseLocalizedCopy(extractObjectBody(item, 'description', sourceName), `${id} description`);

    return {
      family: id,
      kind: 'static',
      pathSuffix,
      lastModified,
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
    schemaServiceType: extractStringProperty(item, 'schemaServiceType', sourceName),
    lastModified: extractDateIsoProperty(item, 'lastModified', sourceName),
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

export function localizedPath(locale, suffix) {
  return `/${locale}${suffix}`;
}

function localizedAlternates({siteUrl, locales, defaultLocale, hreflangByLocale, suffix}) {
  const byLocale = locales.map((locale) => {
    const path = localizedPath(locale, suffix);
    return {
      locale,
      hreflang: hreflangByLocale[locale] ?? locale,
      path,
      url: `${siteUrl}${path}`,
    };
  });
  const defaultAlternate = byLocale.find((alternate) => alternate.locale === defaultLocale);

  if (!defaultAlternate) throw new Error(`Default locale ${defaultLocale} is not present in locales`);

  return {
    byLocale,
    xDefault: {
      ...defaultAlternate,
      hreflang: 'x-default',
    },
  };
}

export function stripLocalizedPathPrefix(pathname, locales) {
  const prefixPattern = new RegExp(`^/(?:${locales.map(escapeRegExp).join('|')})(?=/|$)`);
  return pathname.replace(prefixPattern, '') || '';
}

function buildLocalizedRouteFacts({siteUrl, locales, defaultLocale, hreflangByLocale, routeFamilies, metadataFor}) {
  return routeFamilies.flatMap((family) =>
    locales.map((locale) => {
      const metadata = metadataFor(family, locale);
      const path = localizedPath(locale, family.pathSuffix);
      const url = `${siteUrl}${path}`;

      if (!metadata.title) throw new Error(`${family.family} is missing ${locale} title`);
      if (!metadata.description) throw new Error(`${family.family} is missing ${locale} description`);

      return {
        family: family.family,
        kind: family.kind,
        slug: family.slug,
        schemaServiceType: family.schemaServiceType,
        locale,
        suffix: family.pathSuffix,
        path,
        url,
        canonicalUrl: url,
        alternates: localizedAlternates({
          siteUrl,
          locales,
          defaultLocale,
          hreflangByLocale,
          suffix: family.pathSuffix,
        }),
        expectedJsonLdTypes: expectedJsonLdTypesForRouteFamily(family),
        lastModified: family.lastModified,
        title: metadata.title,
        description: metadata.description,
      };
    })
  );
}

function normalizeMetadataValue(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()
    .toLowerCase();
}

function assertServiceMetadataValue({route, field, slugLabel, defaultLocaleValue}) {
  const value = route[field];
  const normalized = normalizeMetadataValue(value);

  if (!normalized) {
    throw new Error(`${route.path} has empty localized service ${field}`);
  }

  const fallbackLooks = [
    normalizeMetadataValue(route.slug),
    normalizeMetadataValue(route.suffix),
    normalizeMetadataValue(slugLabel),
  ].filter(Boolean);

  if (fallbackLooks.includes(normalized)) {
    throw new Error(`${route.path} has fallback-looking localized service ${field}: "${value}"`);
  }

  if (route.locale !== defaultLocaleValue.locale && normalized === defaultLocaleValue.normalized) {
    throw new Error(
      `${route.path} has fallback-looking localized service ${field}: it matches ${defaultLocaleValue.path}`
    );
  }
}

function assertUniqueServiceMetadata(serviceRoutes, field) {
  const byValue = new Map();

  for (const route of serviceRoutes) {
    const normalized = normalizeMetadataValue(route[field]);
    if (!normalized) continue;

    const routes = byValue.get(normalized) ?? [];
    routes.push(route);
    byValue.set(normalized, routes);
  }

  for (const routes of byValue.values()) {
    if (routes.length <= 1) continue;

    throw new Error(
      `Duplicate localized service ${field} metadata: ${routes.map((route) => route.path).join(', ')}`
    );
  }
}

function assertLocalizedServiceMetadataQuality({localizedRoutes, locales, defaultLocale, serviceSlugs}) {
  const serviceRoutes = localizedRoutes.filter((route) => route.kind === 'service');
  const expectedCount = locales.length * serviceSlugs.length;

  if (serviceRoutes.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} localized service metadata checks, got ${serviceRoutes.length}`);
  }

  for (const field of ['title', 'description']) {
    for (const slug of serviceSlugs) {
      const slugRoutes = locales.map((locale) => {
        const route = serviceRoutes.find((item) => item.locale === locale && item.slug === slug);
        if (!route) throw new Error(`Missing localized service metadata check for /${locale}/services/${slug}`);
        return route;
      });
      const defaultLocaleRoute = slugRoutes.find((route) => route.locale === defaultLocale);

      if (!defaultLocaleRoute) {
        throw new Error(`Missing default-locale service metadata check for /${defaultLocale}/services/${slug}`);
      }

      const defaultLocaleValue = {
        locale: defaultLocaleRoute.locale,
        normalized: normalizeMetadataValue(defaultLocaleRoute[field]),
        path: defaultLocaleRoute.path,
      };

      for (const route of slugRoutes) {
        assertServiceMetadataValue({
          route,
          field,
          slugLabel: slug,
          defaultLocaleValue,
        });
      }
    }

    assertUniqueServiceMetadata(serviceRoutes, field);
  }

  return serviceRoutes.map(({locale, slug, path, title, description}) => ({
    locale,
    slug,
    path,
    title,
    description,
  }));
}

function expectedJsonLdTypesForRouteFamily(family) {
  if (family.kind === 'service') {
    return ['WebPage', 'Service', 'BreadcrumbList', 'FAQPage'];
  }

  if (family.family === 'services') {
    return ['WebPage', 'ItemList', 'BreadcrumbList'];
  }

  return ['WebPage'];
}

export function getLiveSeoSourceFacts({root = defaultRoot} = {}) {
  const siteSource = readSource(root, 'src/lib/site/site.ts');
  const routingSource = readSource(root, 'src/i18n/routing.ts');
  const seoSource = readSource(root, 'src/lib/site/seo.ts');
  const pageProfilesSource = readSource(root, 'src/lib/site/page-profiles.ts');
  const offerTracksSource = readSource(root, 'src/lib/offer/offer-tracks.ts');

  const siteUrl = normalizeSiteUrl(extractStringProperty(siteSource, 'url', 'src/lib/site/site.ts'));
  const locales = extractConstStringArray(routingSource, 'LOCALES', 'src/i18n/routing.ts');
  const defaultLocale = extractConstString(routingSource, 'DEFAULT_LOCALE', 'src/i18n/routing.ts');
  const hreflangByLocale = extractStringRecord(seoSource, 'HREFLANG_BY_LOCALE', 'src/lib/site/seo.ts');
  const staticPageSuffixes = extractStaticPageSuffixes(pageProfilesSource, 'src/lib/site/page-profiles.ts');
  const serviceSlugs = extractOfferTrackSlugs(offerTracksSource, 'src/lib/offer/offer-tracks.ts');
  const staticPages = extractStaticPageDefinitions(pageProfilesSource, 'src/lib/site/page-profiles.ts');
  const servicePages = extractOfferTracks(offerTracksSource, 'src/lib/offer/offer-tracks.ts');
  const routeFamilies = [...staticPages, ...servicePages];
  const servicePageSuffixes = serviceSlugs.map((slug) => `/services/${slug}`);
  const pageSuffixes = unique([...staticPageSuffixes, ...servicePageSuffixes]);
  const localizedRoutes = buildLocalizedRouteFacts({
    siteUrl,
    locales,
    defaultLocale,
    hreflangByLocale,
    routeFamilies,
    metadataFor: (family, locale) =>
      family.kind === 'service'
        ? extractMdxMetadata(root, locale, family.slug)
        : {
            title: family.title[locale],
            description: family.description[locale],
          },
  });
  const expectedPaths = localizedRoutes.map((route) => route.path);
  const expectedUrls = localizedRoutes.map((route) => route.url);
  const urlChecks = localizedRoutes;
  const servicesRouteFamilyChecks = localizedRoutes.filter(
    (route) => route.family === 'services' || route.kind === 'service'
  );
  const serviceMetadataChecks = assertLocalizedServiceMetadataQuality({
    localizedRoutes,
    locales,
    defaultLocale,
    serviceSlugs,
  });

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
    routeFamilies,
    localizedRoutes,
    expectedPaths,
    expectedUrls,
    urlChecks,
    servicesRouteFamilyChecks,
    serviceMetadataChecks,
    stripLocalizedPathPrefix: (pathname) => stripLocalizedPathPrefix(pathname, locales),
  };
}
