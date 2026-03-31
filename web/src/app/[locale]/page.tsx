import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {FadeIn, FadeInStagger} from '@/components/studio/FadeIn';
import {PageIntro} from '@/components/studio/PageIntro';
import {SectionIntro} from '@/components/studio/SectionIntro';
import {StatList, StatListItem} from '@/components/studio/StatList';
import {buildLocaleAlternates} from '@/lib/seo';

type Props = {
  params: Promise<{locale: string}>;
};

type ProofIconProps = {
  kind: 'process' | 'stack' | 'outcomes';
};

function ProofIcon({kind}: ProofIconProps) {
  const shared = {
    className: 'h-5 w-5',
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true' as const,
    focusable: false,
  };

  if (kind === 'process') {
    return (
      <svg {...shared}>
        <path
          d="M6 7H18M6 12H12M6 17H15"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="17.5" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (kind === 'stack') {
    return (
      <svg {...shared}>
        <rect x="4" y="5" width="16" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="4" y="10" width="16" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="4" y="15" width="16" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg {...shared}>
      <path
        d="M5 16L10 11L13 14L19 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 8H19V12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;

  const titleByLocale: Record<string, string> = {
    fr: 'Développement web et 3D/VR pour entreprises wallonnes',
    en: 'Web development and 3D/VR for Belgian teams',
    nl: 'Webontwikkeling en 3D/VR voor Belgische teams',
  };

  const descriptionByLocale: Record<string, string> = {
    fr: 'Edge Solutions conçoit des sites performants et des expériences 3D/VR, avec une approche SEO et conversion orientée Wallonie.',
    en: 'Edge Solutions builds high-performance websites and real-time 3D/VR experiences with a Wallonia-first SEO and conversion approach.',
    nl: 'Edge Solutions bouwt snelle websites en realtime 3D/VR-ervaringen met een lokale SEO- en conversiefocus voor België.',
  };

  return {
    title: titleByLocale[locale] || titleByLocale.en,
    description: descriptionByLocale[locale] || descriptionByLocale.en,
    alternates: buildLocaleAlternates(locale),
  };
}

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(900px_circle_at_75%_18%,rgba(37,99,235,0.20),transparent_60%),radial-gradient(800px_circle_at_20%_78%,rgba(124,58,237,0.16),transparent_60%)]"
      />

      <div className="relative z-10 space-y-24">
        <section className="relative">

        <PageIntro eyebrow={t('home.subheadline')} title={t('home.headline')}>
          <p>{t('meta.siteTagline')}</p>

          <div className="not-prose mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" size="lg" trackingPlacement="home_hero_primary">
              {t('home.primaryCta')}
            </ButtonLink>
            <ButtonLink href="/services" variant="outline" size="lg">
              {t('home.secondaryCta')}
            </ButtonLink>
          </div>
        </PageIntro>
      </section>

      <section>
        <SectionIntro title={t('services.title')} />

        <FadeInStagger className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <FadeIn className="flex">
            <TrackedLink
              href="/services/web-dev"
              aria-label={t('services.webTitle')}
              eventName="service_card_click"
              eventParams={{
                service_slug: 'web-dev',
                placement: 'home_services_grid',
              }}
              className="group flex w-full flex-col rounded-lg border border-border bg-surface p-6 no-underline shadow-sm transition-colors hover:bg-surface-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-lg font-semibold">{t('services.webTitle')}</div>
                <span
                  className="mt-0.5 text-sm text-subtle-foreground transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {t('services.webDesc')}
              </p>

              <div className="mt-auto pt-5 inline-flex items-center gap-1 text-sm font-medium text-link">
                {t('services.cta')}
                <span
                  className="transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </TrackedLink>
          </FadeIn>

          <FadeIn className="flex">
            <TrackedLink
              href="/services/realtime-games"
              aria-label={t('services.realtimeTitle')}
              eventName="service_card_click"
              eventParams={{
                service_slug: 'realtime-games',
                placement: 'home_services_grid',
              }}
              className="group flex w-full flex-col rounded-lg border border-border bg-surface p-6 no-underline shadow-sm transition-colors hover:bg-surface-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-lg font-semibold">
                  {t('services.realtimeTitle')}
                </div>
                <span
                  className="mt-0.5 text-sm text-subtle-foreground transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {t('services.realtimeDesc')}
              </p>

              <div className="mt-auto pt-5 inline-flex items-center gap-1 text-sm font-medium text-link">
                {t('services.cta')}
                <span
                  className="transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </TrackedLink>
          </FadeIn>
        </FadeInStagger>
      </section>

      <section>
        <SectionIntro
          eyebrow={t('home.trust.eyebrow')}
          title={t('home.trust.title')}
        >
          <p>{t('home.trust.intro')}</p>
        </SectionIntro>

        <StatList className="mt-10">
          <StatListItem
            value={t('home.trust.items.direct.value')}
            label={t('home.trust.items.direct.label')}
          />
          <StatListItem
            value={t('home.trust.items.delivery.value')}
            label={t('home.trust.items.delivery.label')}
          />
          <StatListItem
            value={t('home.trust.items.quality.value')}
            label={t('home.trust.items.quality.label')}
          />
        </StatList>
      </section>

      <section id="proof-signals" className="scroll-mt-24">
        <SectionIntro
          eyebrow={t('home.proof.eyebrow')}
          title={t('home.proof.title')}
        >
          <p>{t('home.proof.intro')}</p>
        </SectionIntro>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-link">
                <ProofIcon kind="process" />
              </span>
              <span>{t('home.proof.items.process.kicker')}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">
              {t('home.proof.items.process.title')}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('home.proof.items.process.body')}
            </p>
          </Card>

          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-link">
                <ProofIcon kind="stack" />
              </span>
              <span>{t('home.proof.items.stack.kicker')}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">
              {t('home.proof.items.stack.title')}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('home.proof.items.stack.body')}
            </p>
          </Card>

          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-link">
                <ProofIcon kind="outcomes" />
              </span>
              <span>{t('home.proof.items.outcomes.kicker')}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">
              {t('home.proof.items.outcomes.title')}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('home.proof.items.outcomes.body')}
            </p>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6 md:p-8">
            <p className="text-base font-medium leading-relaxed text-foreground">
              “{t('home.proof.testimonials.first.quote')}”
            </p>
            <div className="mt-5 space-y-1 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                {t('home.proof.testimonials.first.author')}
              </p>
              <p>{t('home.proof.testimonials.first.role')}</p>
            </div>
          </Card>

          <Card className="p-6 md:p-8">
            <p className="text-base font-medium leading-relaxed text-foreground">
              “{t('home.proof.testimonials.second.quote')}”
            </p>
            <div className="mt-5 space-y-1 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                {t('home.proof.testimonials.second.author')}
              </p>
              <p>{t('home.proof.testimonials.second.role')}</p>
            </div>
          </Card>
        </div>
      </section>

      <section>
        <Card className="relative overflow-hidden p-8 md:p-12">
          <div
            className="pointer-events-none absolute -right-28 -top-24 h-72 w-72 rounded-full bg-secondary/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          <FadeIn>
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('contact.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t('contact.intro')}
            </p>

            <div className="not-prose mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/contact"
                size="lg"
                trackingPlacement="home_bottom_primary"
              >
                {t('home.primaryCta')}
              </ButtonLink>
              <ButtonLink href="/services" variant="outline" size="lg">
                {t('home.secondaryCta')}
              </ButtonLink>
            </div>
          </FadeIn>
        </Card>
      </section>
      </div>
    </div>
  );
}

