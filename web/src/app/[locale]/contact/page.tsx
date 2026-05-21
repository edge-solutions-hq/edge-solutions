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
        <div className="rounded-lg border-2 border-border bg-surface p-5 shadow-[6px_6px_0_var(--primary)]">
          <p className="text-xs font-semibold text-primary">{t('contact.fitLabel')}</p>
          <p className="mt-2 text-sm leading-6 text-foreground">{t('contact.fitText')}</p>
        </div>
      </div>

      <Card className="border-2 border-border p-6 shadow-[8px_8px_0_var(--primary)]">
        <ContactForm />
      </Card>
    </div>
  );
}
