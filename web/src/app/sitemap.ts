import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {OFFER_TRACKS, STATIC_SITE_ROUTES} from '@/lib/offer-tracks';
import {site} from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, '');

  const entries: Array<{path: string; lastModified: Date}> = [];

  for (const locale of routing.locales) {
    for (const route of STATIC_SITE_ROUTES) {
      entries.push({
        path: `/${locale}${route.pathSuffix}`,
        lastModified: route.lastModified,
      });
    }

    for (const track of OFFER_TRACKS) {
      entries.push({
        path: `/${locale}${track.path}`,
        lastModified: track.lastModified,
      });
    }
  }

  return entries.map(({path, lastModified}) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: path.endsWith('/contact') ? 0.6 : 0.7
  }));
}
