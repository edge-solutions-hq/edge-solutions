import {after, beforeEach, describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register(new URL('./ts-extension-resolver.mjs', import.meta.url));

const deliveries = [];
let deliveryBehavior = 'success';

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
const {isBrowserHarnessRequest} = await import(
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

async function submit(formData) {
  return sendContactEmail({status: 'idle'}, formData, fakeDeliveryAdapter);
}

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
  });

  it('fails closed in self-hosted production without the browser request marker', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PLAYWRIGHT_TEST = '1';
    process.env.PLAYWRIGHT_TEST_TOKEN = 'random-per-run-token';
    delete process.env.VERCEL_ENV;

    const state = await sendContactEmail({status: 'idle'}, contactForm());

    assert.deepEqual(state, {
      status: 'error',
      messageKey: 'contact.form.genericError',
      outcome: {kind: 'delivery_error', service: 'ai'},
    });
  });

  it('normalizes valid data, delivers through the action binding, and returns success', async () => {
    const state = await submit(contactForm());

    assert.deepEqual(state, {
      status: 'success',
      message: 'Message envoyé. Je reviens vers vous rapidement.',
      messageKey: 'contact.form.success',
      outcome: {kind: 'success', service: 'ai'},
    });
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

  it('does not deliver invalid data and preserves its validation outcome', async () => {
    const state = await submit(contactForm({name: 'A', email: 'invalid', message: 'short'}));

    assert.deepEqual(state, {
      status: 'error',
      message: 'Champs invalides.',
      messageKey: 'contact.form.validationError',
      fieldErrors: {
        name: 'contact.form.fieldErrors.name',
        email: 'contact.form.fieldErrors.email',
        service: undefined,
        message: 'contact.form.fieldErrors.message',
      },
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
    assert.equal(deliveries.length, 0);
  });

  it('does not deliver honeypot data and preserves its silent outcome', async () => {
    const state = await submit(contactForm({company: 'robot-company'}));

    assert.deepEqual(state, {
      status: 'idle',
      outcome: {kind: 'spam', service: 'ai'},
    });
    assert.equal(deliveries.length, 0);
  });

  it('normalizes missing delivery configuration without leaking config diagnostics', async () => {
    delete process.env.RESEND_API_KEY;

    const state = await submit(contactForm());

    assert.deepEqual(state, {
      status: 'error',
      messageKey: 'contact.form.configError',
      outcome: {kind: 'delivery_error', service: 'ai'},
    });
    assert.doesNotMatch(JSON.stringify(state), /RESEND|missing|api.?key/i);
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
    assert.equal(deliveries.length, 1);
  });
});
