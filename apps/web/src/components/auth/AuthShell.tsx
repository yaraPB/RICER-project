'use client';

import * as React from 'react';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';

export type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isRTL: boolean;
};

export function AuthShell({ title, subtitle, children, footer, isRTL }: AuthShellProps) {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip overflow-y-hidden bg-background bg-dot-grid">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 hidden h-[420px] w-[420px] rounded-full bg-primary/10 blur-[100px] sm:block" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 hidden h-[500px] w-[500px] rounded-full bg-warning/8 blur-[120px] sm:block" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 hidden h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-danger/5 blur-[80px] sm:block" />

      <div className="absolute end-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-4 sm:p-6">
        <Card tone="elevated" className="p-6 sm:p-8 animate-scale-in" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-5 h-20 w-20 bg-surface-2 shadow-elev-2 rounded-xl p-3 transition-all duration-200">
              <Logo variant="badge" size="xl" priority />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle ? <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>

          {children}

          {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
        </Card>
      </div>
    </div>
  );
}
