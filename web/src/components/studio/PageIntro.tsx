import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';
import {Container} from './Container';
import {FadeIn} from './FadeIn';

export function PageIntro({
  eyebrow,
  title,
  children,
  centered = false,
  className
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  centered?: boolean;
  className?: string;
}) {
  return (
    <Container
      className={cn('not-prose', className)}
      innerClassName={cn('max-w-4xl', centered && 'text-center')}
    >
      <FadeIn>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <div className="mt-4 space-y-4 text-lg leading-relaxed text-muted-foreground">
          {children}
        </div>
      </FadeIn>
    </Container>
  );
}


