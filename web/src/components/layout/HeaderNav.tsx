'use client';

import {Link, usePathname} from '@/i18n/navigation';
import {trackContactCtaClick} from '@/lib/analytics/events';
import {cn} from '@/lib/cn';
import {
  getHeaderNavigationRenderItems,
  type HeaderNavigationItem,
} from '@/lib/navigation/header-navigation';
import {
  shouldOpenContactModalForClick,
  useContactModal,
} from '@/components/contact/ContactModalContext';

export function HeaderNav({items}: {items: HeaderNavigationItem[]}) {
  const pathname = usePathname();
  const navItems = getHeaderNavigationRenderItems(pathname, items, 'header_nav');
  const contactModal = useContactModal();

  return (
    <nav className="hidden items-stretch lg:flex">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          className={cn(
            'relative flex items-center whitespace-nowrap border-x border-transparent px-3 font-mono text-[0.8125rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none lg:px-4',
            item.active
              ? 'border-border bg-background text-heading after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:bg-primary'
              : 'text-muted-foreground hover:bg-surface hover:text-heading'
          )}
          onClick={(event) => {
            if (item.trackingPayload) {
              trackContactCtaClick(item.trackingPayload);
            }

            if (
              item.trackingPayload &&
              contactModal &&
              !event.defaultPrevented &&
              shouldOpenContactModalForClick(event)
            ) {
              event.preventDefault();
              contactModal.openContactModal({href: item.href});
            }
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
