export const analyticsEnvKeys = {
  gaMeasurementId: 'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  gtmId: 'NEXT_PUBLIC_GTM_ID',
};

export const GA4_PATTERN = /^G-[A-Z0-9]{4,}$/;
export const GTM_PATTERN = /^GTM-[A-Z0-9]+$/;
export const GA4_PLACEHOLDER_PATTERN = /^G-X+$/i;
export const GTM_PLACEHOLDER_PATTERN = /^GTM-X+$/i;

export function cleanEnvValue(env, key) {
  return (env[key] || '').trim();
}

export function validateRuntimeId({
  value,
  pattern,
  label,
  placeholderPattern,
}) {
  if (!value) return {ok: false, value, reason: `${label} is missing`};
  if (placeholderPattern.test(value)) {
    return {ok: false, value, reason: `${label} is still a placeholder value (${value})`};
  }
  if (!pattern.test(value)) {
    return {ok: false, value, reason: `${label} has an invalid format (${value})`};
  }
  return {ok: true, value, reason: `${label} format looks valid (${value})`};
}

export function getAnalyticsRuntimeConfig(env = process.env) {
  const gaMeasurementId = cleanEnvValue(env, analyticsEnvKeys.gaMeasurementId);
  const gtmId = cleanEnvValue(env, analyticsEnvKeys.gtmId);
  const gaStatus = validateRuntimeId({
    value: gaMeasurementId,
    pattern: GA4_PATTERN,
    label: analyticsEnvKeys.gaMeasurementId,
    placeholderPattern: GA4_PLACEHOLDER_PATTERN,
  });
  const gtmStatus = validateRuntimeId({
    value: gtmId,
    pattern: GTM_PATTERN,
    label: analyticsEnvKeys.gtmId,
    placeholderPattern: GTM_PLACEHOLDER_PATTERN,
  });

  return {
    gaMeasurementId: gaStatus.ok ? gaMeasurementId : '',
    gtmId: gtmStatus.ok ? gtmId : '',
    raw: {gaMeasurementId, gtmId},
    status: {ga: gaStatus, gtm: gtmStatus},
  };
}
