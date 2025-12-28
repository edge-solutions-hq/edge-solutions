import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {LocaleSwitch} from './LocaleSwitch';
import {site} from '@/lib/site';

export async function Header({locale}: {locale: string}) {
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-black/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="text-base font-semibold tracking-tight">
            {site.personalBrand}
          </span>
          <span className="text-sm text-black/50 dark:text-white/50">
            {site.companyName}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Link
            href="/"
            className="rounded-xl px-3 py-2 text-black/70 transition hover:bg-black/[0.04] dark:text-white/70 dark:hover:bg-white/[0.06]"
          >
            {t('nav.home')}
          </Link>
          <Link
            href="/services/web-dev"
            className="rounded-xl px-3 py-2 text-black/70 transition hover:bg-black/[0.04] dark:text-white/70 dark:hover:bg-white/[0.06]"
          >
            {t('nav.web')}
          </Link>
          <Link
            href="/services/realtime-games"
            className="rounded-xl px-3 py-2 text-black/70 transition hover:bg-black/[0.04] dark:text-white/70 dark:hover:bg-white/[0.06]"
          >
            {t('nav.realtime')}
          </Link>
          <Link
            href="/contact"
            className="rounded-xl px-3 py-2 text-black/70 transition hover:bg-black/[0.04] dark:text-white/70 dark:hover:bg-white/[0.06]"
          >
            {t('nav.contact')}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitch locale={locale} />
          <Link
            href="/contact"
            className="hidden rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 md:inline-flex"
          >
            {t('home.primaryCta')}
          </Link>
        </div>
      </div>
    </header>
  );
}


