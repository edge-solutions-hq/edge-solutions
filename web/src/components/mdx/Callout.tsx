import {Card} from '@/components/ui/Card';

export function Callout({children}: {children: React.ReactNode}) {
  return (
    <Card className="not-prose bg-surface-muted p-5">
      <div className="text-sm leading-relaxed text-foreground">{children}</div>
    </Card>
  );
}


