import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t('notFound.title')}
      </h1>
      <p className="text-sm text-black/70 dark:text-white/70">
        {t('notFound.description')}
      </p>
      <div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
        >
          {t('notFound.cta')}
        </Link>
      </div>
    </div>
  );
}


