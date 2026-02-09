import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

export type LogoVariant = 'badge' | 'icon' | 'horizontal';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<LogoSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  priority?: boolean;
}

export function Logo({
  variant = 'badge',
  size = 'md',
  className,
  priority = false,
}: LogoProps) {
  const dimension = SIZE_MAP[size];
  const src =
    variant === 'horizontal'
      ? '/logos/logo.png'
      : variant === 'icon'
        ? '/logos/icon-1024.png'
        : '/logos/badge.png';

  return (
    <Image
      src={src}
      alt="RICER Logo"
      width={dimension}
      height={dimension}
      priority={priority}
      className={cn('object-contain', className)}
    />
  );
}
