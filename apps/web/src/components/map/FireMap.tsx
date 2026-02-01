'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '@/hooks/useTranslation';
import { IFRANE_COORDINATES, STATUS_COLORS } from '@/utils/constants';
import type { Report } from '@/types';
import type { TranslationKey } from '@/utils/translations';

const iconProto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
delete iconProto._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createColoredIcon = (color: string, isSelected: boolean) => {
  const size = isSelected ? 34 : 30;
  const borderWidth = isSelected ? 4 : 3;
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: ${borderWidth}px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.28);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [Math.round(size / 2), size],
  });
};

export type FireMapProps = {
  reports: Report[];
  loading: boolean;
  selectedReportId: string | null;
  onSelectReport: (reportId: string) => void;
};

export default function FireMap({ reports, loading, selectedReportId, onSelectReport }: FireMapProps) {
  const { t, language } = useTranslation();

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

  const markerIcons = useMemo(() => {
    return {
      pending: createColoredIcon(STATUS_COLORS.PENDING, false),
      inProgress: createColoredIcon(STATUS_COLORS.IN_PROGRESS, false),
      completed: createColoredIcon(STATUS_COLORS.COMPLETED, false),
      pendingSelected: createColoredIcon(STATUS_COLORS.PENDING, true),
      inProgressSelected: createColoredIcon(STATUS_COLORS.IN_PROGRESS, true),
      completedSelected: createColoredIcon(STATUS_COLORS.COMPLETED, true),
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-2 text-sm text-muted-foreground">
        {t('loadingMap')}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[IFRANE_COORDINATES.lat, IFRANE_COORDINATES.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0 h-full w-full"
        key={language}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((report) => {
          const formattedDate = new Date(report.createdAt).toLocaleString(
            language === 'ar' ? 'ar-MA' : 'fr-FR',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }
          );

          const isSelected = selectedReportId === report.id;
          const icon =
            report.status === 'PENDING'
              ? isSelected
                ? markerIcons.pendingSelected
                : markerIcons.pending
              : report.status === 'IN_PROGRESS'
                ? isSelected
                  ? markerIcons.inProgressSelected
                  : markerIcons.inProgress
                : isSelected
                  ? markerIcons.completedSelected
                  : markerIcons.completed;

          return (
            <Marker
              key={`${report.id}-${language}`}
              position={[report.latitude, report.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectReport(report.id),
              }}
            >
              <Popup>
                <div className="text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <div className="mb-2 font-bold">
                    {t('fireIncident')} • #{report.id.slice(0, 6)}
                  </div>
                  <div className="space-y-1">
                    <div>
                      <span className="font-medium">
                        {t('status')}:
                      </span>{' '}
                      <span
                        style={{ color: STATUS_COLORS[report.status] }}
                        className="font-bold"
                      >
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                    {report.cause && (
                      <div>
                        <span className="font-medium">
                          {t('cause')}:
                        </span>{' '}
                        {getCauseLabel(report.cause)}
                      </div>
                    )}
                    {report.description && (
                      <div>
                        <span className="font-medium">
                          {t('description')}:
                        </span>{' '}
                        {report.description}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">
                        {t('reporter')}:
                      </span>{' '}
                      {report.user?.cin}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {formattedDate}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div
        className="pointer-events-auto absolute bottom-4 left-4 z-[1000] rounded-lg border border-border bg-surface/90 p-3 shadow-elev-1 backdrop-blur-sm"
        aria-label={t('legend')}
      >
        <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          {t('legend')}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: STATUS_COLORS.PENDING }} />
            <span>{t('pending')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS.IN_PROGRESS }}
            />
            <span>{t('inProgress')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS.COMPLETED }}
            />
            <span>{t('completed')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
