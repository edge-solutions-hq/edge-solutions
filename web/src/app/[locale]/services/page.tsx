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
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t('services.title')}
        </h1>
        <p className="text-sm text-black/70 dark:text-white/70">
          Deux offres, deux pages dédiées. Le contenu EN/NL affichera la version
          FR tant que les traductions ne sont pas prêtes.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/services/web-dev"
          className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 transition hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
        >
          <div className="text-lg font-semibold">{t('services.webTitle')}</div>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            {t('services.webDesc')}
          </p>
        </Link>

        <Link
          href="/services/realtime-games"
          className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 transition hover:bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
        >
          <div className="text-lg font-semibold">
            {t('services.realtimeTitle')}
          </div>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            {t('services.realtimeDesc')}
          </p>
        </Link>
      </div>
    </div>
  );
}


