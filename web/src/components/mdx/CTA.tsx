import {Link} from '@/i18n/navigation';

export function CTA({
  title,
  href,
  children
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="not-prose mt-8 rounded-2xl border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-2 text-sm opacity-80">{children}</div>
      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black/[0.03] dark:border-white/10 dark:bg-black dark:text-white dark:hover:bg-white/[0.06]"
        >
          Me contacter
        </Link>
      </div>
    </div>
  );
}


