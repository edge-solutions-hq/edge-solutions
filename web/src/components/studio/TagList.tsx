import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

export function TagList({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul role="list" className={cn('not-prose flex flex-wrap gap-3', className)}>
      {children}
    </ul>
  );
}

export function TagListItem({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        'rounded-full bg-surface-muted px-4 py-1.5 text-sm text-muted-foreground',
        className
      )}
    >
      {children}
    </li>
  );
}


