import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';
import {Border} from './Border';
import {FadeIn, FadeInStagger} from './FadeIn';

export function List({
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
        className={cn('not-prose text-sm leading-relaxed text-muted-foreground', className)}
      >
        {children}
      </ul>
    </FadeInStagger>
  );
}

export function ListItem({children, title}: {children: ReactNode; title?: string}) {
  return (
    <li className="group mt-8 first:mt-0">
      <FadeIn>
        <Border className="pt-8 group-first:pt-0 group-first:before:hidden group-first:after:hidden">
          {title ? (
            <strong className="font-semibold text-foreground">{`${title}. `}</strong>
          ) : null}
          {children}
        </Border>
      </FadeIn>
    </li>
  );
}


