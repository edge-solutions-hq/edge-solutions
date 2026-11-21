'use client';

import * as React from 'react';
import {createPortal} from 'react-dom';
import {Link, usePathname} from '@/i18n/navigation';
import {cn} from '@/lib/cn';
import {trackContactCtaClick} from '@/lib/analytics/events';
import {
  shouldOpenContactModalForClick,
  useContactModal,
} from '@/components/contact/ContactModalContext';
import {
  getHeaderNavigationRenderItems,
  type HeaderNavigationItem,
} from '@/lib/navigation/header-navigation';

type PaletteLabels = {
  title: string;
  placeholder: string;
  empty: string;
  close: string;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function CommandPalette({
  items,
  extraItems = [],
  labels,
}: {
  items: HeaderNavigationItem[];
  extraItems?: HeaderNavigationItem[];
  labels: PaletteLabels;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const titleId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const contactModal = useContactModal();

  const navItems = getHeaderNavigationRenderItems(
    pathname,
    [...items, ...extraItems],
    'header_nav'
  );
  const needle = normalize(query.trim());
  const results = needle
    ? navItems.filter(
        (item) => normalize(item.label).includes(needle) || item.href.includes(needle)
      )
    : navItems;

  const close = React.useCallback((restoreFocus = true) => {
    setOpen(false);
    setQuery('');
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        const triggerIsVisible = triggerRef.current?.offsetParent != null;
        if (!triggerIsVisible) return;
        const anotherModalIsOpen = Array.from(
          document.querySelectorAll('[role="dialog"][aria-modal="true"]')
        ).some((dialog) => dialog !== dialogRef.current);
        if (anotherModalIsOpen) return;
        event.preventDefault();
        const paletteIsOpen = dialogRef.current != null;
        if (paletteIsOpen) close();
        else setOpen(true);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function resultLinks() {
    return Array.from(listRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? []);
  }

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }

    const links = resultLinks();
    const index = links.findIndex((link) => link === document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      (links[index + 1] ?? links[0])?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index <= 0) inputRef.current?.focus();
      else links[index - 1]?.focus();
    } else if (event.key === 'Enter' && document.activeElement === inputRef.current) {
      event.preventDefault();
      links[0]?.click();
    } else if (event.key === 'Tab') {
      const focusable = [inputRef.current, ...links].filter(Boolean) as HTMLElement[];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        className="hidden h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background/60 px-2.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/70 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary motion-reduce:transition-none xl:inline-flex"
        onClick={() => setOpen(true)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.6"
        >
          <circle cx="7" cy="7" r="4.25" />
          <path d="m10.5 10.5 3 3" />
        </svg>
        <span className="sr-only">{labels.title}</span>
        <kbd className="whitespace-nowrap rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.6875rem] text-muted-foreground">
          Ctrl K
        </kbd>
      </button>

      {open
        ? createPortal(
        <div className="fixed inset-0 z-[95]">
          <button
            type="button"
            tabIndex={-1}
            aria-label={labels.close}
            className="absolute inset-0 h-full w-full cursor-default bg-black/65 backdrop-blur-sm"
            onClick={() => close()}
          />

          <div className="pointer-events-none relative z-10 flex justify-center px-4 pt-[12vh]">
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-md border border-border-strong bg-surface shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95)]"
              onKeyDown={handleDialogKeyDown}
            >
              <h2 id={titleId} className="sr-only">
                {labels.title}
              </h2>
              <div className="flex items-center gap-3 border-b border-border px-4">
                <span className="font-mono text-sm font-extrabold text-primary" aria-hidden="true">
                  &gt;
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label={labels.placeholder}
                  placeholder={labels.placeholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="h-12 w-full bg-transparent font-mono text-sm text-heading placeholder:text-subtle-foreground focus-visible:outline-none"
                />
                <kbd
                  className="shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[0.6875rem] text-muted-foreground"
                  aria-hidden="true"
                >
                  Esc
                </kbd>
              </div>

              {results.length > 0 ? (
                <ul ref={listRef} role="list" className="max-h-[50vh] overflow-y-auto p-2">
                  {results.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={item.active ? 'page' : undefined}
                        className={cn(
                          'flex items-center justify-between gap-4 rounded px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none',
                          item.active ? 'text-heading' : undefined
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
                            close();
                            contactModal.openContactModal({href: item.href});
                            return;
                          }

                          close(false);
                        }}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={cn(
                              'font-mono',
                              item.active ? 'text-primary' : 'text-subtle-foreground'
                            )}
                            aria-hidden="true"
                          >
                            &gt;
                          </span>
                          {item.label}
                        </span>
                        <span className="font-mono text-xs text-subtle-foreground" aria-hidden="true">
                          {item.href}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-6 font-mono text-sm text-muted-foreground" role="status">
                  {labels.empty}
                </p>
              )}
            </div>
          </div>
        </div>,
            document.body
          )
        : null}
    </>
  );
}
