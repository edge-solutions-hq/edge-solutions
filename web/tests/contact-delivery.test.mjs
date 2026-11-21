import {after, beforeEach, describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register(new URL('./ts-extension-resolver.mjs', import.meta.url));

const deliveries = [];
let abuseCalls = 0;
let abuseBehavior = 'allowed';
let deliveryBehavior = 'success';

function fakeAbuseAdapter() {
  abuseCalls += 1;
  if (abuseBehavior === 'throw') {
    throw new Error('WAF diagnostic: unavailable');
  }
  return Promise.resolve(abuseBehavior);
}

async function fakeDeliveryAdapter(payload, config) {
  deliveries.push({payload, config});

  if (deliveryBehavior === 'reject') {
    return {ok: false, message: 'provider diagnostic: invalid sender'};
  }

  if (deliveryBehavior === 'throw') {
    throw new Error('network diagnostic: connection reset');
  }

  return {ok: true};
}

const {sendContactEmail} = await import('../src/app/[locale]/contact/actions.ts');
const {
  normalizeContactRateLimitResult,
} = await import('../src/lib/contact/abuse.ts');
const {isBrowserHarnessRequest, resolveBrowserHarnessMode} = await import(
  '../src/lib/contact/browser-harness.ts'
);

const contactEnvKeys = [
  'NODE_ENV',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'RESEND_TO_EMAIL',
  'PLAYWRIGHT_TEST',
  'PLAYWRIGHT_TEST_TOKEN',
  'VERCEL_ENV',
];
const originalContactEnv = Object.fromEntries(
  contactEnvKeys.map((key) => [key, process.env[key]])
);

after(() => {
  for (const key of contactEnvKeys) {
    const originalValue = originalContactEnv[key];
    if (originalValue === undefined) delete process.env[key];
    else process.env[key] = originalValue;
  }
});

beforeEach(() => {
  abuseCalls = 0;
  abuseBehavior = 'allowed';
  deliveries.length = 0;
  deliveryBehavior = 'success';
  if (originalContactEnv.NODE_ENV === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalContactEnv.NODE_ENV;
  process.env.RESEND_API_KEY = 'test-api-key';
  process.env.RESEND_FROM_EMAIL = 'Edge Test <from@example.com>';
  process.env.RESEND_TO_EMAIL = 'inbox@example.com';
  delete process.env.PLAYWRIGHT_TEST;
  delete process.env.PLAYWRIGHT_TEST_TOKEN;
  delete process.env.VERCEL_ENV;
});

function contactForm(overrides = {}) {
  const values = {
    name: '  Ada Lovelace  ',
    email: '  ada@example.com  ',
    service: 'ai',
    message: '  Please automate this detailed workflow.  ',
    company: '',
    ...overrides,
  };
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

async function submit(formData, overrides = {}) {
  return sendContactEmail(
    {status: 'idle'},
    formData,
    {
      abuse: overrides.abuse ?? fakeAbuseAdapter,
      deliver: overrides.deliver ?? fakeDeliveryAdapter,
    }
  );
}

describe('contact abuse policy', () => {
  it('normalizes allowed, limited, missing, and blocked WAF results', () => {
    assert.equal(
      normalizeContactRateLimitResult({rateLimited: false}),
      'allowed'
    );
    assert.equal(
      normalizeContactRateLimitResult({rateLimited: true}),
      'limited'
    );
    assert.equal(
      normalizeContactRateLimitResult({rateLimited: false, error: 'not-found'}),
      'unavailable'
    );
    assert.equal(
      normalizeContactRateLimitResult({rateLimited: true, error: 'blocked'}),
      'unavailable'
    );
  });
});

describe('contact Server Action delivery', () => {
  it('requires the exact per-run request marker for the browser harness', () => {
    const harness = {
      enabled: '1',
      expectedToken: 'random-per-run-token',
    };

    assert.equal(isBrowserHarnessRequest({...harness, requestToken: null}), false);
    assert.equal(
      isBrowserHarnessRequest({...harness, requestToken: 'wrong-token'}),
      false
    );
    assert.equal(
      isBrowserHarnessRequest({
        ...harness,
        requestToken: 'random-per-run-token',
      }),
      true
    );
    assert.equal(
      resolveBrowserHarnessMode({...harness, requestToken: null}),
      'unverified'
    );
    assert.equal(
      resolveBrowserHarnessMode({...harness, requestToken: 'wrong-token'}),
      'unverified'
    );
    assert.equal(
      resolveBrowserHarnessMode({
        ...harness,
        requestToken: 'random-per-run-token',
      }),
      'verified'
    );
    assert.equal(
      resolveBrowserHarnessMode({
        enabled: undefined,
        expectedToken: undefined,
        requestToken: null,
      }),
      'production'
    );
  });

  it('fails closed without I/O when browser harness headers are unavailable', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PLAYWRIGHT_TEST = '1';
    process.env.PLAYWRIGHT_TEST_TOKEN = 'random-per-run-token';
    delete process.env.VERCEL_ENV;

    const state = await sendContactEmail({status: 'idle'}, contactForm());

    assert.deepEqual(state, {
      status: 'error',
      messageKey: 'contact.form.genericError',
      outcome: {kind: 'abuse_control_error', service: 'ai'},
    });
    assert.doesNotMatch(JSON.stringify(state), /WAF|Vercel|IP|rule|counter/i);
  });

  it('allows the first valid attempt, delivers once, and returns success', async () => {
    const state = await submit(contactForm());

    assert.deepEqual(state, {
      status: 'success',
      outcome: {kind: 'success', service: 'ai'},
    });
    assert.equal(abuseCalls, 1);
    assert.deepEqual(deliveries, [
      {
        payload: {
          from: 'Edge Test <from@example.com>',
          to: 'inbox@example.com',
          replyTo: 'ada@example.com',
          subject: '[Edge Solutions] Nouveau message (IA & automatisation) - Ada Lovelace',
          text: [
            'Nom: Ada Lovelace',
            'Email: ada@example.com',
            'Service: IA & automatisation',
            '',
            'Please automate this detailed workflow.',
          ].join('\n'),
        },
        config: {apiKey: 'test-api-key'},
      },
    ]);
  });

  it('suppresses delivery for a limited attempt without exposing diagnostics', async () => {
    abuseBehavior = 'limited';

    const state = await submit(contactForm());

    assert.deepEqual(state, {
      status: 'error',
      messageKey: 'contact.form.rateLimitError',
      outcome: {kind: 'limited', service: 'ai'},
    });
    assert.doesNotMatch(
      JSON.stringify(state),
      /contact-submit|Vercel|IP|count|remaining|reset|600|\b5\b/i
    );
    assert.equal(abuseCalls, 1);
    assert.equal(deliveries.length, 0);
  });

  it('fails closed when abuse control is unavailable', async () => {
    abuseBehavior = 'unavailable';

    const state = await submit(contactForm());

    assert.deepEqual(state, {
      status: 'error',
      messageKey: 'contact.form.genericError',
      outcome: {kind: 'abuse_control_error', service: 'ai'},
    });
    assert.equal(abuseCalls, 1);
    assert.equal(deliveries.length, 0);
  });

  it('normalizes thrown abuse errors and suppresses delivery', async () => {
    abuseBehavior = 'throw';

    const state = await submit(contactForm());

    assert.deepEqual(state, {
      status: 'error',
      messageKey: 'contact.form.genericError',
      outcome: {kind: 'abuse_control_error', service: 'ai'},
    });
    assert.doesNotMatch(JSON.stringify(state), /WAF|diagnostic|unavailable/i);
    assert.equal(abuseCalls, 1);
    assert.equal(deliveries.length, 0);
  });

  it('bypasses abuse control and delivery for invalid data', async () => {
    const state = await submit(
      contactForm({name: 'A', email: 'invalid', message: 'short'})
    );

    assert.deepEqual(state, {
      status: 'error',
      messageKey: 'contact.form.validationError',
      outcome: {
        kind: 'validation_error',
        service: 'ai',
        fieldErrors: {
          name: 'contact.form.fieldErrors.name',
          email: 'contact.form.fieldErrors.email',
          service: undefined,
          message: 'contact.form.fieldErrors.message',
        },
      },
    });
    assert.equal(abuseCalls, 0);
    assert.equal(deliveries.length, 0);
  });

  it('bypasses abuse control and delivery for honeypot data', async () => {
    const state = await submit(contactForm({company: 'robot-company'}));

    assert.deepEqual(state, {
      status: 'dropped',
      outcome: {kind: 'spam', service: 'ai'},
    });
    assert.equal(abuseCalls, 0);
    assert.equal(deliveries.length, 0);
  });

  it('consumes an allowed decision before resolving delivery configuration', async () => {
    delete process.env.RESEND_API_KEY;

    const state = await submit(contactForm());

    assert.deepEqual(state, {
      status: 'error',
      messageKey: 'contact.form.configError',
      outcome: {kind: 'delivery_error', service: 'ai'},
    });
    assert.doesNotMatch(JSON.stringify(state), /RESEND|missing|api.?key/i);
    assert.equal(abuseCalls, 1);
    assert.equal(deliveries.length, 0);
  });

  it('normalizes adapter rejection without exposing provider diagnostics', async () => {
    deliveryBehavior = 'reject';

    const state = await submit(contactForm());

    assert.deepEqual(state, {
      status: 'error',
      messageKey: 'contact.form.genericError',
      outcome: {kind: 'delivery_error', service: 'ai'},
    });
    assert.doesNotMatch(JSON.stringify(state), /provider|invalid sender|resend/i);
    assert.equal(abuseCalls, 1);
    assert.equal(deliveries.length, 1);
  });

  it('normalizes thrown provider errors without exposing network diagnostics', async () => {
    deliveryBehavior = 'throw';

    const state = await submit(contactForm());

    assert.deepEqual(state, {
      status: 'error',
      messageKey: 'contact.form.genericError',
      outcome: {kind: 'delivery_error', service: 'ai'},
    });
    assert.doesNotMatch(JSON.stringify(state), /network|connection reset|resend/i);
    assert.equal(abuseCalls, 1);
    assert.equal(deliveries.length, 1);
  });
});
