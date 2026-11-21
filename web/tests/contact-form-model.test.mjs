import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register(new URL('./ts-extension-resolver.mjs', import.meta.url));

const contactIntake = await import('../src/lib/contact/intake.ts');
const contactAttemptTracker = await import('../src/lib/contact/contact-attempt-tracker.ts');

const validRaw = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  service: 'ai',
  message: 'Please automate this workflow.',
  company: '',
};

function invalidFieldsOf(overrides) {
  const parsed = contactIntake.parseContactFields({...validRaw, ...overrides});
  if (parsed.ok) return [];
  return Object.entries(parsed.outcome.fieldErrors)
    .filter(([, key]) => key)
    .map(([field]) => field);
}

function emailOfLength(length) {
  const domain = '@example.com';
  return 'a'.repeat(length - domain.length) + domain;
}

describe('contact form model behavior', () => {
  it('extracts the submit service from form data without normalizing business validity', () => {
    const formData = new FormData();
    formData.set('service', 'realtime');

    assert.equal(contactIntake.extractContactSubmitService(formData), 'realtime');

    formData.set('service', 'not-a-known-service');
    assert.equal(contactIntake.extractContactSubmitService(formData), undefined);

    formData.delete('service');
    assert.equal(contactIntake.extractContactSubmitService(formData), undefined);
  });

  it('resolves contact service query params for preselected CTAs', () => {
    assert.equal(contactIntake.resolveContactServiceSearchParam('ai'), 'ai');
    assert.equal(contactIntake.resolveContactServiceSearchParam(['realtime', 'ai']), 'realtime');
    assert.equal(contactIntake.resolveContactServiceSearchParam('unknown'), undefined);
    assert.equal(contactIntake.resolveContactServiceSearchParam(undefined), undefined);
    assert.equal(contactIntake.resolveContactServiceTarget('/fr/contact?service=realtime'), 'realtime');
    assert.equal(contactIntake.resolveContactServiceTarget('/contact?service=unknown'), undefined);
    assert.equal(contactIntake.resolveContactServiceTarget('/fr/contact?service=ai#contact-form'), 'ai');
  });

  it('shows success and error feedback for the contact adapter', () => {
    assert.deepEqual(
      contactIntake.resolveContactFeedback({
        status: 'dropped',
        outcome: {kind: 'spam', service: 'ai'},
      }),
      {kind: 'none'}
    );

    assert.deepEqual(
      contactIntake.resolveContactFeedback({
        status: 'success',
        outcome: {kind: 'success', service: 'ai'},
      }),
      {kind: 'success', messageKey: 'contact.form.success'}
    );
    assert.deepEqual(
      contactIntake.resolveContactFeedback({
        status: 'error',
        messageKey: 'contact.form.rateLimitError',
        outcome: {kind: 'limited', service: 'ai'},
      }),
      {kind: 'error', messageKey: 'contact.form.rateLimitError', fieldErrors: {}}
    );
  });

  it('accepts each field at its length limit and rejects it one character beyond', () => {
    const cases = [
      ['name', 'N'.repeat(2), 'N'.repeat(1)],
      ['name', 'N'.repeat(80), 'N'.repeat(81)],
      ['email', emailOfLength(200), emailOfLength(201)],
      ['message', 'm'.repeat(10), 'm'.repeat(9)],
      ['message', 'm'.repeat(5000), 'm'.repeat(5001)],
    ];

    for (const [field, accepted, rejected] of cases) {
      assert.deepEqual(invalidFieldsOf({[field]: accepted}), [], `${field} length ${accepted.length}`);
      assert.deepEqual(invalidFieldsOf({[field]: rejected}), [field], `${field} length ${rejected.length}`);
    }
  });

  it('trims surrounding whitespace before enforcing minimum lengths', () => {
    assert.deepEqual(invalidFieldsOf({name: '    A    '}), ['name']);
    assert.deepEqual(invalidFieldsOf({message: `     ${'m'.repeat(9)}     `}), ['message']);
    assert.deepEqual(invalidFieldsOf({message: ' '.repeat(40)}), ['message']);
  });

  it('offers each service exactly once and every offered service is accepted', () => {
    const offered = contactIntake.contactFormModel.offerOptions.map((option) => option.value);

    assert.deepEqual([...offered].sort(), ['ai', 'realtime', 'unsure']);
    for (const service of offered) {
      const parsed = contactIntake.parseContactFields({...validRaw, service});
      assert.equal(parsed.ok && parsed.fields.service, service);
    }
  });

  it('keeps field errors in validation feedback so the form can highlight them', () => {
    const fieldErrors = {email: 'contact.form.fieldErrors.email'};

    assert.deepEqual(
      contactIntake.resolveContactFeedback({
        status: 'error',
        messageKey: 'contact.form.validationError',
        outcome: {kind: 'validation_error', service: 'ai', fieldErrors},
      }),
      {kind: 'error', messageKey: 'contact.form.validationError', fieldErrors}
    );
  });

  it('waits for the pending submission to settle before completing the attempt', () => {
    const state = contactAttemptTracker.createContactAttemptTrackerState();
    contactAttemptTracker.captureContactSubmitAttempt(state);
    const outcome = {kind: 'success', service: 'ai'};

    assert.equal(
      contactAttemptTracker.resolveContactAttemptCompletion({state, pending: true, outcome}),
      null
    );
    assert.deepEqual(
      contactAttemptTracker.resolveContactAttemptCompletion({state, pending: false, outcome}),
      {shouldTrack: true, submitAttempt: 1, outcome}
    );
  });
});
