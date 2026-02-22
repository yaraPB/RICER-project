import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

export type LogoVariant = 'badge' | 'icon' | 'horizontal';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'responsive';

const SIZE_MAP: Record<LogoSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  responsive: 56, // Default size for SSR, actual size controlled by Tailwind classes
};

const SIZE_CLASSES: Record<LogoSize, string> = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
  responsive: 'h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14',
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
  const sizeClass = SIZE_CLASSES[size];
  const src =
    variant === 'horizontal'
      ? '/logos/logo-horizontal.svg'
      : variant === 'icon'
        ? '/logos/icon.svg'
        : '/logos/badge.svg';

  const altText =
    variant === 'horizontal'
      ? 'RICER - Rapid Incident Communication & Emergency Response'
      : 'RICER Logo';

  return (
    <Image
      src={src}
      alt={altText}
      width={dimension}
      height={dimension}
      priority={priority}
      className={cn('object-contain', sizeClass, className)}
    />
  );
}
