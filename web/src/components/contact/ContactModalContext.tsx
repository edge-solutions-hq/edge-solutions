'use client';

import * as React from 'react';
import type {ContactOfferValue} from '@/lib/contact/options';

export type ContactModalRequest = {
  href?: string;
  service?: ContactOfferValue;
};

type ContactModalContextValue = {
  openContactModal: (request?: ContactModalRequest) => void;
};

export const ContactModalContext = React.createContext<ContactModalContextValue | null>(null);

export function useContactModal() {
  return React.useContext(ContactModalContext);
}

export function shouldOpenContactModalForClick(
  event: React.MouseEvent<HTMLElement>
) {
  const target = event.currentTarget.getAttribute('target');

  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    (!target || target === '_self') &&
    !event.currentTarget.hasAttribute('download')
  );
}
