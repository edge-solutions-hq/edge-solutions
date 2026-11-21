import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';
import {MediaFrame} from '@/components/ui/MediaFrame';
import {surfaceClass} from '@/components/ui/Surface';

type ShowcasePanelProps = {
  eyebrow?: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  imagePriority?: boolean;
  imageSide?: 'left' | 'right';
  className?: string;
  children: ReactNode;
};

export function ShowcasePanel({
  eyebrow,
  title,
  imageSrc,
  imageAlt,
  imagePriority = false,
  imageSide = 'right',
  className,
  children,
}: ShowcasePanelProps) {
  const imageFirst = imageSide === 'left';

  return (
    <section
      className={cn(
        surfaceClass('feature', 'not-prose grid overflow-hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]'),
        className,
      )}
    >
      <div
        className={cn(
          'bg-surface px-6 py-6 md:px-8 md:py-8',
          imageFirst ? 'lg:order-2' : 'lg:order-1',
        )}
      >
        {eyebrow ? (
          <p className="font-mono text-xs text-syn-green">
            <span aria-hidden="true">{'// '}</span>
            {eyebrow}
          </p>
        ) : null}

        <h3 className="mt-3 text-balance font-display text-xl font-bold tracking-tight text-heading sm:text-2xl">
          {title}
        </h3>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground [&_a]:text-link [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-primary/70 [&_a]:transition-colors [&_a:hover]:decoration-link [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </div>

      <MediaFrame
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        outerClassName={cn(
          'relative border-t border-border bg-secondary p-4 lg:border-l lg:border-t-0',
          imageFirst ? 'lg:order-1' : 'lg:order-2',
        )}
        chromeClassName="pb-3"
        imageFrameClassName={surfaceClass('media', 'overflow-hidden')}
        imagePriority={imagePriority}
      />
    </section>
  );
}
