import {ExternalLinkButton} from '@/components/ui/ExternalLinkButton';
import {surfaceClass} from '@/components/ui/Surface';
import {WindowChrome} from '@/components/ui/WindowChrome';
import {cn} from '@/lib/cn';

type BryzaPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  supportText: string;
  pipelineLabel: string;
  ctaLabel: string;
  href: string;
  className?: string;
};

/**
 * Bryza, Gil's own product. Text-only presentation: no screenshot or logo is
 * approved in the asset registry, so the right pane is a synthetic pipeline
 * read-out describing the real processing steps, not product UI.
 */
const pipelineSteps: {cmd: string; tone: string}[] = [
  {cmd: 'fetch    steam_reviews --public', tone: 'text-syn-cyan'},
  {cmd: 'translate --to en', tone: 'text-syn-cyan'},
  {cmd: 'triage   bug | design | feature', tone: 'text-syn-purple'},
  {cmd: 'group    → issues', tone: 'text-syn-green'},
  {cmd: 'cite     player_quotes + source_link', tone: 'text-primary'},
];

export function BryzaPanel({
  eyebrow,
  title,
  description,
  supportText,
  pipelineLabel,
  ctaLabel,
  href,
  className,
}: BryzaPanelProps) {
  return (
    <section
      className={cn(
        surfaceClass(
          'feature',
          'not-prose grid overflow-hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]',
        ),
        className,
      )}
    >
      <div className="bg-surface px-6 py-6 md:px-8 md:py-8">
        <p className="font-mono text-xs text-syn-green">
          <span aria-hidden="true">{'// '}</span>
          {eyebrow}
        </p>
        <h3 className="mt-3 text-balance font-display text-xl font-bold tracking-tight text-heading sm:text-2xl">
          {title}
        </h3>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p className="text-base">{description}</p>
          <p>{supportText}</p>
          <ExternalLinkButton href={href} className="!no-underline">
            {ctaLabel}
          </ExternalLinkButton>
        </div>
      </div>

      <div className="border-t border-border bg-secondary p-4 lg:border-l lg:border-t-0">
        <div className={surfaceClass('media', 'overflow-hidden bg-background')}>
          <WindowChrome title={`bryza.app · ${pipelineLabel}`} />
          <ol
            className="space-y-2.5 px-4 py-5 font-mono text-[0.8125rem] leading-6"
            aria-hidden="true"
          >
            {pipelineSteps.map((step, index) => (
              <li key={step.cmd} className="flex gap-3">
                <span className="w-4 shrink-0 text-right text-subtle-foreground">{index + 1}</span>
                <span className="min-w-0 break-words">
                  <span className="text-primary">$ </span>
                  <span className={step.tone}>{step.cmd}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
