export type OfferTrackSlug = 'ai-automation' | 'web-dev' | 'realtime-games';

export type OfferTrack = {
  slug: OfferTrackSlug;
  path: `/services/${OfferTrackSlug}`;
  navKey: string;
  titleKey: string;
  descriptionKey: string;
  hubTriggerKey: string;
  hubDescriptionKey: string;
  hubProofKey: string;
  decisionKey: string;
  schemaServiceType: string;
  lastModified: Date;
  sitemapPriority: number;
  priorityRole: 'primary' | 'supporting';
};

export const OFFER_TRACKS: readonly OfferTrack[] = [
  {
    slug: 'ai-automation',
    path: '/services/ai-automation',
    navKey: 'nav.ai',
    titleKey: 'services.aiTitle',
    descriptionKey: 'services.aiDesc',
    hubTriggerKey: 'services.hubAiTrigger',
    hubDescriptionKey: 'services.hubAiDesc',
    hubProofKey: 'services.hubAiProof',
    decisionKey: 'services.decisionAi',
    schemaServiceType: 'AI systems & automation',
    lastModified: new Date('2026-04-14T05:55:40.000Z'),
    sitemapPriority: 0.7,
    priorityRole: 'primary',
  },
  {
    slug: 'web-dev',
    path: '/services/web-dev',
    navKey: 'nav.web',
    titleKey: 'services.webTitle',
    descriptionKey: 'services.webDesc',
    hubTriggerKey: 'services.hubWebTrigger',
    hubDescriptionKey: 'services.hubWebDesc',
    hubProofKey: 'services.hubWebProof',
    decisionKey: 'services.decisionWeb',
    schemaServiceType: 'Web development',
    lastModified: new Date('2026-04-16T05:54:06.000Z'),
    sitemapPriority: 0.7,
    priorityRole: 'supporting',
  },
  {
    slug: 'realtime-games',
    path: '/services/realtime-games',
    navKey: 'nav.realtime',
    titleKey: 'services.realtimeTitle',
    descriptionKey: 'services.realtimeDesc',
    hubTriggerKey: 'services.hubRealtimeTrigger',
    hubDescriptionKey: 'services.hubRealtimeDesc',
    hubProofKey: 'services.hubRealtimeProof',
    decisionKey: 'services.decisionRealtime',
    schemaServiceType: 'Real-time 3D/VR',
    lastModified: new Date('2026-04-15T05:56:00.000Z'),
    sitemapPriority: 0.7,
    priorityRole: 'supporting',
  },
];

export const OFFER_TRACK_SLUGS = OFFER_TRACKS.map((track) => track.slug);

export function isOfferTrackSlug(value: string): value is OfferTrackSlug {
  return OFFER_TRACK_SLUGS.includes(value as OfferTrackSlug);
}

export function getOfferTrack(slug: string): OfferTrack | null {
  return OFFER_TRACKS.find((track) => track.slug === slug) ?? null;
}

export function getOfferTrackPath(slug: OfferTrackSlug): `/services/${OfferTrackSlug}` {
  return `/services/${slug}`;
}
