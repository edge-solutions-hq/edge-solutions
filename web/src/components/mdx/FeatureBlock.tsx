import {ReactNode} from 'react';

import {Card} from '@/components/ui/Card';

type FeatureBlockProps = {
  eyebrow?: string;
  title: string;
  children: ReactNode;
};

export function FeatureBlock({eyebrow, title, children}: FeatureBlockProps) {
  return (
    <Card variant="feature" className="bg-secondary p-6 text-secondary-foreground md:p-8">
      {eyebrow ? (
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </div>
      ) : null}
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-secondary-foreground">
        {title}
      </h3>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-secondary-foreground/82">
        {children}
      </div>
    </Card>
  );
}
