import {getLiveSeoSourceFacts} from './seo-source-facts.mjs';

const {
  locales,
  defaultLocale,
  hreflangByLocale,
  urlChecks,
} = getLiveSeoSourceFacts();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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

function textBetween(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return normalizeText(match?.[1] ?? '');
}

function metaTags(html) {
  return tags(html, 'meta').map(attrsFromTag);
}

function linkTags(html) {
  return tags(html, 'link').map(attrsFromTag);
}

function metaContent(html, name) {
  const content = metaTags(html).find((attrs) => attrs.name?.toLowerCase() === name)?.content?.trim() ?? '';
  return normalizeText(content);
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

function expectedUrl(locale, suffix) {
  return urlChecks.find((check) => check.locale === locale && check.suffix === suffix)?.url ?? '';
}

function assertCanonical(html, url) {
  const canonical = linkTags(html).find((attrs) => attrs.rel?.toLowerCase() === 'canonical')?.href;
  assert(canonical, `${url} is missing canonical`);
  assert(canonical === url, `${url} canonical is ${canonical}, expected self-canonical ${url}`);
}

function assertAlternates(html, locale, suffix, url) {
  const alternates = linkTags(html).filter((attrs) => attrs.rel?.toLowerCase() === 'alternate');
  const alternatesByHreflang = new Map(
    alternates
      .filter((attrs) => attrs.hreflang && attrs.href)
      .map((attrs) => [attrs.hreflang.toLowerCase(), attrs.href])
  );

  for (const alternateLocale of locales) {
    const hreflang = hreflangByLocale[alternateLocale];
    const href = expectedUrl(alternateLocale, suffix);
    const found = alternatesByHreflang.get(hreflang.toLowerCase());

    assert(found === href, `${url} is missing ${hreflang} alternate ${href}`);
  }

  const defaultHref = expectedUrl(defaultLocale, suffix);
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

function assertMetadata(html, {title: expectedTitle, description: expectedDescription, url}) {
  const title = textBetween(html, 'title');
  assert(title, `${url} is missing title`);
  assert(
    title.includes(normalizeText(expectedTitle)),
    `${url} title is "${title}", expected localized title containing "${expectedTitle}"`
  );

  const description = metaContent(html, 'description');
  assert(description, `${url} is missing meta description`);
  assert(
    description === normalizeText(expectedDescription),
    `${url} meta description is "${description}", expected "${expectedDescription}"`
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

async function checkUrl(urlCheck) {
  const {locale, suffix, url} = urlCheck;
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

  assertMetadata(html, urlCheck);
  assertCanonical(html, url);
  assertAlternates(html, locale, suffix, url);
  assertJsonLd(html, url);

  return url;
}

const checked = [];

for (const urlCheck of urlChecks) {
  checked.push(await checkUrl(urlCheck));
}

console.log(
  `Live SEO smoke passed: ${checked.length} source-derived production URLs returned 200 with indexable self-canonical pages, localized title and description, JSON-LD, locale hreflang, and x-default.`
);
