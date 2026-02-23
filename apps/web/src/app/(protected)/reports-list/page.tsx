'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Report } from '@/types';
import type { TranslationKey } from '@/i18n/translations';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getApiErrorUserMessage } from '@/lib/errors/sdk';
import { CreateIncidentModal } from '@/components/reports/CreateIncidentModal';

const FETCH_TIMEOUT_MS = 5000;

export default function ReportsListPage() {
  const user = useAuthStore((state) => state.user);
  const { t, language } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportToConvert, setReportToConvert] = useState<Report | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchReports = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setTimedOut(false);
    setLoading(true);

    const timer = setTimeout(() => {
      controller.abort();
      setTimedOut(true);
      setLoading(false);
    }, FETCH_TIMEOUT_MS);

    try {
      const response = await fetch('/api/reports', { signal: controller.signal });
      clearTimeout(timer);
      const data = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        setReports([]);
        setError(getApiErrorUserMessage(data, t('errorServer')));
        return;
      }

      const nextReports = Array.isArray((data as { data?: unknown })?.data)
        ? ((data as { data: Report[] }).data ?? [])
        : [];
      setReports(nextReports);
    } catch (err) {
      clearTimeout(timer);
      if ((err as Error)?.name === 'AbortError') return;
      setReports([]);
      setError(t('connectionError'));
    } finally {
      clearTimeout(timer);
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    fetchReports();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchReports]);

  const handleStatusUpdate = async (reportId: string, newStatus: Report['status']) => {
    setUpdatingId(reportId);
    setError(null);
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        setError(getApiErrorUserMessage(data, t('errorServer')));
        return;
      }

      const updatedReport = (data as { report?: unknown })?.report as Report | undefined;
      if (!updatedReport?.id) {
        setError(t('errorServer'));
        return;
      }

      setReports((prev) => prev.map((r) => (r.id === reportId ? updatedReport : r)));
    } catch {
      setError(t('connectionError'));
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-danger-muted text-danger-foreground';
      case 'IN_PROGRESS':
        return 'bg-warning-muted text-warning-foreground';
      case 'COMPLETED':
        return 'bg-success-muted text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'PENDING') return t('pending');
    if (status === 'IN_PROGRESS') return t('inProgress');
    if (status === 'COMPLETED') return t('completed');
    return status;
  };

  const getCauseLabel = (causeKey: string | undefined) => {
    if (!causeKey) return t('unknown');

    const causeMap: Record<string, TranslationKey> = {
      'CAMPFIRE_UNATTENDED': 'campfireUnattended',
      'CIGARETTE': 'cigarette',
      'AGRICULTURAL_BURNING': 'agriculturalBurning',
      'ELECTRICAL': 'electrical',
      'LIGHTNING': 'lightning',
      'ARSON': 'arson',
      'EQUIPMENT_MALFUNCTION': 'equipmentMalfunction',
      'OTHER': 'other',
      'UNKNOWN': 'unknown',
    };
    return t(causeMap[causeKey] ?? 'unknown');
  };

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleString(
      locale,
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'text-right' : 'text-left';
  const flexAlign = isRTL ? 'justify-end' : 'justify-start';

  const formatCoordinates = (latitude: unknown, longitude: unknown) => {
    const lat = typeof latitude === 'number' ? latitude : Number(latitude);
    const lng = typeof longitude === 'number' ? longitude : Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return t('unknown');
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6" aria-busy="true" aria-label={t('loadingReports')}>
        <div className="mb-8">
          <div className="h-9 w-48 animate-pulse bg-muted rounded-xl mb-2" />
          <div className="h-5 w-72 animate-pulse bg-muted rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-20 bg-muted-foreground/10 rounded-full" />
                <div className="h-4 w-32 bg-muted-foreground/10 rounded-xl" />
              </div>
              <div className="h-4 w-56 bg-muted-foreground/10 rounded-xl mb-2" />
              <div className="h-4 w-40 bg-muted-foreground/10 rounded-xl mb-2" />
              <div className="h-4 w-48 bg-muted-foreground/10 rounded-xl mb-4" />
              <div className="h-20 w-full bg-muted-foreground/10 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (timedOut) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div role="alert" className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t('loadingReportsTimeout')}</p>
          <Button onClick={() => fetchReports()} variant="primary">
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold text-foreground mb-2 ${textAlign}`}>
          {t('reportsListTitle')}
        </h1>
        <p className={`text-muted-foreground ${textAlign}`}>
          {t('reportsListDesc')}
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className={`mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger ${textAlign}`}
        >
          {error}
        </div>
      ) : null}

      {reports.length === 0 ? (
        <Card tone="elevated" className="p-12 text-center">
          <div className="mb-4 flex justify-center text-muted-foreground">
            <Icon name="clipboard" aria-hidden={true} size={52} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {t('noReports')}
          </h3>
          <p className="text-muted-foreground">{t('noReportsDesc')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report) => (
            <Card
              key={report.id}
              tone="elevated"
              className="p-6"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className={`flex items-start ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between mb-4`}>
                <div className={`flex-1 ${textAlign}`}>
                  <div className={`flex items-center gap-3 ${flexAlign} mb-2`}>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {getStatusLabel(report.status)}
                    </span>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </div>
                  </div>

                  <div className={`text-sm text-muted-foreground mb-1 ${textAlign}`}>
                    <span className="font-medium">{t('reporter')}:</span> {report.user?.cin ?? '—'}
                  </div>

                  {report.cause && (
                    <div className={`text-sm text-muted-foreground mb-1 ${textAlign}`}>
                      <span className="font-medium">{t('cause')}:</span>{' '}
                      {getCauseLabel(report.cause)}
                    </div>
                  )}

                  <div className={`text-sm text-muted-foreground ${textAlign}`}>
                    <span className="font-medium">{t('location')}:</span>{' '}
                    {formatCoordinates(report.latitude, report.longitude)}
                  </div>
                </div>

                <div className={isRTL ? 'mr-4 text-danger' : 'ml-4 text-danger'}>
                  <Icon name="fire" aria-hidden={true} size={28} />
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className={`text-sm font-medium text-foreground mb-2 ${textAlign}`}>
                  {t('description')}:
                </div>
                <p className={`text-foreground ${textAlign}`}>{report.description}</p>
              </div>

              {user?.role === 'OFFICIAL' && (
                <div className="space-y-2">
                  <div className="flex gap-2" aria-busy={updatingId === report.id}>
                    <Button
                      onClick={() => handleStatusUpdate(report.id, 'PENDING')}
                      disabled={
                        report.status === 'PENDING' || updatingId === report.id
                      }
                      variant="secondary"
                      className="flex-1 bg-danger-muted hover:bg-danger-muted/80 disabled:bg-muted disabled:text-muted-foreground text-danger-foreground"
                    >
                      {t('pending')}
                    </Button>
                    <Button
                      onClick={() =>
                        handleStatusUpdate(report.id, 'IN_PROGRESS')
                      }
                      disabled={
                        report.status === 'IN_PROGRESS' ||
                        updatingId === report.id
                      }
                      variant="secondary"
                      className="flex-1 bg-warning-muted hover:bg-warning-muted/80 disabled:bg-muted disabled:text-muted-foreground text-warning-foreground"
                    >
                      {t('inProgress')}
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(report.id, 'COMPLETED')}
                      disabled={
                        report.status === 'COMPLETED' || updatingId === report.id
                      }
                      variant="secondary"
                      className="flex-1 bg-success-muted hover:bg-success-muted/80 disabled:bg-muted disabled:text-muted-foreground text-success-foreground"
                    >
                      {t('completed')}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {!report.incidentId && (
                      <Button
                        onClick={() => setReportToConvert(report)}
                        variant="primary"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Icon name="fire" size={16} />
                        {t('createIncident')}
                      </Button>
                    )}

                    {report.incidentId && (
                      <div className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-success-muted px-4 py-2 text-sm font-medium text-success-foreground">
                        <Icon name="fire" size={16} />
                        {t('incidentCreated')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <CreateIncidentModal
        report={reportToConvert}
        open={!!reportToConvert}
        onClose={() => setReportToConvert(null)}
        onSuccess={() => {
          setReportToConvert(null);
          fetchReports();
        }}
      />
    </div>
  );
}
