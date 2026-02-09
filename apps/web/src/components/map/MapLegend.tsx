'use client';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n/translations';
import { INCIDENT_STATUS_COLORS, RESOURCE_TYPE_COLORS, FIRMS_CONFIDENCE_COLORS } from '@/lib/map/colors';

const INCIDENT_COLORS = [
  { key: 'VIGILANCE', color: INCIDENT_STATUS_COLORS.VIGILANCE, label: 'statusVigilance' },
  { key: 'ALERTE', color: INCIDENT_STATUS_COLORS.ALERTE, label: 'statusAlerte' },
  { key: 'INTERVENTION', color: INCIDENT_STATUS_COLORS.INTERVENTION, label: 'statusIntervention' },
  { key: 'MAITRISE', color: INCIDENT_STATUS_COLORS.MAITRISE, label: 'statusMaitrise' },
  { key: 'ETEINT', color: INCIDENT_STATUS_COLORS.ETEINT, label: 'statusEteint' },
];

const RESOURCE_COLORS = [
  { key: 'TRUCK', color: RESOURCE_TYPE_COLORS.TRUCK, label: 'resourceTruck' },
  { key: 'AIRCRAFT', color: RESOURCE_TYPE_COLORS.AIRCRAFT, label: 'resourceAircraft' },
  { key: 'PERSONNEL', color: RESOURCE_TYPE_COLORS.PERSONNEL, label: 'resourcePersonnel' },
  { key: 'EQUIPMENT', color: RESOURCE_TYPE_COLORS.EQUIPMENT, label: 'resourceEquipment' },
];

const RISK_LEVELS = [
  { level: 1, color: '#22c55e', label: 'riskLevel1' },
  { level: 2, color: '#f59e0b', label: 'riskLevel2' },
  { level: 3, color: '#f97316', label: 'riskLevel3' },
  { level: 4, color: '#ef4444', label: 'riskLevel4' },
  { level: 5, color: '#991b1b', label: 'riskLevel5' },
];

const FIRMS_CONFIDENCE_ITEMS = [
  { key: 'high', color: FIRMS_CONFIDENCE_COLORS.high, label: 'firmsConfidenceHigh' },
  { key: 'nominal', color: FIRMS_CONFIDENCE_COLORS.nominal, label: 'firmsConfidenceNominal' },
  { key: 'low', color: FIRMS_CONFIDENCE_COLORS.low, label: 'firmsConfidenceLow' },
];

export default function MapLegend() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-10 rounded-lg border border-border bg-surface shadow-lg">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between gap-2 p-3 text-sm font-semibold hover:bg-hover transition-colors"
        aria-expanded={!collapsed}
        aria-controls="legend-content"
      >
        <span>{t('mapLegend')}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {!collapsed && (
        <div id="legend-content" className="space-y-3 px-3 pb-3">
          {/* Incident Status */}
          <div>
            <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('incidentStatus')}
            </div>
            <div className="space-y-1">
              {INCIDENT_COLORS.map(({ key, color, label }) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-3 w-3 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span>{t(label as TranslationKey)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Types */}
          <div>
            <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('resources')}
            </div>
            <div className="space-y-1">
              {RESOURCE_COLORS.map(({ key, color, label }) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-3 w-3 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span>{t(label as TranslationKey)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Levels */}
          <div>
            <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('riskLevels')}
            </div>
            <div className="space-y-1">
              {RISK_LEVELS.map(({ level, color, label }) => (
                <div key={level} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-3 w-8 border border-white/50 flex-shrink-0"
                    style={{ backgroundColor: color, opacity: 0.6 }}
                  />
                  <span>{t(label as TranslationKey)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FIRMS Satellite Detections */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('firmsDetections')}
              </div>
              <div className="text-[10px] text-muted-foreground italic">
                (NASA)
              </div>
            </div>
            <div className="space-y-1.5">
              {FIRMS_CONFIDENCE_ITEMS.map(({ key, color, label }) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span>{t(label as TranslationKey)}</span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  • {t('firmsLegendSize')}
                </div>
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  • {t('firmsLegendRecent')}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-border/50 text-[9px] text-muted-foreground italic leading-relaxed">
                {t('firmsDataSource')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
