import {Card} from '@/components/ui/Card';
import {SectionIntro} from '@/components/studio/SectionIntro';

type ProofModuleItem = {
  title: string;
  body: string;
  href?: string;
  label?: string;
};

export interface ProofModuleProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  items?: ProofModuleItem[];
}

export default function ProofModule({
  eyebrow,
  title,
  intro,
  items = []
}: ProofModuleProps) {
  return (
    <section>
      <SectionIntro eyebrow={eyebrow} title={title}>
        {intro ? <p>{intro}</p> : null}
      </SectionIntro>

      {items.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={`${item.title}-${item.href ?? 'static'}`} className="p-6">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-4 inline-flex text-sm font-medium text-foreground underline underline-offset-4"
                >
                  {item.label ?? item.href}
                </a>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
