'use client';

import * as React from 'react';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

export type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isRTL: boolean;
};

export function AuthShell({ title, subtitle, children, footer, isRTL }: AuthShellProps) {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip overflow-y-hidden bg-background">
      <div className="pointer-events-none absolute -left-24 -top-24 hidden h-72 w-72 rounded-full bg-primary/15 blur-3xl sm:block" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 hidden h-96 w-96 rounded-full bg-warning/20 blur-3xl sm:block" />

      <div className="absolute end-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-4 sm:p-6">
        <Card tone="elevated" className="p-6 sm:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-primary text-primary-foreground shadow-elev-1">
              <Icon name="fire" aria-hidden={true} size={26} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>

          {children}

          {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
        </Card>
      </div>
    </div>
  );
}

