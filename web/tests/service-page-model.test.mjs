import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {register} from 'node:module';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
register('./ts-extension-resolver.mjs', import.meta.url);
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

describe('service content availability', () => {
  it('returns localized hit state when requested content exists', async () => {
    const result = await services.getServiceContentAvailability('en', 'web-dev', {
      loaders: loaderMap({
        fr: {'web-dev': async () => mdxModule('FR web')},
        en: {'web-dev': async () => mdxModule('EN web')},
      }),
    });

    assert.equal(result.status, 'localized');
    assert.equal(result.requestedLocale, 'en');
    assert.equal(result.contentLocale, 'en');
    assert.equal(result.didFallback, false);
    assert.equal(result.renderPolicy.kind, 'localized');
    assert.equal(result.metadata.title, 'EN web');
    assert.equal(result.proofContract.slug, 'web-dev');
    assert.equal(result.proofContract.render.module, 'DeliveryBlueprint');
    assert.equal(result.proofContract.render.imagePath, 'web-delivery-board.svg');
    assert.deepEqual(
      result.proofContract.structure.map((item) => [item.key, item.expectedCount]),
      [
        ['checklist', 3],
        ['columns', 3],
        ['columnPoints', 9],
      ]
    );
  });

  it('returns fallback hit state when localized content is absent and FR content exists', async () => {
    const result = await services.getServiceContentAvailability('nl', 'web-dev', {
      loaders: loaderMap({
        fr: {'web-dev': async () => mdxModule('FR web')},
      }),
    });

    assert.equal(result.status, 'fallback');
    assert.equal(result.requestedLocale, 'nl');
    assert.equal(result.contentLocale, 'fr');
    assert.equal(result.didFallback, true);
    assert.equal(result.renderPolicy.kind, 'fallback');
    assert.equal(result.metadata.title, 'FR web');
    assert.equal(result.proofContract.slug, 'web-dev');
    assert.equal(result.proofContract.render.module, 'DeliveryBlueprint');
  });

  it('returns invalid slug state before loading content', async () => {
    const result = await services.getServiceContentAvailability('en', 'missing-service', {
      loaders: loaderMap({
        fr: {'web-dev': async () => mdxModule('FR web')},
      }),
    });

    assert.deepEqual(result, {
      status: 'invalid_slug',
      requestedLocale: 'en',
      slug: 'missing-service',
    });
  });

  it('returns missing fallback state when FR content is unavailable', async () => {
    const result = await services.getServiceContentAvailability('nl', 'web-dev', {
      loaders: loaderMap({
        nl: {},
        fr: {},
      }),
    });

    assert.deepEqual(result, {
      status: 'missing_fallback',
      slug: 'web-dev',
      requestedLocale: 'nl',
      fallbackLocale: 'fr',
    });
  });

  it('returns loader failure state instead of hiding a broken localized loader behind fallback', async () => {
    const error = new Error('broken mdx import');
    const result = await services.getServiceContentAvailability('en', 'web-dev', {
      loaders: loaderMap({
        fr: {'web-dev': async () => mdxModule('FR web')},
        en: {'web-dev': async () => {
          throw error;
        }},
      }),
    });

    assert.equal(result.status, 'loader_failure');
    assert.equal(result.slug, 'web-dev');
    assert.equal(result.requestedLocale, 'en');
    assert.equal(result.attemptedLocale, 'en');
    assert.equal(result.error, error);
  });
});

describe('service page model ownership', () => {
  it('exposes proof policy as structured page-model data', async () => {
    const model = await servicePage.getServicePageModel({
      locale: 'en',
      slug: 'ai-automation',
      loaders: loaderMap({
        fr: {'ai-automation': async () => mdxModule('FR AI')},
        en: {'ai-automation': async () => mdxModule('EN AI')},
      }),
    });

    assert.ok(model);
    assert.equal(model.proofPolicy.offerTrackSlug, 'ai-automation');
    assert.equal(model.proofPolicy.renderModule, 'WorkflowSnapshot');
    assert.equal(model.proofPolicy.imagePath, 'services-ai-workflow-board.svg');
    assert.deepEqual(
      model.proofPolicy.structuralExpectations.map((item) => [item.key, item.expectedCount]),
      [
        ['reviewPoints', 3],
        ['steps', 3],
      ]
    );
    assert.deepEqual(
      model.proofPolicy.requiredSignals.map((signal) => signal.concept),
      ['human review', 'source of truth', 'guardrails']
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
    assert.match(modelSource, /proofPolicy/);
    assert.match(modelSource, /proofContract/);
    assert.match(modelSource, /scrollTracking/);
    assert.match(routeSource, /getServicePageStaticParams/);
    assert.match(routeSource, /getServicePageMetadata/);
    assert.match(routeSource, /getServicePageModel/);
    assert.doesNotMatch(routeSource, /getOfferTrackPageProfile/);
  });
});
