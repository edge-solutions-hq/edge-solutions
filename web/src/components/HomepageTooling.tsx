'use client';

import {Card} from '@/components/ui/Card';
import {SectionIntro} from '@/components/studio/SectionIntro';

type HomepageToolingProps = {
  eyebrow: string;
  title: string;
  intro: string;
  cardTitle: string;
  cardBody: string;
  stackLabel: string;
  workflowLabel: string;
  deliveryLabel: string;
  stackBody: string;
  workflowBody: string;
  deliveryBody: string;
  proofLabel: string;
  proofTitle: string;
  proofBody: string;
  githubLabel: string;
  artstationLabel: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export default function HomepageTooling({
  eyebrow,
  title,
  intro,
  cardTitle,
  cardBody,
  stackLabel,
  workflowLabel,
  deliveryLabel,
  stackBody,
  workflowBody,
  deliveryBody,
  proofLabel,
  proofTitle,
  proofBody,
  githubLabel,
  artstationLabel,
}: HomepageToolingProps) {
  const trackToolingClick = (targetDomain: 'github.com' | 'artstation.com') => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'tooling_link_click',
      event_name: 'tooling_link_click',
      link_domain: targetDomain,
      placement: 'homepage_tooling_section',
    });
  };

  return (
    <section>
      <SectionIntro eyebrow={eyebrow} title={title}>
        <p>{intro}</p>
      </SectionIntro>

      <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-subtle-foreground">
              {stackLabel}
            </span>
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-subtle-foreground">
              {workflowLabel}
            </span>
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-subtle-foreground">
              {deliveryLabel}
            </span>
          </div>

          <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
            {cardTitle}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {cardBody}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-background/60 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-subtle-foreground">
                {stackLabel}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{stackBody}</p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-subtle-foreground">
                {workflowLabel}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {workflowBody}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-subtle-foreground">
                {deliveryLabel}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {deliveryBody}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8">
          <div className="text-sm font-semibold text-foreground">{proofLabel}</div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
            {proofTitle}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {proofBody}
          </p>

          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <a
              href="https://github.com/Gil-1"
              onClick={() => trackToolingClick('github.com')}
              className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-4 py-3 no-underline transition-colors hover:bg-surface-muted"
            >
              <span>{githubLabel}</span>
              <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://www.artstation.com/edge_solutions"
              onClick={() => trackToolingClick('artstation.com')}
              className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-4 py-3 no-underline transition-colors hover:bg-surface-muted"
            >
              <span>{artstationLabel}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </Card>
      </div>
    </section>
  );
}
