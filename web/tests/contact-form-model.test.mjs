import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register(new URL('./ts-extension-resolver.mjs', import.meta.url));

const contactIntake = await import('../src/lib/contact/intake.ts');

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
    assert.partialDeepStrictEqual(
      contactIntake.resolveContactFeedback({
        status: 'error',
        messageKey: 'contact.form.rateLimitError',
      }),
      {kind: 'error', messageKey: 'contact.form.rateLimitError'}
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
});
