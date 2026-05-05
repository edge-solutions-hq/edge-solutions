import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readSource(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
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

function extractArrayBody(source, exportName) {
  const start = source.indexOf(exportName);
  assert(start >= 0, `Could not find ${exportName}`);

  const assignmentStart = source.indexOf('=', start);
  assert(assignmentStart >= 0, `Could not find ${exportName} assignment`);

  const arrayStart = source.indexOf('[', assignmentStart);
  assert(arrayStart >= 0, `Could not find ${exportName} array`);

  const arrayEnd = findMatchingDelimiter(source, arrayStart, '[', ']');
  return source.slice(arrayStart + 1, arrayEnd);
}

function extractObjectBody(source, propertyName) {
  const match = new RegExp(`\\b${escapeRegExp(propertyName)}\\s*:`).exec(source);
  assert(match, `Could not find ${propertyName} object`);

  const objectStart = source.indexOf('{', match.index);
  assert(objectStart >= 0, `Could not find ${propertyName} object body`);

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

function extractStringArray(source, exportName) {
  const arrayBody = extractArrayBody(source, exportName);
  const values = [...arrayBody.matchAll(/['"]([^'"]+)['"]/g)].map((item) => item[1]);

  assert(values.length > 0, `${exportName} did not contain any string values`);
  return values;
}

function extractStringConstant(source, exportName) {
  const match = new RegExp(`\\b${escapeRegExp(exportName)}\\b[^=]*=\\s*['"]([^'"]+)['"]`).exec(source);
  assert(match, `Could not find ${exportName} string constant`);
  return match[1];
}

function extractStringProperty(source, propertyName) {
  const match = new RegExp(`\\b${escapeRegExp(propertyName)}\\s*:\\s*(['"])([\\s\\S]*?)\\1`).exec(source);
  assert(match, `Could not find ${propertyName} string property`);
  return match[2];
}

function parseLocalizedCopy(objectBody, label) {
  const copy = {};
  const entries = [...objectBody.matchAll(/\b([a-z]{2})\s*:\s*(['"])([\s\S]*?)\2\s*,?/g)];

  assert(entries.length > 0, `${label} did not contain localized copy`);

  for (const [, locale, , value] of entries) {
    copy[locale] = value;
  }

  return copy;
}

function extractStaticPageDefinitions(source) {
  return extractTopLevelObjects(extractArrayBody(source, 'STATIC_PAGE_DEFINITIONS')).map((item) => {
    const id = extractStringProperty(item, 'id');
    const pathSuffix = extractStringProperty(item, 'pathSuffix');
    const title = parseLocalizedCopy(extractObjectBody(item, 'title'), `${id} title`);
    const description = parseLocalizedCopy(
      extractObjectBody(item, 'description'),
      `${id} description`
    );

    return {
      family: id,
      pathSuffix,
      title,
      description,
    };
  });
}

function extractOfferTracks(source) {
  return extractTopLevelObjects(extractArrayBody(source, 'OFFER_TRACKS')).map((item) => ({
    family: extractStringProperty(item, 'slug'),
    slug: extractStringProperty(item, 'slug'),
    pathSuffix: extractStringProperty(item, 'path'),
  }));
}

function extractHreflangByLocale(source) {
  const objectBody = extractObjectBody(source, 'HREFLANG_BY_LOCALE');
  const values = {};

  for (const [, locale, hreflang] of objectBody.matchAll(/\b([a-z]{2})\s*:\s*['"]([^'"]+)['"]/g)) {
    values[locale] = hreflang;
  }

  assert(Object.keys(values).length > 0, 'HREFLANG_BY_LOCALE did not contain any locale mappings');
  return values;
}

function extractSiteUrl(source) {
  return extractStringProperty(source, 'url').replace(/\/$/, '');
}

function extractMdxMetadata(locale, slug) {
  const relativePath = `src/content/${locale}/services/${slug}.mdx`;
  const absolutePath = path.join(root, relativePath);

  assert(existsSync(absolutePath), `Missing localized service content: ${relativePath}`);

  const source = readFileSync(absolutePath, 'utf8');
  const metadataStart = source.indexOf('export const metadata');
  assert(metadataStart >= 0, `${relativePath} is missing metadata export`);

  const objectStart = source.indexOf('{', metadataStart);
  assert(objectStart >= 0, `${relativePath} is missing metadata object`);

  const objectEnd = findMatchingDelimiter(source, objectStart, '{', '}');
  const metadata = source.slice(objectStart + 1, objectEnd);

  return {
    title: extractStringProperty(metadata, 'title'),
    description: extractStringProperty(metadata, 'description'),
  };
}

function buildExpectedPages() {
  const routingSource = readSource('src/i18n/routing.ts');
  const pageProfilesSource = readSource('src/lib/page-profiles.ts');
  const offerTracksSource = readSource('src/lib/offer-tracks.ts');

  const locales = extractStringArray(routingSource, 'LOCALES');
  const defaultLocale = extractStringConstant(routingSource, 'DEFAULT_LOCALE');
  const staticPages = extractStaticPageDefinitions(pageProfilesSource);
  const servicePages = extractOfferTracks(offerTracksSource);
  const routeFamilies = [
    ...staticPages.map((page) => ({kind: 'static', ...page})),
    ...servicePages.map((page) => ({kind: 'service', ...page})),
  ];

  assert(routeFamilies.length > 0, 'Live SEO smoke did not derive any route families');

  const familyCoverage = new Map();
  const pages = routeFamilies.flatMap((family) =>
    locales.map((locale) => {
      const metadata =
        family.kind === 'service'
          ? extractMdxMetadata(locale, family.slug)
          : {
              title: family.title[locale],
              description: family.description[locale],
            };

      assert(metadata.title, `${family.family} is missing ${locale} title`);
      assert(metadata.description, `${family.family} is missing ${locale} description`);

      const familyLocales = familyCoverage.get(family.pathSuffix) ?? new Set();
      familyLocales.add(locale);
      familyCoverage.set(family.pathSuffix, familyLocales);

      return {
        family: family.family,
        locale,
        pathSuffix: family.pathSuffix,
        title: metadata.title,
        description: metadata.description,
      };
    })
  );

  for (const family of routeFamilies) {
    const familyLocales = familyCoverage.get(family.pathSuffix);
    assert(
      familyLocales?.size === locales.length,
      `${family.pathSuffix || '/'} has ${familyLocales?.size ?? 0} localized routes, expected ${locales.length}`
    );
  }

  assert(pages.length > 0, 'Live SEO smoke did not derive any localized URLs');

  return {
    locales,
    defaultLocale,
    pages,
  };
}

function attrsFromTag(tag) {
  const attrs = {};
  const attrPattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

  for (const match of tag.matchAll(attrPattern)) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }

  return attrs;
}

function tags(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))].map((match) => match[0]);
}

function textBetween(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return decodeHtml(match?.[1]?.trim() ?? '');
}

function metaTags(html) {
  return tags(html, 'meta').map(attrsFromTag);
}

function linkTags(html) {
  return tags(html, 'link').map(attrsFromTag);
}

function metaContent(html, name) {
  const content = metaTags(html).find((attrs) => attrs.name?.toLowerCase() === name)?.content?.trim() ?? '';
  return decodeHtml(content);
}

function decodeHtml(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function normalizeText(value) {
  return decodeHtml(value).replace(/\s+/g, ' ').trim();
}

function hasNoindexMeta(html) {
  return metaTags(html).some((attrs) => {
    const name = attrs.name?.toLowerCase();
    return ['robots', 'googlebot', 'bingbot'].includes(name) && /\bnoindex\b/i.test(attrs.content ?? '');
  });
}

function jsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(pattern)) {
    const attrs = attrsFromTag(match[1]);
    if (attrs.type?.toLowerCase() === 'application/ld+json') {
      blocks.push(match[2].trim());
    }
  }

  return blocks;
}

function expectedUrl(siteUrl, locale, suffix) {
  return `${siteUrl}/${locale}${suffix}`;
}

function assertCanonical(html, url) {
  const canonical = linkTags(html).find((attrs) => attrs.rel?.toLowerCase() === 'canonical')?.href;
  assert(canonical, `${url} is missing canonical`);
  assert(canonical === url, `${url} canonical is ${canonical}, expected self-canonical ${url}`);
}

function assertAlternates({html, locale, suffix, url, siteUrl, locales, defaultLocale, hreflangByLocale}) {
  const alternates = linkTags(html).filter((attrs) => attrs.rel?.toLowerCase() === 'alternate');
  const alternatesByHreflang = new Map(
    alternates
      .filter((attrs) => attrs.hreflang && attrs.href)
      .map((attrs) => [attrs.hreflang.toLowerCase(), attrs.href])
  );

  for (const alternateLocale of locales) {
    const hreflang = hreflangByLocale[alternateLocale];
    const href = expectedUrl(siteUrl, alternateLocale, suffix);
    const found = alternatesByHreflang.get(hreflang.toLowerCase());

    assert(found === href, `${url} is missing ${hreflang} alternate ${href}`);
  }

  const defaultHref = expectedUrl(siteUrl, defaultLocale, suffix);
  assert(
    alternatesByHreflang.get('x-default') === defaultHref,
    `${url} is missing x-default alternate ${defaultHref}`
  );

  const selfHreflang = hreflangByLocale[locale].toLowerCase();
  assert(
    alternatesByHreflang.get(selfHreflang) === url,
    `${url} ${hreflangByLocale[locale]} alternate must match the current URL`
  );
}

function assertMetadata(html, page, url) {
  const title = normalizeText(textBetween(html, 'title'));
  assert(title, `${url} is missing title`);
  assert(
    title.includes(normalizeText(page.title)),
    `${url} title is "${title}", expected localized title containing "${page.title}"`
  );

  const description = normalizeText(metaContent(html, 'description'));
  assert(description, `${url} is missing meta description`);
  assert(
    description === normalizeText(page.description),
    `${url} meta description is "${description}", expected "${page.description}"`
  );
}

function assertJsonLd(html, url) {
  const blocks = jsonLdBlocks(html);
  assert(blocks.length > 0, `${url} is missing JSON-LD`);

  for (const block of blocks) {
    try {
      JSON.parse(block);
    } catch (error) {
      throw new Error(`${url} has invalid JSON-LD: ${error.message}`);
    }
  }
}

async function checkUrl({page, siteUrl, locales, defaultLocale, hreflangByLocale}) {
  const url = expectedUrl(siteUrl, page.locale, page.pathSuffix);
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'edge-solutions-live-seo-smoke/1.0',
    },
    redirect: 'follow',
  });

  assert(response.status === 200, `${url} returned HTTP ${response.status}`);
  assert(response.url === url, `${url} resolved to ${response.url}`);

  const robotsHeader = response.headers.get('x-robots-tag') ?? '';
  assert(!/\bnoindex\b/i.test(robotsHeader), `${url} has x-robots-tag noindex`);

  const html = await response.text();
  assert(!hasNoindexMeta(html), `${url} has noindex meta robots`);

  assertMetadata(html, page, url);
  assertCanonical(html, url);
  assertAlternates({
    html,
    locale: page.locale,
    suffix: page.pathSuffix,
    url,
    siteUrl,
    locales,
    defaultLocale,
    hreflangByLocale,
  });
  assertJsonLd(html, url);

  return url;
}

const siteUrl = extractSiteUrl(readSource('src/lib/site.ts'));
const hreflangByLocale = extractHreflangByLocale(readSource('src/lib/seo.ts'));
const {locales, defaultLocale, pages} = buildExpectedPages();
const checked = [];

for (const page of pages) {
  checked.push(await checkUrl({page, siteUrl, locales, defaultLocale, hreflangByLocale}));
}

console.log(
  `Live SEO smoke passed: ${checked.length} source-derived production URLs returned 200 with indexable self-canonical pages, localized title and description, JSON-LD, FR/EN/NL hreflang, and x-default.`
);
