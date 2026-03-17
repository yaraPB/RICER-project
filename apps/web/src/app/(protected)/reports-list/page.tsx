'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Report } from '@/types';
import type { TranslationKey } from '@/i18n/translations';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/SelectField';
import { getApiErrorUserMessage } from '@/lib/errors/sdk';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import { CreateIncidentModal } from '@/components/reports/CreateIncidentModal';

const FETCH_TIMEOUT_MS = 8000;
const PAGE_LIMIT = 20;

export default function ReportsListPage() {
  const user = useAuthStore((state) => state.user);
  const { t, language } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportToConvert, setReportToConvert] = useState<Report | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Pagination state
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [causeFilter, setCauseFilter] = useState('');

  const fetchReports = useCallback(async (append = false) => {
    if (!append) {
      abortRef.current?.abort();
    }
    const controller = new AbortController();
    if (!append) {
      abortRef.current = controller;
    }

    setError(null);
    setTimedOut(false);
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const timer = setTimeout(() => {
      controller.abort();
      setTimedOut(true);
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }, FETCH_TIMEOUT_MS);

    try {
      const params = new URLSearchParams({ limit: String(PAGE_LIMIT) });
      if (append && cursor) {
        params.set('cursor', cursor);
      }
      const response = await fetchWithAuth(`/api/reports?${params.toString()}`, { signal: controller.signal });
      clearTimeout(timer);
      const data = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        if (!append) setReports([]);
        setError(getApiErrorUserMessage(data, t('errorServer')));
        return;
      }

      const payload = data as { data?: Report[]; pagination?: { cursor: string | null; hasMore: boolean; total: number } };
      const nextReports = Array.isArray(payload?.data) ? payload.data : [];
      const pagination = payload?.pagination;

      if (append) {
        setReports((prev) => [...prev, ...nextReports]);
      } else {
        setReports(nextReports);
      }

      setCursor(pagination?.cursor ?? null);
      setHasMore(pagination?.hasMore ?? false);
      setTotal(pagination?.total ?? nextReports.length);
    } catch (err) {
      clearTimeout(timer);
      if ((err as Error)?.name === 'AbortError') return;
      if (!append) setReports([]);
      setError(t('connectionError'));
    } finally {
      clearTimeout(timer);
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [t, cursor]);

  useEffect(() => {
    fetchReports();
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusUpdate = async (reportId: string, newStatus: Report['status']) => {
    setUpdatingId(reportId);
    setError(null);
    try {
      const response = await fetchWithAuth(`/api/reports/${reportId}`, {
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

  // Client-side filtering
  const filteredReports = reports.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (causeFilter && r.cause !== causeFilter) return false;
    return true;
  });

  const statusOptions = [
    { value: '', label: t('allStatuses') },
    { value: 'PENDING', label: t('pending') },
    { value: 'IN_PROGRESS', label: t('inProgress') },
    { value: 'COMPLETED', label: t('completed') },
  ];

  const causeOptions = [
    { value: '', label: t('allCauses') },
    { value: 'CAMPFIRE_UNATTENDED', label: t('campfireUnattended') },
    { value: 'CIGARETTE', label: t('cigarette') },
    { value: 'AGRICULTURAL_BURNING', label: t('agriculturalBurning') },
    { value: 'ELECTRICAL', label: t('electrical') },
    { value: 'LIGHTNING', label: t('lightning') },
    { value: 'ARSON', label: t('arson') },
    { value: 'EQUIPMENT_MALFUNCTION', label: t('equipmentMalfunction') },
    { value: 'OTHER', label: t('other') },
    { value: 'UNKNOWN', label: t('unknown') },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 page-enter">
      {/* HEADER — always visible */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-fluid-3xl font-bold text-foreground mb-1 ${textAlign}`}>
            {t('reportsListTitle')}
          </h1>
          <p className={`text-sm text-muted-foreground ${textAlign}`}>
            {t('reportsListDesc')}
            {total > 0 && !loading && (
              <span className="ms-2">
                ({t('showingXOfY').replace('{0}', String(filteredReports.length)).replace('{1}', String(total))})
              </span>
            )}
          </p>
        </div>
        <Link href="/report" className="shrink-0">
          <Button variant="primary" className="flex items-center gap-2">
            <Icon name="campaign" size={16} />
            {t('newReport')}
          </Button>
        </Link>
      </div>

      {/* FILTERS — always visible */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-48">
          <SelectField
            id="status-filter"
            label={t('filterByStatus')}
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <div className="w-48">
          <SelectField
            id="cause-filter"
            label={t('filterByCause')}
            options={causeOptions}
            value={causeFilter}
            onChange={(e) => setCauseFilter(e.target.value)}
          />
        </div>
      </div>

      {/* ERROR / TIMEOUT — inline, not early-return */}
      {(error || timedOut) && !loading && (
        <Card tone="elevated" className="p-8 text-center mb-6">
          <div className="mb-4 flex justify-center text-danger">
            <Icon name="warning" aria-hidden={true} size={40} />
          </div>
          <p className="text-muted-foreground mb-4">
            {error ?? t('loadingReportsTimeout')}
          </p>
          <Button onClick={() => fetchReports()} variant="primary">
            {t('retry')}
          </Button>
        </Card>
      )}

      {/* LOADING — inline skeletons with staggered animation */}
      {loading && (
        <div className="grid grid-cols-1 gap-6" aria-busy="true" aria-label={t('loadingReports')}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted rounded-xl p-6"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-20 skeleton-shimmer rounded-full" />
                <div className="h-4 w-32 skeleton-shimmer rounded-xl" />
              </div>
              <div className="h-4 w-56 skeleton-shimmer rounded-xl mb-2" />
              <div className="h-4 w-40 skeleton-shimmer rounded-xl mb-2" />
              <div className="h-4 w-48 skeleton-shimmer rounded-xl mb-4" />
              <div className="h-20 w-full skeleton-shimmer rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && !timedOut && filteredReports.length === 0 && (
        <Card tone="elevated" className="p-12 text-center">
          <div className="mb-4 flex justify-center text-muted-foreground">
            <Icon name="clipboard" aria-hidden={true} size={56} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {t('noReports')}
          </h3>
          <p className="text-muted-foreground mb-6">{t('noReportsDesc')}</p>
          <Link href="/report">
            <Button variant="primary" className="inline-flex items-center gap-2">
              <Icon name="campaign" size={16} />
              {t('createFirstReport')}
            </Button>
          </Link>
        </Card>
      )}

      {/* REPORT CARDS */}
      {!loading && filteredReports.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {filteredReports.map((report) => (
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
                    {report.referenceNumber && (
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {report.referenceNumber}
                      </span>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </div>
                  </div>

                  <div className={`text-sm text-muted-foreground mb-1 ${textAlign}`}>
                    <span className="font-medium">{t('reporter')}:</span>{' '}
                    {report.anonymous ? t('anonymousReport') : (report.user?.cin ?? '—')}
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

      {/* LOAD MORE */}
      {hasMore && !loading && !loadingMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={() => fetchReports(true)} variant="secondary">
            {t('loadMore')}
          </Button>
        </div>
      )}
      {loadingMore && (
        <div className="flex justify-center mt-8">
          <Button variant="secondary" disabled>
            {t('loading')}
          </Button>
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
