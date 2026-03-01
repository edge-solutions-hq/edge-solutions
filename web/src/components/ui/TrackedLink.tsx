'use client';

import * as React from 'react';
import {Link} from '@/i18n/navigation';
import {trackConversionEvent} from '@/lib/analytics/events';

type EventParams = Record<string, string | number | boolean | undefined>;

type TrackedLinkProps = React.ComponentProps<typeof Link> & {
  eventName: string;
  eventParams?: EventParams;
};

function queryValueToStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(queryValueToStrings);
  }

  if (value === undefined || value === null) {
    return [];
  }

  return [String(value)];
}

function queryToSearch(query: Record<string, unknown> | undefined): string {
  if (!query) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    queryValueToStrings(value).forEach((item) => {
      searchParams.append(key, item);
    });
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

function normalizeHash(hash: unknown): string {
  if (typeof hash !== 'string' || hash.length === 0) {
    return '';
  }

  return hash.startsWith('#') ? hash : `#${hash}`;
}

function hrefToPathname(href: React.ComponentProps<typeof Link>['href']) {
  if (typeof href === 'string') return href;
  if (typeof href === 'object' && href && 'pathname' in href) {
    const pathname = typeof href.pathname === 'string' ? href.pathname : '';
    const query = 'query' in href ? queryToSearch(href.query as Record<string, unknown>) : '';
    const hash = 'hash' in href ? normalizeHash(href.hash) : '';

    return `${pathname}${query}${hash}`;
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

        const currentPath = `${window.location.pathname}${window.location.search}`;
        const linkLabel =
          event.currentTarget.getAttribute('aria-label')?.trim() ||
          event.currentTarget.textContent?.trim();

        trackConversionEvent(eventName, {
          page_path: currentPath,
          link_target: hrefPathname || undefined,
          link_label: linkLabel || undefined,
          ...eventParams,
        });
      }}
      {...props}
    />
  );
}
