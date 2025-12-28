import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <p className="text-sm text-black/60 dark:text-white/60">
          {t('home.subheadline')}
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          {t('home.headline')}
        </h1>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {t('home.primaryCta')}
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-black/[0.03] dark:border-white/10 dark:bg-black dark:text-white dark:hover:bg-white/[0.06]"
          >
            {t('home.secondaryCta')}
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t('services.title')}
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="text-lg font-semibold">{t('services.webTitle')}</div>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              {t('services.webDesc')}
            </p>
            <div className="mt-4">
              <Link
                href="/services/web-dev"
                className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                {t('services.cta')}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="text-lg font-semibold">
              {t('services.realtimeTitle')}
            </div>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">
              {t('services.realtimeDesc')}
            </p>
            <div className="mt-4">
              <Link
                href="/services/realtime-games"
                className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                {t('services.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


