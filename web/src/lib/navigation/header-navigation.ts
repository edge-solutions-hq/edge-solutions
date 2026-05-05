import type {ContactCtaPlacement} from '@/lib/analytics/taxonomy';

type Translate = (key: string) => string;

export type HeaderNavigationTrackingIntent = {
  type: 'contact_cta';
  target: '/contact';
};

export type HeaderNavigationItem = {
  href: string;
  label: string;
  tracking?: HeaderNavigationTrackingIntent;
};

export type HeaderNavigationContactTrackingPayload = {
  ctaTarget: string;
  placement: ContactCtaPlacement;
  ctaLabel: string;
};

export function getHeaderNavigationItems(
  translate: Translate,
  offerItems: HeaderNavigationItem[]
): HeaderNavigationItem[] {
  return [
    {href: '/', label: translate('nav.home')},
    ...offerItems,
    {
      href: '/contact',
      label: translate('nav.contact'),
      tracking: {
        type: 'contact_cta',
        target: '/contact',
      },
    },
  ];
}

export function isHeaderNavigationItemActive(pathname: string, item: HeaderNavigationItem) {
  if (item.href === '/') return pathname === '/';
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function getHeaderNavigationContactTrackingPayload(
  item: HeaderNavigationItem,
  placement: ContactCtaPlacement
): HeaderNavigationContactTrackingPayload | null {
  if (item.tracking?.type !== 'contact_cta') return null;

  return {
    ctaTarget: item.tracking.target,
    placement,
    ctaLabel: item.label,
  };
}
