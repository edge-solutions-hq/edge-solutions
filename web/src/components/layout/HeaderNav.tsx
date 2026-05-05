'use client';

import {Link, usePathname} from '@/i18n/navigation';
import {trackContactCtaClick} from '@/lib/analytics/events';
import {cn} from '@/lib/cn';
import {
  getHeaderNavigationContactTrackingPayload,
  isHeaderNavigationItemActive,
  type HeaderNavigationItem,
} from '@/lib/navigation/header-navigation';

export function HeaderNav({items}: {items: HeaderNavigationItem[]}) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {items.map((item) => {
        const active = isHeaderNavigationItemActive(pathname, item);
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
              const trackingPayload = getHeaderNavigationContactTrackingPayload(item, 'header_nav');
              if (trackingPayload) {
                trackContactCtaClick(trackingPayload);
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
