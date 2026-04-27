import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {buildLocalizedPageMetadata, breadcrumbSchema, webPageSchema} from '@/lib/seo';
import {JsonLd} from '@/components/seo/JsonLd';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;

  const titleByLocale: Record<string, string> = {
    fr: 'Services IA-first, web et 3D/VR pour équipes en Wallonie',
    en: 'AI-first services with web and 3D/VR execution in Belgium',
    nl: 'AI-first diensten met web- en 3D/VR-uitvoering in België',
  };

  const descriptionByLocale: Record<string, string> = {
    fr: 'Services Edge Solutions : systèmes IA, automatisation, intégration web, SEO technique et exécution temps réel 3D/VR pour équipes belges qui doivent rendre l’IA réellement exploitable.',
    en: 'Edge Solutions services: AI systems, automation, web integration, technical SEO and real-time 3D/VR execution for Belgian teams that need AI to become truly usable.',
    nl: 'Diensten van Edge Solutions: AI-systemen, automatisatie, webintegratie, technische SEO en realtime 3D/VR-uitvoering voor Belgische teams die AI echt bruikbaar moeten maken.',
  };

  return buildLocalizedPageMetadata({
    locale,
    pathSuffix: '/services',
    title: titleByLocale[locale] || titleByLocale.en,
    description: descriptionByLocale[locale] || descriptionByLocale.en,
  });
}

export default async function ServicesIndexPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const title = t('services.hubTitle');
  const description = t('services.hubIntro');
  const services = [
    {
      href: '/services/ai-automation',
      label: t('services.aiTitle'),
      triggerLabel: t('services.hubAiTrigger'),
      description: t('services.hubAiDesc'),
      proofCue: t('services.hubAiProof'),
      slug: 'ai-automation',
    },
    {
      href: '/services/web-dev',
      label: t('services.webTitle'),
      triggerLabel: t('services.hubWebTrigger'),
      description: t('services.hubWebDesc'),
      proofCue: t('services.hubWebProof'),
      slug: 'web-dev',
    },
    {
      href: '/services/realtime-games',
      label: t('services.realtimeTitle'),
      triggerLabel: t('services.hubRealtimeTrigger'),
      description: t('services.hubRealtimeDesc'),
      proofCue: t('services.hubRealtimeProof'),
      slug: 'realtime-games',
    },
  ];

  return (
    <div className="space-y-8">
      <JsonLd
        data={[
          webPageSchema(locale, '/services', title, description),
          breadcrumbSchema(locale, [
            {name: t('nav.home'), path: ''},
            {name: t('services.title'), path: '/services'},
          ]),
        ]}
      />

      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t('services.hubTitle')}
        </h1>

        <p className="text-base leading-7 text-muted-foreground">
          {t('services.hubIntro')}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <TrackedLink
            key={service.slug}
            href={service.href}
            aria-label={service.label}
            eventName="service_card_click"
            eventParams={{
              service_slug: service.slug,
              placement: 'services_index_grid',
            }}
            className="group rounded-lg border border-border bg-surface p-6 shadow-sm transition-colors hover:bg-surface-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">
                  {service.triggerLabel}
                </div>
                <div className="text-lg font-semibold">{service.label}</div>
              </div>
              <span
                className="mt-0.5 text-sm text-subtle-foreground transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              >
                →
              </span>
            </div>

            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {service.description}
            </p>

            <p className="mt-4 border-t border-border pt-4 text-sm leading-6 text-foreground">
              {service.proofCue}
            </p>

            <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-link">
              {t('services.cta')}
              <span
                className="transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              >
                →
              </span>
            </div>
          </TrackedLink>
        ))}
      </div>
    </div>
  );
}
