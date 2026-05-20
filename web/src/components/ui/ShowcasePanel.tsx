import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';
import {ProofMediaFrame} from '@/components/ui/ProofMediaFrame';

type ShowcasePanelProps = {
  eyebrow?: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  imageSide?: 'left' | 'right';
  className?: string;
  children: ReactNode;
};

export function ShowcasePanel({
  eyebrow,
  title,
  imageSrc,
  imageAlt,
  imageSide = 'right',
  className,
  children,
}: ShowcasePanelProps) {
  const imageFirst = imageSide === 'left';

  return (
    <section
      className={cn(
        'not-prose grid gap-2 overflow-hidden rounded-lg border border-border/80 bg-surface/95 p-2 shadow-sm lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]',
        className,
      )}
    >
      <div
        className={cn(
          'rounded-lg bg-surface px-6 py-6 md:px-8 md:py-8',
          imageFirst ? 'lg:order-2' : 'lg:order-1',
        )}
      >
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}

        <h3 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h3>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground [&_a]:text-link [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-link/30 [&_a]:transition-colors [&_a:hover]:decoration-link [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </div>

      <ProofMediaFrame
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        outerClassName={cn(
          'relative rounded-lg border border-border/70 bg-surface-muted p-4 shadow-[inset_0_0_0_1px_rgba(16,43,74,0.08)]',
          imageFirst ? 'lg:order-1' : 'lg:order-2',
        )}
        chromeClassName="pb-3"
        imageFrameClassName="overflow-hidden rounded-xl border border-border/70 bg-background/90 shadow-[6px_6px_0_rgba(170,142,75,0.35)]"
      />
    </section>
  );
}
