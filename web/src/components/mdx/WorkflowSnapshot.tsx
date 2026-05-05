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
        'not-prose overflow-hidden rounded-[2.25rem] border border-slate-900/90 bg-slate-950 text-white shadow-[0_28px_90px_rgba(15,23,42,0.34)]',
        className,
      )}
    >
      <div className="grid gap-px xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)]">
        <div className="bg-linear-to-br from-slate-950 via-slate-900 to-violet-950/90 px-6 py-7 md:px-8 md:py-8">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/90">
              {eyebrow}
            </p>
          ) : null}

          <h3 className="mt-3 max-w-xl text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h3>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-200 [&_strong]:font-semibold [&_strong]:text-white">
            {children}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
              {reviewTitle}
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
              {reviewPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-300" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-slate-100 px-6 py-7 text-slate-900 md:px-8 md:py-8">
          <ProofMediaFrame
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            outerClassName="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.12)]"
            chromeClassName="border-b border-slate-200 px-4 py-3"
          />

          <div className="relative mt-8">
            <div className="absolute left-[0.42rem] top-2 bottom-2 w-px bg-linear-to-b from-violet-300 via-cyan-300 to-emerald-300" aria-hidden="true" />
            <ol className="space-y-4 pl-5">
              {steps.map((step) => (
                <li key={`${step.label}-${step.title}`} className="relative pl-6">
                  <span className="absolute left-0 top-2.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-violet-500 shadow-[0_0_0_4px_rgba(167,139,250,0.18)]" aria-hidden="true" />
                  <div className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">
                      {step.label}
                    </p>
                    <h4 className="mt-2 text-base font-semibold tracking-tight text-slate-950">
                      {step.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
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
