'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/hooks/useTranslation';

export type RailItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export type SidebarRailProps = {
  items: RailItem[];
  footerItems?: RailItem[];
  className?: string;
};

export function SidebarRail({ items, footerItems, className }: SidebarRailProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('primaryNavigation')}
      className={cn(
        'group flex w-[72px] shrink-0 flex-col border-r border-border bg-surface transition-all duration-300 hover:w-64',
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span className="grid h-9 w-9 place-items-center rounded-md bg-surface-2 text-foreground group-hover:bg-surface">
                {item.icon}
              </span>
              <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {footerItems?.length ? (
        <div className="border-t border-border p-3">
          {footerItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span className="grid h-9 w-9 place-items-center rounded-md bg-surface-2 text-foreground group-hover:bg-surface">
                  {item.icon}
                </span>
                <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </nav>
  );
}
