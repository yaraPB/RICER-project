'use client';

import NavBar from '@/src/components/NavBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: 'aliceblue', minHeight: '100vh' }}>
      <NavBar />
      {children}
    </div>
  );
}
