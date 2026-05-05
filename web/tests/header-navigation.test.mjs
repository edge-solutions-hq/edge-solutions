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
      {href: '/services/web-dev', label: 'Web'},
    ]);

    assert.deepEqual(items, [
      {href: '/', label: 'Home'},
      {href: '/services/web-dev', label: 'Web'},
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
    const services = {href: '/services/web-dev', label: 'Web'};

    assert.equal(headerNavigation.isHeaderNavigationItemActive('/', home), true);
    assert.equal(headerNavigation.isHeaderNavigationItemActive('/fr', home), false);
    assert.equal(headerNavigation.isHeaderNavigationItemActive('/services/web-dev', services), true);
    assert.equal(headerNavigation.isHeaderNavigationItemActive('/services/web-dev/proof', services), true);
    assert.equal(headerNavigation.isHeaderNavigationItemActive('/services/web-dev-extra', services), false);
  });

  it('derives contact tracking payloads from item metadata and placement', () => {
    const contact = {
      href: '/contact',
      label: 'Contact',
      tracking: {
        type: 'contact_cta',
        target: '/contact',
      },
    };

    assert.deepEqual(
      headerNavigation.getHeaderNavigationContactTrackingPayload(contact, 'header_nav'),
      {
        ctaTarget: '/contact',
        placement: 'header_nav',
        ctaLabel: 'Contact',
      }
    );
    assert.deepEqual(
      headerNavigation.getHeaderNavigationContactTrackingPayload(contact, 'mobile_menu_nav'),
      {
        ctaTarget: '/contact',
        placement: 'mobile_menu_nav',
        ctaLabel: 'Contact',
      }
    );
    assert.equal(
      headerNavigation.getHeaderNavigationContactTrackingPayload({href: '/contact', label: 'Contact'}, 'header_nav'),
      null
    );
  });
});
