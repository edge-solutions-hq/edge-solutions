import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function ServicesIndexPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t('services.title')}
        </h1>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/services/web-dev"
          aria-label={t('services.webTitle')}
          className="group rounded-2xl border border-black/10 bg-black/[0.02] p-6 transition hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="text-lg font-semibold">{t('services.webTitle')}</div>
            <span
              className="mt-0.5 text-sm text-black/50 transition group-hover:translate-x-0.5 dark:text-white/50"
              aria-hidden="true"
            >
              →
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-black/70 dark:text-white/70">
            {t('services.webDesc')}
          </p>

          <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
            {t('services.cta')}
            <span
              className="transition group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              →
            </span>
          </div>
        </Link>

        <Link
          href="/services/realtime-games"
          aria-label={t('services.realtimeTitle')}
          className="group rounded-2xl border border-black/10 bg-black/[0.02] p-6 transition hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="text-lg font-semibold">
              {t('services.realtimeTitle')}
            </div>
            <span
              className="mt-0.5 text-sm text-black/50 transition group-hover:translate-x-0.5 dark:text-white/50"
              aria-hidden="true"
            >
              →
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-black/70 dark:text-white/70">
            {t('services.realtimeDesc')}
          </p>

          <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
            {t('services.cta')}
            <span
              className="transition group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}


