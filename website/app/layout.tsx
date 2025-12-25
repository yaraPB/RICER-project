import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RICER - Fire Management System',
  description: 'Fire incident reporting and management system for Morocco',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
