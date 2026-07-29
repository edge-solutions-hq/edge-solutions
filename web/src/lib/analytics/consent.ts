export const ANALYTICS_CONSENT_STORAGE_KEY =
  'edge-solutions.analytics-consent.v1';

export type AnalyticsConsent = 'accepted' | 'rejected' | 'undecided';
export type StoredAnalyticsConsent = Exclude<AnalyticsConsent, 'undecided'>;

type ConsentStorage = Pick<Storage, 'getItem' | 'setItem'>;
let analyticsDeniedForSession = false;

export function parseAnalyticsConsent(value: string | null): AnalyticsConsent {
  return value === 'accepted' || value === 'rejected' ? value : 'undecided';
}

export function readAnalyticsConsent(storage?: ConsentStorage): AnalyticsConsent {
  try {
    const consentStorage = storage ?? (
      typeof window === 'undefined' ? undefined : window.localStorage
    );
    if (!consentStorage) return 'undecided';

    return parseAnalyticsConsent(
      consentStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)
    );
  } catch {
    return 'undecided';
  }
}

export function writeAnalyticsConsent(
  consent: StoredAnalyticsConsent,
  storage?: ConsentStorage
): boolean {
  try {
    const consentStorage = storage ?? (
      typeof window === 'undefined' ? undefined : window.localStorage
    );
    if (!consentStorage) return false;

    consentStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
    return true;
  } catch {
    return false;
  }
}

export function setAnalyticsConsentForSession(
  consent: StoredAnalyticsConsent
) {
  analyticsDeniedForSession = consent === 'rejected';
}

export function hasAnalyticsConsent(): boolean {
  return !analyticsDeniedForSession && readAnalyticsConsent() === 'accepted';
}
