import type {MDXComponents} from 'mdx/types';
import {CTA} from '@/components/mdx/CTA';
import {Callout} from '@/components/mdx/Callout';
import {DeliveryBlueprint} from '@/components/mdx/DeliveryBlueprint';
import {GridList, GridListItem} from '@/components/studio/GridList';
import {List, ListItem} from '@/components/studio/List';
import {PageIntro} from '@/components/studio/PageIntro';
import {PrototypeSignals} from '@/components/mdx/PrototypeSignals';
import {SectionIntro} from '@/components/studio/SectionIntro';
import {ServiceFaq} from '@/components/mdx/ServiceFaq';
import {StatList, StatListItem} from '@/components/studio/StatList';
import {TagList, TagListItem} from '@/components/studio/TagList';
import {ShowcasePanel} from '@/components/ui/ShowcasePanel';
import {WorkflowSnapshot} from '@/components/mdx/WorkflowSnapshot';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    // Custom components available in MDX without imports
    CTA,
    Callout,
    DeliveryBlueprint,
    PageIntro,
    PrototypeSignals,
    SectionIntro,
    ServiceFaq,
    GridList,
    GridListItem,
    List,
    ListItem,
    StatList,
    StatListItem,
    Stats: StatList,
    StatsItem: StatListItem,
    TagList,
    TagListItem,
    ShowcasePanel,
    WorkflowSnapshot,

    // Optional: tighten default rendering
    h1: (props) => (
      <h1
        className="scroll-m-20 text-4xl font-semibold tracking-tight"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight"
        {...props}
      />
    ),
    a: (props) => (
      <a
        className="text-link underline underline-offset-4 decoration-link/30 transition-colors hover:decoration-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        {...props}
      />
    )
  };
}
