#!/usr/bin/env node

import {getAnalyticsRuntimeConfig} from '../src/lib/runtime-config-core.mjs';

const requireGoogleTagFlags = ['--strict', '--require-google-tag', '--require-gtm'];
const args = new Set(process.argv.slice(2));
const requireGoogleTag = requireGoogleTagFlags.some((flag) => args.has(flag));

const analyticsConfig = getAnalyticsRuntimeConfig();
const {googleTagId} = analyticsConfig.raw;
const {googleTag: googleTagStatus} = analyticsConfig.status;

function resolveGoogleTagOutcome() {
  if (googleTagStatus.ok) return {kind: 'ok'};
  if (googleTagId || requireGoogleTag) return {kind: 'fail', reason: googleTagStatus.reason};
  return {kind: 'absent_allowed'};
}

console.log('Analytics env validation');
console.log('------------------------');
console.log(`• Google tag: ${googleTagId ? googleTagStatus.reason : 'NEXT_PUBLIC_GTM_ID not set'}`);

const outcome = resolveGoogleTagOutcome();

switch (outcome.kind) {
  case 'fail':
    console.error(`\nERROR: ${outcome.reason}`);
    process.exit(1);
    break;
  case 'absent_allowed':
    console.log('\nNo analytics IDs configured. This is valid for local development.');
    break;
  case 'ok':
    break;
}

console.log('\nValidation complete.');
