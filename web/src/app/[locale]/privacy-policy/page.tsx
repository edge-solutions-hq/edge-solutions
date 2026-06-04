import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {JsonLd} from '@/components/seo/JsonLd';
import {getPrivacyPolicyPageProfile} from '@/lib/page-profiles';
import {site} from '@/lib/site';

type Props = {
  params: Promise<{locale: string}>;
};

const privacySectionKeys = [
  'whoWeAre',
  'whatDataWeCollect',
  'cookiesAndGoogleTags',
  'whyWeUseData',
  'dataSharing',
  'dataRetention',
  'yourGdprRights',
  'contact',
  'lastUpdated',
] as const;

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  return getPrivacyPolicyPageProfile(locale).metadata;
}

export default async function PrivacyPolicyPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const profile = getPrivacyPolicyPageProfile(locale);
  const sections = privacySectionKeys.map((key) => ({
    key,
    title: t(`privacy.sections.${key}.title`),
    body: t.raw(`privacy.sections.${key}.body`) as string[],
  }));

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <JsonLd data={profile.jsonLd} />

      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-normal text-subtle-foreground">
          {site.companyName}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-technical-blue">
          {t('privacy.title')}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {t('privacy.intro')}
        </p>
      </header>

      <div className="space-y-7">
        {sections.map((section) => (
          <section key={section.key} aria-labelledby={`privacy-${section.key}`}>
            <h2
              id={`privacy-${section.key}`}
              className="text-lg font-semibold tracking-tight text-technical-blue"
            >
              {section.title}
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.key === 'contact' ? (
                <p>
                  <a
                    href={`mailto:${site.contactEmail}`}
                    className="text-link underline underline-offset-4 decoration-primary/60 transition-colors hover:decoration-link motion-reduce:transition-none"
                  >
                    {site.contactEmail}
                  </a>
                </p>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
