'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { Report, WeatherData } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { KpiCard } from '@/components/ui/KpiCard';
import { Icon } from '@/components/ui/Icon';
import { RightDrawer } from '@/components/shell/RightDrawer';
import type { TranslationKey } from '@/utils/translations';
import { getApiErrorUserMessage } from '@/lib/errors/sdk';

function FireMapLoading() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-muted-foreground">
      {t('loadingMap')}
    </div>
  );
}

const FireMap = dynamic(() => import('@/components/map/FireMap'), {
  ssr: false,
  loading: () => <FireMapLoading />,
});

type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme';

function getRiskLevel(weather: WeatherData | null): RiskLevel | null {
  if (!weather) return null;
  const score = weather.temperature * 0.9 + weather.windSpeed * 1.2;
  if (score >= 60) return 'extreme';
  if (score >= 45) return 'high';
  if (score >= 30) return 'moderate';
  return 'low';
}

export default function MapPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [lastReportsUpdate, setLastReportsUpdate] = useState<number | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchWeather = useCallback(async () => {
    setWeatherError(null);
    try {
      const response = await fetch('/api/weather');
      const data = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        setWeather(null);
        setWeatherError(getApiErrorUserMessage(data, t('weatherLoadFailed')));
        return;
      }
      setWeather(data as WeatherData);
    } catch {
      setWeather(null);
      setWeatherError(t('connectionError'));
    } finally {
      setWeatherLoading(false);
    }
  }, [t]);

  const fetchReports = useCallback(async () => {
    setReportsError(null);
    try {
      const response = await fetch('/api/reports');
      const data = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        setReports([]);
        setReportsError(getApiErrorUserMessage(data, t('errorServer')));
        return;
      }

      const nextReports = Array.isArray((data as { reports?: unknown })?.reports)
        ? ((data as { reports: Report[] }).reports ?? [])
        : [];
      setReports(nextReports);
      setLastReportsUpdate(Date.now());
    } catch {
      setReports([]);
      setReportsError(t('connectionError'));
    } finally {
      setReportsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchWeather();
    fetchReports();
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, [fetchReports, fetchWeather]);

  const directionKeys = ['windN', 'windNE', 'windE', 'windSE', 'windS', 'windSW', 'windW', 'windNW'] as const;
  const directionIndex = weather ? Math.round(weather.windDirection / 45) % 8 : 0;
  const windDirectionText = weather ? t(directionKeys[directionIndex]) : '';
  const risk = getRiskLevel(weather);

  const riskLabel =
    risk === 'low'
      ? t('riskLow')
      : risk === 'moderate'
        ? t('riskModerate')
        : risk === 'high'
          ? t('riskHigh')
          : risk === 'extreme'
            ? t('riskExtreme')
            : t('unknown');

  const riskTone: 'success' | 'warning' | 'danger' =
    risk === 'extreme' || risk === 'high' ? 'danger' : risk === 'moderate' ? 'warning' : 'success';

  const activeIncidents = reports.filter((r) => r.status !== 'COMPLETED').length;
  const selectedReport = selectedReportId ? reports.find((r) => r.id === selectedReportId) : undefined;

  const getStatusLabel = (status: string) => {
    if (status === 'PENDING') return t('pending');
    if (status === 'IN_PROGRESS') return t('inProgress');
    if (status === 'COMPLETED') return t('completed');
    return status;
  };

  const getCauseLabel = (causeKey: string | undefined) => {
    if (!causeKey) return t('unknown');

    const causeMap: Record<string, TranslationKey> = {
      CAMPFIRE_UNATTENDED: 'campfireUnattended',
      CIGARETTE: 'cigarette',
      AGRICULTURAL_BURNING: 'agriculturalBurning',
      ELECTRICAL: 'electrical',
      LIGHTNING: 'lightning',
      ARSON: 'arson',
      EQUIPMENT_MALFUNCTION: 'equipmentMalfunction',
      OTHER: 'other',
      UNKNOWN: 'unknown',
    };
    return t(causeMap[causeKey] ?? 'unknown');
  };

  const handleSelectReport = (id: string) => {
    setSelectedReportId(id);
    setDrawerOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      <section className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
        {weatherError || reportsError ? (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {weatherError ?? reportsError}
          </div>
        ) : null}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">
                {t('fireMapTitle')}
              </h1>
              <Badge tone="primary" className="hidden sm:inline-flex">
                {t('activeIncidents')}: {activeIncidents}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{t('fireMapDesc')}</p>
          </div>

          <div className="flex items-center gap-2">
            {lastReportsUpdate ? (
              <Badge tone="neutral">
                {t('lastUpdated')}{' '}
                {new Date(lastReportsUpdate).toLocaleTimeString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Badge>
            ) : null}
            <Button variant="secondary" onClick={fetchReports} aria-label="Refresh">
              <Icon name="refresh" aria-hidden="true" size={20} />
              <span className="sr-only sm:not-sr-only">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label={t('riskIndex')}
            value={<span className={riskTone === 'danger' ? 'text-danger' : riskTone === 'warning' ? 'text-warning' : 'text-success'}>{riskLabel}</span>}
            hint={
              weather && !weatherLoading
                ? `${weather.temperature}°C • ${weather.windSpeed} km/h`
                : weatherLoading
                  ? '…'
                  : '—'
            }
            tone={riskTone}
            icon={<Icon name="warning" aria-hidden="true" size={22} />}
          />
          <KpiCard
            label={t('activeIncidents')}
            value={activeIncidents}
            hint={`${reports.length} total`}
            tone={activeIncidents > 0 ? 'warning' : 'neutral'}
            icon={<Icon name="fire" aria-hidden="true" size={22} />}
          />
          <KpiCard
            label={t('temperature')}
            value={weather && !weatherLoading ? `${weather.temperature}°C` : '—'}
            hint={weatherLoading ? '…' : null}
            tone="neutral"
            icon={<Icon name="thermostat" aria-hidden="true" size={22} />}
          />
          <KpiCard
            label={t('windSpeed')}
            value={weather && !weatherLoading ? `${weather.windSpeed} km/h` : '—'}
            hint={weather && !weatherLoading ? `${windDirectionText} • ${weather.windDirection}°` : weatherLoading ? '…' : null}
            tone="neutral"
            icon={<Icon name="air" aria-hidden="true" size={22} />}
          />
        </div>

        <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-surface shadow-elev-1">
          <FireMap
            reports={reports}
            loading={reportsLoading}
            selectedReportId={selectedReportId}
            onSelectReport={handleSelectReport}
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>OSM • Leaflet</span>
          <a
            href="http://sysfeu.com/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            sysfeu.com
          </a>
        </div>
      </section>

      <RightDrawer title={t('incidentDetails')} open={drawerOpen} onOpenChange={setDrawerOpen}>
        <div className="space-y-5 p-4">
          {!selectedReport ? (
            <div className="rounded-lg border border-border bg-surface-2 p-4 text-sm text-muted-foreground">
              {t('selectIncident')}
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    #{selectedReport.id.slice(0, 6)}
                  </div>
                  <div className="mt-1 text-lg font-extrabold tracking-tight">
                    {getStatusLabel(selectedReport.status)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}
                  </div>
                </div>
                <Badge
                  tone={
                    selectedReport.status === 'PENDING'
                      ? 'warning'
                      : selectedReport.status === 'IN_PROGRESS'
                        ? 'primary'
                        : 'success'
                  }
                >
                  {getStatusLabel(selectedReport.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('cause')}
                  </div>
                  <div className="mt-2 text-sm font-semibold">{getCauseLabel(selectedReport.cause)}</div>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('reporter')}
                  </div>
                  <div className="mt-2 text-sm font-semibold">{selectedReport.user?.cin ?? '—'}</div>
                </div>
              </div>

              {selectedReport.description ? (
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('description')}
                  </div>
                  <div className="mt-2 text-sm">{selectedReport.description}</div>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Button variant="primary">
                  <Icon name="campaign" aria-hidden="true" size={20} />
                  {t('dispatchReinforcements')}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary">
                    <Icon name="share" aria-hidden="true" size={20} />
                    {t('share')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/reports-list`)}
                  >
                    <Icon name="open" aria-hidden="true" size={20} />
                    {t('openReport')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </RightDrawer>
    </div>
  );
}
