export const analyticsEvents = {
  contactCtaClick: 'contact_cta_click',
  offerTrackClick: 'service_card_click',
  contactFormSubmit: 'contact_form_submit',
  contactFormSuccess: 'contact_form_success',
  contactFormError: 'contact_form_error',
  localeSwitch: 'locale_switch',
  offerTrackScrollDepth: 'service_scroll_depth',
} as const;

export const contactCtaPlacements = [
  'header_cta',
  'header_nav',
  'mobile_menu_cta',
  'mobile_menu_nav',
  'home_hero_primary',
  'home_bottom_primary',
  'service_detail_cta',
] as const;

export const offerTrackClickPlacements = [
  'home_services_grid',
  'services_index_grid',
] as const;

export const scrollDepthThresholds = [25, 50, 75, 90, 100] as const;

export type AnalyticsEventName = (typeof analyticsEvents)[keyof typeof analyticsEvents];
export type ContactCtaPlacement = (typeof contactCtaPlacements)[number];
export type OfferTrackClickPlacement = (typeof offerTrackClickPlacements)[number];
export type ScrollDepthThreshold = (typeof scrollDepthThresholds)[number];
