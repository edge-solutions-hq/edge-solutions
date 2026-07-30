'use client';

import * as React from 'react';
import {Link, usePathname} from '@/i18n/navigation';
import {cn} from '@/lib/cn';
import {buttonClass} from '@/components/ui/Button';
import {surfaceClass} from '@/components/ui/Surface';
import {trackContactCtaClick} from '@/lib/analytics/events';
import {
  shouldOpenContactModalForClick,
  useContactModal,
} from '@/components/contact/ContactModalContext';
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
  const menuId = React.useId();
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const navItems = getHeaderNavigationRenderItems(pathname, items, 'mobile_menu_nav');
  const contactAction = getHeaderNavigationContactAction(items, ctaLabel, 'mobile_menu_cta');
  const contactModal = useContactModal();

  React.useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

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
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? labels.close : labels.open}
          className={cn(
            buttonClass({variant: 'outline', size: 'md', className: 'px-3'})
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
            id={menuId}
            className={surfaceClass('card', 'absolute right-0 mt-2 w-[min(22rem,calc(100vw-3rem))] p-2')}
          >
            <div className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={item.active ? 'page' : undefined}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
                    item.active ? 'bg-surface-muted' : undefined
                  )}
                  onClick={(event) => {
                    if (item.trackingPayload) {
                      trackContactCtaClick(item.trackingPayload);
                    }

                    if (
                      item.trackingPayload &&
                      contactModal &&
                      !event.defaultPrevented &&
                      shouldOpenContactModalForClick(event)
                    ) {
                      event.preventDefault();
                      setOpen(false);
                      toggleRef.current?.focus();
                      contactModal.openContactModal({href: item.href});
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
                  className={buttonClass({size: 'lg', className: 'w-full'})}
                  onClick={(event) => {
                    if (!event.defaultPrevented) {
                      trackContactCtaClick(contactAction.trackingPayload);
                    }

                    if (
                      contactModal &&
                      !event.defaultPrevented &&
                      shouldOpenContactModalForClick(event)
                    ) {
                      event.preventDefault();
                      setOpen(false);
                      toggleRef.current?.focus();
                      contactModal.openContactModal({href: contactAction.href});
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
