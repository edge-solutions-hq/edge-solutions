export const ANALYTICS_CONSENT_STORAGE_KEY =
  'edge-solutions.analytics-consent.v1';

export type AnalyticsConsent = 'accepted' | 'rejected' | 'undecided';
export type StoredAnalyticsConsent = Exclude<AnalyticsConsent, 'undecided'>;

type ConsentStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function parseAnalyticsConsent(value: string | null): AnalyticsConsent {
  return value === 'accepted' || value === 'rejected' ? value : 'undecided';
}

export function readAnalyticsConsent(
  storage: ConsentStorage | undefined =
    typeof window === 'undefined' ? undefined : window.localStorage
): AnalyticsConsent {
  if (!storage) return 'undecided';

  try {
    return parseAnalyticsConsent(storage.getItem(ANALYTICS_CONSENT_STORAGE_KEY));
  } catch {
    return 'undecided';
  }
}

export function writeAnalyticsConsent(
  consent: StoredAnalyticsConsent,
  storage: ConsentStorage | undefined =
    typeof window === 'undefined' ? undefined : window.localStorage
): boolean {
  if (!storage) return false;

  try {
    storage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
    return true;
  } catch {
    return false;
  }
}

export function hasAnalyticsConsent(): boolean {
  return readAnalyticsConsent() === 'accepted';
}
