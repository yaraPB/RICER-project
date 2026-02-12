import { create } from 'zustand';
import type { ViewState } from 'react-map-gl';
import type { Basemap } from '@/lib/map/styles';

type ActiveLayer = 'incidents' | 'infrastructure' | 'resources' | 'riskBasins' | 'firmsDetections' | 'routes' | 'activeTeams' | 'isochrones';

interface MapState {
  viewState: ViewState;
  setViewState: (vs: ViewState) => void;
  // Individual layer visibility flags (more performant than Set)
  layers: {
    incidents: boolean;
    infrastructure: boolean;
    resources: boolean;
    riskBasins: boolean;
    firmsDetections: boolean;
    routes: boolean; // Dispatch routes (MVP)
    activeTeams: boolean; // Active dispatch teams (MVP)
    isochrones: boolean; // Isochrones (reachability polygons)
  };
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
    firmsDetections: string | null;
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
  layers: {
    incidents: true,
    infrastructure: true,
    resources: true,
    riskBasins: true,
    firmsDetections: true,
    routes: true, // Dispatch routes enabled by default
    activeTeams: true, // Active teams enabled by default
    isochrones: true, // Isochrones enabled by default
  },
  toggleLayer: (layer) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: !state.layers[layer],
      },
    })),
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
    firmsDetections: null,
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
        firmsDetections: null,
      },
    }),
}));
