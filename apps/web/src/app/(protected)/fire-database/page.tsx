'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/useAuthStore';
import { useFireRecordStore } from '@/store/useFireRecordStore';
import { FireDatabaseKpis } from '@/components/fire-records/FireDatabaseKpis';
import { FireRecordFiltersV2 } from '@/components/fire-records/FireRecordFiltersV2';
import { FireRecordTableV2 } from '@/components/fire-records/FireRecordTableV2';
import { FireRecordMapView } from '@/components/fire-records/FireRecordMapView';
import { ComparisonBar } from '@/components/fire-records/ComparisonBar';
import { ComparisonView } from '@/components/fire-records/ComparisonView';
import { ImportFirmsDialog } from '@/components/fire-records/ImportFirmsDialog';

export default function FireDatabasePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { fetchRecords, reset, viewMode, comparisonRecords } = useFireRecordStore();

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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 page-enter">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-fluid-2xl font-bold">{t('fireDatabaseTitle')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('fireDatabaseDesc')}</p>
        </div>

        {user?.role === 'OFFICIAL' && (
          <div className="flex flex-wrap gap-2 shrink-0">
            <ImportFirmsDialog />
            <button
              onClick={() => handleExport('csv')}
              className="rounded-lg border border-border/60 px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              data-testid="export-csv"
            >
              {t('fireRecordExportCSV')}
            </button>
            <button
              onClick={() => handleExport('geojson')}
              className="rounded-lg border border-border/60 px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              data-testid="export-geojson"
            >
              {t('fireRecordExportGeoJSON')}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* KPI Cards */}
        <FireDatabaseKpis />

        {/* Filters */}
        <FireRecordFiltersV2 />

        {/* Comparison bar */}
        <ComparisonBar />

        {/* Comparison view (when loaded) */}
        {comparisonRecords.length > 0 && <ComparisonView />}

        {/* Main content area */}
        <div className="rounded-lg border border-border/60 bg-surface shadow-elev-1">
          {viewMode === 'table' ? <FireRecordTableV2 /> : <FireRecordMapView />}
        </div>
      </div>
    </div>
  );
}
