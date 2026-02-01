import * as React from 'react';
import { cn } from '@/lib/cn';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: 'default' | 'elevated' | 'subtle';
};

export function Card({ className, tone = 'default', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface text-foreground',
        tone === 'default' && 'shadow-elev-1',
        tone === 'elevated' && 'shadow-elev-2',
        tone === 'subtle' && 'bg-surface/70 shadow-sm',
        className
      )}
      {...props}
    />
  );
}
