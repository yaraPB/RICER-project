import { create } from 'zustand';
import type { ViewState } from 'react-map-gl';
import type { Basemap } from '@/lib/map/styles';

type ActiveLayer = 'incidents' | 'infrastructure' | 'resources' | 'riskBasins';

interface MapState {
  viewState: ViewState;
  setViewState: (vs: ViewState) => void;
  activeLayers: Set<ActiveLayer>;
  toggleLayer: (layer: ActiveLayer) => void;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  is3DEnabled: boolean;
  setIs3DEnabled: (enabled: boolean) => void;
  basemap: Basemap;
  setBasemap: (basemap: Basemap) => void;
  isHeatmapEnabled: boolean;
  setIsHeatmapEnabled: (enabled: boolean) => void;
  dataErrors: {
    incidents: string | null;
    resources: string | null;
    infrastructure: string | null;
    riskBasins: string | null;
  };
  setDataError: (layer: keyof MapState['dataErrors'], error: string | null) => void;
  clearAllErrors: () => void;
}

const DEFAULT_VIEW: ViewState = {
  longitude: -5.1056,
  latitude: 33.5275,
  zoom: 13,
  pitch: 0,
  bearing: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
};

export const useMapStore = create<MapState>()((set) => ({
  viewState: DEFAULT_VIEW,
  setViewState: (viewState) => set({ viewState }),
  activeLayers: new Set<ActiveLayer>(['incidents', 'infrastructure', 'resources', 'riskBasins']),
  toggleLayer: (layer) =>
    set((state) => {
      const next = new Set(state.activeLayers);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return { activeLayers: next };
    }),
  selectedIncidentId: null,
  setSelectedIncidentId: (id) => set({ selectedIncidentId: id }),
  is3DEnabled: false,
  setIs3DEnabled: (is3DEnabled) => set({ is3DEnabled }),
  basemap: 'streets' as Basemap,
  setBasemap: (basemap) => set({ basemap }),
  isHeatmapEnabled: false,
  setIsHeatmapEnabled: (isHeatmapEnabled) => set({ isHeatmapEnabled }),
  dataErrors: {
    incidents: null,
    resources: null,
    infrastructure: null,
    riskBasins: null,
  },
  setDataError: (layer, error) =>
    set((state) => ({
      dataErrors: { ...state.dataErrors, [layer]: error },
    })),
  clearAllErrors: () =>
    set({
      dataErrors: {
        incidents: null,
        resources: null,
        infrastructure: null,
        riskBasins: null,
      },
    }),
}));
