'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Icon } from '@/components/ui/Icon';
import { STATUS_COLORS } from '@/config/constants';
import type { Report } from '@/types';
import { clientLogger } from '@/lib/observability/clientLogger';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { t } = useTranslation();
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorRequestId, setErrorRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchRecentReports = async () => {
      setLoading(true);
      setError(null);
      setErrorRequestId(null);

      try {
        const res = await fetch('/api/reports?limit=10');
        const requestId = res.headers.get('x-request-id');

        if (res.ok) {
          const data = await res.json();
          setRecentReports(data.data || data.reports || []);
          setError(null);
        } else {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.error?.userMessage || t('errorLoadingReports') || 'Failed to load reports';
          setError(errorMessage);
          setErrorRequestId(errorData.error?.requestId || requestId || null);

          clientLogger.error({
            event: 'notifications_fetch_failed',
            route: '/api/reports',
            requestId: requestId || undefined,
            meta: {
              status: res.status,
              errorCode: errorData.error?.code,
            },
          });
        }
      } catch (err) {
        setError(t('connectionError') || 'Connection error');

        clientLogger.error({
          event: 'notifications_fetch_exception',
          route: '/api/reports',
          error: {
            name: (err as Error)?.name,
            message: (err as Error)?.message,
            stack: (err as Error)?.stack,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReports();
  }, [isOpen, t]);

  if (!isOpen) return null;

  const getStatusLabel = (status: string) => {
    if (status === 'PENDING') return t('pending');
    if (status === 'IN_PROGRESS') return t('inProgress');
    if (status === 'COMPLETED') return t('completed');
    return status;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden={true}
      />

      {/* Panel */}
      <div className="fixed right-4 top-16 z-50 w-full max-w-md sm:w-96 rounded-lg border border-border bg-surface shadow-elev-2">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold">{t('notifications')}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-surface-2 transition-colors"
            aria-label={t('closePanel')}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {error ? (
            <div className="p-4">
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900">{error}</p>
                {errorRequestId && (
                  <p className="text-xs text-red-700 mt-2">
                    Request ID: {errorRequestId}
                  </p>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              {t('loading')}...
            </div>
          ) : recentReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Icon name="notifications" size={48} className="text-muted-foreground opacity-50 mb-2" />
              <p className="text-sm text-muted-foreground">{t('noNotifications')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentReports.map((report) => (
                <a
                  key={report.id}
                  href={`/map?selected=${report.id}`}
                  className="block px-4 py-3 hover:bg-surface-2 transition-colors"
                  onClick={onClose}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[report.status] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold truncate">
                          {t('fireIncident')} #{report.id.slice(0, 6)}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className="font-semibold"
                          style={{ color: STATUS_COLORS[report.status] }}
                        >
                          {getStatusLabel(report.status)}
                        </span>
                        {report.user && (
                          <span className="text-muted-foreground">
                            • {report.user.cin}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
