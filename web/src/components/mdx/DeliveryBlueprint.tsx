import type {ReactNode} from 'react';

import {cn} from '@/lib/cn';
import {ProofMediaFrame} from '@/components/ui/ProofMediaFrame';

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
        'not-prose overflow-hidden rounded-lg border-2 border-border bg-surface shadow-[8px_8px_0_rgba(170,142,75,0.36)]',
        className,
      )}
    >
      <div className="grid gap-px border-b-2 border-border bg-border lg:grid-cols-[minmax(0,1.2fr)_22rem]">
        <div className="bg-surface px-6 py-7 md:px-8 md:py-8">
          {eyebrow ? (
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-subtle-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-3 max-w-2xl text-balance font-display text-3xl font-extrabold leading-none text-foreground sm:text-4xl">
            {title}
          </h3>
          <div className="mt-5 max-w-2xl space-y-4 text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
            {children}
          </div>
        </div>

        <div className="bg-secondary px-6 py-7 text-secondary-foreground md:px-8 md:py-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {checklistTitle}
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-secondary-foreground/85">
            {checklist.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border border-primary bg-primary/25" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-b-2 border-border bg-surface-muted px-4 py-4 md:px-6 md:py-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(16,43,74,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(16,43,74,0.12)_1px,transparent_1px)] [background-size:28px_28px]"
          aria-hidden="true"
        />
        <div className="relative">
          <ProofMediaFrame
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            outerClassName="overflow-hidden rounded-lg border-2 border-border bg-background/85 shadow-[6px_6px_0_rgba(170,142,75,0.34)]"
            chromeClassName="border-b border-border/70 bg-surface/75 px-4 py-3"
          />
        </div>
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
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle-foreground">
              {column.label}
            </p>
            <h4 className="mt-2 font-display text-xl font-bold leading-none text-foreground">
              {column.title}
            </h4>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {column.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
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
