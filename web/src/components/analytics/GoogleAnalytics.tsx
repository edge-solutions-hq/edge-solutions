'use client';

import {useEffect, useRef} from 'react';
import Script from 'next/script';
import {usePathname, useSearchParams} from 'next/navigation';
import {readBrowserAnalyticsContext} from '@/lib/analytics/browser-context';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type GoogleAnalyticsProps = {
  measurementId: string;
};

export function GoogleAnalytics({measurementId}: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const previousPagePathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!window.gtag) return;

    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;
    const previousPagePath = previousPagePathRef.current;
    const browserContext = readBrowserAnalyticsContext({pagePath, pathname});

    window.gtag('config', measurementId, {
      ...browserContext,
      previous_page_path: previousPagePath || undefined,
    });

    previousPagePathRef.current = pagePath;
  }, [measurementId, pathname, queryString]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
