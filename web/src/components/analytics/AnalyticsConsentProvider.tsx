'use client';

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {Analytics} from '@vercel/analytics/react';
import {SpeedInsights} from '@vercel/speed-insights/next';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {
  hasAnalyticsConsent,
  readAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsent,
} from '@/lib/analytics/consent';
import {buttonClass} from '@/components/ui/Button';
import {GoogleAnalytics} from './GoogleAnalytics';

type ConsentContextValue = {
  openSettings: (trigger: HTMLButtonElement) => void;
};

const AnalyticsConsentContext = createContext<ConsentContextValue | null>(null);

const subscribeToConsent = () => () => {};
const readServerConsent = () => 'loading' as const;

function allowWhenConsented<T>(event: T): T | null {
  return hasAnalyticsConsent() ? event : null;
}

export function AnalyticsConsentProvider({
  children,
  googleTagId,
}: {
  children: ReactNode;
  googleTagId?: string;
}) {
  const t = useTranslations('analyticsConsent');
  const titleId = useId();
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const persistedConsent = useSyncExternalStore(
    subscribeToConsent,
    readAnalyticsConsent,
    readServerConsent
  );
  const [sessionConsent, setSessionConsent] = useState<AnalyticsConsent | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const consent = sessionConsent ?? persistedConsent;

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    settingsTriggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeSettings();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeSettings, settingsOpen]);

  function accept() {
    writeAnalyticsConsent('accepted');
    setSessionConsent('accepted');
    setSettingsOpen(false);
  }

  function reject() {
    const hadConsent = consent === 'accepted';
    writeAnalyticsConsent('rejected');
    setSessionConsent('rejected');
    setSettingsOpen(false);

    if (hadConsent) window.location.reload();
  }

  const showPanel = consent === 'undecided' || settingsOpen;
  const analyticsEnabled = consent === 'accepted';

  return (
    <AnalyticsConsentContext.Provider
      value={{
        openSettings(trigger) {
          settingsTriggerRef.current = trigger;
          setSettingsOpen(true);
        },
      }}
    >
      {children}

      {showPanel ? (
        <section
          role="region"
          aria-labelledby={titleId}
          className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-2xl rounded-lg border border-border bg-surface p-5 text-foreground shadow-[6px_6px_0_rgba(170,142,75,0.3)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-technical-blue">
                {consent === 'undecided' ? t('promptTitle') : t('settingsTitle')}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {consent === 'accepted'
                  ? t('acceptedDescription')
                  : consent === 'rejected'
                    ? t('rejectedDescription')
                    : t('promptDescription')}
              </p>
            </div>
            {consent !== 'undecided' ? (
              <button
                type="button"
                aria-label={t('close')}
                className="rounded-md border border-border px-2 py-1 text-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                onClick={closeSettings}
              >
                {t('close')}
              </button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {consent !== 'accepted' ? (
              <button type="button" className={buttonClass()} onClick={accept}>
                {t('accept')}
              </button>
            ) : null}
            <button
              type="button"
              className={buttonClass({variant: 'outline'})}
              onClick={reject}
            >
              {consent === 'accepted' ? t('withdraw') : t('reject')}
            </button>
            <Link
              href="/privacy-policy"
              className="text-sm text-link underline underline-offset-4 decoration-primary/60 hover:decoration-link"
            >
              {t('privacyLink')}
            </Link>
          </div>
        </section>
      ) : null}

      {analyticsEnabled ? (
        <>
          {googleTagId ? (
            <Suspense fallback={null}>
              <GoogleAnalytics measurementId={googleTagId} />
            </Suspense>
          ) : null}
          <Analytics beforeSend={allowWhenConsented} />
          <SpeedInsights beforeSend={allowWhenConsented} />
        </>
      ) : null}
    </AnalyticsConsentContext.Provider>
  );
}

export function AnalyticsSettingsButton({className}: {className?: string}) {
  const t = useTranslations('analyticsConsent');
  const consent = useContext(AnalyticsConsentContext);

  if (!consent) return null;

  return (
    <button
      type="button"
      className={className}
      onClick={(event) => consent.openSettings(event.currentTarget)}
    >
      {t('settingsButton')}
    </button>
  );
}
