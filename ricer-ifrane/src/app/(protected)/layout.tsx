import Navbar from '@/components/layout/Navbar';
import AuthProvider from '@/components/layout/AuthProvider';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>{children}</main>
      </div>
    </AuthProvider>
  );
}
