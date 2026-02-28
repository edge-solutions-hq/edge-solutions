'use client';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

function compactParams(params: EventParams): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number | boolean>;
}

export function trackConversionEvent(eventName: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;

  const defaultPath = `${window.location.pathname}${window.location.search}`;
  const payload = compactParams({
    page_path: defaultPath,
    page_location: window.location.href,
    ...params,
  });

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...payload,
    });
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  }
}
