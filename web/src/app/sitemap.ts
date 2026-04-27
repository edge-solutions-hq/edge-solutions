import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {SERVICE_SLUGS} from '@/lib/content/services';
import type {ServiceSlug} from '@/lib/content/services';
import {site} from '@/lib/site';

// Keep sitemap freshness tied to source/content edits instead of build time.
const staticRouteLastModified = {
  home: new Date('2026-04-24T10:10:11.000Z'),
  services: new Date('2026-04-27T13:06:04.000Z'),
  contact: new Date('2026-04-05T14:34:58.000Z'),
};

const serviceLastModified: Record<ServiceSlug, Date> = {
  'ai-automation': new Date('2026-04-14T05:55:40.000Z'),
  'web-dev': new Date('2026-04-16T05:54:06.000Z'),
  'realtime-games': new Date('2026-04-15T05:56:00.000Z'),
};

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, '');

  const entries: Array<{path: string; lastModified: Date}> = [];

  for (const locale of routing.locales) {
    entries.push({
      path: `/${locale}`,
      lastModified: staticRouteLastModified.home,
    });
    entries.push({
      path: `/${locale}/services`,
      lastModified: staticRouteLastModified.services,
    });
    entries.push({
      path: `/${locale}/contact`,
      lastModified: staticRouteLastModified.contact,
    });
    for (const slug of SERVICE_SLUGS) {
      entries.push({
        path: `/${locale}/services/${slug}`,
        lastModified: serviceLastModified[slug],
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
