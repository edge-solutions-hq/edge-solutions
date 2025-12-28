'use client';

import {Link, usePathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import {cn} from '@/lib/cn';

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
            className={cn(
              'rounded-md px-2 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
            )}
          >
            {l.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}


