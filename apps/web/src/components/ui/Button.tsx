'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      type = 'button',
      variant = 'secondary',
      size = 'md',
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex select-none items-center justify-center gap-2 rounded-md font-semibold transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
          size === 'sm' && 'h-9 px-3 text-sm',
          size === 'md' && 'h-10 px-4 text-sm',
          size === 'lg' && 'h-11 px-5 text-base',
          variant === 'primary' &&
            'bg-primary text-primary-foreground shadow-elev-1 hover:brightness-[0.96] active:brightness-[0.92]',
          variant === 'danger' &&
            'bg-danger text-white shadow-elev-1 hover:brightness-[0.96] active:brightness-[0.92]',
          variant === 'secondary' &&
            'bg-surface-2 text-foreground shadow-sm hover:bg-muted active:bg-muted/80',
          variant === 'ghost' && 'bg-transparent text-foreground hover:bg-muted active:bg-muted/80',
          className
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
