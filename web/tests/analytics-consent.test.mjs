import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register(new URL('./ts-extension-resolver.mjs', import.meta.url));

const {
  ANALYTICS_CONSENT_STORAGE_KEY,
  hasAnalyticsConsent,
  parseAnalyticsConsent,
  readAnalyticsConsent,
  setAnalyticsConsentForSession,
  writeAnalyticsConsent,
} = await import('../src/lib/analytics/consent.ts');

describe('analytics consent persistence', () => {
  it('parses only the two explicit persisted choices', () => {
    assert.equal(parseAnalyticsConsent('accepted'), 'accepted');
    assert.equal(parseAnalyticsConsent('rejected'), 'rejected');
    assert.equal(parseAnalyticsConsent(null), 'undecided');
    assert.equal(parseAnalyticsConsent(''), 'undecided');
    assert.equal(parseAnalyticsConsent('unknown'), 'undecided');
  });

  it('keeps a failed withdrawal rejected until visitors accept again', () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const localValues = new Map([
      [ANALYTICS_CONSENT_STORAGE_KEY, 'accepted'],
    ]);
    const sessionValues = new Map();
    const localStorage = {
      getItem: (key) => localValues.get(key) ?? null,
      setItem(key, value) {
        if (value === 'rejected') throw new Error('blocked write');
        localValues.set(key, value);
      },
      removeItem() {
        throw new Error('blocked removal');
      },
    };
    const sessionStorage = {
      getItem: (key) => sessionValues.get(key) ?? null,
      setItem: (key, value) => sessionValues.set(key, value),
      removeItem: (key) => sessionValues.delete(key),
    };
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {localStorage, sessionStorage},
    });

    try {
      assert.equal(writeAnalyticsConsent('rejected'), true);
      assert.equal(readAnalyticsConsent(), 'rejected');

      assert.equal(writeAnalyticsConsent('accepted'), true);
      assert.equal(readAnalyticsConsent(), 'accepted');
    } finally {
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', originalWindow);
      } else {
        delete globalThis.window;
      }
    }
  });

  it('session rejection overrides stored acceptance until accepted again', () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        localStorage: {getItem: () => 'accepted'},
        sessionStorage: {getItem: () => null},
      },
    });

    try {
      setAnalyticsConsentForSession('rejected');
      assert.equal(hasAnalyticsConsent(), false);
      setAnalyticsConsentForSession('accepted');
      assert.equal(hasAnalyticsConsent(), true);
    } finally {
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', originalWindow);
      } else {
        delete globalThis.window;
      }
      setAnalyticsConsentForSession('accepted');
    }
  });
});
