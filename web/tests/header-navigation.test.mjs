import {describe, it} from 'node:test';
import assert from 'node:assert/strict';

const headerNavigation = await import('../src/lib/navigation/header-navigation.ts');

describe('header navigation model', () => {
  const translate = (key) => ({
    'nav.home': 'Home',
    'nav.contact': 'Contact',
  })[key] ?? key;

  it('builds shared header navigation items with contact tracking metadata', () => {
    const items = headerNavigation.getHeaderNavigationItems(translate, [
      {href: '/services/ai-automation', label: 'AI'},
    ]);

    assert.deepEqual(items, [
      {href: '/', label: 'Home'},
      {href: '/services/ai-automation', label: 'AI'},
      {
        href: '/contact',
        label: 'Contact',
        tracking: {
          type: 'contact_cta',
          target: '/contact',
        },
      },
    ]);
  });

  it('matches active items exactly for home and by path segment for nested pages', () => {
    const home = {href: '/', label: 'Home'};
    const services = {href: '/services/ai-automation', label: 'AI'};

    assert.equal(headerNavigation.isHeaderNavigationItemActive('/', home), true);
    assert.equal(headerNavigation.isHeaderNavigationItemActive('/fr', home), false);
    assert.equal(headerNavigation.isHeaderNavigationItemActive('/services/ai-automation', services), true);
    assert.equal(headerNavigation.isHeaderNavigationItemActive('/services/ai-automation/details', services), true);
    assert.equal(headerNavigation.isHeaderNavigationItemActive('/services/ai-automation-extra', services), false);
  });

  it('builds desktop and mobile render items with matching active state and placement-specific contact payloads', () => {
    const items = headerNavigation.getHeaderNavigationItems(translate, [
      {href: '/services/ai-automation', label: 'AI'},
    ]);

    const desktopItems = headerNavigation.getHeaderNavigationRenderItems(
      '/services/ai-automation/details',
      items,
      'header_nav'
    );
    const mobileItems = headerNavigation.getHeaderNavigationRenderItems(
      '/services/ai-automation/details',
      items,
      'mobile_menu_nav'
    );

    assert.deepEqual(
      desktopItems.map((item) => ({href: item.href, active: item.active})),
      mobileItems.map((item) => ({href: item.href, active: item.active}))
    );
    assert.deepEqual(
      desktopItems.map((item) => ({href: item.href, active: item.active})),
      [
        {href: '/', active: false},
        {href: '/services/ai-automation', active: true},
        {href: '/contact', active: false},
      ]
    );
    assert.deepEqual(desktopItems.at(-1).trackingPayload, {
      ctaTarget: '/contact',
      placement: 'header_nav',
      ctaLabel: 'Contact',
    });
    assert.deepEqual(mobileItems.at(-1).trackingPayload, {
      ctaTarget: '/contact',
      placement: 'mobile_menu_nav',
      ctaLabel: 'Contact',
    });
  });

  it('returns no contact tracking payload for items without tracking metadata', () => {
    assert.equal(
      headerNavigation.getHeaderNavigationContactTrackingPayload({href: '/contact', label: 'Contact'}, 'header_nav'),
      null
    );
  });

  it('derives mobile menu CTA targets and tracking payloads from the shared contact item', () => {
    const items = headerNavigation.getHeaderNavigationItems(translate, [
      {href: '/services/ai-automation', label: 'AI'},
    ]);

    assert.deepEqual(
      headerNavigation.getHeaderNavigationContactAction(
        items,
        'Start a conversation',
        'mobile_menu_cta'
      ),
      {
        href: '/contact',
        label: 'Start a conversation',
        trackingPayload: {
          ctaTarget: '/contact',
          placement: 'mobile_menu_cta',
          ctaLabel: 'Start a conversation',
        },
      }
    );
    assert.equal(
      headerNavigation.getHeaderNavigationContactAction(
        [{href: '/', label: 'Home'}],
        'Start a conversation',
        'mobile_menu_cta'
      ),
      null
    );
  });
});
