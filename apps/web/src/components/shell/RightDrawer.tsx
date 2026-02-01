'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/ui/IconButton';
import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';

export type RightDrawerProps = {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

export function RightDrawer({
  title,
  open,
  onOpenChange,
  children,
  className,
}: RightDrawerProps) {
  const { t } = useTranslation();
  const titleId = React.useId();
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  return (
    <>
      <button
        type="button"
        aria-label={t('closePanel')}
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => onOpenChange(false)}
      ></button>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'fixed right-0 top-16 z-50 h-[calc(100vh-4rem)] w-[380px] max-w-[95vw] overflow-hidden border-l border-border bg-surface shadow-elev-2 transition-transform md:relative md:top-0 md:z-0 md:h-full md:translate-x-0 md:shadow-none',
          open ? 'translate-x-0' : 'translate-x-full md:translate-x-0',
          className
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border bg-surface-2 px-4">
          <div id={titleId} className="min-w-0 text-sm font-extrabold tracking-tight">
            {title}
          </div>
          <IconButton
            label={t('closePanel')}
            className="md:hidden"
            onClick={() => onOpenChange(false)}
            ref={closeButtonRef}
          >
            <Icon name="close" aria-hidden="true" size={20} />
          </IconButton>
        </div>
        <div className="h-[calc(100%-3.5rem)] overflow-auto">{children}</div>
      </div>
    </>
  );
}
