export const CONTACT_RATE_LIMIT_ID = 'contact-submit';

export type ContactAbuseDecision = 'allowed' | 'limited' | 'unavailable';

export type ContactAbuseAdapter = () => Promise<ContactAbuseDecision>;

export type ContactRateLimitResult = {
  rateLimited: boolean;
  error?: 'not-found' | 'blocked';
};

export function normalizeContactRateLimitResult(
  result: ContactRateLimitResult
): ContactAbuseDecision {
  if (result.error) return 'unavailable';
  return result.rateLimited ? 'limited' : 'allowed';
}
