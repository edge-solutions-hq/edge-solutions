import {afterEach, describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register(new URL('./ts-extension-resolver.mjs', import.meta.url));

const {
  buildContactCtaClickPayload,
  buildContactFormOutcomePayload,
  buildContactFormSubmitPayload,
  buildOfferTrackClickPayload,
  trackContactFormOutcome,
  trackConversionEvent,
} = await import('../src/lib/analytics/events.ts');
const {ANALYTICS_CONSENT_STORAGE_KEY} = await import('../src/lib/analytics/consent.ts');

afterEach(() => {
  delete globalThis.window;
  delete globalThis.document;
});

function installBrowser({
  dataLayer = [],
  gtagCalls = [],
  pathname = '/fr/contact',
  search = '?source=hero',
  href = 'https://example.com/fr/contact?source=hero',
  lang = 'fr-BE',
  title = '  Contact Edge  ',
  referrer = '  https://referrer.example/start  ',
} = {}) {
  globalThis.window = {
    dataLayer,
    gtag: (...args) => gtagCalls.push(args),
    location: {href, pathname, search},
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
    documentElement: {lang},
    title,
    referrer,
  };

  return {dataLayer, gtagCalls};
}

describe('analytics event payload policy', () => {
  it('builds contact submit payloads without browser reads', () => {
    assert.deepEqual(
      buildContactFormSubmitPayload({
        service: 'ai',
        submitAttempt: 2,
        pagePath: '/fr/contact?source=hero',
      }),
      {
        eventName: 'contact_form_submit',
        params: {
          service: 'ai',
          page_path: '/fr/contact?source=hero',
          submit_attempt: 2,
        },
      }
    );
  });

  it('builds contact outcome payloads and keeps spam silent', () => {
    assert.deepEqual(
      buildContactFormOutcomePayload({
        outcome: {kind: 'success', service: 'realtime'},
        submitAttempt: 3,
        pagePath: '/fr/contact',
      }),
      {
        eventName: 'contact_form_success',
        params: {
          page_path: '/fr/contact',
          service: 'realtime',
          submit_attempt: 3,
        },
      }
    );

    assert.deepEqual(
      buildContactFormOutcomePayload({
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
        submitAttempt: 4,
        pagePath: '/fr/contact',
      }),
      {
        eventName: 'contact_form_error',
        params: {
          page_path: '/fr/contact',
          service: 'invalid-service',
          submit_attempt: 4,
          error_type: 'validation',
          error_field_count: 2,
        },
      }
    );

    assert.deepEqual(
      buildContactFormOutcomePayload({
        outcome: {kind: 'limited', service: 'realtime'},
        submitAttempt: 5,
        pagePath: '/fr/contact',
      }),
      {
        eventName: 'contact_form_error',
        params: {
          page_path: '/fr/contact',
          service: 'realtime',
          submit_attempt: 5,
          error_type: 'limited',
          error_field_count: undefined,
        },
      }
    );

    assert.deepEqual(
      buildContactFormOutcomePayload({
        outcome: {kind: 'abuse_control_error', service: 'unsure'},
        submitAttempt: 6,
        pagePath: '/fr/contact',
      }),
      {
        eventName: 'contact_form_error',
        params: {
          page_path: '/fr/contact',
          service: 'unsure',
          submit_attempt: 6,
          error_type: 'delivery',
          error_field_count: undefined,
        },
      }
    );

    assert.deepEqual(
      buildContactFormOutcomePayload({
        outcome: {kind: 'delivery_error', service: 'ai'},
        submitAttempt: 7,
        pagePath: '/fr/contact',
      }),
      {
        eventName: 'contact_form_error',
        params: {
          page_path: '/fr/contact',
          service: 'ai',
          submit_attempt: 7,
          error_type: 'delivery',
          error_field_count: undefined,
        },
      }
    );

    assert.equal(
      buildContactFormOutcomePayload({
        outcome: {kind: 'spam', service: 'ai'},
        submitAttempt: 8,
        pagePath: '/fr/contact',
      }),
      undefined
    );
  });

  it('builds offer and contact click payloads with documented parameters', () => {
    assert.deepEqual(
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
      }
    );

    assert.deepEqual(
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
      }
    );
  });
});

describe('analytics browser transport adapter', () => {
  it('does not read context or touch transports without accepted consent', () => {
    for (const storedConsent of [null, 'rejected', 'unknown']) {
      const dataLayer = [];
      const gtagCalls = [];
      installBrowser({dataLayer, gtagCalls});
      globalThis.window.localStorage.getItem = () => storedConsent;
      globalThis.window.location = {
        get href() {
          throw new Error('browser context should not be read');
        },
      };

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
    };

    assert.deepEqual(dataLayer, [
      {
        event: 'contact_form_submit',
        ...expectedPayload,
      },
    ]);
    assert.deepEqual(gtagCalls, [['event', 'contact_form_submit', expectedPayload]]);
  });

  it('adds service-detail source context to conversion events', () => {
    const {dataLayer, gtagCalls} = installBrowser({
      pathname: '/fr/services/ai-automation',
      search: '',
      href: 'https://example.com/fr/services/ai-automation',
      title: 'Automatisation IA',
    });

    trackConversionEvent('contact_cta_click', {
      cta_target: '/contact',
      placement: 'service_detail_cta',
    });

    const expectedPayload = {
      page_family: 'service_detail',
      site_locale: 'fr',
      source_offer_track: 'ai-automation',
      page_path: '/fr/services/ai-automation',
      page_location: 'https://example.com/fr/services/ai-automation',
      page_title: 'Automatisation IA',
      page_referrer: 'https://referrer.example/start',
      cta_target: '/contact',
      placement: 'service_detail_cta',
    };

    assert.deepEqual(dataLayer, [
      {
        event: 'contact_cta_click',
        ...expectedPayload,
      },
    ]);
    assert.deepEqual(gtagCalls, [['event', 'contact_cta_click', expectedPayload]]);
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
});
