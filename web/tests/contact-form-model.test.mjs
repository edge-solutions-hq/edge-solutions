import {describe, it} from 'node:test';
import assert from 'node:assert/strict';

const contactIntake = await import('../src/lib/contact/intake.ts');

describe('contact form model behavior', () => {
  it('exposes field defaults and validation hints from the contact module', () => {
    const {contactFormModel} = contactIntake;

    assert.equal(contactFormModel.fields.name.name, 'name');
    assert.equal(contactFormModel.fields.name.required, true);
    assert.equal(contactFormModel.fields.name.minLength, 2);
    assert.equal(contactFormModel.fields.name.maxLength, 80);
    assert.equal(contactFormModel.fields.email.type, 'email');
    assert.equal(contactFormModel.fields.email.maxLength, 200);
    assert.equal(contactFormModel.fields.service.defaultValue, 'unsure');
    assert.equal(contactFormModel.fields.message.minLength, 10);
    assert.equal(contactFormModel.fields.message.maxLength, 5000);
    assert.equal(contactFormModel.fields.honeypot.name, 'company');
    assert.equal(contactFormModel.fields.honeypot.autocomplete, 'off');
    assert.deepEqual(contactFormModel.fieldOrder, ['name', 'email', 'service', 'message']);
    assert.deepEqual(
      contactFormModel.offerOptions.map((option) => option.value),
      ['ai', 'realtime', 'unsure']
    );
  });

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
