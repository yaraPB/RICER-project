'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import { NotificationsPanel } from './NotificationsPanel';
import { ThemeToggle } from './ThemeToggle';
import { Footer } from './Footer';
import { AppShell } from '@/components/shell/AppShell';
import { Topbar } from '@/components/shell/Topbar';
import { SidebarRail } from '@/components/shell/SidebarRail';
import { SkipLink } from '@/components/shell/SkipLink';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { SearchInput } from '@/components/ui/SearchInput';

export default function Navbar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/signin');
    } catch {
      logout();
      router.push('/signin');
    }
  };

  const navItems = [
    { href: '/map', label: t('fireMap'), icon: <Icon name="map" aria-hidden={true} size={20} /> },
    {
      href: '/analytics',
      label: t('analytics'),
      icon: <Icon name="analytics" aria-hidden={true} size={20} />,
    },
    {
      href: '/report',
      label: t('reportFire'),
      icon: <Icon name="campaign" aria-hidden={true} size={20} />,
    },
    {
      href: '/reports-list',
      label: t('reports'),
      icon: <Icon name="list" aria-hidden={true} size={20} />,
    },
  ];

  if (user?.role === 'OFFICIAL') {
    navItems.push({
      href: '/equipment',
      label: t('equipment'),
      icon: <Icon name="truck" aria-hidden={true} size={20} />,
    });
  }

  return (
    <>
      <SkipLink />
      <AppShell
        topbar={
          <Topbar
            left={
              <div className="flex items-center gap-3">
                <Link href="/map" className="flex items-center gap-3" aria-label={t('brandTitle')}>
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-surface shadow-elev-1 p-1">
                    <Logo variant="badge" size="sm" priority />
                  </div>
                  <span className="sr-only">{t('brandTitle')}</span>
                  <div className="hidden sm:block leading-tight">
                    <div className="text-sm font-extrabold tracking-tight">{t('brandTitle')}</div>
                    <div className="text-xs text-muted-foreground">{t('brandSubtitle')}</div>
                  </div>
                </Link>

                <div className="hidden lg:flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                  </span>
                  <span className="text-xs font-bold text-foreground">{t('systemOnline')}</span>
                </div>
              </div>
            }
            center={
              <div className="w-full max-w-md">
                <SearchInput
                  label={t('search')}
                  placeholder={t('globalSearchPlaceholder')}
                  name="globalSearch"
                />
              </div>
            }
            right={
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher />

                <IconButton
                  label={t('notifications')}
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <span className="relative">
                    <Icon name="notifications" aria-hidden={true} size={22} />
                    <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
                  </span>
                </IconButton>

                <div className="hidden sm:flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 shadow-sm">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold">{user?.cin}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {user?.role === 'OFFICIAL' ? t('official') : t('civilian')}
                      {user?.department ? ` • ${user.department}` : ''}
                    </div>
                  </div>
                  <Badge tone="primary" className="hidden md:inline-flex">
                    {user?.role === 'OFFICIAL' ? t('roleBadgeOps') : t('roleBadgeUser')}
                  </Badge>
                </div>

                <Button variant="secondary" onClick={handleLogout}>
                  <Icon name="logout" aria-hidden={true} size={20} />
                  <span className="sr-only sm:not-sr-only">{t('logout')}</span>
                </Button>
              </div>
            }
          />
        }
        sidebar={<SidebarRail items={navItems} />}
      >
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </AppShell>

      <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
