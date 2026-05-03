#!/usr/bin/env node

import {getAnalyticsRuntimeConfig} from '../src/lib/runtime-config-core.mjs';

const args = new Set(process.argv.slice(2));
const strict = args.has('--strict');
const requireGa = strict || args.has('--require-ga');
const requireGtm = strict || args.has('--require-gtm');

const analyticsConfig = getAnalyticsRuntimeConfig();
const {gaMeasurementId, gtmId} = analyticsConfig.raw;
const {ga: gaStatus, gtm: gtmStatus} = analyticsConfig.status;

console.log('Analytics env validation');
console.log('------------------------');

if (gaMeasurementId) {
  console.log(`• GA4: ${gaStatus.reason}`);
} else {
  console.log('• GA4: NEXT_PUBLIC_GA_MEASUREMENT_ID not set');
}

if (gtmId) {
  console.log(`• GTM: ${gtmStatus.reason}`);
} else {
  console.log('• GTM: NEXT_PUBLIC_GTM_ID not set');
}

let hasFailure = false;

if (requireGa && !gaStatus.ok) {
  hasFailure = true;
  console.error(`\nERROR: ${gaStatus.reason}`);
}

if (requireGtm && !gtmStatus.ok) {
  hasFailure = true;
  console.error(`\nERROR: ${gtmStatus.reason}`);
}

if (!requireGa && !requireGtm && !gaMeasurementId && !gtmId) {
  console.log('\nNo analytics IDs configured. This is valid for local development.');
}

if (hasFailure) {
  process.exit(1);
}

console.log('\nValidation complete.');
