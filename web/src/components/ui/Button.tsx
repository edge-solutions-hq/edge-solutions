'use client';

import * as React from 'react';
import {Link} from '@/i18n/navigation';
import {trackConversionEvent} from '@/lib/analytics/events';
import {cn} from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  outline: 'border border-border bg-surface text-foreground hover:bg-surface-muted',
  ghost: 'text-foreground hover:bg-surface-muted'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3',
  md: 'h-10 px-4',
  lg: 'h-11 px-5'
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

function isContactPath(path: string): boolean {
  const cleanPath = path.split(/[?#]/, 1)[0] ?? '';
  return cleanPath.endsWith('/contact') || cleanPath === '/contact';
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  trackingPlacement?: string;
};

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  href,
  trackingPlacement,
  ...props
}: ButtonLinkProps) {
  const hrefPathname = hrefToPathname(href);
  const isContactCta = isContactPath(hrefPathname);

  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || !isContactCta) {
          return;
        }

        const currentPath = `${window.location.pathname}${window.location.search}`;
        const ctaLabel =
          event.currentTarget.getAttribute('aria-label')?.trim() ||
          event.currentTarget.textContent?.trim();

        trackConversionEvent('contact_cta_click', {
          cta_target: hrefPathname,
          page_path: currentPath,
          placement: trackingPlacement,
          cta_label: ctaLabel || undefined,
        });
      }}
      {...props}
    />
  );
}
