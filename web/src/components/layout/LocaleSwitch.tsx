'use client';

import {Link, usePathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

export function LocaleSwitch({locale}: {locale: string}) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-sm">
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={pathname}
            locale={l}
            aria-current={active ? 'page' : undefined}
            className={[
              'rounded-lg px-2 py-1 transition',
              active
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-black/70 hover:bg-black/[0.04] dark:text-white/70 dark:hover:bg-white/[0.06]'
            ].join(' ')}
          >
            {l.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}


