import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <div className="space-y-16">
      <section>
        <Card className="relative overflow-hidden p-8 md:p-12">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
            aria-hidden="true"
          />

          <p className="text-sm text-subtle-foreground">{t('home.subheadline')}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            {t('home.headline')}
          </h1>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" size="lg">
              {t('home.primaryCta')}
            </ButtonLink>
            <ButtonLink href="/services" variant="outline" size="lg">
              {t('home.secondaryCta')}
            </ButtonLink>
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">{t('services.title')}</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="text-lg font-semibold text-foreground">
              {t('services.webTitle')}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t('services.webDesc')}</p>
            <div className="mt-5">
              <ButtonLink href="/services/web-dev" variant="outline">
                {t('services.cta')}
              </ButtonLink>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-lg font-semibold text-foreground">
              {t('services.realtimeTitle')}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('services.realtimeDesc')}
            </p>
            <div className="mt-5">
              <ButtonLink href="/services/realtime-games" variant="outline">
                {t('services.cta')}
              </ButtonLink>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}


