import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register(new URL('./ts-extension-resolver.mjs', import.meta.url));

const {LOCALES} = await import('../src/i18n/routing.ts');
const {
  createBrowserAnalyticsContext,
  currentBrowserPagePath,
  readBrowserAnalyticsContext,
  resolveBrowserAnalyticsPageContext,
  resolveBrowserAnalyticsLocale,
} = await import('../src/lib/analytics/browser-context.ts');

function fakeDocument({lang = '', title = '', referrer = ''} = {}) {
  return {
    documentElement: {lang},
    referrer,
    title,
  };
}

function fakeLocation({
  href = 'https://example.com/fr/services?source=hero',
  pathname = '/fr/services',
  search = '?source=hero',
} = {}) {
  return {href, pathname, search};
}

describe('browser analytics context', () => {
  it('derives supported locales from routing locales', () => {
    for (const locale of LOCALES) {
      assert.equal(
        resolveBrowserAnalyticsLocale({
          document: fakeDocument({lang: ''}),
          pathname: `/${locale}/services`,
        }),
        locale
      );
    }
  });

  it('prefers normalized html lang over localized path fallback', () => {
    assert.equal(
      resolveBrowserAnalyticsLocale({
        document: fakeDocument({lang: 'EN-BE'}),
        pathname: '/fr/services',
      }),
      'en'
    );
  });

  it('falls back to the first localized path segment when html lang is unsupported', () => {
    assert.equal(
      resolveBrowserAnalyticsLocale({
        document: fakeDocument({lang: 'de-BE'}),
        pathname: '/nl/services',
      }),
      'nl'
    );
  });

  it('returns undefined when neither html lang nor path contains a supported locale', () => {
    assert.equal(
      resolveBrowserAnalyticsLocale({
        document: fakeDocument({lang: 'de'}),
        pathname: '/services',
      }),
      undefined
    );
  });

  it('builds stable GA page defaults from injected document and location data', () => {
    assert.deepEqual(
      createBrowserAnalyticsContext({
        document: fakeDocument({
          lang: 'fr-BE',
          title: '  Edge Solutions  ',
          referrer: '  https://referrer.example/path  ',
        }),
        location: fakeLocation(),
      }),
      {
        page_family: 'services_index',
        site_locale: 'fr',
        page_path: '/fr/services?source=hero',
        page_location: 'https://example.com/fr/services?source=hero',
        page_title: 'Edge Solutions',
        page_referrer: 'https://referrer.example/path',
        source_offer_track: undefined,
      }
    );
  });

  it('allows router-derived page path while keeping browser location and locale fallback', () => {
    assert.deepEqual(
      createBrowserAnalyticsContext({
        document: fakeDocument({lang: '', title: 'Pricing'}),
        location: fakeLocation({
          href: 'https://example.com/en/pricing?plan=pro',
          pathname: '/stale-path',
          search: '',
        }),
        pagePath: '/en/pricing?plan=pro',
        pathname: '/en/pricing',
      }),
      {
        page_family: 'other',
        site_locale: 'en',
        page_path: '/en/pricing?plan=pro',
        page_location: 'https://example.com/en/pricing?plan=pro',
        page_title: 'Pricing',
        page_referrer: undefined,
        source_offer_track: undefined,
      }
    );
  });

  it('keeps browser reads optional outside a real browser', () => {
    assert.equal(readBrowserAnalyticsContext(), undefined);
    assert.equal(currentBrowserPagePath(), undefined);
  });

  it('classifies localized page families and current service-track source', () => {
    assert.deepEqual(
      resolveBrowserAnalyticsPageContext('/fr'),
      {pageFamily: 'home'}
    );
    assert.deepEqual(
      resolveBrowserAnalyticsPageContext('/nl/services/'),
      {pageFamily: 'services_index'}
    );
    assert.deepEqual(
      resolveBrowserAnalyticsPageContext('/en/services/ai-automation?from=nav'),
      {
        pageFamily: 'service_detail',
        sourceOfferTrack: 'ai-automation',
      }
    );
    assert.deepEqual(
      resolveBrowserAnalyticsPageContext('/fr/contact'),
      {pageFamily: 'contact'}
    );
    assert.deepEqual(
      resolveBrowserAnalyticsPageContext('/fr/services/unknown-offer'),
      {pageFamily: 'other'}
    );
  });
});
