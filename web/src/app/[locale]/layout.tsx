import type {Metadata} from 'next';
import {Suspense} from 'react';
import {Fira_Code, Inter} from 'next/font/google';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {Analytics} from '@vercel/analytics/react';
import {SpeedInsights} from '@vercel/speed-insights/next';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import '@/styles/globals.css';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import {GoogleAnalytics} from '@/components/analytics/GoogleAnalytics';
import {GoogleTagManager} from '@/components/analytics/GoogleTagManager';
import {site} from '@/lib/site';
import {buildLocalizedPageMetadata, organizationSchema} from '@/lib/seo';
import {JsonLd} from '@/components/seo/JsonLd';
import {getAnalyticsRuntimeConfig} from '@/lib/runtime-config';

const inter = Inter({variable: '--font-inter', subsets: ['latin']});

const firaCode = Fira_Code({variable: '--font-fira-code', subsets: ['latin']});

const analyticsConfig = getAnalyticsRuntimeConfig();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;

  const descriptionByLocale: Record<string, string> = {
    fr: 'Systèmes IA, automatisation, développement web et technologies temps réel en Belgique. Workflows utiles, sites performants et expériences 3D/VR.',
    en: 'AI systems, automation, web development and real-time technology in Belgium. Useful workflows, high-performance websites and 3D/VR experiences.',
    nl: 'AI-systemen, automatisatie, webontwikkeling en realtime technologie in België. Nuttige workflows, performante websites en 3D/VR-ervaringen.',
  };

  return {
    metadataBase: new URL(site.url),
    ...buildLocalizedPageMetadata({
      locale,
      title: `${site.personalBrand} · ${site.companyName}`,
      description: descriptionByLocale[locale] || descriptionByLocale.en,
    }),
    title: {
      default: `${site.personalBrand} · ${site.companyName}`,
      template: `%s · ${site.companyName}`,
    },
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
      <body className={`${inter.variable} ${firaCode.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          <main className="mx-auto max-w-6xl px-6 py-12 md:py-14">{children}</main>
          <Footer />
        </NextIntlClientProvider>
        <JsonLd data={organizationSchema} />
        {analyticsConfig.gtmId ? <GoogleTagManager containerId={analyticsConfig.gtmId} /> : null}
        {analyticsConfig.gaMeasurementId ? (
          <Suspense fallback={null}>
            <GoogleAnalytics measurementId={analyticsConfig.gaMeasurementId} />
          </Suspense>
        ) : null}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
