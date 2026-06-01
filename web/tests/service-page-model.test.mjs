import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {register} from 'node:module';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
register('./ts-extension-resolver.mjs', import.meta.url);
const {LOCALES} = await import('../src/i18n/routing.ts');
const {OFFER_TRACKS} = await import('../src/lib/offer-tracks.ts');
const {getServiceSchemaDetails} = await import('../src/lib/seo.ts');
const services = await import('../src/lib/content/services.ts');
const servicePage = await import('../src/lib/content/service-page.ts');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function mdxModule(title) {
  return {
    default() {
      return null;
    },
    metadata: {
      title,
      description: `${title} description`,
    },
  };
}

function loaderMap(overrides) {
  return {
    fr: {},
    en: {},
    nl: {},
    ...overrides,
  };
}

function allServiceLoaders() {
  return Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      Object.fromEntries(
        OFFER_TRACKS.map((track) => [
          track.slug,
          async () => mdxModule(`${locale.toUpperCase()} ${track.slug}`),
        ])
      ),
    ])
  );
}

function assertNoUnsupportedServiceClaims(service, label) {
  for (const property of [
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
  ]) {
    assert.equal(service[property], undefined, `${label} must not emit ${property}`);
  }

  assert.equal(service.offers?.price, undefined, `${label} offer must not emit price`);
  assert.equal(service.offers?.priceCurrency, undefined, `${label} offer must not emit priceCurrency`);
  assert.equal(service.offers?.priceSpecification, undefined, `${label} offer must not emit priceSpecification`);
}

describe('service content availability', () => {
  it('returns localized hit state when requested content exists', async () => {
    const result = await services.getServiceContentAvailability('en', 'realtime-games', {
      loaders: loaderMap({
        fr: {'realtime-games': async () => mdxModule('FR realtime')},
        en: {'realtime-games': async () => mdxModule('EN realtime')},
      }),
    });

    assert.equal(result.status, 'localized');
    assert.equal(result.requestedLocale, 'en');
    assert.equal(result.contentLocale, 'en');
    assert.equal(result.didFallback, false);
    assert.equal(result.renderPolicy.kind, 'localized');
    assert.equal(result.metadata.title, 'EN realtime');
    assert.equal(result.evidenceContract.slug, 'realtime-games');
    assert.equal(result.evidenceContract.render.module, 'PrototypeSignals');
    assert.equal(result.evidenceContract.render.imagePath, 'services-realtime-prototype-board.svg');
    assert.deepEqual(
      result.evidenceContract.structure.map((item) => [item.key, item.expectedCount]),
      [
        ['signals', 3],
        ['phases', 3],
      ]
    );
  });

  it('returns fallback hit state when localized content is absent and FR content exists', async () => {
    const result = await services.getServiceContentAvailability('nl', 'realtime-games', {
      loaders: loaderMap({
        fr: {'realtime-games': async () => mdxModule('FR realtime')},
      }),
    });

    assert.equal(result.status, 'fallback');
    assert.equal(result.requestedLocale, 'nl');
    assert.equal(result.contentLocale, 'fr');
    assert.equal(result.didFallback, true);
    assert.equal(result.renderPolicy.kind, 'fallback');
    assert.equal(result.metadata.title, 'FR realtime');
    assert.equal(result.evidenceContract.slug, 'realtime-games');
    assert.equal(result.evidenceContract.render.module, 'PrototypeSignals');
  });

  it('returns invalid slug state before loading content', async () => {
    const result = await services.getServiceContentAvailability('en', 'missing-service', {
      loaders: loaderMap({
        fr: {'realtime-games': async () => mdxModule('FR realtime')},
      }),
    });

    assert.deepEqual(result, {
      status: 'invalid_slug',
      requestedLocale: 'en',
      slug: 'missing-service',
    });
  });

  it('returns missing fallback state when FR content is unavailable', async () => {
    const result = await services.getServiceContentAvailability('nl', 'realtime-games', {
      loaders: loaderMap({
        nl: {},
        fr: {},
      }),
    });

    assert.deepEqual(result, {
      status: 'missing_fallback',
      slug: 'realtime-games',
      requestedLocale: 'nl',
      fallbackLocale: 'fr',
    });
  });

  it('returns loader failure state instead of hiding a broken localized loader behind fallback', async () => {
    const error = new Error('broken mdx import');
    const result = await services.getServiceContentAvailability('en', 'realtime-games', {
      loaders: loaderMap({
        fr: {'realtime-games': async () => mdxModule('FR realtime')},
        en: {'realtime-games': async () => {
          throw error;
        }},
      }),
    });

    assert.equal(result.status, 'loader_failure');
    assert.equal(result.slug, 'realtime-games');
    assert.equal(result.requestedLocale, 'en');
    assert.equal(result.attemptedLocale, 'en');
    assert.equal(result.error, error);
  });
});

