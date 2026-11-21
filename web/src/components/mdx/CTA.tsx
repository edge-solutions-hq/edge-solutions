import {ButtonLink} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import {PromptLine, WindowChrome} from '@/components/ui/WindowChrome';

export function CTA({
  title,
  href,
  buttonLabel,
  children
}: {
  title: string;
  href: string;
  buttonLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="feature" className="not-prose mt-14 overflow-hidden">
      <WindowChrome title="contact" />
      <div className="grid gap-5 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <PromptLine command="./contact.sh" caret />
          <div className="mt-3 font-display text-xl font-bold tracking-tight text-heading sm:text-2xl">
            {title}
          </div>
          <div className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {children}
          </div>
        </div>
        <div>
          <ButtonLink href={href} size="lg" trackingPlacement="service_detail_cta">
            {buttonLabel}
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}


