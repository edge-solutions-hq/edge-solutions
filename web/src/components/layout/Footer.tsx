import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {site} from '@/lib/site/site';
import {AnalyticsSettingsButton} from '@/components/analytics/AnalyticsConsentProvider';
import {LogoMark} from '@/components/ui/LogoMark';

type SocialLink = {label: string; href: string};

const footerLinkClass =
  'inline-block cursor-pointer py-0.5 text-secondary-foreground underline underline-offset-4 decoration-primary/70 transition-colors hover:text-accent hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none';

const footerHeadingClass = 'font-mono text-xs text-syn-green';

export async function Footer() {
  const t = await getTranslations();

  const links: SocialLink[] = [
    {label: 'LinkedIn', href: site.social.linkedin},
    {label: 'GitHub', href: site.social.github},
    {label: 'ArtStation', href: site.social.artstation}
  ];

  return (
    <footer className="mt-20 border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 font-mono text-2xl font-extrabold tracking-tight text-heading">
            <LogoMark className="size-7 shrink-0 text-primary" />
            {site.companyName}
          </div>
          <div className="text-sm text-muted-foreground">{site.personalBrand}</div>
          <div className="text-sm">
            <a className={footerLinkClass} href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <div className={footerHeadingClass}>
            <span aria-hidden="true">{'// '}</span>
            {t('footer.links')}
          </div>
          <ul className="space-y-2 text-sm">
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
          </ul>
        </div>

        <div className="space-y-3">
          <div className={footerHeadingClass}>
            <span aria-hidden="true">{'// '}</span>
            edge-solutions.be
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/privacy-policy" className={footerLinkClass}>
                {t('footer.privacyPolicy')}
              </Link>
            </li>
            <li>
              <AnalyticsSettingsButton className={footerLinkClass} />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border bg-background/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 font-mono text-xs text-muted-foreground sm:px-6">
          <span className="rounded-sm bg-primary px-2 py-0.5 font-bold text-primary-foreground">
            {site.companyName}
          </span>
          <span>{t('footer.copyright', {year: new Date().getFullYear()})}</span>
          <span className="sm:ml-auto">{site.vatNumber}</span>
        </div>
      </div>
    </footer>
  );
}

