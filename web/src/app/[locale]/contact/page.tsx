import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ContactForm} from './ContactForm';
import {Card} from '@/components/ui/Card';
import {Surface} from '@/components/ui/Surface';
import {PromptLine, WindowChrome} from '@/components/ui/WindowChrome';
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
    <div className="grid gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start">
      <JsonLd data={profile.jsonLd} />
      <div className="space-y-6">
        <PromptLine command="./contact.sh" typed caret />
        <h1 className="text-balance font-display text-3xl leading-[1.12] font-extrabold tracking-tight text-heading sm:text-4xl">
          {t('contact.title')}
        </h1>
        <Surface variant="panel" className="border-l-2 border-l-primary p-5">
          <p className="font-mono text-xs text-syn-green">
            <span aria-hidden="true">{'// '}</span>
            {t('contact.fitLabel')}
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground">{t('contact.fitText')}</p>
        </Surface>
      </div>

      <Card variant="feature" className="overflow-hidden">
        <WindowChrome title="contact" />
        <div className="p-5 sm:p-6">
          <ContactForm />
        </div>
      </Card>
    </div>
  );
}
