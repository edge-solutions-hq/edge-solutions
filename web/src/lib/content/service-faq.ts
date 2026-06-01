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
        question: 'Faut-il deja avoir un cas d’usage tres precise ?',
        answer:
          'Non. Je peux justement aider a transformer une intuition ou un besoin diffus en cas d’usage priorise et testable.',
      },
      {
        question: 'Faut-il deja avoir des donnees propres ?',
        answer:
          'Pas forcement. On peut commencer petit, auditer ce qui existe, puis remettre au propre seulement les sources qui comptent vraiment pour le premier cycle.',
      },
      {
        question: 'Vous fournissez seulement des prompts ?',
        answer:
          'Non. Je peux cadrer, prototyper, integrer, documenter et fiabiliser le flux, avec une vraie logique de supervision et de responsabilite.',
      },
      {
        question: 'Et si le verdict est “stop” ?',
        answer:
          'C’est aussi un bon resultat. Le but est d’eviter qu’un sujet fragile absorbe du budget ou de l’energie sans produire de valeur exploitable.',
      },
    ],
    'realtime-games': [
      {
        question: 'Vous pouvez partir d’un concept flou ?',
        answer:
          'Oui. Je peux aider à clarifier le besoin, la plateforme et les risques pour proposer un plan de prototype réaliste.',
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
          'Après un cadrage court, je propose une estimation par options, prototype vs. production, avec jalons clairs et risques identifiés.',
      },
    ],
  },
  en: {
    'ai-automation': [
      {
        question: 'Do we need a very precise use case already?',
        answer: 'No. I can help turn an intuition or messy need into a prioritized and testable use case.',
      },
      {
        question: 'Do our data sources already need to be clean?',
        answer:
          'Not necessarily. We can start small, audit what exists and clean only the sources that matter for the first useful cycle.',
      },
      {
        question: 'Do you only provide prompts?',
        answer:
          'No. I can scope, prototype, integrate, document and harden the workflow with real supervision and accountability around it.',
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
          'Yes. I can help clarify the need, the platform and the main risks so the prototype plan stays realistic.',
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
          'After a short framing step, I propose options, prototype vs production, with clear milestones and identified risks.',
      },
    ],
  },
  nl: {
    'ai-automation': [
      {
        question: 'Moeten we al een heel precieze use case hebben?',
        answer:
          'Nee. Ik kan helpen om een intuïtie of diffuus probleem om te zetten in een geprioriteerde en testbare use case.',
      },
      {
        question: 'Moeten onze bronnen al proper zijn?',
        answer:
          'Niet noodzakelijk. We kunnen klein starten, bekijken wat er is en alleen de bronnen opschonen die voor de eerste nuttige cyclus echt tellen.',
      },
      {
        question: 'Lever je alleen prompts?',
        answer:
          'Nee. Ik kan de workflow afbakenen, prototypen, integreren, documenteren en hardenen met echte supervisie en duidelijke verantwoordelijkheid.',
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
          'Ja. Ik kan helpen om behoefte, platform en grootste risico’s te verduidelijken zodat het prototypeplan realistisch blijft.',
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
          'Na een korte framing stap stel ik opties voor, prototype versus productie, met duidelijke mijlpalen en geïdentificeerde risico’s.',
      },
    ],
  },
};

export function getServiceFaqItems(locale: Locale, slug: OfferTrackSlug): readonly ServiceFaqItem[] {
  return SERVICE_FAQS[locale][slug];
}
