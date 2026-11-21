import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register(new URL('./ts-extension-resolver.mjs', import.meta.url));

const {LOCALES} = await import('../src/i18n/routing.ts');
const {
  classifyAiReferrer,
  createBrowserAnalyticsContext,
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
  it('falls back to the localized path segment for every routing locale when html lang is unsupported', () => {
    for (const locale of LOCALES) {
      assert.equal(
        resolveBrowserAnalyticsLocale({
          document: fakeDocument({lang: 'de-BE'}),
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
        location: fakeLocation({
          href: 'https://example.com/fr/services/ai-automation?source=hero',
          pathname: '/fr/services/ai-automation',
        }),
      }),
      {
        page_family: 'service_detail',
        site_locale: 'fr',
        page_path: '/fr/services/ai-automation?source=hero',
        page_location: 'https://example.com/fr/services/ai-automation?source=hero',
        page_title: 'Edge Solutions',
        page_referrer: 'https://referrer.example/path',
        source_offer_track: 'ai-automation',
      }
    );
  });

  it('classifies AI referrers without retaining prompt or query details', () => {
    assert.equal(classifyAiReferrer('https://chatgpt.com/c/abc?prompt=private'), 'chatgpt');
    assert.equal(classifyAiReferrer('https://www.perplexity.ai/search?q=private'), 'perplexity');
    assert.equal(classifyAiReferrer('https://gemini.google.com/app/123'), 'gemini');
    assert.equal(classifyAiReferrer('https://claude.ai/chat/123'), 'claude');
    assert.equal(classifyAiReferrer('https://copilot.microsoft.com/chats/123'), 'copilot');
    assert.equal(classifyAiReferrer('https://www.bing.com/chat?q=private'), 'copilot');
    assert.equal(classifyAiReferrer('not a url'), undefined);
    assert.equal(classifyAiReferrer('https://example.com/search?q=private'), undefined);

    assert.deepEqual(
      createBrowserAnalyticsContext({
        document: fakeDocument({
          lang: 'en',
          title: 'Contact',
          referrer: 'https://chatgpt.com/c/abc?prompt=private',
        }),
        location: fakeLocation({
          href: 'https://example.com/en/contact',
          pathname: '/en/contact',
          search: '',
        }),
      }),
      {
        ai_referrer: 'chatgpt',
        page_family: 'contact',
        site_locale: 'en',
        page_path: '/en/contact',
        page_location: 'https://example.com/en/contact',
        page_title: 'Contact',
        page_referrer: 'https://chatgpt.com',
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
