import type {ReactNode} from 'react';

import {cn} from '@/lib/cn';
import {ProofMediaFrame} from '@/components/ui/ProofMediaFrame';

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
  return (
    <section
      className={cn(
        'not-prose overflow-hidden rounded-[2.5rem] border border-white/10 bg-linear-to-br from-slate-950 via-slate-950 to-indigo-950 text-white shadow-[0_28px_90px_rgba(15,23,42,0.34)]',
        className,
      )}
    >
      <div className="grid gap-px xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
        <div className="bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-7 md:px-8 md:py-8">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
              {eyebrow}
            </p>
          ) : null}

          <h3 className="mt-3 max-w-xl text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h3>

          <div className="mt-5 max-w-xl space-y-4 text-sm leading-relaxed text-slate-200 [&_strong]:font-semibold [&_strong]:text-white">
            {children}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {signals.map((signal, index) => (
              <div
                key={`${signal.label}-${signal.value}`}
                className={cn(
                  'rounded-[1.35rem] border px-4 py-4 backdrop-blur-sm',
                  index === 0 && 'border-cyan-300/25 bg-cyan-400/8',
                  index === 1 && 'border-violet-300/25 bg-violet-400/10',
                  index === 2 && 'border-emerald-300/25 bg-emerald-400/10',
                  index > 2 && 'border-white/12 bg-white/6',
                )}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {signal.label}
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-white">
                  {signal.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/90 px-6 py-7 md:px-8 md:py-8">
          <ProofMediaFrame
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            outerClassName="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900 shadow-[0_24px_60px_rgba(0,0,0,0.34)]"
            chromeClassName="border-b border-white/10 px-4 py-3"
          />

          <div className="mt-6 space-y-4">
            {phases.map((phase) => (
              <div
                key={`${phase.label}-${phase.title}`}
                className="rounded-[1.35rem] border border-white/10 bg-white/6 p-5"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                  {phase.label}
                </p>
                <h4 className="mt-2 text-base font-semibold tracking-tight text-white">
                  {phase.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
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
