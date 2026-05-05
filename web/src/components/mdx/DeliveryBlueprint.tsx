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
        'not-prose overflow-hidden rounded-[2.25rem] border border-border/80 bg-surface/95 shadow-sm',
        className,
      )}
    >
      <div className="grid gap-px border-b border-border/80 lg:grid-cols-[minmax(0,1.2fr)_22rem]">
        <div className="bg-surface px-6 py-7 md:px-8 md:py-8">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-3 max-w-2xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h3>
          <div className="mt-5 max-w-2xl space-y-4 text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
            {children}
          </div>
        </div>

        <div className="bg-slate-950 px-6 py-7 text-white md:px-8 md:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
            {checklistTitle}
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-200">
            {checklist.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-b border-border/80 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_45%),linear-gradient(180deg,rgba(248,250,252,1),rgba(241,245,249,0.92))] px-4 py-4 md:px-6 md:py-6">
        <ProofMediaFrame
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          outerClassName="overflow-hidden rounded-[1.75rem] border border-border/70 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
          chromeClassName="border-b border-border/70 px-4 py-3"
        />
      </div>

      <div className="grid gap-px bg-border/80 md:grid-cols-3">
        {columns.map((column, index) => (
          <div
            key={`${column.label}-${column.title}`}
            className={cn(
              'bg-surface px-6 py-6 md:px-7 md:py-7',
              index === 1 ? 'bg-slate-50/80' : '',
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {column.label}
            </p>
            <h4 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
              {column.title}
            </h4>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {column.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-400/70" aria-hidden="true" />
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
