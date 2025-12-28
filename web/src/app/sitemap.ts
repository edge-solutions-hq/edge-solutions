import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {SERVICE_SLUGS} from '@/lib/content/services';
import {site} from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, '');
  const now = new Date();

  const urls: string[] = [];

  for (const locale of routing.locales) {
    urls.push(`/${locale}`);
    urls.push(`/${locale}/services`);
    urls.push(`/${locale}/contact`);
    for (const slug of SERVICE_SLUGS) {
      urls.push(`/${locale}/services/${slug}`);
    }
  }

  return urls.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: path.endsWith('/contact') ? 0.6 : 0.7
  }));
}


