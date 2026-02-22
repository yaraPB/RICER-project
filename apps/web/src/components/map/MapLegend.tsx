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
  { key: 'high', color: FIRMS_CONFIDENCE_COLORS.high, label: 'firmsConfidenceHigh', size: 'h-4 w-4' },
  { key: 'nominal', color: FIRMS_CONFIDENCE_COLORS.nominal, label: 'firmsConfidenceNominal', size: 'h-3 w-3' },
  { key: 'low', color: FIRMS_CONFIDENCE_COLORS.low, label: 'firmsConfidenceLow', size: 'h-2 w-2' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
      {children}
    </div>
  );
}

export default function MapLegend() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-10 rounded-xl border border-white/10 bg-surface/80 shadow-xl backdrop-blur-md overflow-hidden min-w-[180px]">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-white/5 transition-colors"
        aria-expanded={!collapsed}
        aria-controls="legend-content"
      >
        <span>{t('mapLegend')}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {!collapsed && (
        <div id="legend-content" className="border-t border-white/10 px-3 pb-3 pt-2.5 space-y-3">
          {/* ── Incident Status ── */}
          <div>
            <SectionLabel>{t('incidentStatus')}</SectionLabel>
            <div className="space-y-1.5">
              {INCIDENT_COLORS.map(({ key, color, label }) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  {key !== 'ETEINT' ? (
                    <span className="relative flex h-3 w-3 flex-shrink-0">
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className="relative inline-flex h-3 w-3 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    </span>
                  ) : (
                    <span
                      className="h-3 w-3 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  <span>{t(label as TranslationKey)}</span>
                </div>
              ))}
            </div>
            {/* Severity scale */}
            <div className="mt-2">
              <div className="text-[9px] text-muted-foreground/70 mb-1">Severity scale</div>
              <div className="flex gap-0.5 items-end">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className="rounded-sm flex-1"
                    style={{
                      height: `${s * 4}px`,
                      backgroundColor: INCIDENT_STATUS_COLORS.INTERVENTION,
                      opacity: 0.4 + s * 0.12,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Resource Types ── */}
          <div>
            <SectionLabel>{t('resources')}</SectionLabel>
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

          {/* ── Risk Levels ── */}
          <div>
            <SectionLabel>{t('riskLevels')}</SectionLabel>
            <div className="space-y-1">
              {RISK_LEVELS.map(({ level, color, label }) => (
                <div key={level} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-3 w-8 border border-white/30 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: color, opacity: 0.7 }}
                  />
                  <span>{t(label as TranslationKey)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── FIRMS Detections ── */}
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <SectionLabel>{t('firmsDetections')}</SectionLabel>
              <span className="text-[9px] text-muted-foreground italic -mt-1.5">(NASA)</span>
            </div>

            {/* FRP gradient bar */}
            <div className="mb-2">
              <div className="text-[9px] text-muted-foreground/70 mb-1">Fire Radiative Power</div>
              <div
                className="h-2 w-full rounded-full"
                style={{ background: 'linear-gradient(to right, #fef3c7, #f59e0b, #dc2626, #991b1b)' }}
              />
              <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                <span>0 MW</span>
                <span>50</span>
                <span>100</span>
                <span>200+ MW</span>
              </div>
            </div>

            {/* Confidence with size-varying dots */}
            <div className="space-y-1.5">
              {FIRMS_CONFIDENCE_ITEMS.map(({ key, color, label, size }) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div className="flex h-4 w-4 items-center justify-center flex-shrink-0">
                    <div
                      className={`${size} rounded-full border-2 border-white shadow-sm`}
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <span>{t(label as TranslationKey)}</span>
                </div>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
              <div className="text-[10px] text-muted-foreground leading-relaxed">
                • {t('firmsLegendSize')}
              </div>
              <div className="text-[10px] text-muted-foreground leading-relaxed">
                • {t('firmsLegendRecent')}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-muted-foreground italic leading-relaxed">
              {t('firmsDataSource')}
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-muted-foreground italic leading-relaxed">
              💡 {t('firmsClusterHelp')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
