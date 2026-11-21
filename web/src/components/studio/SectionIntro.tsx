import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';
import {Container} from './Container';
import {PromptLine} from '@/components/ui/WindowChrome';
import {unwrapMdxParagraphs} from '@/lib/unwrap-mdx-paragraphs';

export function SectionIntro({
  title,
  eyebrow,
  children,
  smaller = false,
  invert = false,
  className,
  titleId,
  command
}: {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  smaller?: boolean;
  invert?: boolean;
  className?: string;
  titleId?: string;
  /** Decorative prompt command shown above the heading, e.g. `ls ./services`. */
  command?: string;
}) {
  const content = unwrapMdxParagraphs(children);

  return (
    <Container className={cn('not-prose', className)}>
      <div className="max-w-2xl">
        {command ? <PromptLine command={command} className="mb-3" /> : null}

        {eyebrow ? (
          <p
            className={cn(
              'font-mono text-xs',
              invert ? 'text-white/80' : 'text-syn-green'
            )}
          >
            <span aria-hidden="true">{'// '}</span>
            {eyebrow}
          </p>
        ) : null}

        <h2
          id={titleId}
          className={cn(
            'mt-2 text-balance font-display leading-[1.15] font-bold tracking-tight',
            smaller ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl',
            invert ? 'text-white' : 'text-heading'
          )}
        >
          {title}
        </h2>

        {content ? (
          <div
            className={cn(
              'mt-4 space-y-3 text-base leading-relaxed sm:text-lg',
              invert ? 'text-white/70' : 'text-muted-foreground'
            )}
          >
            {content}
          </div>
        ) : null}
      </div>
    </Container>
  );
}

