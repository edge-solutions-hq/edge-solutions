import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';
import {Container} from './Container';
import {unwrapMdxParagraphs} from '@/lib/unwrap-mdx-paragraphs';

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
  const content = unwrapMdxParagraphs(children);

  return (
    <Container
      className={cn('not-prose', className)}
      innerClassName={cn('max-w-4xl', centered && 'text-center')}
    >
      <div>
        <p className="font-mono text-xs text-syn-green">
          <span aria-hidden="true">{'// '}</span>
          {eyebrow}
        </p>
        <h1 className="mt-4 text-balance font-display text-3xl leading-[1.12] font-extrabold tracking-tight text-heading sm:text-4xl lg:text-[2.75rem]">
          {title}
          <span className="caret ml-2" aria-hidden="true" />
        </h1>
        <div className="mt-6 space-y-4 border-l-2 border-primary/60 pl-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {content}
        </div>
      </div>
    </Container>
  );
}

