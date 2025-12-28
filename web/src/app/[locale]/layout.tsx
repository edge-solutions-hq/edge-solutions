import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {Analytics} from '@vercel/analytics/react';
import {SpeedInsights} from '@vercel/speed-insights/next';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import '@/styles/globals.css';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import {site} from '@/lib/site';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;

  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.personalBrand} · ${site.companyName}`,
      template: `%s · ${site.companyName}`
    },
    description:
      locale === 'fr'
        ? 'Développement web & technologies temps réel. Sites/applications performants, expériences 3D/VR.'
        : 'Web development & real-time technologies. High-performance sites/apps, 3D/VR experiences.',
    alternates: {
      canonical: `/${locale}`
    }
  };
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  // Enable static rendering with next-intl
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
          <Footer />
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}


