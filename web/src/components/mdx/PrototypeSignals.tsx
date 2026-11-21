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

          <div className="mt-5 max-w-xl space-y-4 text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-secondary-foreground">
            {content}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {signals.map((signal) => (
              <div
                key={`${signal.label}-${signal.value}`}
                className="rounded-md border border-border bg-surface px-4 py-4"
              >
                <p className="font-mono text-xs text-syn-cyan">
                  {signal.label}
                </p>
                <p className="mt-2 font-mono text-base font-bold text-heading">
                  {signal.value}
                </p>
              </div>
            ))}
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

          <div className="mt-6 space-y-4">
            {phases.map((phase) => (
              <div
                key={`${phase.label}-${phase.title}`}
                className={surfaceClass('inset', 'p-5')}
              >
                <p className="font-mono text-xs text-syn-cyan">
                  {phase.label}
                </p>
                <h3 className="mt-2 font-mono text-sm font-bold text-heading">
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
