'use client';

import {Link, usePathname} from '@/i18n/navigation';
import {trackConversionEvent} from '@/lib/analytics/events';
import {cn} from '@/lib/cn';

export type HeaderNavItem = {
  href: string;
  label: string;
};

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav({items}: {items: HeaderNavItem[]}) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
              active
                ? 'bg-surface-muted text-foreground'
                : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
            )}
            onClick={() => {
              if (item.href === '/contact') {
                trackConversionEvent('contact_cta_click', {
                  cta_target: '/contact',
                  page_path: `${window.location.pathname}${window.location.search}`,
                  placement: 'header_nav',
                });
              }
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}


