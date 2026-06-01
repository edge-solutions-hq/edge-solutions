import {getLiveSeoSourceFacts} from './seo-source-facts.mjs';

const {
  expectedUrls,
  localizedRoutes,
  locales,
  serviceSlugs,
  servicesRouteFamilyChecks,
  siteUrl,
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

function flattenJsonLd(value) {
  if (Array.isArray(value)) {
    return value.flatMap(flattenJsonLd);
  }

  if (value && typeof value === 'object') {
    const graph = Array.isArray(value['@graph']) ? value['@graph'].flatMap(flattenJsonLd) : [];
    return [value, ...graph];
  }

  return [];
}

function jsonLdObjects(html, url) {
  const blocks = jsonLdBlocks(html);
  assert(blocks.length > 0, `${url} is missing JSON-LD`);

  return blocks.flatMap((block) => {
    try {
      return flattenJsonLd(JSON.parse(block));
    } catch (error) {
      throw new Error(`${url} has invalid JSON-LD: ${error.message}`);
    }
  });
}

function hasSchemaType(item, type) {
  const schemaType = item?.['@type'];
  return Array.isArray(schemaType) ? schemaType.includes(type) : schemaType === type;
}

async function fetchTextAsset(url, {accept, expectedContentType}) {
  const response = await fetch(url, {
    headers: {
      accept,
      'user-agent': 'edge-solutions-live-seo-smoke/1.0',
    },
    redirect: 'follow',
  });

  assert(response.status === 200, `${url} returned HTTP ${response.status}`);
  assert(response.url === url, `${url} resolved to ${response.url}`);

  const contentType = response.headers.get('content-type') ?? '';
  assert(
    expectedContentType.test(contentType),
    `${url} returned content-type "${contentType}", expected ${expectedContentType}`
  );

  return response.text();
}

async function checkRobotsTxt() {
  const robotsUrl = `${siteUrl}/robots.txt`;
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const robotsTxt = await fetchTextAsset(robotsUrl, {
    accept: 'text/plain',
    expectedContentType: /^text\/plain\b/i,
  });

  assert(
    robotsTxt.includes(`Sitemap: ${sitemapUrl}`),
    `${robotsUrl} must include Sitemap: ${sitemapUrl}`
  );

  return robotsUrl;
}

function parseSitemapUrlBlocks(sitemapXml, sitemapUrl) {
  assert(/<\?xml\b/i.test(sitemapXml), `${sitemapUrl} is missing an XML declaration`);
  assert(/<urlset\b/i.test(sitemapXml), `${sitemapUrl} is missing a urlset root`);

  return [...sitemapXml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].map((match) => {
    const block = match[0];
    const loc = normalizeText(match[1].match(/<loc>([\s\S]*?)<\/loc>/i)?.[1] ?? '');
    const alternates = tags(block, 'xhtml:link')
      .map(attrsFromTag)
      .filter((attrs) => attrs.rel?.toLowerCase() === 'alternate' && attrs.hreflang && attrs.href);

    assert(loc, `${sitemapUrl} has a URL block without loc`);

    return {
      block,
      loc,
      alternates,
    };
  });
}

function assertSitemapAlternates(sitemapEntry, route, sitemapUrl) {
  const alternatesByHreflang = new Map(
    sitemapEntry.alternates.map((alternate) => [alternate.hreflang.toLowerCase(), alternate.href])
  );

  for (const alternate of route.alternates.byLocale) {
    const found = alternatesByHreflang.get(alternate.hreflang.toLowerCase());

    assert(
      found === alternate.url,
      `${sitemapUrl} URL ${route.url} is missing ${alternate.hreflang} alternate ${alternate.url}`
    );
  }

  assert(
    alternatesByHreflang.get('x-default') === route.alternates.xDefault.url,
    `${sitemapUrl} URL ${route.url} is missing x-default alternate ${route.alternates.xDefault.url}`
  );
}

async function checkSitemapXml() {
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const sitemapXml = await fetchTextAsset(sitemapUrl, {
    accept: 'application/xml,text/xml',
    expectedContentType: /\b(?:application|text)\/xml\b/i,
  });
  const sitemapEntries = parseSitemapUrlBlocks(sitemapXml, sitemapUrl);
  const sitemapUrls = sitemapEntries.map((entry) => entry.loc);
  const sitemapEntriesByUrl = new Map(sitemapEntries.map((entry) => [entry.loc, entry]));

  assert(
    sitemapUrls.length === expectedUrls.length,
    `${sitemapUrl} has ${sitemapUrls.length} URLs, expected ${expectedUrls.length}`
  );

  for (const expectedUrl of expectedUrls) {
    assert(sitemapEntriesByUrl.has(expectedUrl), `${sitemapUrl} is missing ${expectedUrl}`);
  }

  for (const route of localizedRoutes) {
    assertSitemapAlternates(sitemapEntriesByUrl.get(route.url), route, sitemapUrl);
  }

  return sitemapUrl;
}

async function checkLlmsTxt() {
  const llmsUrl = `${siteUrl}/llms.txt`;
  const response = await fetch(llmsUrl, {
    headers: {
      accept: 'text/plain',
      'user-agent': 'edge-solutions-live-seo-smoke/1.0',
    },
    redirect: 'follow',
  });

  assert(response.status === 200, `${llmsUrl} returned HTTP ${response.status}`);
  assert(response.url === llmsUrl, `${llmsUrl} resolved to ${response.url}`);

  const contentType = response.headers.get('content-type') ?? '';
  assert(/^text\/plain\b/i.test(contentType), `${llmsUrl} returned content-type "${contentType}"`);

  const robotsHeader = response.headers.get('x-robots-tag') ?? '';
  assert(/\bnoindex\b/i.test(robotsHeader), `${llmsUrl} must send X-Robots-Tag: noindex`);

  const text = await response.text();
  assert(text.includes('# Edge Solutions'), `${llmsUrl} is missing the site heading`);
  for (const expectedUrl of expectedUrls) {
    assert(text.includes(expectedUrl), `${llmsUrl} is missing ${expectedUrl}`);
  }

  return llmsUrl;
}

function assertCanonical(html, url) {
  const canonical = linkTags(html).find((attrs) => attrs.rel?.toLowerCase() === 'canonical')?.href;
  assert(canonical, `${url} is missing canonical`);
  assert(canonical === url, `${url} canonical is ${canonical}, expected self-canonical ${url}`);
}

function assertAlternates(html, route) {
  const alternates = linkTags(html).filter((attrs) => attrs.rel?.toLowerCase() === 'alternate');
  const alternatesByHreflang = new Map(
    alternates
      .filter((attrs) => attrs.hreflang && attrs.href)
      .map((attrs) => [attrs.hreflang.toLowerCase(), attrs.href])
  );

  for (const alternate of route.alternates.byLocale) {
    const found = alternatesByHreflang.get(alternate.hreflang.toLowerCase());

    assert(found === alternate.url, `${route.url} is missing ${alternate.hreflang} alternate ${alternate.url}`);
  }

  assert(
    alternatesByHreflang.get('x-default') === route.alternates.xDefault.url,
    `${route.url} is missing x-default alternate ${route.alternates.xDefault.url}`
  );

  const selfHreflang = route.alternates.byLocale
    .find((alternate) => alternate.locale === route.locale)
    ?.hreflang.toLowerCase();
  assert(
    selfHreflang && alternatesByHreflang.get(selfHreflang) === route.url,
    `${route.url} self hreflang alternate must match the current URL`
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

function objectTypes(item) {
  const type = item?.['@type'];
  return Array.isArray(type) ? type : [type].filter(Boolean);
}

function findJsonLdType(objects, type) {
  return objects.find((item) => objectTypes(item).includes(type));
}

function assertWebPageJsonLd(webPage, route) {
  assert(webPage, `${route.url} is missing WebPage JSON-LD`);
  assert(webPage['@id'] === `${route.url}#webpage`, `${route.url} WebPage has unexpected @id`);
  assert(webPage.url === route.url, `${route.url} WebPage has unexpected url`);
  assert(webPage.name === route.title, `${route.url} WebPage has unexpected name`);
  assert(webPage.description === route.description, `${route.url} WebPage has unexpected description`);
  assert(webPage.inLanguage === route.locale, `${route.url} WebPage has unexpected inLanguage`);
}

function assertServicesHubJsonLd(itemList, route) {
  assert(itemList, `${route.url} is missing ItemList JSON-LD`);
  assert(itemList['@id'] === `${route.url}#services-list`, `${route.url} ItemList has unexpected @id`);
  assert(itemList.inLanguage === route.locale, `${route.url} ItemList has unexpected inLanguage`);
  assert(Array.isArray(itemList.itemListElement), `${route.url} ItemList itemListElement must be an array`);

  const expectedServiceUrls = serviceSlugs.map((slug) => `${siteUrl}/${route.locale}/services/${slug}`);
  for (const expectedUrl of expectedServiceUrls) {
    assert(
      itemList.itemListElement.some((item) => item?.url === expectedUrl || item?.item?.url === expectedUrl),
      `${route.url} ItemList is missing ${expectedUrl}`
    );
  }
}

function assertServiceJsonLd(service, route) {
  assert(service, `${route.url} is missing Service JSON-LD`);
  assert(service['@id'] === `${route.url}#service`, `${route.url} Service has unexpected @id`);
  assert(service.url === route.url, `${route.url} Service has unexpected url`);
  assert(service.name === route.title, `${route.url} Service has unexpected name`);
  assert(service.description === route.description, `${route.url} Service has unexpected description`);
  assert(service.inLanguage === route.locale, `${route.url} Service has unexpected inLanguage`);
  assert(service.serviceType === route.schemaServiceType, `${route.url} Service has unexpected serviceType`);
  assert(service.category === route.slug, `${route.url} Service has unexpected category`);
  assert(service.provider?.['@id'] === `${siteUrl}#organization`, `${route.url} Service has unexpected provider`);
}

function assertBreadcrumbJsonLd(breadcrumb, route) {
  assert(breadcrumb, `${route.url} is missing BreadcrumbList JSON-LD`);
  assert(Array.isArray(breadcrumb.itemListElement), `${route.url} BreadcrumbList itemListElement must be an array`);
  assert(breadcrumb.itemListElement.length >= 2, `${route.url} BreadcrumbList must contain at least 2 items`);
}

function assertFaqJsonLd(faqPage, route) {
  assert(faqPage, `${route.url} is missing FAQPage JSON-LD`);
  assert(faqPage['@id'] === `${route.url}#faq`, `${route.url} FAQPage has unexpected @id`);
  assert(faqPage.url === route.url, `${route.url} FAQPage has unexpected url`);
  assert(faqPage.inLanguage === route.locale, `${route.url} FAQPage has unexpected inLanguage`);
  assert(Array.isArray(faqPage.mainEntity), `${route.url} FAQPage mainEntity must be an array`);
  assert(faqPage.mainEntity.length > 0, `${route.url} FAQPage mainEntity must not be empty`);
}

function assertJsonLd(html, route) {
  const objects = jsonLdObjects(html, route.url);

  for (const expectedType of route.expectedJsonLdTypes) {
    assert(findJsonLdType(objects, expectedType), `${route.url} is missing ${expectedType} JSON-LD`);
  }

  if (route.family === 'services' || route.kind === 'service') {
    assertWebPageJsonLd(findJsonLdType(objects, 'WebPage'), route);
    assertBreadcrumbJsonLd(findJsonLdType(objects, 'BreadcrumbList'), route);
  }

  if (route.family === 'services') {
    assertServicesHubJsonLd(findJsonLdType(objects, 'ItemList'), route);
  }

  if (route.kind === 'service') {
    assertServiceJsonLd(findJsonLdType(objects, 'Service'), route);
    assertFaqJsonLd(findJsonLdType(objects, 'FAQPage'), route);
  }
}

function assertSchemaObject(objects, type, url) {
  const object = objects.find((item) => hasSchemaType(item, type));
  assert(object, `${url} is missing ${type} JSON-LD`);
  return object;
}

function assertClaimSafeServiceSchema(service, url) {
  const unsupportedProperties = [
    'aggregateRating',
    'award',
    'awards',
    'brand',
    'certification',
    'hasCredential',
    'price',
    'priceCurrency',
    'priceRange',
    'review',
  ];

  for (const property of unsupportedProperties) {
    assert(
      service[property] === undefined,
      `${url} Service JSON-LD must not emit unsupported ${property} claims`
    );
  }

  assert(service.offers?.price === undefined, `${url} Service offer must not emit unsupported price claims`);
  assert(
    service.offers?.priceCurrency === undefined,
    `${url} Service offer must not emit unsupported priceCurrency claims`
  );
  assert(
    service.offers?.priceSpecification === undefined,
    `${url} Service offer must not emit unsupported priceSpecification claims`
  );
}

function assertJsonLdGraph(html, route) {
  const objects = jsonLdObjects(html, route.url);

  const organization = assertSchemaObject(objects, 'ProfessionalService', route.url);
  assert(
    organization['@id'] === `${siteUrl}#organization`,
    `${route.url} ProfessionalService JSON-LD has unexpected @id`
  );

  const person = assertSchemaObject(objects, 'Person', route.url);
  assert(person['@id'] === `${siteUrl}#gil-guminski`, `${route.url} Person JSON-LD has unexpected @id`);
  assert(
    person.worksFor?.['@id'] === `${siteUrl}#organization`,
    `${route.url} Person JSON-LD must reference the organization`
  );

  const webpage = assertSchemaObject(objects, 'WebPage', route.url);
  assert(webpage['@id'] === `${route.url}#webpage`, `${route.url} WebPage JSON-LD has unexpected @id`);
  assert(webpage.url === route.url, `${route.url} WebPage JSON-LD has unexpected url`);
  assert(webpage.inLanguage === route.locale, `${route.url} WebPage JSON-LD has unexpected inLanguage`);
  assert(webpage.dateModified === route.lastModified, `${route.url} WebPage JSON-LD has unexpected dateModified`);
  assert(
    webpage.about?.['@id'] === `${siteUrl}#organization`,
    `${route.url} WebPage JSON-LD must reference the organization`
  );

  if (route.suffix === '') {
    const website = assertSchemaObject(objects, 'WebSite', route.url);
    assert(website['@id'] === `${route.url}#website`, `${route.url} WebSite JSON-LD has unexpected @id`);
    assert(website.url === route.url, `${route.url} WebSite JSON-LD has unexpected url`);
  }

  if (route.suffix === '/services') {
    const itemList = assertSchemaObject(objects, 'ItemList', route.url);
    assert(itemList['@id'] === `${route.url}#services-list`, `${route.url} ItemList JSON-LD has unexpected @id`);
    assert(
      Array.isArray(itemList.itemListElement) && itemList.itemListElement.length > 0,
      `${route.url} ItemList JSON-LD must include service entries`
    );
  }

  if (route.kind === 'service') {
    const service = assertSchemaObject(objects, 'Service', route.url);
    assert(service['@id'] === `${route.url}#service`, `${route.url} Service JSON-LD has unexpected @id`);
    assert(service.url === route.url, `${route.url} Service JSON-LD has unexpected url`);
    assert(service.inLanguage === route.locale, `${route.url} Service JSON-LD has unexpected inLanguage`);
    assert(service.dateModified === route.lastModified, `${route.url} Service JSON-LD has unexpected dateModified`);
    assert(service.serviceType === route.schemaServiceType, `${route.url} Service JSON-LD has unexpected type`);
    assert(
      service.provider?.['@id'] === `${siteUrl}#organization`,
      `${route.url} Service JSON-LD must reference the organization`
    );
    assertClaimSafeServiceSchema(service, route.url);

    const faqPage = assertSchemaObject(objects, 'FAQPage', route.url);
    assert(faqPage['@id'] === `${route.url}#faq`, `${route.url} FAQPage JSON-LD has unexpected @id`);
    assert(faqPage.url === route.url, `${route.url} FAQPage JSON-LD has unexpected url`);
    assert(
      Array.isArray(faqPage.mainEntity) && faqPage.mainEntity.length > 0,
      `${route.url} FAQPage JSON-LD must include questions`
    );
  }
}

async function checkUrl(urlCheck) {
  const {url} = urlCheck;
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
  assertAlternates(html, urlCheck);
  assertJsonLd(html, urlCheck);
  assertJsonLdGraph(html, urlCheck);

  return url;
}

const checked = [];
const checkedServicesRoutes = [];

const checkedRobots = await checkRobotsTxt();
const checkedSitemap = await checkSitemapXml();
const checkedLlmsTxt = await checkLlmsTxt();

for (const urlCheck of urlChecks) {
  checked.push(await checkUrl(urlCheck));
  if (servicesRouteFamilyChecks.some((route) => route.url === urlCheck.url)) {
    checkedServicesRoutes.push(urlCheck);
  }
}

for (const locale of locales) {
  const localeServicesRoutes = checkedServicesRoutes.filter((route) => route.locale === locale);
  assert(
    localeServicesRoutes.some((route) => route.family === 'services' && route.suffix === '/services'),
    `Live SEO smoke did not check ${locale} services hub`
  );

  for (const slug of serviceSlugs) {
    assert(
      localeServicesRoutes.some((route) => route.kind === 'service' && route.slug === slug),
      `Live SEO smoke did not check ${locale} services/${slug}`
    );
  }
}

console.log(
  `Live SEO smoke passed: ${checked.length} source-derived production URLs returned 200 with indexable self-canonical pages, localized title and description, typed JSON-LD graphs, locale hreflang, and x-default; ${checkedServicesRoutes.length} localized services-family URLs covered FR/EN/NL typed JSON-LD; ${checkedRobots} references ${checkedSitemap}; ${checkedLlmsTxt} lists the source-derived URLs; sitemap has ${expectedUrls.length} source-derived URLs with localized alternates and x-default.`
);
