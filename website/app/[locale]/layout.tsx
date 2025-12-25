import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import 'leaflet/dist/leaflet.css';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;  // Changed to Promise!
}) {
  // Await params in Next.js 15
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <title>RICER - Fire Management System</title>
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}