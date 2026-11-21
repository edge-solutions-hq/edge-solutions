import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import path from 'node:path';

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

describe('analytics env check script', () => {
  const script = path.join(import.meta.dirname, '../scripts/validate-analytics-env.mjs');

  function runCheck(googleTagId, args = []) {
    const env = {...process.env, NEXT_PUBLIC_GTM_ID: googleTagId};
    return spawnSync(process.execPath, [script, ...args], {env, encoding: 'utf8'}).status;
  }

  for (const [label, value, args, expected] of [
    ['passes with a valid ID', 'G-5JG1EX9FQ8', [], 0],
    ['passes with no ID outside strict mode', '', [], 0],
    ['fails with no ID in strict mode', '', ['--strict'], 1],
    ['fails with a Tag Manager container ID', 'GTM-WRD5HMK3', [], 1],
    ['fails with the placeholder ID', 'G-XXXXXXXXXX', [], 1],
  ]) {
    it(label, () => {
      assert.equal(runCheck(value, args), expected);
    });
  }
});