describe('service page model ownership', () => {
  it('emits catalog-backed Service JSON-LD contract for every localized offer track page', async () => {
    for (const locale of LOCALES) {
      for (const track of OFFER_TRACKS) {
        const model = await servicePage.getServicePageModel({
          locale,
          slug: track.slug,
          loaders: allServiceLoaders(),
        });

        assert.ok(model);

        const service = model.profile.jsonLd.find((item) => item?.['@type'] === 'Service');
        const webPage = model.profile.jsonLd.find((item) => item?.['@type'] === 'WebPage');
        const expectedUrl = `https://edge-solutions.be/${locale}/services/${track.slug}`;
        const details = getServiceSchemaDetails(locale, track.slug);
        const label = `${locale}/${track.slug} Service JSON-LD`;

        assert.ok(service, `${label} is missing`);
        assert.equal(service['@id'], `${expectedUrl}#service`);
        assert.equal(service.url, expectedUrl);
        assert.equal(service.inLanguage, locale);
        assert.equal(service.dateModified, track.lastModified.toISOString());
        assert.equal(service.serviceType, track.schemaServiceType);
        assert.equal(service.category, track.slug);
        assert.deepEqual(service.audience, {
          '@type': 'Audience',
          audienceType: details.audienceType,
        });
        assert.deepEqual(
          service.serviceOutput,
          details.serviceOutput.map((name) => ({
            '@type': 'Thing',
            name,
          }))
        );
        assert.deepEqual(service.identifier, {
          '@type': 'PropertyValue',
          propertyID: 'edge-solutions:service-offer-track',
          value: `edge-solutions:${locale}:services:${track.slug}`,
        });
        assert.deepEqual(service.provider, {
          '@id': 'https://edge-solutions.be#organization',
        });
        assert.deepEqual(service.areaServed, [
          {
            '@type': 'Country',
            name: 'Belgium',
          },
          {
            '@type': 'AdministrativeArea',
            name: 'Wallonia',
          },
        ]);
        assert.deepEqual(service.offers, {
          '@type': 'Offer',
          name: details.offer.name,
          description: details.offer.description,
          url: expectedUrl,
          seller: {
            '@id': 'https://edge-solutions.be#organization',
          },
          itemOffered: {
            '@id': `${expectedUrl}#service`,
          },
        });
        assertNoUnsupportedServiceClaims(service, label);
        assert.equal(webPage.dateModified, track.lastModified.toISOString());
      }
    }
  });

  it('exposes evidence policy as structured page-model data', async () => {
    const model = await servicePage.getServicePageModel({
      locale: 'en',
      slug: 'ai-automation',
      loaders: loaderMap({
        fr: {'ai-automation': async () => mdxModule('FR AI')},
        en: {'ai-automation': async () => mdxModule('EN AI')},
      }),
    });

    assert.ok(model);
    assert.equal(model.evidencePolicy.offerTrackSlug, 'ai-automation');
    assert.equal(model.evidencePolicy.renderModule, 'WorkflowSnapshot');
    assert.equal(model.evidencePolicy.imagePath, 'services-ai-workflow-board.svg');
    assert.deepEqual(
      model.evidencePolicy.structuralExpectations.map((item) => [item.key, item.expectedCount]),
      [
        ['reviewPoints', 3],
        ['steps', 3],
      ]
    );
    assert.deepEqual(
      model.evidencePolicy.requiredSignals.map((signal) => signal.concept),
      ['human review', 'source of truth', 'action limits']
    );
  });

  it('derives static params from locale routing and offer-track slugs', () => {
    const source = read('src/lib/content/service-page.ts');

    assert.match(source, /export function getServicePageStaticParams/);
    assert.match(source, /routing\.locales\.flatMap/);
    assert.match(source, /OFFER_TRACK_SLUGS\.map/);
  });

  it('keeps service route validity, profile creation, and tracking identity behind the model seam', () => {
    const modelSource = read('src/lib/content/service-page.ts');
    const routeSource = read('src/app/[locale]/services/[slug]/page.tsx');

    assert.match(modelSource, /export function isServicePageLocale/);
    assert.match(modelSource, /if \(!isServicePageLocale\(locale\)\) return null/);
    assert.match(modelSource, /getServiceContentAvailability/);
    assert.match(modelSource, /availability\.status !== 'localized'/);
    assert.match(modelSource, /getOfferTrackPageProfile/);
    assert.match(modelSource, /renderPolicy\.requestedLocale/);
    assert.match(modelSource, /evidencePolicy/);
    assert.match(modelSource, /evidenceContract/);
    assert.match(modelSource, /scrollTracking/);
    assert.match(routeSource, /getServicePageStaticParams/);
    assert.match(routeSource, /getServicePageMetadata/);
    assert.match(routeSource, /getServicePageModel/);
    assert.doesNotMatch(routeSource, /getOfferTrackPageProfile/);
  });
});
