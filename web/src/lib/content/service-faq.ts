import type {Locale} from '../../i18n/routing';
import type {OfferTrackSlug} from '../offer-tracks';

export type ServiceFaqItem = {
  question: string;
  answer: string;
};

type ServiceFaqMap = Record<Locale, Record<OfferTrackSlug, readonly ServiceFaqItem[]>>;

export const SERVICE_FAQS: ServiceFaqMap = {
  fr: {
    'ai-automation': [
      {
        question: 'Faut-il déjà avoir un cas d’usage très précis ?',
        answer:
          'Non. Je peux commencer par auditer le travail réel, repérer les tâches répétitives et transformer une intuition en automatisation priorisée et testable.',
      },
      {
        question: 'Faut-il déjà avoir des données propres ?',
        answer:
          'Pas forcément. On peut commencer petit, regarder ce qui existe, puis remettre au propre seulement les sources qui comptent vraiment pour le premier cycle.',
      },
      {
        question: 'Vous fournissez seulement des prompts ?',
        answer:
          'Non. Je peux cadrer, développer une première version, intégrer, documenter et fiabiliser le processus, avec une vraie logique de supervision et de responsabilité.',
      },
      {
        question: 'Et si le verdict est “stop” ?',
        answer:
          'C’est aussi un bon résultat. Le but est d’éviter qu’un sujet fragile absorbe du budget ou de l’énergie sans produire de valeur exploitable.',
      },
    ],
    'realtime-games': [
      {
        question: 'Vous pouvez partir d’un concept flou ?',
        answer:
          'Oui. Je peux aider à clarifier le besoin, la plateforme et les risques pour proposer une approche réaliste.',
      },
      {
        question: 'Quest, PCVR, ou les deux ?',
        answer:
          'On choisit selon l’usage, le niveau de rendu attendu, le budget et les contraintes de diffusion. Le plus important est d’éviter les promesses qui ne tiennent pas sur le matériel cible.',
      },
      {
        question: 'Et la performance ?',
        answer:
          'Elle fait partie du cadrage dès le début: budgets, profiling, optimisation et validation sur le vrai support.',
      },
      {
        question: 'Comment estimez-vous budget et délais ?',
        answer:
          'Après un cadrage court, je propose une estimation par options, premier build vs. production, avec jalons clairs et risques identifiés.',
      },
    ],
  },
  en: {
    'ai-automation': [
      {
        question: 'Do we need a very precise use case already?',
        answer: 'No. I can start by auditing the real work, spotting repeated tasks and turning an intuition into prioritized, testable automation.',
      },
      {
        question: 'Do our data sources already need to be clean?',
        answer:
          'Not necessarily. We can start small, audit what exists and clean only the sources that matter for the first useful cycle.',
      },
      {
        question: 'Do you only provide prompts?',
        answer:
          'No. I can scope, build a first version, integrate, document and harden the process with real supervision and accountability around it.',
      },
      {
        question: 'What if the verdict is “stop”?',
        answer:
          'That is still a good result. The point is to stop fragile work from consuming more budget and attention than it should.',
      },
    ],
    'realtime-games': [
      {
        question: 'Can you start from a fuzzy concept?',
        answer:
          'Yes. I can help clarify the need, the platform and the main risks so the approach stays realistic.',
      },
      {
        question: 'Quest, PCVR, or both?',
        answer:
          'We choose based on the use case, visual ambition, budget and distribution constraints. The key is to avoid promises that the target hardware cannot support.',
      },
      {
        question: 'What about performance?',
        answer:
          'It is built into the work from the start: budgets, profiling, optimization and validation on the real target device.',
      },
      {
        question: 'How do you estimate budget and timing?',
        answer:
          'After a short framing step, I propose options, first build vs production, with clear milestones and identified risks.',
      },
    ],
  },
  nl: {
    'ai-automation': [
      {
        question: 'Moeten we al een heel precieze use case hebben?',
        answer:
          'Nee. Ik kan starten met het echte werk te auditen, repetitieve taken te vinden en een intuïtie om te zetten in geprioriteerde, testbare automatisatie.',
      },
      {
        question: 'Moeten onze bronnen al proper zijn?',
        answer:
          'Niet noodzakelijk. We kunnen klein starten, bekijken wat er is en alleen de bronnen opschonen die voor de eerste nuttige cyclus echt tellen.',
      },
      {
        question: 'Lever je alleen prompts?',
        answer:
          'Nee. Ik kan het proces afbakenen, een eerste versie bouwen, integreren, documenteren en verstevigen met echte supervisie en duidelijke verantwoordelijkheid.',
      },
      {
        question: 'Wat als het verdict “stop” is?',
        answer:
          'Dat is nog altijd een goed resultaat. Het doel is net te vermijden dat een fragiel onderwerp meer budget en aandacht opslorpt dan het waard is.',
      },
    ],
    'realtime-games': [
      {
        question: 'Kan je starten van een vaag concept?',
        answer:
          'Ja. Ik kan helpen om behoefte, platform en grootste risico’s te verduidelijken zodat de aanpak realistisch blijft.',
      },
      {
        question: 'Quest, PCVR of allebei?',
        answer:
          'We kiezen op basis van use case, visuele ambitie, budget en distributieconstraints. De sleutel is vermijden dat je beloftes maakt die de doelhardware niet kan dragen.',
      },
      {
        question: 'Wat met performance?',
        answer:
          'Die zit vanaf het begin in het werk: budgetten, profiling, optimalisatie en validatie op het echte doeltoestel.',
      },
      {
        question: 'Hoe schat je budget en timing in?',
        answer:
          'Na een korte framing stap stel ik opties voor, eerste build versus productie, met duidelijke mijlpalen en geïdentificeerde risico’s.',
      },
    ],
  },
};

export function getServiceFaqItems(locale: Locale, slug: OfferTrackSlug): readonly ServiceFaqItem[] {
  return SERVICE_FAQS[locale][slug];
}
