import {Card} from '@/components/ui/Card';
import {cn} from '@/lib/cn';

export function Callout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('not-prose bg-surface-muted p-5', className)}>
      <div className="text-sm leading-relaxed text-foreground">{children}</div>
    </Card>
  );
}


