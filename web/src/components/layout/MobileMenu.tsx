'use client';

import * as React from 'react';
import {Link, usePathname} from '@/i18n/navigation';
import {cn} from '@/lib/cn';
import {trackContactCtaClick} from '@/lib/analytics/events';
import {
  getHeaderNavigationContactAction,
  getHeaderNavigationRenderItems,
  type HeaderNavigationItem,
} from '@/lib/navigation/header-navigation';

export function MobileMenu({
  items,
  ctaLabel,
  labels,
}: {
  items: HeaderNavigationItem[];
  ctaLabel: string;
  labels: {
    open: string;
    close: string;
  };
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const navItems = getHeaderNavigationRenderItems(pathname, items, 'mobile_menu_nav');
  const contactAction = getHeaderNavigationContactAction(items, ctaLabel, 'mobile_menu_cta');

  return (
    <div className="md:hidden">
      {open ? (
        <button
          type="button"
          aria-label={labels.close}
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="relative z-50">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={open ? labels.close : labels.open}
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none'
          )}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? labels.close : labels.open}</span>
          <span aria-hidden="true" className="grid gap-1">
            <span className="h-0.5 w-5 rounded bg-foreground/80" />
            <span className="h-0.5 w-5 rounded bg-foreground/80" />
            <span className="h-0.5 w-5 rounded bg-foreground/80" />
          </span>
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-3rem))] rounded-lg border border-border bg-surface p-2 shadow-lg"
          >
            <div className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  aria-current={item.active ? 'page' : undefined}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
                    item.active ? 'bg-surface-muted' : undefined
                  )}
                  onClick={() => {
                    if (item.trackingPayload) {
                      trackContactCtaClick(item.trackingPayload);
                    }

                    setOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {contactAction ? (
              <div className="mt-2 border-t border-border pt-2">
                <Link
                  href={contactAction.href}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none"
                  onClick={(event) => {
                    if (!event.defaultPrevented) {
                      trackContactCtaClick(contactAction.trackingPayload);
                    }

                    setOpen(false);
                  }}
                >
                  {contactAction.label}
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
