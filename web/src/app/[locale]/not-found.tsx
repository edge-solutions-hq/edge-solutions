import {getTranslations} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/Button';

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight text-technical-blue">
        {t('notFound.title')}
      </h1>
      <p className="text-sm text-muted-foreground">{t('notFound.description')}</p>
      <div>
        <ButtonLink href="/" size="lg">
          {t('notFound.cta')}
        </ButtonLink>
      </div>
    </div>
  );
}


