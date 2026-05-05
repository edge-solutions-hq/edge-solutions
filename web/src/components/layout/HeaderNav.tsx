'use client';

import {Link, usePathname} from '@/i18n/navigation';
import {trackContactCtaClick} from '@/lib/analytics/events';
import {cn} from '@/lib/cn';
import {
  getHeaderNavigationRenderItems,
  type HeaderNavigationItem,
} from '@/lib/navigation/header-navigation';

export function HeaderNav({items}: {items: HeaderNavigationItem[]}) {
  const pathname = usePathname();
  const navItems = getHeaderNavigationRenderItems(pathname, items, 'header_nav');

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          className={cn(
            'rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
            item.active
              ? 'bg-surface-muted text-foreground'
              : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
          )}
          onClick={() => {
            if (item.trackingPayload) {
              trackContactCtaClick(item.trackingPayload);
            }
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
