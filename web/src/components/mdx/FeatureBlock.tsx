import {ReactNode} from 'react';

import {Card} from '@/components/ui/Card';

type FeatureBlockProps = {
  eyebrow?: string;
  title: string;
  children: ReactNode;
};

export function FeatureBlock({eyebrow, title, children}: FeatureBlockProps) {
  return (
    <Card className="border-white/12 bg-linear-to-br from-slate-950 via-slate-900 to-violet-950/90 p-6 text-white shadow-[0_22px_60px_rgba(76,29,149,0.28)] md:p-8">
      {eyebrow ? (
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/90">
          {eyebrow}
        </div>
      ) : null}
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
        {title}
      </h3>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
        {children}
      </div>
    </Card>
  );
}
