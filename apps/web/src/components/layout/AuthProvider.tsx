'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          router.push('/signin');
        }
      } catch {
        router.push('/signin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-4 rounded-lg border border-border bg-surface px-5 py-4 shadow-elev-1"
        >
          <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Icon name="fire" aria-hidden="true" size={20} />
          </div>
          <div className="text-sm font-semibold text-muted-foreground">{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
