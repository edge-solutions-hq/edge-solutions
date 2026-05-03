'use client';

import {useEffect, useRef} from 'react';
import Script from 'next/script';
import {usePathname, useSearchParams} from 'next/navigation';
import {LOCALES} from '@/i18n/routing';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type GoogleAnalyticsProps = {
  measurementId: string;
};

const SUPPORTED_LOCALES = new Set<string>(LOCALES);

function resolveSiteLocale(pathname: string): string | undefined {
  const htmlLang = document.documentElement.lang.trim().toLowerCase();
  const normalizedHtmlLang = htmlLang.split('-')[0];

  if (SUPPORTED_LOCALES.has(normalizedHtmlLang)) {
    return normalizedHtmlLang;
  }

  const pathLocale = pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  if (pathLocale && SUPPORTED_LOCALES.has(pathLocale)) {
    return pathLocale;
  }

  return undefined;
}

export function GoogleAnalytics({measurementId}: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const previousPagePathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!window.gtag) return;

    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;
    const previousPagePath = previousPagePathRef.current;

    window.gtag('config', measurementId, {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title.trim() || undefined,
      site_locale: resolveSiteLocale(pathname),
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
