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
    assert.equal(contactIntake.resolveContactServiceSearchParam('realtime'), 'realtime');
    assert.equal(contactIntake.resolveContactServiceSearchParam(['realtime', 'ai']), 'realtime');
    assert.equal(contactIntake.resolveContactServiceSearchParam('unknown'), undefined);
    assert.equal(contactIntake.resolveContactServiceSearchParam(undefined), undefined);
    assert.equal(contactIntake.resolveContactServiceTarget('/contact?service=ai'), 'ai');
    assert.equal(contactIntake.resolveContactServiceTarget('/fr/contact?service=realtime'), 'realtime');
    assert.equal(contactIntake.resolveContactServiceTarget('/contact?service=unknown'), undefined);
  });

  it('resolves feedback message keys and fallbacks for the contact adapter', () => {
    assert.deepEqual(
      contactIntake.resolveContactFeedback({status: 'idle'}),
      {kind: 'none'}
    );

    assert.deepEqual(
      contactIntake.resolveContactFeedback({status: 'success'}),
      {kind: 'success', messageKey: 'contact.form.success'}
    );

    assert.deepEqual(
      contactIntake.resolveContactFeedback({
        status: 'error',
        message: 'Champs invalides.',
        messageKey: 'contact.form.validationError',
      }),
      {
        kind: 'error',
        messageKey: 'contact.form.validationError',
        fallbackMessage: 'Champs invalides.',
      }
    );
  });
});
