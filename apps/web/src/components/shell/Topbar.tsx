import * as React from 'react';
import { cn } from '@/lib/cn';

export type TopbarProps = {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
};

export function Topbar({ left, center, right, className }: TopbarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 w-full items-center border-b border-border bg-surface/90 backdrop-blur-md',
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4">
        <div className="flex flex-1 items-center gap-3">{left}</div>
        <div className="hidden min-w-0 flex-[2] items-center justify-center md:flex">
          {center}
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">{right}</div>
      </div>
    </header>
  );
}
