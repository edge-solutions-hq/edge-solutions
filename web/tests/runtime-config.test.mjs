import {describe, it} from 'node:test';
import assert from 'node:assert/strict';

const {getAnalyticsRuntimeConfig} = await import('../src/lib/runtime-config-core.mjs');

describe('analytics runtime config', () => {
  it('uses NEXT_PUBLIC_GTM_ID as the single Google tag ID', () => {
    const config = getAnalyticsRuntimeConfig({
      NEXT_PUBLIC_GTM_ID: 'G-5JG1EX9FQ8',
    });

    assert.equal(config.googleTagId, 'G-5JG1EX9FQ8');
    assert.deepEqual(config.raw, {googleTagId: 'G-5JG1EX9FQ8'});
    assert.equal(config.status.googleTag.ok, true);
  });

  it('rejects Google Tag Manager container IDs for the gtag.js loader', () => {
    const config = getAnalyticsRuntimeConfig({
      NEXT_PUBLIC_GTM_ID: 'GTM-WRD5HMK3',
    });

    assert.equal(config.googleTagId, '');
    assert.equal(config.status.googleTag.ok, false);
    assert.match(config.status.googleTag.reason, /invalid format/);
  });
});
