'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { WeatherData, GeoFeatureCollection, GeoIncidentProps, IncidentStatus } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { KpiCard } from '@/components/ui/KpiCard';
import { Icon } from '@/components/ui/Icon';
import { RightDrawer } from '@/components/shell/RightDrawer';
import type { TranslationKey } from '@/i18n/translations';
import { getApiErrorUserMessage } from '@/lib/errors/sdk';
import { useMapStore } from '@/store/useMapStore';
import { useAuthStore } from '@/store/useAuthStore';

function MapDataErrorBanner() {
  const { t } = useTranslation();
  const dataErrors = useMapStore((s) => s.dataErrors);
  const hasErrors = Object.values(dataErrors).some(err => err !== null);

  if (!hasErrors) return null;

  return (
    <div role="alert" className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
      <div className="font-semibold">{t('mapDataWarning')}</div>
      <div className="mt-1 text-xs space-y-1">
        {dataErrors.incidents && <div>• Incidents: {dataErrors.incidents}</div>}
        {dataErrors.resources && <div>• Resources: {dataErrors.resources}</div>}
        {dataErrors.infrastructure && <div>• Infrastructure: {dataErrors.infrastructure}</div>}
        {dataErrors.riskBasins && <div>• Risk basins: {dataErrors.riskBasins}</div>}
      </div>
    </div>
  );
}

function RicerMapLoading() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-muted-foreground">
      {t('loadingMap')}
    </div>
  );
}

