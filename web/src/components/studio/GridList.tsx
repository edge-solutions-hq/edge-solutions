import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';
import {Border} from './Border';
import {FadeIn, FadeInStagger} from './FadeIn';

export function GridList({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <FadeInStagger>
      <ul
        role="list"
        className={cn(
          'not-prose grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3',
          className
        )}
      >
        {children}
      </ul>
    </FadeInStagger>
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
      <FadeIn>
        <Border position="left" className="pl-6" invert={invert}>
          <strong
            className={cn(
              'font-semibold',
              invert ? 'text-white' : 'text-foreground'
            )}
          >
            {title}.
          </strong>{' '}
          {children}
        </Border>
      </FadeIn>
    </li>
  );
}


