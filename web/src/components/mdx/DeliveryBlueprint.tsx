import type {ReactNode} from 'react';

import {cn} from '@/lib/cn';
import {MediaFrame} from '@/components/ui/MediaFrame';
import {surfaceClass} from '@/components/ui/Surface';

type DeliveryBlueprintColumn = {
  label: string;
  title: string;
  points: string[];
};

type DeliveryBlueprintProps = {
  eyebrow?: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  columns: DeliveryBlueprintColumn[];
  checklistTitle: string;
  checklist: string[];
  className?: string;
  children: ReactNode;
};

export function DeliveryBlueprint({
  eyebrow,
  title,
  imageSrc,
  imageAlt,
  columns,
  checklistTitle,
  checklist,
  className,
  children,
}: DeliveryBlueprintProps) {
  return (
    <section
      className={cn(
        surfaceClass('feature', 'not-prose overflow-hidden'),
        className,
      )}
    >
      <div className="grid gap-px border-b border-border bg-border lg:grid-cols-[minmax(0,1.2fr)_22rem]">
        <div className="bg-surface px-6 py-7 md:px-8 md:py-8">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-3 max-w-2xl text-balance text-2xl font-semibold tracking-tight text-technical-blue sm:text-3xl">
            {title}
          </h3>
          <div className="mt-5 max-w-2xl space-y-4 text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
            {children}
          </div>
        </div>

        <div className="bg-secondary px-6 py-7 text-secondary-foreground md:px-8 md:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {checklistTitle}
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-secondary-foreground/85">
            {checklist.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border border-secondary-foreground/70 bg-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-b border-border bg-[linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(180deg,color-mix(in_srgb,var(--foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(180deg,var(--surface-muted),var(--surface))] bg-[length:28px_28px,28px_28px,auto] px-4 py-4 md:px-6 md:py-6">
        <MediaFrame
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          imagePriority
          outerClassName={surfaceClass('media', 'overflow-hidden')}
          chromeClassName="border-b border-border/70 px-4 py-3"
        />
      </div>

      <div className="grid gap-px bg-border md:grid-cols-3">
        {columns.map((column, index) => (
          <div
            key={`${column.label}-${column.title}`}
            className={cn(
              'bg-surface px-6 py-6 md:px-7 md:py-7',
              index === 1 ? 'bg-surface-muted' : '',
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {column.label}
            </p>
            <h4 className="mt-2 text-lg font-semibold tracking-tight text-technical-blue">
              {column.title}
            </h4>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {column.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border border-border/70 bg-primary/70" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
