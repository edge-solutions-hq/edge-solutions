import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {LocaleSwitch} from './LocaleSwitch';
import {site} from '@/lib/site';
import {ButtonLink} from '@/components/ui/Button';
import {HeaderNav} from './HeaderNav';
import {MobileMenu} from './MobileMenu';

export async function Header({locale}: {locale: string}) {
  const t = await getTranslations();

  const items = [
    {href: '/', label: t('nav.home')},
    {href: '/#how-we-work', label: t('nav.process')},
    {href: '/services/web-dev', label: t('nav.web')},
    {href: '/services/realtime-games', label: t('nav.realtime')},
    {href: '/contact', label: t('nav.contact')}
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="group flex items-baseline gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="text-base font-semibold tracking-tight text-foreground">
              {site.personalBrand}
            </span>
            <span className="text-sm text-subtle-foreground">
              {site.companyName}
            </span>
          </Link>

          <HeaderNav items={items} />
        </div>

        <div className="flex items-center gap-3">
          <LocaleSwitch locale={locale} />
          <ButtonLink
            href="/contact"
            className="hidden md:inline-flex"
            trackingPlacement="header_cta"
          >
            {t('home.primaryCta')}
          </ButtonLink>
          <MobileMenu items={items} ctaLabel={t('home.primaryCta')} />
        </div>
      </div>
    </header>
  );
}


