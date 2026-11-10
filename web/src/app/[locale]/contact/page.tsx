import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ContactForm} from './ContactForm';
import {Card} from '@/components/ui/Card';
import {Surface} from '@/components/ui/Surface';
import {getContactPageProfile} from '@/lib/site/page-profiles';
import {JsonLd} from '@/components/seo/JsonLd';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  return getContactPageProfile(locale).metadata;
}

export default async function ContactPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const profile = getContactPageProfile(locale);

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <JsonLd data={profile.jsonLd} />
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-technical-blue">
          {t('contact.title')}
        </h1>
        <Surface variant="panel" className="p-5">
          <p className="text-xs font-semibold text-subtle-foreground">{t('contact.fitLabel')}</p>
          <p className="mt-2 text-sm leading-6 text-foreground">{t('contact.fitText')}</p>
        </Surface>
      </div>

      <Card variant="panel" className="p-6">
        <ContactForm />
      </Card>
    </div>
  );
}
