'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useMapStore } from '@/store/useMapStore';
import type { Basemap } from '@/lib/map/styles';

const LAYERS = ['incidents', 'infrastructure', 'resources', 'riskBasins'] as const;

const LAYER_KEY_MAP: Record<string, string> = {
  incidents: 'layerIncidents',
  infrastructure: 'layerInfrastructure',
  resources: 'layerResources',
  riskBasins: 'layerRiskZones',
};

const BASEMAPS: { value: Basemap; labelKey: string }[] = [
  { value: 'streets', labelKey: 'basemapStreets' },
  { value: 'light', labelKey: 'basemapLight' },
  { value: 'dark', labelKey: 'basemapDark' },
  { value: 'satellite', labelKey: 'basemapSatellite' },
];

export default function MapControls() {
  const { t } = useTranslation();
  const activeLayers = useMapStore((s) => s.activeLayers);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const is3DEnabled = useMapStore((s) => s.is3DEnabled);
  const setIs3DEnabled = useMapStore((s) => s.setIs3DEnabled);
  const basemap = useMapStore((s) => s.basemap);
  const setBasemap = useMapStore((s) => s.setBasemap);
  const isHeatmapEnabled = useMapStore((s) => s.isHeatmapEnabled);
  const setIsHeatmapEnabled = useMapStore((s) => s.setIsHeatmapEnabled);

  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
      {/* Basemap selector */}
      <div className="flex flex-wrap overflow-hidden rounded-lg border border-border shadow-elev-1">
        {BASEMAPS.map(({ value, labelKey }) => (
          <button
            key={value}
            type="button"
            className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
              basemap === value
                ? 'bg-primary text-white'
                : 'bg-surface text-foreground hover:bg-surface-2'
            }`}
            onClick={() => setBasemap(value)}
          >
            {t(labelKey as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

      {/* Mode toggles */}
      <div className="flex gap-1.5">
        <button
          type="button"
          className={`flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold shadow-elev-1 transition-colors ${
            is3DEnabled
              ? 'bg-primary text-white'
              : 'bg-surface text-foreground hover:bg-surface-2'
          }`}
          onClick={() => setIs3DEnabled(!is3DEnabled)}
        >
          {t('toggle3D')}
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold shadow-elev-1 transition-colors ${
            isHeatmapEnabled
              ? 'bg-primary text-white'
              : 'bg-surface text-foreground hover:bg-surface-2'
          }`}
          onClick={() => setIsHeatmapEnabled(!isHeatmapEnabled)}
          title={t('layerHeatmap' as Parameters<typeof t>[0])}
        >
          {t('layerHeatmap' as Parameters<typeof t>[0])}
        </button>
      </div>

      {/* Layer toggles */}
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-2 shadow-elev-1">
        {LAYERS.map((layer) => (
          <label
            key={layer}
            className="flex cursor-pointer items-center gap-2 text-xs"
          >
            <input
              type="checkbox"
              checked={activeLayers.has(layer)}
              onChange={() => toggleLayer(layer)}
              className="accent-primary"
            />
            <span className="text-foreground">
              {t(LAYER_KEY_MAP[layer] as Parameters<typeof t>[0])}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
