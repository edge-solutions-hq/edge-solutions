import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ContactForm} from './ContactForm';

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
        <p className="text-sm text-black/70 dark:text-white/70">
          {t('contact.intro')}
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.04]">
        <ContactForm />
      </div>
    </div>
  );
}


