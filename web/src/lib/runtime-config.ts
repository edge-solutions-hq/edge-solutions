import {site} from '@/lib/site';
import {cleanEnvValue} from '@/lib/runtime-config-core.mjs';

export {
  analyticsEnvKeys,
  cleanEnvValue,
  GOOGLE_TAG_PATTERN,
  GOOGLE_TAG_PLACEHOLDER_PATTERN,
  getAnalyticsRuntimeConfig,
  validateRuntimeId,
} from '@/lib/runtime-config-core.mjs';

export const contactEnvKeys = {
  resendApiKey: 'RESEND_API_KEY',
  resendFromEmail: 'RESEND_FROM_EMAIL',
  resendToEmail: 'RESEND_TO_EMAIL',
} as const;

type RuntimeEnv = Record<string, string | undefined>;

export type RuntimeIdStatus = {
  ok: boolean;
  value: string;
  reason: string;
};

export function getContactDeliveryConfig(env: RuntimeEnv = process.env) {
  const apiKey = cleanEnvValue(env, contactEnvKeys.resendApiKey);
  const from = cleanEnvValue(env, contactEnvKeys.resendFromEmail) || 'Edge Solutions <onboarding@resend.dev>';
  const to = cleanEnvValue(env, contactEnvKeys.resendToEmail) || site.contactEmail;

  return {
    ready: Boolean(apiKey),
    missingKeys: apiKey ? [] : [contactEnvKeys.resendApiKey],
    apiKey,
    from,
    to,
  };
}
