'use client';

import type {OfferTrackSlug} from '@/lib/offer/offer-tracks';
import type {ContactAttemptOutcome, ContactOfferValue} from '@/lib/contact/intake';
import {
  currentBrowserPagePath,
  readBrowserAnalyticsContext,
  type BrowserAnalyticsContext,
} from './browser-context';
import {
  analyticsEvents,
  type ContactCtaPlacement,
  type OfferTrackClickPlacement,
  type ScrollDepthThreshold,
} from './taxonomy';
import {hasAnalyticsConsent} from './consent';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;
type AnalyticsEventPayload = {
  eventName: string;
  params: EventParams;
};

function compactParams(
  params: EventParams | BrowserAnalyticsContext
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number | boolean>;
}

export function trackConversionEvent(eventName: string, params: EventParams = {}) {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return;

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

export function buildContactCtaClickPayload({
  ctaTarget,
  placement,
  ctaLabel,
  pagePath,
}: {
  ctaTarget: string;
  placement?: ContactCtaPlacement;
  ctaLabel?: string;
  pagePath?: string;
}): AnalyticsEventPayload {
  return {
    eventName: analyticsEvents.contactCtaClick,
    params: {
      cta_target: ctaTarget,
      page_path: pagePath,
      placement,
      cta_label: ctaLabel,
    },
  };
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
  const payload = buildContactCtaClickPayload({
    ctaTarget,
    placement,
    ctaLabel,
    pagePath: currentPagePath(),
  });

  trackConversionEvent(payload.eventName, payload.params);
}

export function buildOfferTrackClickPayload({
  offerTrackSlug,
  placement,
  linkTarget,
  linkLabel,
  pagePath,
}: {
  offerTrackSlug: OfferTrackSlug;
  placement: OfferTrackClickPlacement;
  linkTarget?: string;
  linkLabel?: string;
  pagePath?: string;
}): AnalyticsEventPayload {
  return {
    eventName: analyticsEvents.offerTrackClick,
    params: {
      service_slug: offerTrackSlug,
      placement,
      page_path: pagePath,
      link_target: linkTarget,
      link_label: linkLabel,
    },
  };
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
  const payload = buildOfferTrackClickPayload({
    offerTrackSlug,
    placement,
    linkTarget,
    linkLabel,
    pagePath: currentPagePath(),
  });

  trackConversionEvent(payload.eventName, payload.params);
}

export function buildLocaleSwitchPayload({
  fromLocale,
  toLocale,
  pagePath,
}: {
  fromLocale: string;
  toLocale: string;
  pagePath?: string;
}): AnalyticsEventPayload {
  return {
    eventName: analyticsEvents.localeSwitch,
    params: {
      from_locale: fromLocale,
      to_locale: toLocale,
      page_path: pagePath,
    },
  };
}

export function trackLocaleSwitch({
  fromLocale,
  toLocale,
}: {
  fromLocale: string;
  toLocale: string;
}) {
  const payload = buildLocaleSwitchPayload({
    fromLocale,
    toLocale,
    pagePath: currentPagePath(),
  });

  trackConversionEvent(payload.eventName, payload.params);
}

export function buildServiceScrollDepthPayload({
  offerTrackSlug,
  scrollDepthPercent,
}: {
  offerTrackSlug: OfferTrackSlug;
  scrollDepthPercent: ScrollDepthThreshold;
}): AnalyticsEventPayload {
  return {
    eventName: analyticsEvents.offerTrackScrollDepth,
    params: {
      service_slug: offerTrackSlug,
      scroll_depth_percent: scrollDepthPercent,
    },
  };
}

export function trackServiceScrollDepth({
  offerTrackSlug,
  scrollDepthPercent,
}: {
  offerTrackSlug: OfferTrackSlug;
  scrollDepthPercent: ScrollDepthThreshold;
}) {
  const payload = buildServiceScrollDepthPayload({
    offerTrackSlug,
    scrollDepthPercent,
  });

  trackConversionEvent(payload.eventName, payload.params);
}

export function buildContactFormSubmitPayload({
  service,
  submitAttempt,
  pagePath,
}: {
  service?: string;
  submitAttempt: number;
  pagePath?: string;
}): AnalyticsEventPayload {
  return {
    eventName: analyticsEvents.contactFormSubmit,
    params: {
      service,
      page_path: pagePath,
      submit_attempt: submitAttempt,
    },
  };
}

export function trackContactFormSubmit({
  service,
  submitAttempt,
}: {
  service?: string;
  submitAttempt: number;
}) {
  const payload = buildContactFormSubmitPayload({
    service,
    submitAttempt,
    pagePath: currentPagePath(),
  });

  trackConversionEvent(payload.eventName, payload.params);
}

export function buildContactFormOutcomePayload({
  outcome,
  submitAttempt,
  pagePath,
}: {
  outcome: ContactAttemptOutcome;
  submitAttempt: number;
  pagePath?: string;
}): AnalyticsEventPayload | undefined {
  if (outcome.kind === 'spam') return undefined;

  if (outcome.kind === 'success') {
    return {
      eventName: analyticsEvents.contactFormSuccess,
      params: {
        page_path: pagePath,
        service: outcome.service,
        submit_attempt: submitAttempt,
      },
    };
  }

  const service = 'service' in outcome ? outcome.service : undefined;
  const fieldErrorCount =
    outcome.kind === 'validation_error'
      ? Object.values(outcome.fieldErrors).filter(Boolean).length
      : undefined;
  const errorType = outcome.kind === 'validation_error'
    ? 'validation'
    : outcome.kind === 'limited'
      ? 'limited'
      : 'delivery';

  return {
    eventName: analyticsEvents.contactFormError,
    params: {
      page_path: pagePath,
      service: service as ContactOfferValue | string | undefined,
      submit_attempt: submitAttempt,
      error_type: errorType,
      error_field_count: fieldErrorCount,
    },
  };
}

export function trackContactFormOutcome({
  outcome,
  submitAttempt,
}: {
  outcome: ContactAttemptOutcome;
  submitAttempt: number;
}) {
  const payload = buildContactFormOutcomePayload({
    outcome,
    submitAttempt,
    pagePath: currentPagePath(),
  });

  if (!payload) return;

  trackConversionEvent(payload.eventName, payload.params);
}
