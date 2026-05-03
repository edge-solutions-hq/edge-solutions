import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {getLocalizedSitemapEntries} from '@/lib/page-profiles';

export default function sitemap(): MetadataRoute.Sitemap {
  return getLocalizedSitemapEntries(routing.locales);
}
