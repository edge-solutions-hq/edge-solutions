'use client';

import {Link, usePathname} from '@/i18n/navigation';
import {useSearchParams} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {trackLocaleSwitch} from '@/lib/analytics/events';
import {cn} from '@/lib/cn';

export function LocaleSwitch({locale}: {locale: string}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const href = queryString ? `${pathname}?${queryString}` : pathname;

  return <LocaleLinks locale={locale} href={href} />;
}

export function LocaleSwitchFallback({locale}: {locale: string}) {
  const pathname = usePathname();

  return <LocaleLinks locale={locale} href={pathname} />;
}

function LocaleLinks({locale, href}: {locale: string; href: string}) {
  const handleLocaleClick = (nextLocale: string, active: boolean) => {
    if (active || typeof window === 'undefined') return;

    trackLocaleSwitch({fromLocale: locale, toLocale: nextLocale});
  };

  return (
    <div className="flex items-center rounded-md border border-border p-0.5 font-mono text-xs">
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={href}
            locale={l}
            onClick={() => handleLocaleClick(l, active)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded px-2 py-1.5 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary motion-reduce:transition-none',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-surface-muted hover:text-heading'
            )}
          >
            {l.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
