import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';
import {Container} from './Container';
import {FadeIn} from './FadeIn';

export function SectionIntro({
  title,
  eyebrow,
  children,
  smaller = false,
  invert = false,
  className
}: {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  smaller?: boolean;
  invert?: boolean;
  className?: string;
}) {
  return (
    <Container className={cn('not-prose', className)}>
      <FadeIn className="max-w-2xl">
        {eyebrow ? (
          <p
            className={cn(
              'text-xs font-semibold tracking-wide uppercase',
              invert ? 'text-white/80' : 'text-muted-foreground'
            )}
          >
            {eyebrow}
          </p>
        ) : null}

        <h2
          className={cn(
            'mt-3 text-balance font-semibold tracking-tight',
            smaller ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl',
            invert ? 'text-white' : 'text-foreground'
          )}
        >
          {title}
        </h2>

        {children ? (
          <div
            className={cn(
              'mt-4 space-y-3 text-lg leading-relaxed',
              invert ? 'text-white/70' : 'text-muted-foreground'
            )}
          >
            {children}
          </div>
        ) : null}
      </FadeIn>
    </Container>
  );
}


