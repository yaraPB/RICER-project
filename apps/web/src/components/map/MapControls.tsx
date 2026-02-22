'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useMapStore } from '@/store/useMapStore';
import type { Basemap } from '@/lib/map/styles';
import type { GPUTier } from '@/lib/gpu/detection';

const LAYERS = ['incidents', 'infrastructure', 'resources', 'riskBasins', 'firmsDetections'] as const;

const DISPATCH_LAYERS = ['routes', 'activeTeams', 'isochrones', 'vehicles'] as const;

const LAYER_KEY_MAP: Record<string, string> = {
  incidents: 'layerIncidents',
  infrastructure: 'layerInfrastructure',
  resources: 'layerResources',
  riskBasins: 'layerRiskZones',
  firmsDetections: 'layerFirmsDetections',
  routes: 'layerRoutes',
  activeTeams: 'layerActiveTeams',
  isochrones: 'layerIsochrones',
  vehicles: 'layerVehicles',
};

const LAYER_ICONS: Record<string, string> = {
  incidents: '🔥',
  infrastructure: '🏗️',
  resources: '🚒',
  riskBasins: '⚠️',
  firmsDetections: '🛰️',
  routes: '🗺️',
  activeTeams: '👥',
  isochrones: '⏱️',
  vehicles: '🚒',
};

const BASEMAPS: { value: Basemap; labelKey: string; dot: string }[] = [
  { value: 'streets', labelKey: 'basemapStreets', dot: '#6b7280' },
  { value: 'light', labelKey: 'basemapLight', dot: '#f3f4f6' },
  { value: 'dark', labelKey: 'basemapDark', dot: '#1f2937' },
  { value: 'satellite', labelKey: 'basemapSatellite', dot: '#166534' },
];

const GPU_TIER_CONFIG: Record<GPUTier, { label: string; color: string; bg: string }> = {
  'tier-a': { label: 'A', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  'tier-b': { label: 'B', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  'tier-c': { label: 'C', color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' },
};

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span
        className={`block h-4 w-4 rounded-full bg-white shadow-md ring-0 transition-transform duration-200
          ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 px-0.5">
      {label}
    </div>
  );
}

interface MapControlsProps {
  gpuTier?: GPUTier;
}

export default function MapControls({ gpuTier }: MapControlsProps) {
  const { t } = useTranslation();
  const [panelOpen, setPanelOpen] = useState(true);

  const layers = useMapStore((s) => s.layers);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const is3DEnabled = useMapStore((s) => s.is3DEnabled);
  const setIs3DEnabled = useMapStore((s) => s.setIs3DEnabled);
  const basemap = useMapStore((s) => s.basemap);
  const setBasemap = useMapStore((s) => s.setBasemap);
  const isHeatmapEnabled = useMapStore((s) => s.isHeatmapEnabled);
  const setIsHeatmapEnabled = useMapStore((s) => s.setIsHeatmapEnabled);

  const tierInfo = gpuTier ? GPU_TIER_CONFIG[gpuTier] : null;

  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 max-w-[calc(100vw-1.5rem)] sm:max-w-xs">
      {/* Panel card */}
      <div className="rounded-xl border border-white/10 bg-surface/80 shadow-xl backdrop-blur-md overflow-hidden">
        {/* Header / toggle */}
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-white/5 transition-colors"
          aria-expanded={panelOpen}
        >
          <span className="flex items-center gap-1.5">
            <span>⚙️</span>
            <span>Layers</span>
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{
              transform: panelOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {panelOpen && (
          <div className="border-t border-white/10 px-3 pb-3 pt-2.5 space-y-3">
            {/* ── Basemap ── */}
            <div>
              <SectionHeader label="Basemap" />
              <div className="flex flex-wrap gap-1.5">
                {BASEMAPS.map(({ value, labelKey, dot }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBasemap(value)}
                    aria-pressed={basemap === value}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all border
                      ${basemap === value
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-border bg-surface-2/50 text-foreground hover:border-primary/50'
                      }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full border border-white/30 flex-shrink-0"
                      style={{ backgroundColor: dot }}
                    />
                    {t(labelKey as Parameters<typeof t>[0])}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Visualization ── */}
            <div>
              <SectionHeader label="Visualization" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">{t('toggle3D')}</span>
                  <ToggleSwitch
                    checked={is3DEnabled}
                    onChange={() => setIs3DEnabled(!is3DEnabled)}
                    label={t('toggle3D')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">{t('layerHeatmap' as Parameters<typeof t>[0])}</span>
                  <ToggleSwitch
                    checked={isHeatmapEnabled}
                    onChange={() => setIsHeatmapEnabled(!isHeatmapEnabled)}
                    label={t('layerHeatmap' as Parameters<typeof t>[0])}
                  />
                </div>
              </div>
            </div>

            {/* ── Layers ── */}
            <div>
              <SectionHeader label="Layers" />
              <div className="space-y-2">
                {LAYERS.map((layer) => (
                  <div key={layer} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-foreground">
                      <span>{LAYER_ICONS[layer]}</span>
                      {t(LAYER_KEY_MAP[layer] as Parameters<typeof t>[0])}
                    </span>
                    <ToggleSwitch
                      checked={layers[layer]}
                      onChange={() => toggleLayer(layer)}
                      label={t(LAYER_KEY_MAP[layer] as Parameters<typeof t>[0])}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Dispatch ── */}
            <div>
              <SectionHeader label="Dispatch" />
              <div className="space-y-2">
                {DISPATCH_LAYERS.map((layer) => (
                  <div key={layer} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-foreground">
                      <span>{LAYER_ICONS[layer]}</span>
                      {t(LAYER_KEY_MAP[layer] as Parameters<typeof t>[0])}
                    </span>
                    <ToggleSwitch
                      checked={layers[layer]}
                      onChange={() => toggleLayer(layer)}
                      label={t(LAYER_KEY_MAP[layer] as Parameters<typeof t>[0])}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── GPU tier badge ── */}
            {tierInfo && (
              <div className="pt-1 border-t border-white/10 flex justify-end">
                <span
                  className="text-[10px] font-semibold rounded-full px-2 py-0.5 border"
                  style={{
                    color: tierInfo.color,
                    backgroundColor: tierInfo.bg,
                    borderColor: tierInfo.color + '44',
                  }}
                >
                  GPU: Tier {tierInfo.label}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
