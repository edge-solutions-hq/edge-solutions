import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {getLiveSeoSourceFacts} from './seo-source-facts.mjs';

const root = process.cwd();
const routeFacts = getLiveSeoSourceFacts({root});
const {
  siteUrl,
  locales,
  hreflangByLocale,
  serviceSlugs,
  staticPageSuffixes,
  expectedPaths,
  expectedUrls,
  localizedRoutes,
} = routeFacts;

function readSource(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
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

const htmlAttributeValuePattern = String.raw`[^'"]*`;

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
    `Generated page ${pathname} was not found. Run pnpm run build before check:seo.`
  );
  assert(
    generated.includes('application/ld+json'),
    `Generated page ${pathname} is missing JSON-LD`
  );
}

function assertPageHasLocaleAlternates(pathname) {
  const generated = readGeneratedPage(pathname);
  const route = localizedRoutes.find((item) => item.path === pathname);

  assert(
    generated,
    `Generated page ${pathname} was not found. Run pnpm run build before check:seo.`
  );
  assert(route, `No route facts found for generated path ${pathname}`);

  for (const alternate of route.alternates.byLocale) {
    const hrefPattern = `${escapeRegExp(alternate.url)}${htmlAttributeValuePattern.slice(0, 0)}`;
    const alternatePattern = new RegExp(
      `<link[^>]+rel=["']alternate["'][^>]+hreflang=["']${escapeRegExp(alternate.hreflang)}["'][^>]+href=["']${hrefPattern}["'][^>]*>|<link[^>]+href=["']${hrefPattern}["'][^>]+rel=["']alternate["'][^>]+hreflang=["']${escapeRegExp(alternate.hreflang)}["'][^>]*>`,
      'i'
    );

    assert(
      alternatePattern.test(generated),
      `Generated ${pathname} is missing ${alternate.hreflang} alternate ${alternate.url}`
    );
  }

  assert(
    new RegExp(
      `<link[^>]+rel=["']alternate["'][^>]+hreflang=["']x-default["'][^>]+href=["']${escapeRegExp(route.alternates.xDefault.url)}["'][^>]*>|<link[^>]+href=["']${escapeRegExp(route.alternates.xDefault.url)}["'][^>]+rel=["']alternate["'][^>]+hreflang=["']x-default["'][^>]*>`,
      'i'
    ).test(generated),
    `Generated ${pathname} is missing x-default alternate ${route.alternates.xDefault.url}`
  );
}

function assertPageHasCanonical(pathname) {
  const generated = readGeneratedPage(pathname);
  const route = localizedRoutes.find((item) => item.path === pathname);

  assert(
    generated,
    `Generated page ${pathname} was not found. Run pnpm run build before check:seo.`
  );
  assert(route, `No route facts found for generated path ${pathname}`);
  assert(
    new RegExp(
      `<link[^>]+rel=["']canonical["'][^>]+href=["']${escapeRegExp(route.canonicalUrl)}["'][^>]*>|<link[^>]+href=["']${escapeRegExp(route.canonicalUrl)}["'][^>]+rel=["']canonical["'][^>]*>`,
      'i'
    ).test(generated),
    `Generated ${pathname} is missing self-canonical ${route.canonicalUrl}`
  );
}

