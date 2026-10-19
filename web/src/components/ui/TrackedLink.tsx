'use client';

import * as React from 'react';
import {Link} from '@/i18n/navigation';
import {trackOfferTrackClick} from '@/lib/analytics/events';
import type {OfferTrackClickPlacement} from '@/lib/analytics/taxonomy';
import type {OfferTrackSlug} from '@/lib/offer-tracks';
import {hrefToTrackedTarget} from '@/lib/navigation/tracked-link-target';

type TrackedLinkProps = React.ComponentProps<typeof Link> & {
  offerTrackSlug: OfferTrackSlug;
  trackingPlacement: OfferTrackClickPlacement;
  trackingLabel?: string;
};

export function TrackedLink({
  offerTrackSlug,
  trackingPlacement,
  trackingLabel,
  onClick,
  href,
  ...props
}: TrackedLinkProps) {
  const hrefPathname = hrefToTrackedTarget(href);

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        const linkLabel =
          trackingLabel?.trim() ||
          event.currentTarget.getAttribute('aria-label')?.trim() ||
          event.currentTarget.textContent?.trim();

        trackOfferTrackClick({
          offerTrackSlug,
          placement: trackingPlacement,
          linkTarget: hrefPathname || undefined,
          linkLabel: linkLabel || undefined,
        });
      }}
      {...props}
    />
  );
}
