'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Report } from '@/types';
import type { TranslationKey } from '@/i18n/translations';
import { Icon } from '@/components/ui/Icon';
import { getApiErrorUserMessage } from '@/lib/errors/sdk';
import { CreateIncidentModal } from '@/components/reports/CreateIncidentModal';

export default function ReportsListPage() {
  const user = useAuthStore((state) => state.user);
  const { t, language } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportToConvert, setReportToConvert] = useState<Report | null>(null);

  const fetchReports = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch('/api/reports');
      const data = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        setReports([]);
        setError(getApiErrorUserMessage(data, t('errorServer')));
        return;
      }

      const nextReports = Array.isArray((data as { reports?: unknown })?.reports)
        ? ((data as { reports: Report[] }).reports ?? [])
        : [];
      setReports(nextReports);
    } catch {
      setReports([]);
      setError(t('connectionError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReports();
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
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">{t('loadingReports')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${textAlign}`}>
          {t('reportsListTitle')}
        </h1>
        <p className={`text-gray-600 ${textAlign}`}>
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
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <div className="mb-4 flex justify-center text-muted-foreground">
            <Icon name="clipboard" aria-hidden={true} size={52} />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {t('noReports')}
          </h3>
          <p className="text-gray-500">{t('noReportsDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
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
                    <div className="text-sm text-gray-500">
                      {formatDate(report.createdAt)}
                    </div>
                  </div>

                  <div className={`text-sm text-gray-600 mb-1 ${textAlign}`}>
                    <span className="font-medium">{t('reporter')}:</span> {report.user?.cin ?? '—'}
                  </div>

                  {report.cause && (
                    <div className={`text-sm text-gray-600 mb-1 ${textAlign}`}>
                      <span className="font-medium">{t('cause')}:</span>{' '}
                      {getCauseLabel(report.cause)}
                    </div>
                  )}

                  <div className={`text-sm text-gray-600 ${textAlign}`}>
                    <span className="font-medium">{t('location')}:</span>{' '}
                    {formatCoordinates(report.latitude, report.longitude)}
                  </div>
                </div>

                <div className={isRTL ? 'mr-4 text-red-600' : 'ml-4 text-red-600'}>
                  <Icon name="fire" aria-hidden={true} size={28} />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className={`text-sm font-medium text-gray-700 mb-2 ${textAlign}`}>
                  {t('description')}:
                </div>
                <p className={`text-gray-800 ${textAlign}`}>{report.description}</p>
              </div>

              {user?.role === 'OFFICIAL' && (
                <div className="space-y-2">
                  <div className="flex gap-2" aria-busy={updatingId === report.id}>
                    <button
                      onClick={() => handleStatusUpdate(report.id, 'PENDING')}
                      disabled={
                        report.status === 'PENDING' || updatingId === report.id
                      }
                      className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t('pending')}
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(report.id, 'IN_PROGRESS')
                      }
                      disabled={
                        report.status === 'IN_PROGRESS' ||
                        updatingId === report.id
                      }
                      className="flex-1 px-4 py-2 bg-orange-100 hover:bg-orange-200 disabled:bg-gray-100 disabled:text-gray-400 text-orange-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t('inProgress')}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(report.id, 'COMPLETED')}
                      disabled={
                        report.status === 'COMPLETED' || updatingId === report.id
                      }
                      className="flex-1 px-4 py-2 bg-green-100 hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 text-green-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t('completed')}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {!report.incidentId && (
                      <button
                        onClick={() => setReportToConvert(report)}
                        className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Icon name="fire" size={16} />
                        {t('createIncident')}
                      </button>
                    )}

                    {report.incidentId && (
                      <div className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
                        <Icon name="check-circle" size={16} />
                        {t('incidentCreated')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
