import type {ContactCtaPlacement} from '@/lib/analytics/taxonomy';

type Translate = (key: string) => string;

export type HomeProofCard = {
  title: string;
  description: string;
};

export type HomeProofSignal = {
  label: string;
  value: string;
  description: string;
};

export type HomePublicProof = {
  eyebrow: string;
  title: string;
  description: string;
  supportText: string;
  imageSrc: string;
  imageAlt: string;
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
  proofCards: HomeProofCard[];
  proofSignals: HomeProofSignal[];
  publicProof: HomePublicProof;
  processCards: HomeProcessCard[];
  ctas: {
    heroPrimary: HomeCtaIntent;
    processPrimary: HomeCtaIntent;
    bottomPrimary: HomeCtaIntent;
  };
  proofCta: {
    href: string;
  };
};

export function getHomePresentationModel(translate: Translate): HomePresentationModel {
  return {
    proofCards: [
      {
        title: translate('home.proof.items.method.title'),
        description: translate('home.proof.items.method.description'),
      },
      {
        title: translate('home.proof.items.execution.title'),
        description: translate('home.proof.items.execution.description'),
      },
      {
        title: translate('home.proof.items.trust.title'),
        description: translate('home.proof.items.trust.body'),
      },
    ],
    proofSignals: [
      {
        label: translate('home.proof.signals.publicWork.label'),
        value: translate('home.proof.signals.publicWork.value'),
        description: translate('home.proof.signals.publicWork.description'),
      },
      {
        label: translate('home.proof.signals.tools.label'),
        value: translate('home.proof.signals.tools.value'),
        description: translate('home.proof.signals.tools.description'),
      },
      {
        label: translate('home.proof.signals.process.label'),
        value: translate('home.proof.signals.process.value'),
        description: translate('home.proof.signals.process.description'),
      },
    ],
    publicProof: {
      eyebrow: translate('home.proof.publicProject.title'),
      title: translate('home.proof.items.openclaw.title'),
      description: translate('home.proof.items.openclaw.description'),
      supportText: translate('home.proof.publicProject.description'),
      imageSrc: '/images/proof/edge-proof-board.svg',
      imageAlt: translate('home.proof.items.openclaw.title'),
      href: 'https://rusty-art.edge-solutions.be/',
      ctaLabel: translate('home.proof.publicProject.cta'),
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
      processPrimary: {
        href: '/contact',
        trackingPlacement: 'home_process_primary',
      },
      bottomPrimary: {
        href: '/contact',
        trackingPlacement: 'home_bottom_primary',
      },
    },
    proofCta: {
      href: '/services/ai-automation',
    },
  };
}
