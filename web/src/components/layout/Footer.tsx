import {getTranslations} from 'next-intl/server';
import {site} from '@/lib/site';

type SocialLink = {label: string; href: string};

export async function Footer() {
  const t = await getTranslations();

  const links: SocialLink[] = [
    {label: 'LinkedIn', href: site.social.linkedin},
    {label: 'GitHub', href: site.social.github},
    {label: 'ArtStation', href: site.social.artstation}
  ];

  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-foreground">
            {site.personalBrand} · {site.companyName}
          </div>
          <div className="text-sm text-muted-foreground">
            <a
              className="text-link underline underline-offset-4 decoration-link/30 transition-colors hover:decoration-link motion-reduce:transition-none"
              href={`mailto:${site.contactEmail}`}
            >
              {site.contactEmail}
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-foreground">
            {t('footer.links')}
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link underline underline-offset-4 decoration-link/30 transition-colors hover:decoration-link motion-reduce:transition-none"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          {!site.social.github ? (
            <div className="text-xs text-subtle-foreground">
              GitHub : à renseigner
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-foreground">
            edge-solutions.be
          </div>
          <div className="text-sm text-muted-foreground">
            {t('footer.copyright', {year: new Date().getFullYear()})}
          </div>
        </div>
      </div>
    </footer>
  );
}


