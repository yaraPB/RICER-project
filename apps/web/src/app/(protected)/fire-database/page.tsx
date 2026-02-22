'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/useAuthStore';
import { useFireRecordStore } from '@/store/useFireRecordStore';
import { FireRecordFilters } from '@/components/fire-records/FireRecordFilters';
import { FireRecordTable } from '@/components/fire-records/FireRecordTable';

export default function FireDatabasePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { fetchRecords, reset } = useFireRecordStore();

  useEffect(() => {
    fetchRecords();
    return () => reset();
  }, [fetchRecords, reset]);

  const handleExport = async (format: 'csv' | 'geojson') => {
    const res = await fetch(`/api/fire-records/export?format=${format}`);
    if (!res.ok) return;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fire-records.${format === 'geojson' ? 'geojson' : 'csv'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('fireDatabaseTitle')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('fireDatabaseDesc')}</p>
        </div>

        {user?.role === 'OFFICIAL' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="rounded border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
              data-testid="export-csv"
            >
              {t('fireRecordExportCSV')}
            </button>
            <button
              onClick={() => handleExport('geojson')}
              className="rounded border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
              data-testid="export-geojson"
            >
              {t('fireRecordExportGeoJSON')}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <FireRecordFilters />
        <div className="rounded-lg border border-border bg-surface shadow-sm">
          <FireRecordTable />
        </div>
      </div>
    </div>
  );
}
