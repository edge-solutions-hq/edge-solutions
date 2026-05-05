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
        'not-prose grid gap-2 overflow-hidden rounded-[2rem] border border-border/80 bg-surface/95 p-2 shadow-sm lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]',
        className,
      )}
    >
      <div
        className={cn(
          'rounded-[1.5rem] bg-surface px-6 py-6 md:px-8 md:py-8',
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
          'relative rounded-[1.5rem] border border-border/70 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_52%),radial-gradient(circle_at_bottom,rgba(37,99,235,0.12),transparent_50%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(243,244,246,0.92))] p-4',
          imageFirst ? 'lg:order-1' : 'lg:order-2',
        )}
        chromeClassName="pb-3"
        imageFrameClassName="overflow-hidden rounded-[1.25rem] border border-border/70 bg-background/90 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
      />
    </section>
  );
}
