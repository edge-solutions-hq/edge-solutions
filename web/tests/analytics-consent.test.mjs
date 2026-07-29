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

  it('reads and writes the versioned storage value', () => {
    const values = new Map();
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    };

    assert.equal(readAnalyticsConsent(storage), 'undecided');
    assert.equal(writeAnalyticsConsent('accepted', storage), true);
    assert.equal(values.get(ANALYTICS_CONSENT_STORAGE_KEY), 'accepted');
    assert.equal(readAnalyticsConsent(storage), 'accepted');
    assert.equal(writeAnalyticsConsent('rejected', storage), true);
    assert.equal(readAnalyticsConsent(storage), 'rejected');
  });

  it('fails closed when browser storage is unavailable', () => {
    const unavailableStorage = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
    };

    assert.equal(readAnalyticsConsent(unavailableStorage), 'undecided');
    assert.equal(writeAnalyticsConsent('accepted', unavailableStorage), false);
  });

  it('keeps a failed withdrawal rejected across reloads', () => {
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
      assert.equal(readAnalyticsConsent(), 'accepted');
      assert.equal(writeAnalyticsConsent('rejected'), true);
      assert.equal(localValues.get(ANALYTICS_CONSENT_STORAGE_KEY), 'accepted');
      assert.equal(
        sessionValues.get(ANALYTICS_CONSENT_STORAGE_KEY),
        'rejected'
      );
      assert.equal(readAnalyticsConsent(), 'rejected');

      assert.equal(writeAnalyticsConsent('accepted'), true);
      assert.equal(sessionValues.has(ANALYTICS_CONSENT_STORAGE_KEY), false);
      assert.equal(readAnalyticsConsent(), 'accepted');
    } finally {
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', originalWindow);
      } else {
        delete globalThis.window;
      }
    }
  });

  it('guards localStorage property access and session rejection', () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: Object.defineProperty({}, 'localStorage', {
        configurable: true,
        get() {
          throw new Error('blocked getter');
        },
      }),
    });

    try {
      assert.equal(readAnalyticsConsent(), 'undecided');
      assert.equal(writeAnalyticsConsent('accepted'), false);

      const acceptedStorage = {
        getItem: () => 'accepted',
        setItem() {},
      };
      Object.defineProperty(globalThis.window, 'localStorage', {
        configurable: true,
        value: acceptedStorage,
      });
      Object.defineProperty(globalThis.window, 'sessionStorage', {
        configurable: true,
        value: {
          getItem: () => null,
          removeItem() {},
          setItem() {},
        },
      });
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
