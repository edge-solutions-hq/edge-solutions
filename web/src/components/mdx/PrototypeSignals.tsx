import type {ReactNode} from 'react';

import {cn} from '@/lib/cn';
import {MediaFrame} from '@/components/ui/MediaFrame';
import {surfaceClass} from '@/components/ui/Surface';
import {unwrapMdxParagraphs} from '@/lib/unwrap-mdx-paragraphs';

type PrototypeSignal = {
  label: string;
  value: string;
};

type PrototypePhase = {
  label: string;
  title: string;
  detail: string;
};

type PrototypeSignalsProps = {
  eyebrow?: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  signals: PrototypeSignal[];
  phases: PrototypePhase[];
  className?: string;
  children: ReactNode;
};

export function PrototypeSignals({
  eyebrow,
  title,
  imageSrc,
  imageAlt,
  signals,
  phases,
  className,
  children,
}: PrototypeSignalsProps) {
  const content = unwrapMdxParagraphs(children);

  return (
    <section
      className={cn(
        surfaceClass('feature', 'not-prose overflow-hidden'),
        className,
      )}
    >
      <div className="grid gap-px bg-border xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
        <div className="bg-secondary px-6 py-7 text-secondary-foreground md:px-8 md:py-8">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {eyebrow}
            </p>
          ) : null}

          <h2 className="mt-3 max-w-xl text-balance text-2xl font-semibold tracking-tight text-secondary-foreground sm:text-3xl">
            {title}
          </h2>

          <div className="mt-5 max-w-xl space-y-4 text-sm leading-relaxed text-secondary-foreground/82 [&_strong]:font-semibold [&_strong]:text-secondary-foreground">
            {content}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {signals.map((signal, index) => (
              <div
                key={`${signal.label}-${signal.value}`}
                className={cn(
                  'rounded-lg border border-primary/55 bg-secondary-foreground/8 px-4 py-4',
                  index === 1 && 'bg-secondary-foreground/12',
                  index > 2 && 'border-secondary-foreground/25 bg-secondary-foreground/6',
                )}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                  {signal.label}
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-secondary-foreground">
                  {signal.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(180deg,var(--surface-muted),var(--surface))] bg-[length:28px_28px,28px_28px,auto] px-6 py-7 text-foreground md:px-8 md:py-8">
          <MediaFrame
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            outerClassName={surfaceClass('media', 'overflow-hidden')}
            chromeClassName="border-b border-border/70 px-4 py-3"
          />

          <div className="mt-6 space-y-4">
            {phases.map((phase) => (
              <div
                key={`${phase.label}-${phase.title}`}
                className={surfaceClass('card', 'border-border/70 p-5 shadow-[3px_3px_0_rgba(16,43,74,0.12)]')}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {phase.label}
                </p>
                <h3 className="mt-2 text-base font-semibold tracking-tight text-technical-blue">
                  {phase.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {phase.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
