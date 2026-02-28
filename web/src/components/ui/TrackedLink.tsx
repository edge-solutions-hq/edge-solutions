'use client';

import * as React from 'react';
import {Link} from '@/i18n/navigation';
import {trackConversionEvent} from '@/lib/analytics/events';

type EventParams = Record<string, string | number | boolean | undefined>;

type TrackedLinkProps = React.ComponentProps<typeof Link> & {
  eventName: string;
  eventParams?: EventParams;
};

function hrefToPathname(href: React.ComponentProps<typeof Link>['href']) {
  if (typeof href === 'string') return href;
  if (typeof href === 'object' && href && 'pathname' in href) {
    return typeof href.pathname === 'string' ? href.pathname : '';
  }

  return '';
}

export function TrackedLink({
  eventName,
  eventParams,
  onClick,
  href,
  ...props
}: TrackedLinkProps) {
  const hrefPathname = hrefToPathname(href);

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        trackConversionEvent(eventName, {
          page_path: window.location.pathname,
          link_target: hrefPathname || undefined,
          ...eventParams,
        });
      }}
      {...props}
    />
  );
}
