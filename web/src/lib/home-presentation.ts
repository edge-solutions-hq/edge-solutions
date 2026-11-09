import type {ContactCtaPlacement} from '@/lib/analytics/taxonomy';
import {getAssetAuthorityRecord, type AssetAuthorityRecord} from './content/asset-authority';
import {site} from './site';

type Translate = (key: string) => string;

export type HomePublicProject = {
  eyebrow: string;
  title: string;
  description: string;
  supportText?: string;
  imageSrc: string;
  imageAlt: string;
  assetAuthority: AssetAuthorityRecord;
  href: string;
  ctaLabel: string;
};

export type HomeProcessCard = {
  kicker: string;
  title: string;
  body: string;
  detail: string;
};

export type HomeCtaIntent = {
  href: string;
  trackingPlacement: ContactCtaPlacement;
};

export type HomePresentationModel = {
  publicProject: HomePublicProject;
  processCards: HomeProcessCard[];
  ctas: {
    heroPrimary: HomeCtaIntent;
    bottomPrimary: HomeCtaIntent;
  };
};

export function getHomePresentationModel(translate: Translate): HomePresentationModel {
  return {
    publicProject: {
      eyebrow: translate('home.showcase.eyebrow'),
      title: translate('home.showcase.publicProject.title'),
      description: translate('home.showcase.publicProject.description'),
      imageSrc: '/images/work/rusty-art-showcase.jpg',
      imageAlt: translate('home.showcase.publicProject.title'),
      assetAuthority: getAssetAuthorityRecord('rusty-art-showcase')!,
      href: site.rustyArtUrl,
      ctaLabel: translate('home.showcase.publicProject.cta'),
    },
    processCards: [
      {
        kicker: translate('home.process.discovery.kicker'),
        title: translate('home.process.discovery.title'),
        body: translate('home.process.discovery.body'),
        detail: translate('home.process.discovery.points.plan'),
      },
      {
        kicker: translate('home.process.build.kicker'),
        title: translate('home.process.build.title'),
        body: translate('home.process.build.body'),
        detail: translate('home.process.build.stackItems.delivery'),
      },
      {
        kicker: translate('home.process.launch.kicker'),
        title: translate('home.process.launch.title'),
        body: translate('home.process.launch.body'),
        detail: translate('home.process.launch.items.measure.body'),
      },
    ],
    ctas: {
      heroPrimary: {
        href: '/contact',
        trackingPlacement: 'home_hero_primary',
      },
      bottomPrimary: {
        href: '/contact',
        trackingPlacement: 'home_bottom_primary',
      },
    },
  };
}
