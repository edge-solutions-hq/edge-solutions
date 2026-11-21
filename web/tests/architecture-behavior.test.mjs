import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register(new URL('./ts-extension-resolver.mjs', import.meta.url));

const contactIntake = await import('../src/lib/contact/intake.ts');
const contactAttemptTracker = await import('../src/lib/contact/contact-attempt-tracker.ts');
const trackedLinkTarget = await import('../src/lib/navigation/tracked-link-target.ts');
const serviceScrollDepth = await import('../src/lib/analytics/service-scroll-depth.ts');

describe('contact intake behavior', () => {
  it('parses valid fields and defaults a missing service to unsure', () => {
    const parsed = contactIntake.parseContactFields({
      name: 'Gil Guminski',
      email: 'gil@example.com',
      service: '',
      message: 'This is a valid project message.',
      company: '',
    });

    assert.equal(parsed.ok, true);
    assert.equal(parsed.fields.service, 'unsure');
  });

  it('classifies honeypot submissions as spam before validation', () => {
    const parsed = contactIntake.parseContactFields({
      name: '',
      email: '',
      service: 'ai',
      message: '',
      company: 'bot-company',
    });

    assert.equal(parsed.ok, false);
    assert.deepEqual(parsed.outcome, {kind: 'spam', service: 'ai'});
  });

  it('returns localized field error keys for invalid input', () => {
    const parsed = contactIntake.parseContactFields({
      name: 'G',
      email: 'not-an-email',
      service: 'invalid-service',
      message: 'short',
      company: '',
    });

    assert.equal(parsed.ok, false);
    assert.equal(parsed.outcome.kind, 'validation_error');
    assert.deepEqual(parsed.outcome.fieldErrors, {
      name: 'contact.form.fieldErrors.name',
      email: 'contact.form.fieldErrors.email',
      service: 'contact.form.fieldErrors.service',
      message: 'contact.form.fieldErrors.message',
    });
  });
});

describe('contact attempt tracker behavior', () => {
  it('increments attempts and completes each outcome once', () => {
    const state = contactAttemptTracker.createContactAttemptTrackerState();
    const firstAttempt = contactAttemptTracker.captureContactSubmitAttempt(state);

    assert.equal(firstAttempt, 1);
    assert.deepEqual(
      contactAttemptTracker.resolveContactAttemptCompletion({
        state,
        pending: false,
        outcome: {kind: 'success', service: 'ai'},
      }),
      {shouldTrack: true, submitAttempt: 1, outcome: {kind: 'success', service: 'ai'}}
    );
    assert.equal(
      contactAttemptTracker.resolveContactAttemptCompletion({
        state,
        pending: false,
        outcome: {kind: 'success', service: 'ai'},
      }),
      null
    );
  });

  it('completes spam attempts without requesting outcome tracking', () => {
    const state = contactAttemptTracker.createContactAttemptTrackerState();
    contactAttemptTracker.captureContactSubmitAttempt(state);

    assert.deepEqual(
      contactAttemptTracker.resolveContactAttemptCompletion({
        state,
        pending: false,
        outcome: {kind: 'spam', service: 'realtime'},
      }),
      {shouldTrack: false, submitAttempt: 1, outcome: {kind: 'spam', service: 'realtime'}}
    );
  });

  it('never re-tracks a previous server outcome under a client-invalid attempt', () => {
    const state = contactAttemptTracker.createContactAttemptTrackerState();
    contactAttemptTracker.captureContactSubmitAttempt(state);
    contactAttemptTracker.resolveContactAttemptCompletion({
      state,
      pending: false,
      outcome: {kind: 'limited', service: 'ai'},
    });

    assert.equal(contactAttemptTracker.captureContactInvalidAttempt(state), 2);
    assert.equal(
      contactAttemptTracker.resolveContactAttemptCompletion({
        state,
        pending: false,
        outcome: {kind: 'limited', service: 'ai'},
      }),
      null
    );
  });
});

describe('tracked link target behavior', () => {
  it('serializes object hrefs with query arrays and normalized hashes', () => {
    assert.equal(
      trackedLinkTarget.hrefToTrackedTarget({
        pathname: '/services/ai-automation',
        query: {source: 'home', tags: ['ai', null, 'ops'], empty: undefined},
        hash: 'details',
      }),
      '/services/ai-automation?source=home&tags=ai&tags=ops#details'
    );
  });

  it('detects contact targets without query or hash drift', () => {
    assert.equal(trackedLinkTarget.isContactTarget('/fr/contact?source=header'), true);
    assert.equal(trackedLinkTarget.isContactTarget('/services/ai-automation'), false);
    assert.equal(trackedLinkTarget.hrefToTrackedTarget(null), '');
  });
});

describe('service scroll-depth behavior', () => {
  it('calculates current scroll percent', () => {
    assert.equal(
      serviceScrollDepth.calculateScrollDepthPercent({scrollTop: 250, scrollHeight: 1000, viewportHeight: 500}),
      50
    );
    assert.equal(
      serviceScrollDepth.calculateScrollDepthPercent({scrollTop: 0, scrollHeight: 400, viewportHeight: 500}),
      100
    );
    assert.equal(
      serviceScrollDepth.calculateScrollDepthPercent({scrollTop: 800, scrollHeight: 1000, viewportHeight: 500}),
      100
    );
  });

  it('returns only newly reached thresholds in order', () => {
    assert.deepEqual(
      serviceScrollDepth.getUnfiredScrollDepthThresholds({
        scrollDepthPercent: 76,
        thresholds: [25, 50, 75, 90, 100],
        firedThresholds: new Set([25]),
      }),
      [50, 75]
    );
  });
});
