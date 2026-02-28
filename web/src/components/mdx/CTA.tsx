import {ButtonLink} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';

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
    <Card className="not-prose mt-8 p-6">
      <div className="text-lg font-semibold text-foreground">{title}</div>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
      <div className="mt-4">
        <ButtonLink href={href} trackingPlacement="service_detail_cta">
          {buttonLabel}
        </ButtonLink>
      </div>
    </Card>
  );
}


