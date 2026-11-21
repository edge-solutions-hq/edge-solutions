import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register(new URL('./ts-extension-resolver.mjs', import.meta.url));

const headerNavigation = await import('../src/lib/navigation/header-navigation.ts');
const {hrefToTrackedTarget, isContactTarget} = await import('../src/lib/navigation/tracked-link-target.ts');
const {getHeaderOfferNavItems} = await import('../src/lib/offer/offer-presentation.ts');
const {getHomePresentationModel} = await import('../src/lib/offer/home-presentation.ts');

describe('header navigation model', () => {
  const translate = (key) => ({
    'nav.home': 'Home',
    'nav.contact': 'Contact',
  })[key] ?? key;

  it('matches active items exactly for home and by path segment for nested pages', () => {
    const home = {href: '/', label: 'Home'};
    const services = {href: '/services/ai-automation', label: 'AI'};

    assert.equal(headerNavigation.isHeaderNavigationItemActive('/', home), true);
    assert.equal(headerNavigation.isHeaderNavigationItemActive('/fr', home), false);
    assert.equal(headerNavigation.isHeaderNavigationItemActive('/services/ai-automation', services), true);
    assert.equal(headerNavigation.isHeaderNavigationItemActive('/services/ai-automation/details', services), true);
    assert.equal(headerNavigation.isHeaderNavigationItemActive('/services/ai-automation-extra', services), false);
  });

  it('renders home, offers, then a tracked contact item with placement-specific payloads', () => {
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

    for (const renderItems of [desktopItems, mobileItems]) {
      assert.deepEqual(
        renderItems.map((item) => ({href: item.href, active: item.active, tracked: item.trackingPayload !== null})),
        [
          {href: '/', active: false, tracked: false},
          {href: '/services/ai-automation', active: true, tracked: false},
          {href: '/contact', active: false, tracked: true},
        ]
      );
    }
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

describe('tracked navigation targets', () => {
  it('reports the destination users actually reach', () => {
    assert.equal(hrefToTrackedTarget('/fr/services/ai-automation?from=nav'), '/fr/services/ai-automation?from=nav');
    assert.equal(hrefToTrackedTarget({pathname: '/en/contact', hash: '#form'}), '/en/contact#form');
  });

  it('treats only the contact page as a contact target', () => {
    assert.equal(isContactTarget('/en/contact#form'), true);
    assert.equal(isContactTarget('/contact-us'), false);
    assert.equal(isContactTarget('/en/services/contact-center'), false);
  });
});

describe('offer navigation surfaces', () => {
  it('labels header offer links with their navigation keys and service paths', () => {
    assert.deepEqual(
      getHeaderOfferNavItems((key) => key).map(({href, label}) => ({href, label})),
      [
        {href: '/services/ai-automation', label: 'nav.ai'},
        {href: '/services/realtime-games', label: 'nav.realtime'},
      ]
    );
  });

  it('sends both home CTAs to contact with distinct tracking placements', () => {
    const {ctas} = getHomePresentationModel((key) => key);

    assert.deepEqual(ctas, {
      heroPrimary: {href: '/contact', trackingPlacement: 'home_hero_primary'},
      bottomPrimary: {href: '/contact', trackingPlacement: 'home_bottom_primary'},
    });
  });
});
