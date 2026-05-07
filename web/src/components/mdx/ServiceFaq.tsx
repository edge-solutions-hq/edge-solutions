import type {Locale} from '@/i18n/routing';
import type {OfferTrackSlug} from '@/lib/offer-tracks';
import {getServiceFaqItems} from '@/lib/content/service-faq';
import {List, ListItem} from '@/components/studio/List';

type ServiceFaqProps = {
  locale: Locale;
  slug: OfferTrackSlug;
  className?: string;
};

export function ServiceFaq({locale, slug, className = 'mt-10'}: ServiceFaqProps) {
  return (
    <List className={className}>
      {getServiceFaqItems(locale, slug).map((item) => (
        <ListItem key={item.question} title={item.question}>
          {item.answer}
        </ListItem>
      ))}
    </List>
  );
}
