import type { Metadata, Viewport } from 'next';
import { Public_Sans, Roboto_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import LocaleSync from '@/components/layout/LocaleSync';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorProvider } from '@/contexts/ErrorContext';

export const metadata: Metadata = {
  title: 'RICER Ifrane - نظام الإبلاغ عن الحرائق',
  description: 'نظام إدارة الحرائق والإبلاغ عنها في إفران، المغرب',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const fontSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const storedLanguage = cookieStore.get('ricer-language')?.value;
  const language = storedLanguage === 'fr' ? 'fr' : storedLanguage === 'en' ? 'en' : 'ar';
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={language} dir={dir} suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable}`}>
        <ErrorBoundary>
          <ErrorProvider>
            <LocaleSync />
            {children}
          </ErrorProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