function jsonLdObjects(pathname) {
  const generated = readGeneratedPage(pathname);
  assert(
    generated,
    `Generated page ${pathname} was not found. Run pnpm run build before check:seo.`
  );

  const objects = [];
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

  for (const match of generated.matchAll(pattern)) {
    const attrs = match[1];
    if (!/\btype=["']application\/ld\+json["']/i.test(attrs)) continue;

    const rawJson = match[2].trim();
    assert(rawJson, `Generated ${pathname} has an empty JSON-LD script`);

    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch (error) {
      throw new Error(`Generated ${pathname} has invalid JSON-LD: ${error.message}`);
    }

    objects.push(...(Array.isArray(parsed) ? parsed : [parsed]));
  }

  return objects;
}

function assertServicePageHasFaqPageSchema(locale, slug) {
  const pathname = `/${locale}/services/${slug}`;
  const url = `${siteUrl}${pathname}`;
  const objects = jsonLdObjects(pathname);
  const faqPage = objects.find((item) => item?.['@type'] === 'FAQPage');

  assert(faqPage, `Generated ${pathname} is missing FAQPage JSON-LD`);
  assert(faqPage['@id'] === `${url}#faq`, `Generated ${pathname} FAQPage has unexpected @id`);
  assert(faqPage.url === url, `Generated ${pathname} FAQPage has unexpected url`);
  assert(faqPage.inLanguage === locale, `Generated ${pathname} FAQPage has unexpected inLanguage`);
  assert(Array.isArray(faqPage.mainEntity), `Generated ${pathname} FAQPage mainEntity must be an array`);
  assert(faqPage.mainEntity.length > 0, `Generated ${pathname} FAQPage mainEntity must not be empty`);

  for (const [index, entity] of faqPage.mainEntity.entries()) {
    assert(entity?.['@type'] === 'Question', `Generated ${pathname} FAQ ${index + 1} must be a Question`);
    assert(
      typeof entity.name === 'string' && entity.name.trim(),
      `Generated ${pathname} FAQ ${index + 1} has an empty question`
    );
    assert(
      entity.acceptedAnswer?.['@type'] === 'Answer',
      `Generated ${pathname} FAQ ${index + 1} must have an Answer`
    );
    assert(
      typeof entity.acceptedAnswer.text === 'string' && entity.acceptedAnswer.text.trim(),
      `Generated ${pathname} FAQ ${index + 1} has an empty answer`
    );
  }
}

function assertPageHasWebPageDateModified(route) {
  const objects = jsonLdObjects(route.path);
  const webPage = objects.find((item) => item?.['@type'] === 'WebPage');

  assert(webPage, `Generated ${route.path} is missing WebPage JSON-LD`);
  assert(
    webPage.dateModified === route.lastModified,
    `Generated ${route.path} WebPage has unexpected dateModified`
  );
}

function assertPageHasPersonSchema(pathname) {
  const objects = jsonLdObjects(pathname);
  const person = objects.find((item) => item?.['@type'] === 'Person');

  assert(person, `Generated ${pathname} is missing Person JSON-LD`);
  assert(
    person['@id'] === `${siteUrl}#gil-guminski`,
    `Generated ${pathname} Person has unexpected @id`
  );
  assert(
    person.worksFor?.['@id'] === `${siteUrl}#organization`,
    `Generated ${pathname} Person must reference the organization`
  );
  assert(Array.isArray(person.sameAs) && person.sameAs.length > 0, `Generated ${pathname} Person is missing sameAs`);
}

function assertServiceSchemaClaimSafety(service, pathname) {
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
      `Generated ${pathname} Service must not emit unsupported ${property} claims`
    );
  }

  assert(
    service.offers?.price === undefined,
    `Generated ${pathname} Service offer must not emit unsupported price claims`
  );
  assert(
    service.offers?.priceCurrency === undefined,
    `Generated ${pathname} Service offer must not emit unsupported priceCurrency claims`
  );
  assert(
    service.offers?.priceSpecification === undefined,
    `Generated ${pathname} Service offer must not emit unsupported priceSpecification claims`
  );
}

function assertServicePageHasOfferTrackServiceSchema(route) {
  assert(route, 'Missing localized service route facts for Service JSON-LD check');

  const {locale, slug, url, path: pathname, schemaServiceType} = route;
  const objects = jsonLdObjects(pathname);
  const service = objects.find((item) => item?.['@type'] === 'Service');

  assert(service, `Generated ${pathname} is missing Service JSON-LD`);
  assert(service['@id'] === `${url}#service`, `Generated ${pathname} Service has unexpected @id`);
  assert(service.url === url, `Generated ${pathname} Service has unexpected url`);
  assert(service.inLanguage === locale, `Generated ${pathname} Service has unexpected inLanguage`);
  assert(service.dateModified === route.lastModified, `Generated ${pathname} Service has unexpected dateModified`);
  assert(
    service.serviceType === schemaServiceType,
    `Generated ${pathname} Service has unexpected serviceType`
  );
  assert(service.category === slug, `Generated ${pathname} Service has unexpected category`);
  assert(
    service.identifier?.['@type'] === 'PropertyValue',
    `Generated ${pathname} Service identifier must be a PropertyValue`
  );
  assert(
    service.identifier?.propertyID === 'edge-solutions:service-offer-track',
    `Generated ${pathname} Service identifier has unexpected propertyID`
  );
  assert(
    service.identifier?.value === `edge-solutions:${locale}:services:${slug}`,
    `Generated ${pathname} Service identifier has unexpected value`
  );
  assert(
    service.provider?.['@id'] === `${siteUrl}#organization`,
    `Generated ${pathname} Service provider has unexpected @id`
  );
  assert(
    Array.isArray(service.areaServed) &&
      service.areaServed.some((item) => item?.['@type'] === 'Country' && item.name === 'Belgium') &&
      service.areaServed.some((item) => item?.['@type'] === 'AdministrativeArea' && item.name === 'Wallonia'),
    `Generated ${pathname} Service has unexpected areaServed`
  );
  assert(
    service.audience?.['@type'] === 'Audience' &&
      typeof service.audience.audienceType === 'string' &&
      service.audience.audienceType.trim(),
    `Generated ${pathname} Service is missing audience details`
  );
  assert(
    Array.isArray(service.serviceOutput) &&
      service.serviceOutput.length >= 3 &&
      service.serviceOutput.every(
        (item) => item?.['@type'] === 'Thing' && typeof item.name === 'string' && item.name.trim()
      ),
    `Generated ${pathname} Service is missing serviceOutput details`
  );
  assert(
    service.offers?.['@type'] === 'Offer' &&
      typeof service.offers.name === 'string' &&
      service.offers.name.trim() &&
      typeof service.offers.description === 'string' &&
      service.offers.description.trim() &&
      service.offers.url === url &&
      service.offers.seller?.['@id'] === `${siteUrl}#organization` &&
      service.offers.itemOffered?.['@id'] === `${url}#service`,
    `Generated ${pathname} Service has unexpected offers details`
  );
  assertServiceSchemaClaimSafety(service, pathname);
}

