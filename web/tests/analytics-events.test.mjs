import {afterEach, describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register(new URL('./ts-extension-resolver.mjs', import.meta.url));

const {
  buildContactCtaClickPayload,
  buildContactFormOutcomePayload,
  buildContactFormSubmitPayload,
  buildLocaleSwitchPayload,
  buildOfferTrackClickPayload,
  buildServiceScrollDepthPayload,
  trackContactCtaClick,
  trackContactFormOutcome,
  trackContactFormSubmit,
  trackConversionEvent,
  trackLocaleSwitch,
  trackServiceScrollDepth,
} = await import('../src/lib/analytics/events.ts');
const {
  calculateScrollDepthPercent,
  getUnfiredScrollDepthThresholds,
} = await import('../src/lib/analytics/service-scroll-depth.ts');
const {scrollDepthThresholds} = await import('../src/lib/analytics/taxonomy.ts');
const {ANALYTICS_CONSENT_STORAGE_KEY} = await import('../src/lib/analytics/consent.ts');

afterEach(() => {
  delete globalThis.window;
  delete globalThis.document;
});

function installBrowser({dataLayer = [], gtagCalls = []} = {}) {
  globalThis.window = {
    dataLayer,
    gtag: (...args) => gtagCalls.push(args),
    location: {
      href: 'https://example.com/fr/contact?source=hero',
      pathname: '/fr/contact',
      search: '?source=hero',
    },
    localStorage: {
      getItem: (key) => key === ANALYTICS_CONSENT_STORAGE_KEY ? 'accepted' : null,
      setItem() {},
    },
    sessionStorage: {
      getItem: () => null,
      removeItem() {},
      setItem() {},
    },
  };
  globalThis.document = {
    documentElement: {lang: 'fr-BE'},
    title: '  Contact Edge  ',
    referrer: '  https://referrer.example/start  ',
  };

  return {dataLayer, gtagCalls};
}

describe('analytics event payload policy', () => {
  it('builds documented event names and parameters', () => {
    const cases = [
      [
        buildContactFormSubmitPayload({service: 'ai', submitAttempt: 2, pagePath: '/fr/contact'}),
        {
          eventName: 'contact_form_submit',
          params: {service: 'ai', page_path: '/fr/contact', submit_attempt: 2},
        },
      ],
      [
        buildOfferTrackClickPayload({
          offerTrackSlug: 'realtime-games',
          placement: 'home_services_grid',
          linkTarget: '/fr/services/realtime-games',
          linkLabel: 'Real-time 3D / XR',
          pagePath: '/fr',
        }),
        {
          eventName: 'service_card_click',
          params: {
            service_slug: 'realtime-games',
            placement: 'home_services_grid',
            page_path: '/fr',
            link_target: '/fr/services/realtime-games',
            link_label: 'Real-time 3D / XR',
          },
        },
      ],
      [
        buildContactCtaClickPayload({
          ctaTarget: '/fr/contact',
          placement: 'home_hero_primary',
          ctaLabel: 'Parler du projet',
          pagePath: '/fr',
        }),
        {
          eventName: 'contact_cta_click',
          params: {
            cta_target: '/fr/contact',
            page_path: '/fr',
            placement: 'home_hero_primary',
            cta_label: 'Parler du projet',
          },
        },
      ],
      [
        buildLocaleSwitchPayload({fromLocale: 'fr', toLocale: 'en', pagePath: '/fr'}),
        {
          eventName: 'locale_switch',
          params: {from_locale: 'fr', to_locale: 'en', page_path: '/fr'},
        },
      ],
      [
        buildServiceScrollDepthPayload({offerTrackSlug: 'ai-automation', scrollDepthPercent: 75}),
        {
          eventName: 'service_scroll_depth',
          params: {service_slug: 'ai-automation', scroll_depth_percent: 75},
        },
      ],
    ];

    for (const [actual, expected] of cases) {
      assert.deepEqual(actual, expected, expected.eventName);
    }
  });

  it('maps each contact outcome to its documented error bucket', () => {
    const cases = [
      {
        outcome: {kind: 'success', service: 'realtime'},
        expected: {
          eventName: 'contact_form_success',
          params: {page_path: '/fr/contact', service: 'realtime', submit_attempt: 3},
        },
      },
      {
        outcome: {
          kind: 'validation_error',
          service: 'invalid-service',
          fieldErrors: {
            name: 'contact.form.fieldErrors.name',
            email: undefined,
            service: 'contact.form.fieldErrors.service',
            message: undefined,
          },
        },
        errorType: 'validation',
        errorFieldCount: 2,
      },
      {outcome: {kind: 'limited', service: 'realtime'}, errorType: 'limited'},
      {outcome: {kind: 'abuse_control_error', service: 'unsure'}, errorType: 'delivery'},
      {outcome: {kind: 'delivery_error', service: 'ai'}, errorType: 'delivery'},
    ];

    for (const {outcome, expected, errorType, errorFieldCount} of cases) {
      assert.deepEqual(
        buildContactFormOutcomePayload({outcome, submitAttempt: 3, pagePath: '/fr/contact'}),
        expected ?? {
          eventName: 'contact_form_error',
          params: {
            page_path: '/fr/contact',
            service: outcome.service,
            submit_attempt: 3,
            error_type: errorType,
            error_field_count: errorFieldCount,
          },
        },
        outcome.kind
      );
    }
  });
});

describe('analytics browser transport adapter', () => {
  it('emits nothing without accepted consent', () => {
    for (const storedConsent of [null, 'rejected', 'unknown']) {
      const dataLayer = [];
      const gtagCalls = [];
      installBrowser({dataLayer, gtagCalls});
      globalThis.window.localStorage.getItem = () => storedConsent;

      trackConversionEvent('contact_cta_click');

      assert.deepEqual(dataLayer, []);
      assert.deepEqual(gtagCalls, []);
    }
  });

  it('merges browser context, compacts undefined params, and fans out to dataLayer and gtag', () => {
    const {dataLayer, gtagCalls} = installBrowser();

    trackConversionEvent('contact_form_submit', {
      page_path: '/fr/contact?source=override',
      service: 'ai',
      submit_attempt: 1,
      error_type: undefined,
      error_field_count: 0,
      is_retry: false,
    });

    const expectedPayload = {
      page_family: 'contact',
      site_locale: 'fr',
      page_path: '/fr/contact?source=override',
      page_location: 'https://example.com/fr/contact?source=hero',
      page_title: 'Contact Edge',
      page_referrer: 'https://referrer.example/start',
      service: 'ai',
      submit_attempt: 1,
      error_field_count: 0,
      is_retry: false,
    };

    assert.deepEqual(dataLayer, [
      {
        event: 'contact_form_submit',
        ...expectedPayload,
      },
    ]);
    assert.deepEqual(gtagCalls, [['event', 'contact_form_submit', expectedPayload]]);
  });

  it('does not emit browser events for spam contact outcomes', () => {
    const {dataLayer, gtagCalls} = installBrowser();

    trackContactFormOutcome({
      outcome: {kind: 'spam', service: 'realtime'},
      submitAttempt: 1,
    });

    assert.deepEqual(dataLayer, []);
    assert.deepEqual(gtagCalls, []);
  });

  it('sends each tracked interaction with the current page path and caller values', () => {
    const {gtagCalls} = installBrowser();

    trackContactCtaClick({ctaTarget: '/fr/contact', placement: 'header_cta', ctaLabel: 'Contact'});
    trackContactFormSubmit({service: 'ai', submitAttempt: 1});
    trackLocaleSwitch({fromLocale: 'fr', toLocale: 'en'});
    trackServiceScrollDepth({offerTrackSlug: 'ai-automation', scrollDepthPercent: 50});

    const pagePath = '/fr/contact?source=hero';
    const expected = [
      ['contact_cta_click', {page_path: pagePath, cta_target: '/fr/contact', placement: 'header_cta'}],
      ['contact_form_submit', {page_path: pagePath, service: 'ai', submit_attempt: 1}],
      ['locale_switch', {page_path: pagePath, from_locale: 'fr', to_locale: 'en'}],
      ['service_scroll_depth', {service_slug: 'ai-automation', scroll_depth_percent: 50}],
    ];

    assert.deepEqual(
      gtagCalls.map(([, eventName, params], index) => [
        eventName,
        Object.fromEntries(Object.keys(expected[index]?.[1] ?? {}).map((key) => [key, params[key]])),
      ]),
      expected
    );
  });
});

describe('service scroll-depth thresholds', () => {
  it('fires every documented threshold once, including depths that land exactly on one', () => {
    const fired = new Set();
    const emitted = [];

    for (const scrollTop of [500, 950, 1000, 1000]) {
      const newlyReached = getUnfiredScrollDepthThresholds({
        scrollDepthPercent: calculateScrollDepthPercent({
          scrollTop,
          scrollHeight: 2000,
          viewportHeight: 1000,
        }),
        thresholds: scrollDepthThresholds,
        firedThresholds: fired,
      });
      newlyReached.forEach((threshold) => fired.add(threshold));
      emitted.push(newlyReached);
    }

    assert.deepEqual(emitted, [[25, 50], [75, 90], [100], []]);
  });
});
