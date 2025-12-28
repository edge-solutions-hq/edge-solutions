import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';
import {Border} from './Border';
import {FadeIn, FadeInStagger} from './FadeIn';

export function StatList({
  children,
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof FadeInStagger>, 'children'> & {
  children: ReactNode;
  className?: string;
}) {
  return (
    <FadeInStagger className={cn('not-prose', className)} {...props}>
      <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
        {children}
      </dl>
    </FadeInStagger>
  );
}

export function StatListItem({label, value}: {label: string; value: string}) {
  return (
    <Border as={FadeIn} position="left" className="flex flex-col-reverse pl-6">
      <dt className="mt-2 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {value}
      </dd>
    </Border>
  );
}


