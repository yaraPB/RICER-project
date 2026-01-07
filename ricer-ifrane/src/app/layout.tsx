import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RICER Ifrane - نظام الإبلاغ عن الحرائق',
  description: 'نظام إدارة الحرائق والإبلاغ عنها في إفران، المغرب',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
