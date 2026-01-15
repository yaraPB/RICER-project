'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Report } from '@/types';

export default function ReportsListPage() {
  const user = useAuthStore((state) => state.user);
  const { t, language } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    setUpdatingId(reportId);
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setReports(
          reports.map((r) => (r.id === reportId ? data.report : r))
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
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
    
    const causeMap: Record<string, keyof typeof t> = {
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
    return t(causeMap[causeKey] || 'unknown');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(
      language === 'ar' ? 'ar-MA' : 'fr-FR',
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

      {reports.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
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
                    <span className="font-medium">{t('reporter')}:</span> {report.user?.cin}
                  </div>

                  {report.cause && (
                    <div className={`text-sm text-gray-600 mb-1 ${textAlign}`}>
                      <span className="font-medium">{t('cause')}:</span>{' '}
                      {getCauseLabel(report.cause)}
                    </div>
                  )}

                  <div className={`text-sm text-gray-600 ${textAlign}`}>
                    <span className="font-medium">{t('location')}:</span>{' '}
                    {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                  </div>
                </div>

                <div className={`text-4xl ${isRTL ? 'mr-4' : 'ml-4'}`}>🔥</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className={`text-sm font-medium text-gray-700 mb-2 ${textAlign}`}>
                  {t('description')}:
                </div>
                <p className={`text-gray-800 ${textAlign}`}>{report.description}</p>
              </div>

              {user?.role === 'OFFICIAL' && (
                <div className="flex gap-2">
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
