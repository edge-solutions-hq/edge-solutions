import type {StaticImageData} from 'next/image';
import type {ReactNode} from 'react';

import {cn} from '@/lib/cn';
import {ProofMediaFrame} from '@/components/ui/ProofMediaFrame';

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
  return (
    <section
      className={cn(
        'not-prose overflow-hidden rounded-lg border-2 border-border bg-surface shadow-[6px_6px_0_var(--primary)]',
        className,
      )}
    >
      <div className="grid gap-px bg-border xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)]">
        <div className="bg-secondary px-6 py-7 text-secondary-foreground md:px-8 md:py-8">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {eyebrow}
            </p>
          ) : null}

          <h3 className="mt-3 max-w-xl text-balance text-2xl font-semibold tracking-tight text-secondary-foreground sm:text-3xl">
            {title}
          </h3>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-secondary-foreground/82 [&_strong]:font-semibold [&_strong]:text-secondary-foreground">
            {children}
          </div>

          <div className="mt-8 rounded-lg border border-primary/70 bg-secondary-foreground/8 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {reviewTitle}
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-secondary-foreground/82">
              {reviewPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border border-secondary-foreground/70 bg-primary" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-[linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(180deg,var(--surface-muted),var(--surface))] bg-[length:28px_28px,28px_28px,auto] px-6 py-7 text-foreground md:px-8 md:py-8">
          <ProofMediaFrame
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            outerClassName="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-[6px_6px_0_color-mix(in_srgb,var(--primary)_35%,transparent)]"
            chromeClassName="border-b border-border/70 px-4 py-3"
          />

          <div className="relative mt-8">
            <div className="absolute left-[0.42rem] top-2 bottom-2 w-px bg-border" aria-hidden="true" />
            <ol className="space-y-4 pl-5">
              {steps.map((step) => (
                <li key={`${step.label}-${step.title}`} className="relative pl-6">
                  <span className="absolute left-0 top-2.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_20%,transparent)]" aria-hidden="true" />
                  <div className="rounded-lg border border-border/70 bg-surface p-5 shadow-[3px_3px_0_color-mix(in_srgb,var(--foreground)_12%,transparent)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {step.label}
                    </p>
                    <h4 className="mt-2 text-base font-semibold tracking-tight text-foreground">
                      {step.title}
                    </h4>
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
