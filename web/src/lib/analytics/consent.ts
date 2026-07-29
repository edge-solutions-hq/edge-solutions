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
    if (storage) {
      return parseAnalyticsConsent(
        storage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)
      );
    }
    if (typeof window === 'undefined') return 'undecided';

    const fallbackConsent = parseAnalyticsConsent(
      window.sessionStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)
    );
    if (fallbackConsent === 'rejected') return fallbackConsent;
    return parseAnalyticsConsent(
      window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)
    );
  } catch {
    return 'undecided';
  }
}

export function writeAnalyticsConsent(
  consent: StoredAnalyticsConsent,
  storage?: ConsentStorage
): boolean {
  if (storage) {
    try {
      storage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
      return true;
    } catch {
      return false;
    }
  }
  if (typeof window === 'undefined') return false;

  if (consent === 'accepted') {
    try {
      window.sessionStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
      window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
      return true;
    } catch {
      return false;
    }
  }

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
    return true;
  } catch {
    let fallbackPersisted = false;

    try {
      window.sessionStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
      fallbackPersisted = true;
    } catch {}

    try {
      window.localStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
    } catch {}

    return fallbackPersisted;
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
