'use client';

import * as React from 'react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/cn';
import {ButtonLink} from '@/components/ui/Button';
import type {HeaderNavItem} from './HeaderNav';

export function MobileMenu({
  items,
  ctaLabel
}: {
  items: HeaderNavItem[];
  ctaLabel: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      {open ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="relative z-50">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none'
          )}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
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
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-2 border-t border-border pt-2">
              <ButtonLink
                href="/contact"
                size="lg"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                {ctaLabel}
              </ButtonLink>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}


