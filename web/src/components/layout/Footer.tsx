import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {site} from '@/lib/site';
import {AnalyticsSettingsButton} from '@/components/analytics/AnalyticsConsentProvider';

type SocialLink = {label: string; href: string};

const footerLinkClass =
  'text-secondary-foreground underline underline-offset-4 decoration-primary/60 transition-colors hover:decoration-secondary-foreground motion-reduce:transition-none';

export async function Footer() {
  const t = await getTranslations();

  const links: SocialLink[] = [
    {label: 'LinkedIn', href: site.social.linkedin},
    {label: 'GitHub', href: site.social.github},
    {label: 'ArtStation', href: site.social.artstation}
  ];

  return (
    <footer className="mt-16 border-t border-primary bg-secondary text-secondary-foreground">
      <div className="overflow-hidden border-b border-primary/65 py-3">
        <div
          className="whitespace-nowrap font-display text-5xl font-extrabold uppercase leading-none tracking-normal text-primary sm:text-6xl"
          aria-hidden="true"
        >
          Edge Solutions · Edge Solutions · Edge Solutions · Edge Solutions ·
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-secondary-foreground">
            {site.personalBrand} · {site.companyName}
          </div>
          <div className="text-sm text-secondary-foreground/75">
            <a
              className={footerLinkClass}
              href={`mailto:${site.contactEmail}`}
            >
              {site.contactEmail}
            </a>
          </div>
          <div className="text-sm text-secondary-foreground/75">
            {site.vatNumber}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-secondary-foreground">
            {t('footer.links')}
          </div>
          <ul className="space-y-1 text-sm text-secondary-foreground/75">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className={footerLinkClass}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/privacy-policy" className={footerLinkClass}>
                {t('footer.privacyPolicy')}
              </Link>
            </li>
            <li>
              <AnalyticsSettingsButton className={footerLinkClass} />
            </li>
          </ul>
          {!site.social.github ? (
            <div className="text-xs text-secondary-foreground/65">
              GitHub : à renseigner
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-secondary-foreground">
            edge-solutions.be
          </div>
          <div className="text-sm text-secondary-foreground/75">
            {t('footer.copyright', {year: new Date().getFullYear()})}
          </div>
        </div>
      </div>
    </footer>
  );
}

