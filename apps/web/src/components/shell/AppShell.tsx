import * as React from 'react';
import { cn } from '@/lib/cn';

export type AppShellProps = {
  topbar: React.ReactNode;
  sidebar: React.ReactNode;
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function AppShell({ topbar, sidebar, rightPanel, children, className }: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-background text-foreground', className)}>
      {topbar}
      <div className="relative flex min-h-[calc(100vh-4rem)] w-full overflow-hidden">
        {sidebar}
        <main id="main" className="relative flex-1 overflow-auto">
          {children}
        </main>
        {rightPanel}
      </div>
    </div>
  );
}
