'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { href: '/weather', label: 'الطقس', icon: '🌤️' },
    { href: '/map', label: 'خريطة الحرائق', icon: '🗺️' },
    { href: '/analytics', label: 'الإحصائيات', icon: '📊' },
    { href: '/report', label: 'إبلاغ عن حريق', icon: '🚨' },
    { href: '/reports-list', label: 'التقارير', icon: '📋' },
  ];

  if (user?.role === 'OFFICIAL') {
    navItems.push({ href: '/equipment', label: 'المعدات', icon: '🚒' });
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/weather" className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-xl text-red-600">
              RICER Ifrane
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-red-100 text-red-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="ml-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">
                {user?.cin}
              </div>
              <div className="text-xs text-gray-500">
                {user?.role === 'OFFICIAL' ? 'مسؤول' : 'مواطن'}
                {user?.department && ` - ${user.department}`}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4 overflow-x-auto">
          <div className="flex gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-red-100 text-red-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="ml-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
