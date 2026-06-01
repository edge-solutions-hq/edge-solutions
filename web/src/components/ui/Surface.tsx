import * as React from 'react';
import {cn} from '@/lib/cn';

export type SurfaceVariant =
  | 'card'
  | 'interactive-card'
  | 'panel'
  | 'feature'
  | 'inset'
  | 'media';

export const surfaceClassNames: Record<SurfaceVariant, string> = {
  card: 'rounded-lg border border-border bg-surface shadow-[5px_5px_0_rgba(170,142,75,0.24)]',
  'interactive-card':
    'rounded-lg border border-border bg-surface shadow-[5px_5px_0_rgba(170,142,75,0.24)] transition-[background-color,box-shadow] duration-300 ease-out hover:bg-surface-muted hover:shadow-[4px_4px_0_rgba(170,142,75,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
  panel:
    'rounded-lg border border-border bg-surface/90 shadow-[6px_6px_0_rgba(170,142,75,0.22)]',
  feature:
    'rounded-lg border border-border bg-surface shadow-[6px_6px_0_rgba(170,142,75,0.28)]',
  inset: 'rounded-lg border border-border bg-background/65',
  media:
    'rounded-lg border border-border/70 bg-surface shadow-[6px_6px_0_rgba(170,142,75,0.26)]',
};

export function surfaceClass(variant: SurfaceVariant = 'card', className?: string) {
  return cn(surfaceClassNames[variant], className);
}

export type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: SurfaceVariant;
};

export function Surface({variant = 'card', className, ...props}: SurfaceProps) {
  return <div className={surfaceClass(variant, className)} {...props} />;
}
