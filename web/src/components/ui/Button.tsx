'use client';

import * as React from 'react';
import {Link} from '@/i18n/navigation';
import {trackContactCtaClick} from '@/lib/analytics/events';
import type {ContactCtaPlacement} from '@/lib/analytics/taxonomy';
import {hrefToTrackedTarget, isContactTarget} from '@/lib/navigation/tracked-link-target';
import {cn} from '@/lib/cn';
import {
  shouldOpenContactModalForClick,
  useContactModal,
} from '@/components/contact/ContactModalContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-mono text-[0.8125rem] font-bold transition-[background-color,border-color,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none';

const variants: Record<ButtonVariant, string> = {
  primary:
    'border border-primary bg-primary text-primary-foreground hover:border-accent hover:bg-accent',
  secondary:
    'border border-border-strong bg-secondary text-secondary-foreground hover:border-primary',
  outline:
    'border border-border-strong bg-transparent text-foreground hover:border-primary hover:bg-surface-muted',
  ghost: 'text-foreground hover:bg-surface-muted'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3',
  md: 'h-10 px-4',
  lg: 'h-12 px-6'
};

export function buttonClass({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
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
      className={buttonClass({variant, size, className})}
      {...props}
    />
  );
}

export type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  trackingPlacement?: ContactCtaPlacement;
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
  const hrefPathname = hrefToTrackedTarget(href);
  const isContactCta = isContactTarget(hrefPathname);
  const contactModal = useContactModal();

  return (
    <Link
      href={href}
      className={buttonClass({variant, size, className})}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || !isContactCta) {
          return;
        }

        const ctaLabel =
          event.currentTarget.getAttribute('aria-label')?.trim() ||
          event.currentTarget.textContent?.trim();

        trackContactCtaClick({
          ctaTarget: hrefPathname,
          placement: trackingPlacement,
          ctaLabel: ctaLabel || undefined,
        });

        if (contactModal && shouldOpenContactModalForClick(event)) {
          event.preventDefault();
          contactModal.openContactModal({href: hrefPathname});
        }
      }}
      {...props}
    />
  );
}
