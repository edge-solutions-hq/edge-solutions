import {getTranslations} from 'next-intl/server';
import {Suspense} from 'react';
import {Link} from '@/i18n/navigation';
import {LocaleSwitch, LocaleSwitchFallback} from './LocaleSwitch';
import {site} from '@/lib/site/site';
import {ButtonLink} from '@/components/ui/Button';
import {HeaderNav} from './HeaderNav';
import {LogoMark} from '@/components/ui/LogoMark';
import {MobileMenu} from './MobileMenu';
import {CommandPalette} from './CommandPalette';
import {getHeaderOfferNavItems} from '@/lib/offer/offer-presentation';
import {getHeaderNavigationItems} from '@/lib/navigation/header-navigation';

export async function Header({locale}: {locale: string}) {
  const t = await getTranslations();

  const items = getHeaderNavigationItems(t, getHeaderOfferNavItems(t));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-secondary/85">
      <div className="mx-auto flex h-14 max-w-6xl items-stretch justify-between gap-4 px-5 sm:px-6">
        <div className="flex items-stretch gap-5">
          <Link
            href="/"
            className="group flex items-center gap-2 whitespace-nowrap font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
          >
            <LogoMark className="size-5 text-primary" />
            <span className="text-sm font-bold text-heading">
              {site.personalBrand}
            </span>
            <span className="hidden text-xs text-subtle-foreground sm:inline lg:hidden">
              {site.companyName}
            </span>
          </Link>

          <HeaderNav items={items} />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <CommandPalette
            items={items}
            extraItems={[
              {href: '/services', label: t('services.title')},
              {href: '/privacy-policy', label: t('footer.privacyPolicy')},
            ]}
            labels={{
              title: t('nav.palette.title'),
              placeholder: t('nav.palette.placeholder'),
              empty: t('nav.palette.empty'),
              close: t('nav.palette.close'),
            }}
          />
          <Suspense fallback={<LocaleSwitchFallback locale={locale} />}>
            <LocaleSwitch locale={locale} />
          </Suspense>
          <ButtonLink
            href="/contact"
            className="hidden md:inline-flex"
            size="sm"
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
