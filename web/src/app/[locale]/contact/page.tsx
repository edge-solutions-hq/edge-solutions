import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ContactForm} from './ContactForm';
import {Card} from '@/components/ui/Card';
import {buildLocaleAlternates} from '@/lib/seo';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;

  const titleByLocale: Record<string, string> = {
    fr: 'Contact — projet IA, web ou 3D/VR en Wallonie',
    en: 'Contact — AI, web or 3D/VR project in Belgium',
    nl: 'Contact — AI-, web- of 3D/VR-project in België',
  };

  const descriptionByLocale: Record<string, string> = {
    fr: 'Décrivez votre projet (IA, automatisation, web, SEO, 3D/VR) et recevez un retour rapide avec périmètre, délai et prochaines étapes.',
    en: 'Share your project scope (AI, automation, web, SEO, 3D/VR) and get a fast reply with timeline, scope and next steps.',
    nl: 'Beschrijf je project (AI, automatisatie, web, SEO, 3D/VR) en ontvang snel feedback met scope, timing en volgende stappen.',
  };

  return {
    title: titleByLocale[locale] || titleByLocale.en,
    description: descriptionByLocale[locale] || descriptionByLocale.en,
    alternates: buildLocaleAlternates(locale, '/contact'),
  };
}

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

