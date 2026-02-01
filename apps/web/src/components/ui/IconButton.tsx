'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export type IconButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  label: string;
  children: React.ReactNode;
  variant?: 'ghost' | 'secondary';
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, label, variant = 'ghost', children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-md transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'ghost' && 'text-muted-foreground hover:bg-muted hover:text-foreground',
        variant === 'secondary' && 'bg-surface-2 text-foreground hover:bg-muted',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
