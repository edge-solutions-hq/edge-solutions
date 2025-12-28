import {getTranslations} from 'next-intl/server';
import {site} from '@/lib/site';

type SocialLink = {label: string; href: string};

export async function Footer() {
  const t = await getTranslations();

  const links: SocialLink[] = [
    {label: 'LinkedIn', href: site.social.linkedin},
    {label: 'ArtStation', href: site.social.artstation},
    ...(site.social.github ? ([{label: 'GitHub', href: site.social.github}] as const) : [])
  ];

  return (
    <footer className="border-t border-black/10 py-10 dark:border-white/10">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
        <div className="space-y-2">
          <div className="text-sm font-semibold">
            {site.personalBrand} · {site.companyName}
          </div>
          <div className="text-sm text-black/60 dark:text-white/60">
            <a className="underline underline-offset-4" href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">{t('footer.links')}</div>
          <ul className="space-y-1 text-sm text-black/70 dark:text-white/70">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          {!site.social.github ? (
            <div className="text-xs text-black/50 dark:text-white/50">
              GitHub : à renseigner
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">edge-solutions.be</div>
          <div className="text-sm text-black/60 dark:text-white/60">
            {t('footer.copyright', {year: new Date().getFullYear()})}
          </div>
        </div>
      </div>
    </footer>
  );
}


