import {ExternalLinkButton} from '@/components/ui/ExternalLinkButton';
import {MediaFrame} from '@/components/ui/MediaFrame';
import {surfaceClass} from '@/components/ui/Surface';
import {cn} from '@/lib/cn';

type BryzaPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  supportText: string;
  imageSrc: string;
  imageAlt: string;
  imageCaption: string;
  ctaLabel: string;
  href: string;
  className?: string;
};

export function BryzaPanel({
  eyebrow,
  title,
  description,
  supportText,
  imageSrc,
  imageAlt,
  imageCaption,
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

      <figure className="m-0 border-t border-border bg-secondary p-4 lg:border-l lg:border-t-0">
        <MediaFrame
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          width={1600}
          height={1000}
          outerClassName=""
          chromeClassName="pb-3"
          imageFrameClassName={surfaceClass('media', 'overflow-hidden')}
          imagePriority
        />
        <figcaption className="mt-3 font-mono text-xs text-subtle-foreground">
          <span aria-hidden="true">{'// '}</span>
          {imageCaption}
        </figcaption>
      </figure>
    </section>
  );
}
