import {describe, it} from 'node:test';
import assert from 'node:assert/strict';

const {
  createBrowserAnalyticsContext,
  currentBrowserPagePath,
  readBrowserAnalyticsContext,
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
        site_locale: 'fr',
        page_path: '/fr/services?source=hero',
        page_location: 'https://example.com/fr/services?source=hero',
        page_title: 'Edge Solutions',
        page_referrer: 'https://referrer.example/path',
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
        site_locale: 'en',
        page_path: '/en/pricing?plan=pro',
        page_location: 'https://example.com/en/pricing?plan=pro',
        page_title: 'Pricing',
        page_referrer: undefined,
      }
    );
  });

  it('keeps browser reads optional outside a real browser', () => {
    assert.equal(readBrowserAnalyticsContext(), undefined);
    assert.equal(currentBrowserPagePath(), undefined);
  });
});
