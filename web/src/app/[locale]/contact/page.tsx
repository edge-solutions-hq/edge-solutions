import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ContactForm} from './ContactForm';
import {Card} from '@/components/ui/Card';
import {getContactPageProfile} from '@/lib/page-profiles';
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
        <h1 className="text-3xl font-semibold tracking-tight">
          {t('contact.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('contact.intro')}</p>
      </div>

      <Card className="p-6">
        <ContactForm />
      </Card>
    </div>
  );
}
