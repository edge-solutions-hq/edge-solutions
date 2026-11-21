import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

export function GridList({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div>
      <ul
        role="list"
        className={cn(
          'not-prose grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
          className
        )}
      >
        {children}
      </ul>
    </div>
  );
}

export function GridListItem({
  title,
  children,
  className,
  invert = false
}: {
  title: string;
  children: ReactNode;
  className?: string;
  invert?: boolean;
}) {
  return (
    <li
      className={cn(
        'text-sm leading-relaxed',
        invert ? 'text-white/70' : 'text-muted-foreground',
        className
      )}
    >
      <div
        className={cn(
          'h-full rounded-md border p-5',
          invert ? 'border-white/20' : 'border-border bg-surface'
        )}
      >
        <strong
          className={cn(
            'mb-2 flex items-baseline gap-2 font-mono text-[0.8125rem] font-bold',
            invert ? 'text-white' : 'text-heading'
          )}
        >
          <span className="text-primary" aria-hidden="true">
            &gt;
          </span>
          <span>{title}.</span>
        </strong>{' '}
        {children}
      </div>
    </li>
  );
}


