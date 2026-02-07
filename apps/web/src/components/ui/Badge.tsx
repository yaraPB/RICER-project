import * as React from 'react';
import { cn } from '@/lib/cn';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
};

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold',
        tone === 'neutral' && 'border-border bg-surface-2 text-foreground',
        tone === 'primary' && 'border-primary/25 bg-surface text-primary',
        tone === 'success' && 'border-success/25 bg-surface text-success',
        tone === 'warning' && 'border-warning/25 bg-surface text-warning',
        tone === 'danger' && 'border-danger/25 bg-surface text-danger',
        className
      )}
      {...props}
    />
  );
}
