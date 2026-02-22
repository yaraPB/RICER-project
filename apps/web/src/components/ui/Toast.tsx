'use client';

import { useEffect } from 'react';
import { useToastStore, type Toast } from '@/store/useToastStore';

/* ─── Single toast ─── */

const TOAST_STYLES: Record<Toast['type'], string> = {
  success: 'border-green-500/40 bg-green-50 text-green-900 dark:bg-green-950/60 dark:text-green-100',
  warning: 'border-yellow-500/40 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/60 dark:text-yellow-100',
  error: 'border-red-500/40 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-100',
  info: 'border-blue-500/40 bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-100',
};

const TOAST_ICONS: Record<Toast['type'], string> = {
  success: '✓',
  warning: '⚠',
  error: '✕',
  info: 'ℹ',
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast);

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = setTimeout(() => removeToast(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm max-w-sm w-full pointer-events-auto transition-all ${TOAST_STYLES[toast.type]}`}
    >
      <span className="font-bold mt-0.5 flex-shrink-0">{TOAST_ICONS[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-1"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

/* ─── Container (render in layout) ─── */

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
