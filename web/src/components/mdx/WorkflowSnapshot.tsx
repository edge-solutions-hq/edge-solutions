import type {StaticImageData} from 'next/image';
import type {ReactNode} from 'react';

import {cn} from '@/lib/cn';
import {MediaFrame} from '@/components/ui/MediaFrame';
import {surfaceClass} from '@/components/ui/Surface';
import {unwrapMdxParagraphs} from '@/lib/unwrap-mdx-paragraphs';

type WorkflowStep = {
  label: string;
  title: string;
  detail: string;
};

type WorkflowSnapshotProps = {
  eyebrow?: string;
  title: string;
  imageSrc: string | StaticImageData;
  imageAlt: string;
  steps: WorkflowStep[];
  reviewTitle: string;
  reviewPoints: string[];
  className?: string;
  children: ReactNode;
};

export function WorkflowSnapshot({
  eyebrow,
  title,
  imageSrc,
  imageAlt,
  steps,
  reviewTitle,
  reviewPoints,
  className,
  children,
}: WorkflowSnapshotProps) {
  const content = unwrapMdxParagraphs(children);

  return (
    <section
      className={cn(
        surfaceClass('feature', 'not-prose overflow-hidden'),
        className,
      )}
    >
      <div className="grid gap-px bg-border xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)]">
        <div className="bg-secondary px-6 py-7 text-secondary-foreground md:px-8 md:py-8">
          <div className="xl:sticky xl:top-24">
          {eyebrow ? (
            <p className="font-mono text-xs text-syn-green">
              <span aria-hidden="true">{'// '}</span>
              {eyebrow}
            </p>
          ) : null}

          <h2 className="mt-3 max-w-xl text-balance font-display text-xl font-bold tracking-tight text-heading sm:text-2xl">
            {title}
          </h2>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-secondary-foreground">
            {content}
          </div>

          <div className="mt-8 rounded-md border border-primary/60 bg-primary/5 p-5">
            <p className="font-mono text-xs text-syn-green">
              {reviewTitle}
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {reviewPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-[2px] bg-primary" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          </div>
        </div>

        <div className="bg-surface px-6 py-7 text-foreground md:px-8 md:py-8">
          <MediaFrame
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            outerClassName={surfaceClass('media', 'overflow-hidden')}
            chromeClassName="border-b border-border px-4 py-3"
          />

          <div className="relative mt-8">
            <div className="absolute left-[0.42rem] top-2 bottom-2 w-px bg-border" aria-hidden="true" />
            <ol className="space-y-4 pl-5">
              {steps.map((step) => (
                <li key={`${step.label}-${step.title}`} className="relative pl-6">
                  <span className="absolute left-0 top-2.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-primary" aria-hidden="true" />
                  <div className={surfaceClass('inset', 'p-5')}>
                    <p className="font-mono text-xs text-syn-cyan">
                      {step.label}
                    </p>
                    <h3 className="mt-2 font-mono text-sm font-bold text-heading">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
