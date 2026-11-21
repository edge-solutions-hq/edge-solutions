import Image from 'next/image';
import {cn} from '@/lib/cn';
import {ExternalLinkButton} from '@/components/ui/ExternalLinkButton';
import {surfaceClass} from '@/components/ui/Surface';

type ProjectGalleryItem = {
  title: string;
  category?: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
};

type ProjectGalleryLink = {
  label: string;
  description: string;
  href: string;
};

export function ProjectGallery({
  items,
  links,
  linksTitle,
  className,
}: {
  items: ProjectGalleryItem[];
  links?: ProjectGalleryLink[];
  linksTitle?: string;
  className?: string;
}) {
  return (
    <section className={cn('not-prose', className)}>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className={surfaceClass(
              'interactive-card',
              'group flex flex-col overflow-hidden no-underline'
            )}
          >
            <div className="relative aspect-video overflow-hidden border-b border-border bg-surface-muted">
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                fill
                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </div>
            <div className="flex-1 p-4">
              {item.category ? (
                <div className="mb-2 font-mono text-xs text-syn-cyan">
                  {item.category}
                </div>
              ) : null}
              <div className="font-mono text-sm font-bold text-heading">
                {item.title}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </a>
        ))}
      </div>

      {links && links.length > 0 ? (
        <div className="mt-8 border-t border-border/70 pt-6">
          {linksTitle ? (
            <div className="font-mono text-sm font-bold text-heading">
              {linksTitle}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-3">
            {links.map((link) => (
              <ExternalLinkButton
                key={link.href}
                href={link.href}
                aria-label={`${link.label}: ${link.description}`}
              >
                {link.label}
              </ExternalLinkButton>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
