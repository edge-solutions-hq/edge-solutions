'use client';

import type {OfferTrackSlug} from '@/lib/offer-tracks';
import type {ContactAttemptOutcome, ContactOfferValue} from '@/lib/contact/intake';
import {
  currentBrowserPagePath,
  readBrowserAnalyticsContext,
  type BrowserAnalyticsContext,
} from '@/lib/analytics/browser-context';
import {
  analyticsEvents,
  type ContactCtaPlacement,
  type OfferTrackClickPlacement,
  type ScrollDepthThreshold,
} from '@/lib/analytics/taxonomy';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

function compactParams(
  params: EventParams | BrowserAnalyticsContext
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number | boolean>;
}

export function trackConversionEvent(eventName: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;

  const payload = compactParams({
    ...readBrowserAnalyticsContext(),
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

export function currentPagePath() {
  return currentBrowserPagePath();
}

export function trackContactCtaClick({
  ctaTarget,
  placement,
  ctaLabel,
}: {
  ctaTarget: string;
  placement?: ContactCtaPlacement;
  ctaLabel?: string;
}) {
  trackConversionEvent(analyticsEvents.contactCtaClick, {
    cta_target: ctaTarget,
    page_path: currentPagePath(),
    placement,
    cta_label: ctaLabel,
  });
}

export function trackOfferTrackClick({
  offerTrackSlug,
  placement,
  linkTarget,
  linkLabel,
}: {
  offerTrackSlug: OfferTrackSlug;
  placement: OfferTrackClickPlacement;
  linkTarget?: string;
  linkLabel?: string;
}) {
  trackConversionEvent(analyticsEvents.offerTrackClick, {
    service_slug: offerTrackSlug,
    placement,
    page_path: currentPagePath(),
    link_target: linkTarget,
    link_label: linkLabel,
  });
}

export function trackLocaleSwitch({
  fromLocale,
  toLocale,
}: {
  fromLocale: string;
  toLocale: string;
}) {
  trackConversionEvent(analyticsEvents.localeSwitch, {
    from_locale: fromLocale,
    to_locale: toLocale,
    page_path: currentPagePath(),
  });
}

export function trackServiceScrollDepth({
  offerTrackSlug,
  scrollDepthPercent,
}: {
  offerTrackSlug: OfferTrackSlug;
  scrollDepthPercent: ScrollDepthThreshold;
}) {
  trackConversionEvent(analyticsEvents.offerTrackScrollDepth, {
    service_slug: offerTrackSlug,
    scroll_depth_percent: scrollDepthPercent,
  });
}

export function trackContactFormSubmit({
  service,
  submitAttempt,
}: {
  service?: string;
  submitAttempt: number;
}) {
  trackConversionEvent(analyticsEvents.contactFormSubmit, {
    service,
    page_path: currentPagePath(),
    submit_attempt: submitAttempt,
  });
}

export function trackContactFormOutcome({
  outcome,
  submitAttempt,
}: {
  outcome: ContactAttemptOutcome;
  submitAttempt: number;
}) {
  if (outcome.kind === 'spam') return;

  if (outcome.kind === 'success') {
    trackConversionEvent(analyticsEvents.contactFormSuccess, {
      page_path: currentPagePath(),
      service: outcome.service,
      submit_attempt: submitAttempt,
    });
    return;
  }

  const service = 'service' in outcome ? outcome.service : undefined;
  const fieldErrorCount =
    outcome.kind === 'validation_error'
      ? Object.values(outcome.fieldErrors).filter(Boolean).length
      : undefined;

  trackConversionEvent(analyticsEvents.contactFormError, {
    page_path: currentPagePath(),
    service: service as ContactOfferValue | string | undefined,
    submit_attempt: submitAttempt,
    error_type: outcome.kind === 'validation_error' ? 'validation' : 'delivery',
    error_field_count: fieldErrorCount,
  });
}