const RicerMap = dynamic(() => import('@/components/map/RicerMap'), {
  ssr: false,
  loading: () => <RicerMapLoading />,
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

const INCIDENT_STATUS_KEYS: Record<IncidentStatus, TranslationKey> = {
  VIGILANCE: 'statusVigilance',
  ALERTE: 'statusAlerte',
  INTERVENTION: 'statusIntervention',
  MAITRISE: 'statusMaitrise',
  ETEINT: 'statusEteint',
};

const INCIDENT_STATUS_TONES: Record<IncidentStatus, 'success' | 'warning' | 'danger' | 'primary' | 'neutral'> = {
  VIGILANCE: 'warning',
  ALERTE: 'danger',
  INTERVENTION: 'danger',
  MAITRISE: 'primary',
  ETEINT: 'neutral',
};

export default function MapPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<GeoFeatureCollection<GeoIncidentProps>>({ type: 'FeatureCollection', features: [] });
  const [incidentsError, setIncidentsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const selectedIncidentId = useMapStore((s) => s.selectedIncidentId);
  const setSelectedIncidentId = useMapStore((s) => s.setSelectedIncidentId);
  const user = useAuthStore((s) => s.user);

  // Open drawer whenever an incident is selected
  useEffect(() => {
    if (selectedIncidentId) setDrawerOpen(true);
  }, [selectedIncidentId]);

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

  const fetchIncidents = useCallback(async () => {
    setIncidentsError(null);
    try {
      const response = await fetch('/api/geo/incidents');
      const data = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        setIncidents({ type: 'FeatureCollection', features: [] });
        setIncidentsError(getApiErrorUserMessage(data, t('errorServer')));
        return;
      }
      setIncidents(data as GeoFeatureCollection<GeoIncidentProps>);
      setLastUpdated(Date.now());
    } catch {
      setIncidents({ type: 'FeatureCollection', features: [] });
      setIncidentsError(t('connectionError'));
    }
  }, [t]);

  const handleUpdateIncident = async (field: 'status' | 'severity' | 'description', value: IncidentStatus | number | string) => {
    if (!selectedIncidentId) return;

    setUpdateError(null);
    try {
      const response = await fetch(`/api/incidents/${selectedIncidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });

      if (!response.ok) {
        const data = await response.json();
        setUpdateError(data.error?.userMessage || t('errorServer'));
        return;
      }

      // Refresh incidents list
      fetchIncidents();
    } catch {
      setUpdateError(t('connectionError'));
    }
  };

  useEffect(() => {
    fetchWeather();
    fetchIncidents(); // Fetch for KPI cards and incident drawer
  }, [fetchWeather, fetchIncidents]);

  const selectedIncident = useMemo(
    () => (selectedIncidentId ? incidents.features.find((f) => f.properties.id === selectedIncidentId) : undefined),
    [incidents, selectedIncidentId]
  );

  const activeIncidents = useMemo(
    () => incidents.features.filter((f) => f.properties.status !== 'ETEINT').length,
    [incidents]
  );

  const handleDispatchReinforcements = useCallback(() => {
    if (!selectedIncident) return;
    router.push(`/equipment?dispatch=true&incidentId=${selectedIncident.properties.id}`);
  }, [selectedIncident, router]);

  const handleShare = useCallback(async () => {
    if (!selectedIncident) return;
    const shareData = {
      title: `${t('fireIncident')} #${selectedIncident.properties.id.slice(0, 6)}`,
      text: selectedIncident.properties.description ?? '',
      url: `${window.location.origin}/map?selected=${selectedIncident.properties.id}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus(t('shared'));
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus(t('linkCopied'));
      }
      setTimeout(() => setShareStatus(null), 3000);
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [selectedIncident, t]);

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

  const getStatusLabel = (status: IncidentStatus) => t(INCIDENT_STATUS_KEYS[status]);
  const getStatusTone = (status: IncidentStatus) => INCIDENT_STATUS_TONES[status];

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

  const coords = selectedIncident?.geometry?.coordinates as [number, number] | undefined;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      <section className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:p-6">
        {weatherError || incidentsError ? (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {weatherError ?? incidentsError}
          </div>
        ) : null}

        <MapDataErrorBanner />

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
            {lastUpdated ? (
              <Badge tone="neutral">
                {t('lastUpdated')}{' '}
                {new Date(lastUpdated).toLocaleTimeString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Badge>
            ) : null}
            <Button variant="secondary" onClick={fetchIncidents} aria-label="Refresh">
              <Icon name="refresh" aria-hidden={true} size={20} />
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
            icon={<Icon name="warning" aria-hidden={true} size={22} />}
          />
          <KpiCard
            label={t('activeIncidents')}
            value={activeIncidents}
            hint={`${incidents.features.length} total`}
            tone={activeIncidents > 0 ? 'warning' : 'neutral'}
            icon={<Icon name="fire" aria-hidden={true} size={22} />}
          />
          <KpiCard
            label={t('temperature')}
            value={weather && !weatherLoading ? `${weather.temperature}°C` : '—'}
            hint={weatherLoading ? '…' : null}
            tone="neutral"
            icon={<Icon name="thermostat" aria-hidden={true} size={22} />}
          />
          <KpiCard
            label={t('windSpeed')}
            value={weather && !weatherLoading ? `${weather.windSpeed} km/h` : '—'}
            hint={weather && !weatherLoading ? `${windDirectionText} • ${weather.windDirection}°` : weatherLoading ? '…' : null}
            tone="neutral"
            icon={<Icon name="air" aria-hidden={true} size={22} />}
          />
        </div>

        <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-surface shadow-elev-1">
          <RicerMap />
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>MapTiler • MapLibre GL JS • Deck.gl</span>
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

      <RightDrawer
        title={t('incidentDetails')}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setSelectedIncidentId(null);
        }}
      >
        <div className="space-y-5 p-4">
          {!selectedIncident ? (
            <div className="rounded-lg border border-border bg-surface-2 p-4 text-sm text-muted-foreground">
              {t('selectIncident')}
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    #{selectedIncident.properties.id.slice(0, 6)}
                  </div>
                  <div className="mt-1 text-lg font-extrabold tracking-tight">
                    {getStatusLabel(selectedIncident.properties.status)}
                  </div>
                  {coords && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {coords[1].toFixed(4)}, {coords[0].toFixed(4)}
                    </div>
                  )}
                </div>
                <Badge tone={getStatusTone(selectedIncident.properties.status)}>
                  {getStatusLabel(selectedIncident.properties.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('cause')}
                  </div>
                  <div className="mt-2 text-sm font-semibold">{getCauseLabel(selectedIncident.properties.cause)}</div>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Severity
                  </div>
                  <div className="mt-2 text-sm font-semibold">{selectedIncident.properties.severity}/5</div>
                </div>
              </div>

              {selectedIncident.properties.description ? (
                <div className="rounded-lg border border-border bg-surface-2 p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('description')}
                  </div>
                  <div className="mt-2 text-sm">{selectedIncident.properties.description}</div>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Button variant="primary" onClick={handleDispatchReinforcements}>
                  <Icon name="campaign" aria-hidden={true} size={20} />
                  {t('dispatchReinforcements')}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={handleShare}>
                    <Icon name="share" aria-hidden={true} size={20} />
                    {shareStatus || t('share')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/reports-list`)}
                  >
                    <Icon name="open" aria-hidden={true} size={20} />
                    {t('openReport')}
                  </Button>
                </div>
              </div>

              {user?.role === 'OFFICIAL' && (
                <div className="space-y-4 border-t border-border pt-4">
                  <h3 className="font-semibold">{t('manageIncident')}</h3>

                  {/* Status Update */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">{t('updateStatus')}</label>
                    <div className="flex flex-wrap gap-2">
                      {(['VIGILANCE', 'ALERTE', 'INTERVENTION', 'MAITRISE', 'ETEINT'] as IncidentStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleUpdateIncident('status', s)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            selectedIncident.properties.status === s
                              ? 'bg-primary text-white'
                              : 'bg-surface-2 text-foreground hover:bg-surface-3'
                          }`}
                        >
                          {t(INCIDENT_STATUS_KEYS[s])}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severity Update */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">{t('severity')}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={selectedIncident.properties.severity}
                      onChange={(e) => handleUpdateIncident('severity', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="mt-1 text-sm text-muted-foreground">
                      {selectedIncident.properties.severity}/5
                    </div>
                  </div>

                  {updateError && (
                    <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                      {updateError}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </RightDrawer>
    </div>
  );
}
