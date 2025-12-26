'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/helpers';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems = [
    { href: '/weather', label: 'الطقس', icon: '🌤️' },
    { href: '/map', label: 'الخريطة', icon: '🗺️' },
    { href: '/analytics', label: 'الإحصائيات', icon: '📊' },
    { href: '/report', label: 'إبلاغ', icon: '🚨' },
    { href: '/reports-list', label: 'التقارير', icon: '📋' },
  ];

  if (user?.role === 'OFFICIAL') {
    navItems.push({ href: '/equipment', label: 'المعدات', icon: '🚒' });
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-reverse space-x-8">
            <Link href="/weather" className="flex items-center space-x-2 space-x-reverse">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-xl text-gray-900">RICER إفران</span>
            </Link>
            <div className="hidden sm:flex sm:space-x-reverse sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <span className="ml-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-reverse space-x-4">
            {user && (
              <>
                <div className="text-sm text-right">
                  <div className="font-medium text-gray-900">{user.cin}</div>
                  <div className="text-gray-500">
                    {user.role === 'OFFICIAL' ? user.department : 'مواطن'}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  تسجيل الخروج
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-md text-base font-medium',
                pathname === item.href
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <span className="ml-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
