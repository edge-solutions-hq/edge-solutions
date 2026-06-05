#!/usr/bin/env node

import {getAnalyticsRuntimeConfig} from '../src/lib/runtime-config-core.mjs';

const args = new Set(process.argv.slice(2));
const strict = args.has('--strict');
const requireGoogleTag = strict || args.has('--require-google-tag') || args.has('--require-gtm');

const analyticsConfig = getAnalyticsRuntimeConfig();
const {googleTagId} = analyticsConfig.raw;
const {googleTag: googleTagStatus} = analyticsConfig.status;

console.log('Analytics env validation');
console.log('------------------------');

if (googleTagId) {
  console.log(`• Google tag: ${googleTagStatus.reason}`);
} else {
  console.log('• Google tag: NEXT_PUBLIC_GTM_ID not set');
}

let hasFailure = false;

if (requireGoogleTag && !googleTagStatus.ok) {
  hasFailure = true;
  console.error(`\nERROR: ${googleTagStatus.reason}`);
}

if (!requireGoogleTag && !googleTagId) {
  console.log('\nNo analytics IDs configured. This is valid for local development.');
}

if (hasFailure) {
  process.exit(1);
}

console.log('\nValidation complete.');
