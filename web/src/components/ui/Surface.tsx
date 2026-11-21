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
  card: 'rounded-md border border-border bg-surface',
  'interactive-card':
    'rounded-md border border-border bg-surface transition-[background-color,border-color] duration-200 ease-out hover:border-primary/70 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
  panel: 'rounded-md border border-border bg-surface',
  feature:
    'rounded-md border border-border bg-surface shadow-[0_30px_70px_-40px_rgba(0,0,0,0.9)]',
  inset: 'rounded-md border border-border bg-background/70',
  media: 'rounded-md border border-border bg-secondary',
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
