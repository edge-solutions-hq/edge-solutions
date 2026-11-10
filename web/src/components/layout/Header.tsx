import {getTranslations} from 'next-intl/server';
import {Suspense} from 'react';
import {Link} from '@/i18n/navigation';
import {LocaleSwitch, LocaleSwitchFallback} from './LocaleSwitch';
import {site} from '@/lib/site/site';
import {ButtonLink} from '@/components/ui/Button';
import {HeaderNav} from './HeaderNav';
import {MobileMenu} from './MobileMenu';
import {getHeaderOfferNavItems} from '@/lib/offer/offer-presentation';
import {getHeaderNavigationItems} from '@/lib/navigation/header-navigation';

export async function Header({locale}: {locale: string}) {
  const t = await getTranslations();

  const items = getHeaderNavigationItems(t, getHeaderOfferNavItems(t));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/82">
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
          <Suspense fallback={<LocaleSwitchFallback locale={locale} />}>
            <LocaleSwitch locale={locale} />
          </Suspense>
          <ButtonLink
            href="/contact"
            className="hidden md:inline-flex"
            trackingPlacement="header_cta"
          >
            {t('home.primaryCta')}
          </ButtonLink>
          <MobileMenu
            items={items}
            ctaLabel={t('home.primaryCta')}
            labels={{
              open: t('nav.mobileMenu.open'),
              close: t('nav.mobileMenu.close'),
            }}
          />
        </div>
      </div>
    </header>
  );
}
