#!/usr/bin/env node

const args = new Set(process.argv.slice(2));
const requireGa = args.has('--require-ga');
const requireGtm = args.has('--require-gtm');

const gaMeasurementId = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '').trim();
const gtmId = (process.env.NEXT_PUBLIC_GTM_ID || '').trim();

const GA4_PATTERN = /^G-[A-Z0-9]{4,}$/;
const GTM_PATTERN = /^GTM-[A-Z0-9]+$/;

function checkId(value, pattern, label) {
  if (!value) {
    return {ok: false, reason: `${label} is missing`};
  }

  if (!pattern.test(value)) {
    return {ok: false, reason: `${label} has an invalid format (${value})`};
  }

  return {ok: true, reason: `${label} format looks valid (${value})`};
}

const gaStatus = checkId(gaMeasurementId, GA4_PATTERN, 'NEXT_PUBLIC_GA_MEASUREMENT_ID');
const gtmStatus = checkId(gtmId, GTM_PATTERN, 'NEXT_PUBLIC_GTM_ID');

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
