'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import {useTranslations} from 'next-intl';
import {
  ContactModalContext,
  type ContactModalRequest,
} from '@/components/contact/ContactModalContext';
import {cn} from '@/lib/cn';
import {
  defaultContactOfferValue,
  resolveContactServiceTarget,
  type ContactOfferValue,
} from '@/lib/contact/options';
import {WindowDots} from '@/components/ui/WindowChrome';
import {ContactForm} from './ContactForm';

type ContactModalState = {
  formKey: number;
  open: boolean;
  service?: ContactOfferValue;
};

const initialState: ContactModalState = {
  formKey: 0,
  open: false,
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function ContactModalProvider({children}: {children: ReactNode}) {
  const t = useTranslations();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [modal, setModal] = useState<ContactModalState>(initialState);

  const closeContactModal = useCallback(() => {
    setModal((current) => ({...current, open: false}));
  }, []);

  const openContactModal = useCallback((request?: ContactModalRequest) => {
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const service =
      request?.service ??
      resolveContactServiceTarget(request?.href ?? '') ??
      defaultContactOfferValue;

    setModal((current) => ({
      formKey: current.formKey + 1,
      open: true,
      service,
    }));
  }, []);

  useEffect(() => {
    if (!modal.open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeContactModal();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocusedRef.current?.isConnected) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [closeContactModal, modal.open]);

  function handleDialogKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []
    ).filter((element) => element.offsetParent !== null || element === document.activeElement);

    const first = focusable[0];
    const last = focusable.at(-1);

    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <ContactModalContext.Provider value={{openContactModal}}>
      {children}

      {modal.open ? (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label={t('contact.modalClose')}
            className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
            onClick={closeContactModal}
          />

          <div className="pointer-events-none relative z-10 flex min-h-dvh items-stretch justify-center sm:items-center sm:p-6">
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={cn(
                'pointer-events-auto flex h-dvh w-full flex-col overflow-hidden border-border-strong bg-surface text-foreground',
                'sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:w-[min(42rem,calc(100vw-3rem))] sm:rounded-md sm:border sm:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95)]'
              )}
              onKeyDown={handleDialogKeyDown}
            >
              <div className="flex items-center justify-between gap-4 border-b border-border bg-secondary/70 px-5 py-3 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <WindowDots className="hidden sm:flex" />
                  <h2 id={titleId} className="font-mono text-sm font-bold text-heading sm:text-base">
                    {t('contact.title')}
                  </h2>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label={t('contact.modalClose')}
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-background text-foreground transition-colors hover:border-primary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none"
                  onClick={closeContactModal}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                <ContactForm
                  key={modal.formKey}
                  preselectedService={modal.service}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ContactModalContext.Provider>
  );
}
