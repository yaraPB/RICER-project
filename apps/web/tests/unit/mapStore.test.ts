import { describe, it, expect, beforeEach } from 'vitest';
import { useMapStore } from '@/store/useMapStore';

describe('useMapStore', () => {
  beforeEach(() => {
    useMapStore.setState({
      viewState: {
        longitude: -5.1056,
        latitude: 33.5275,
        zoom: 13,
        pitch: 0,
        bearing: 0,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
      },
      layers: {
        incidents: true,
        infrastructure: true,
        resources: true,
        riskBasins: true,
        firmsDetections: true,
        routes: true,
        activeTeams: true,
        isochrones: true,
        vehicles: true,
      },
      selectedIncidentId: null,
      is3DEnabled: false,
      basemap: 'streets',
      isHeatmapEnabled: false,
      dataErrors: {
        incidents: null,
        resources: null,
        infrastructure: null,
        riskBasins: null,
        firmsDetections: null,
      },
      incidents: { type: 'FeatureCollection', features: [] },
      lastSuccessfulSync: null,
    });
  });

  describe('defaults', () => {
    it('has Ifrane coordinates in viewState', () => {
      const { viewState } = useMapStore.getState();
      expect(viewState.longitude).toBe(-5.1056);
      expect(viewState.latitude).toBe(33.5275);
      expect(viewState.zoom).toBe(13);
    });

    it('has all 9 layers enabled by default', () => {
      const { layers } = useMapStore.getState();
      const values = Object.values(layers);
      expect(values).toHaveLength(9);
      expect(values.every(Boolean)).toBe(true);
    });

    it('has selectedIncidentId as null', () => {
      expect(useMapStore.getState().selectedIncidentId).toBeNull();
    });

    it('has is3DEnabled as false', () => {
      expect(useMapStore.getState().is3DEnabled).toBe(false);
    });

    it('has basemap as streets', () => {
      expect(useMapStore.getState().basemap).toBe('streets');
    });

    it('has empty incidents collection', () => {
      const { incidents } = useMapStore.getState();
      expect(incidents.type).toBe('FeatureCollection');
      expect(incidents.features).toHaveLength(0);
    });

    it('has lastSuccessfulSync as null', () => {
      expect(useMapStore.getState().lastSuccessfulSync).toBeNull();
    });
  });

  describe('toggleLayer', () => {
    it('toggles incidents off', () => {
      useMapStore.getState().toggleLayer('incidents');
      expect(useMapStore.getState().layers.incidents).toBe(false);
    });

    it('toggles incidents back on', () => {
      useMapStore.getState().toggleLayer('incidents');
      useMapStore.getState().toggleLayer('incidents');
      expect(useMapStore.getState().layers.incidents).toBe(true);
    });

    it('does not affect other layers', () => {
      useMapStore.getState().toggleLayer('incidents');
      expect(useMapStore.getState().layers.infrastructure).toBe(true);
      expect(useMapStore.getState().layers.resources).toBe(true);
    });
  });

  describe('setSelectedIncidentId', () => {
    it('sets a string ID', () => {
      useMapStore.getState().setSelectedIncidentId('inc-123');
      expect(useMapStore.getState().selectedIncidentId).toBe('inc-123');
    });

    it('clears to null', () => {
      useMapStore.getState().setSelectedIncidentId('inc-123');
      useMapStore.getState().setSelectedIncidentId(null);
      expect(useMapStore.getState().selectedIncidentId).toBeNull();
    });
  });

  describe('setIs3DEnabled', () => {
    it('enables 3D', () => {
      useMapStore.getState().setIs3DEnabled(true);
      expect(useMapStore.getState().is3DEnabled).toBe(true);
    });
  });

  describe('setBasemap', () => {
    it('switches to dark basemap', () => {
      useMapStore.getState().setBasemap('dark');
      expect(useMapStore.getState().basemap).toBe('dark');
    });
  });

  describe('setIsHeatmapEnabled', () => {
    it('enables heatmap', () => {
      useMapStore.getState().setIsHeatmapEnabled(true);
      expect(useMapStore.getState().isHeatmapEnabled).toBe(true);
    });
  });

  describe('setDataError / clearAllErrors', () => {
    it('sets an error on a specific layer', () => {
      useMapStore.getState().setDataError('incidents', 'fetch failed');
      expect(useMapStore.getState().dataErrors.incidents).toBe('fetch failed');
    });

    it('clears a single layer error', () => {
      useMapStore.getState().setDataError('incidents', 'fetch failed');
      useMapStore.getState().setDataError('incidents', null);
      expect(useMapStore.getState().dataErrors.incidents).toBeNull();
    });

    it('clearAllErrors resets all to null', () => {
      useMapStore.getState().setDataError('incidents', 'err1');
      useMapStore.getState().setDataError('resources', 'err2');
      useMapStore.getState().clearAllErrors();
      const errors = useMapStore.getState().dataErrors;
      expect(Object.values(errors).every((v) => v === null)).toBe(true);
    });
  });

  describe('setIncidents', () => {
    it('sets incidents collection', () => {
      const collection = {
        type: 'FeatureCollection' as const,
        features: [{ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [0, 0] }, properties: { id: '1' } }],
      };
      useMapStore.getState().setIncidents(collection as any);
      expect(useMapStore.getState().incidents.features).toHaveLength(1);
    });
  });

  describe('setLastSuccessfulSync', () => {
    it('sets a date', () => {
      const now = new Date();
      useMapStore.getState().setLastSuccessfulSync(now);
      expect(useMapStore.getState().lastSuccessfulSync).toBe(now);
    });
  });

  describe('setViewState', () => {
    it('updates viewState', () => {
      const newVs = {
        longitude: 10,
        latitude: 20,
        zoom: 5,
        pitch: 45,
        bearing: 90,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
      };
      useMapStore.getState().setViewState(newVs);
      const vs = useMapStore.getState().viewState;
      expect(vs.longitude).toBe(10);
      expect(vs.latitude).toBe(20);
      expect(vs.pitch).toBe(45);
    });
  });
});