function assertServicesHubHasServiceItemList(locale, serviceSlugs) {
  const pathname = `/${locale}/services`;
  const generated = readGeneratedPage(pathname);
  const expectedServiceUrls = serviceSlugs.map((slug) => `${siteUrl}/${locale}/services/${slug}`);

  assert(
    generated,
    `Generated ${pathname} was not found. Run pnpm run build before check:seo.`
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
  const route = localizedRoutes.find((item) => item.path === pagePath);
  assert(route, `No route facts found for sitemap path ${pagePath}`);
  const urlBlock = sitemapXml.match(
    new RegExp(`<url>[\\s\\S]*?<loc>${escapeRegExp(route.url)}<\\/loc>[\\s\\S]*?<\\/url>`)
  )?.[0];

  assert(urlBlock, `Generated sitemap is missing URL block for ${route.url}`);

  for (const alternate of route.alternates.byLocale) {
    assert(
      urlBlock.includes(`hreflang="${alternate.hreflang}"`) && urlBlock.includes(`href="${alternate.url}"`),
      `Generated sitemap URL ${route.url} is missing ${alternate.hreflang} alternate ${alternate.url}`
    );
  }

  assert(
    urlBlock.includes('hreflang="x-default"') && urlBlock.includes(`href="${route.alternates.xDefault.url}"`),
    `Generated sitemap URL ${route.url} is missing x-default alternate ${route.alternates.xDefault.url}`
  );
}

const routingSource = readSource('src/i18n/routing.ts');
const servicesSource = readSource('src/lib/content/services.ts');
const pageProfilesSource = readSource('src/lib/page-profiles.ts');
const sitemapSource = readSource('src/app/sitemap.ts');
const robotsSource = readSource('src/app/robots.ts');
const llmsTxtSource = readSource('src/app/llms.txt/route.ts');
const seoSource = readSource('src/lib/seo.ts');
const aiDiscoverySource = readSource('src/lib/ai-discovery.ts');
const homeSource = readSource('src/app/[locale]/page.tsx');
const servicesIndexSource = readSource('src/app/[locale]/services/page.tsx');
const serviceDetailSource = readSource('src/app/[locale]/services/[slug]/page.tsx');
const servicePageModelSource = readSource('src/lib/content/service-page.ts');
const sitemapUsesCentralizedPageProfiles =
  sitemapSource.includes('getLocalizedSitemapEntries') &&
  pageProfilesSource.includes('STATIC_PAGE_DEFINITIONS') &&
  pageProfilesSource.includes('OFFER_TRACKS');

const expectedLocalizedUrlCount = localizedRoutes.length;

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
assert(llmsTxtSource.includes('buildLlmsTxt'), 'llms.txt route must use the AI discovery builder');
assert(llmsTxtSource.includes('X-Robots-Tag'), 'llms.txt route must explicitly set an X-Robots-Tag');
assert(aiDiscoverySource.includes('OFFER_TRACKS'), 'AI discovery must derive services from OFFER_TRACKS');
assert(aiDiscoverySource.includes('STATIC_PAGE_DEFINITIONS'), 'AI discovery must derive static pages from page profiles');
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
  assertPageHasCanonical(pagePath);
  assertPageHasLocaleAlternates(pagePath);
}

for (const route of localizedRoutes) {
  assertPageHasWebPageDateModified(route);
}

for (const locale of locales) {
  assertPageHasJsonLd(`/${locale}`);
  assertPageHasPersonSchema(`/${locale}`);
  assertPageHasJsonLd(`/${locale}/services`);
  assertServicesHubHasServiceItemList(locale, serviceSlugs);
  for (const slug of serviceSlugs) {
    assertPageHasJsonLd(`/${locale}/services/${slug}`);
    assertServicePageHasOfferTrackServiceSchema(
      localizedRoutes.find((route) => route.kind === 'service' && route.locale === locale && route.slug === slug)
    );
    assertServicePageHasFaqPageSchema(locale, slug);
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
      localeUrls.length === staticPageSuffixes.length + serviceSlugs.length,
      `Generated sitemap has ${localeUrls.length} URLs for ${locale}, expected ${
        staticPageSuffixes.length + serviceSlugs.length
      }`
    );
  }
} else {
  throw new Error('Generated sitemap.xml was not found. Run pnpm run build before check:seo.');
}

if (generatedRobots) {
  const robotsTxt = readFileSync(generatedRobots, 'utf8');
  assert(
    robotsTxt.includes(`Sitemap: ${siteUrl}/sitemap.xml`),
    `Generated robots.txt must include Sitemap: ${siteUrl}/sitemap.xml`
  );
} else {
  throw new Error('Generated robots.txt was not found. Run pnpm run build before check:seo.');
}

console.log(
  `SEO check passed: ${expectedUrls.length} localized URLs, generated hreflang alternates, dateModified JSON-LD, Person schema, llms.txt source, and robots sitemap URL validated.`
);
