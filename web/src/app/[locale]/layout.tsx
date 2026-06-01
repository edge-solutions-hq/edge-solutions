import type {Metadata} from 'next';
import {Suspense} from 'react';
import {Archivo_Narrow, Fira_Code, Inter} from 'next/font/google';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {Analytics} from '@vercel/analytics/react';
import {SpeedInsights} from '@vercel/speed-insights/next';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import '@/styles/globals.css';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import {ContactModalProvider} from './contact/ContactModalProvider';
import {GoogleAnalytics} from '@/components/analytics/GoogleAnalytics';
import {GoogleTagManager} from '@/components/analytics/GoogleTagManager';
import {JsonLd} from '@/components/seo/JsonLd';
import {getAnalyticsRuntimeConfig} from '@/lib/runtime-config';
import {getRootLayoutProfile} from '@/lib/site-profile';

const inter = Inter({variable: '--font-inter', subsets: ['latin']});

const archivoNarrow = Archivo_Narrow({
  variable: '--font-archivo-narrow',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

const firaCode = Fira_Code({
  variable: '--font-fira-code',
  subsets: ['latin'],
  preload: false,
});

const analyticsConfig = getAnalyticsRuntimeConfig();
const shouldLoadDirectGoogleAnalytics = Boolean(
  analyticsConfig.gaMeasurementId && !analyticsConfig.gtmId
);

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  return getRootLayoutProfile(locale).metadata;
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  // Enable static rendering with next-intl
  setRequestLocale(locale);

  const messages = await getMessages();
  const profile = getRootLayoutProfile(locale);

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${archivoNarrow.variable} ${firaCode.variable} flex min-h-dvh flex-col antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ContactModalProvider>
            <Header locale={locale} />
            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-14">{children}</main>
            <Footer />
          </ContactModalProvider>
        </NextIntlClientProvider>
        <JsonLd data={profile.jsonLd} />
        {analyticsConfig.gtmId ? <GoogleTagManager containerId={analyticsConfig.gtmId} /> : null}
        {shouldLoadDirectGoogleAnalytics ? (
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
