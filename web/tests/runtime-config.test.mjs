import {describe, it} from 'node:test';
import assert from 'node:assert/strict';

const {getAnalyticsRuntimeConfig} = await import('../src/lib/runtime-config-core.mjs');

describe('analytics runtime config', () => {
  it('uses NEXT_PUBLIC_GTM_ID as the single Google tag ID', () => {
    const config = getAnalyticsRuntimeConfig({
      NEXT_PUBLIC_GTM_ID: ' G-5JG1EX9FQ8 ',
    });

    assert.equal(config.googleTagId, 'G-5JG1EX9FQ8');
    assert.equal(config.status.googleTag.ok, true);
  });

  for (const [label, value] of [
    ['a Google Tag Manager container ID', 'GTM-WRD5HMK3'],
    ['the documented G-XXXXXXXXXX placeholder', 'G-XXXXXXXXXX'],
  ]) {
    it(`does not load gtag.js with ${label}`, () => {
      const config = getAnalyticsRuntimeConfig({NEXT_PUBLIC_GTM_ID: value});

      assert.equal(config.googleTagId, '');
      assert.equal(config.status.googleTag.ok, false);
    });
  }
});
