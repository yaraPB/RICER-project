'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '@/hooks/useTranslation';
import { IFRANE_COORDINATES, STATUS_COLORS } from '@/utils/constants';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create custom colored markers
const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

export default function FireMap() {
  const { t, language } = useTranslation();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
    // Refresh every 30 seconds to show new reports
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
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

  if (loading) {
    return <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">{t('loadingMap')}</div>;
  }

  return (
    <div className="relative">
      <MapContainer
        center={[IFRANE_COORDINATES.lat, IFRANE_COORDINATES.lng]}
        zoom={13}
        style={{ height: '600px', width: '100%' }}
        className="rounded-lg shadow-lg z-0"
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

          return (
            <Marker
              key={`${report.id}-${language}`}
              position={[report.latitude, report.longitude]}
              icon={createColoredIcon(STATUS_COLORS[report.status])}
            >
              <Popup>
                <div className="text-right" dir="rtl">
                  <div className="font-bold mb-2">
                    {language === 'ar' ? 'حريق' : 'Incendie'}
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">
                        {language === 'ar' ? 'الحالة:' : 'Statut:'}
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
                          {language === 'ar' ? 'السبب:' : 'Cause:'}
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
                        {language === 'ar' ? 'المبلّغ:' : 'Signalé par:'}
                      </span>{' '}
                      {report.user?.cin}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {formattedDate}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <div className="text-sm font-bold mb-3 text-right">
          {language === 'ar' ? 'دليل الألوان' : 'Guide des couleurs'}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: STATUS_COLORS.PENDING }}
            ></div>
            <span className="text-sm">{t('pending')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: STATUS_COLORS.IN_PROGRESS }}
            ></div>
            <span className="text-sm">{t('inProgress')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: STATUS_COLORS.COMPLETED }}
            ></div>
            <span className="text-sm">{t('completed')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
