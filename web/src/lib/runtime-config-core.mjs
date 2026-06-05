export const analyticsEnvKeys = {
  googleTagId: 'NEXT_PUBLIC_GTM_ID',
};

export const GOOGLE_TAG_PATTERN = /^G-[A-Z0-9]{4,}$/;
export const GOOGLE_TAG_PLACEHOLDER_PATTERN = /^G-X+$/i;

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
  const googleTagId = cleanEnvValue(env, analyticsEnvKeys.googleTagId);
  const googleTagStatus = validateRuntimeId({
    value: googleTagId,
    pattern: GOOGLE_TAG_PATTERN,
    label: analyticsEnvKeys.googleTagId,
    placeholderPattern: GOOGLE_TAG_PLACEHOLDER_PATTERN,
  });

  return {
    googleTagId: googleTagStatus.ok ? googleTagId : '',
    raw: {googleTagId},
    status: {googleTag: googleTagStatus},
  };
}
