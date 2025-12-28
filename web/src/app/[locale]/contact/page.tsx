import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ContactForm} from './ContactForm';
import {Card} from '@/components/ui/Card';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function ContactPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <div className="grid gap-10 md:grid-cols-2">
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


