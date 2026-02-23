'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import ReactMapGL, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  ScaleControl,
  GeolocateControl,
  useControl,
  type MapRef,
  type MapLayerMouseEvent,
} from 'react-map-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { MapboxOverlayProps } from '@deck.gl/mapbox/typed';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '@/store/useMapStore';
import { useDispatchStore } from '@/store/useDispatchStore';
import MapControls from '@/components/map/MapControls';
import MapLegend from './MapLegend';
import { useTranslation } from '@/hooks/useTranslation';
import { getMapStyle, HAS_PREMIUM_TILES } from '@/lib/map/styles';
import { INCIDENT_STATUS_COLORS, FIRMS_CONFIDENCE_COLORS } from '@/lib/map/colors';
import { asGeoJSON } from '@/lib/map/helpers';
import { logger } from '@/lib/observability/logger';
import { createResourceLayer, createInfrastructureLayers, createIncidentPulseLayer } from '@/lib/map/layers';
import {
  createRouteLayer,
  createActiveTeamsLayer,
  createDispatchArcLayer,
  createVehicleLayer,
  transformRouteToLayerData,
  transformTeamToLayerData,
  transformVehicleToLayerData,
} from '@/lib/map/dispatchLayers';
import { detectGPUCapabilities, type GPUTier } from '@/lib/gpu/detection';
import { getLayerConfigForTier } from '@/lib/map/performanceLayers';
import type {
  GeoFeatureCollection,
  GeoIncidentProps,
  GeoResourceProps,
  GeoInfrastructureProps,
  RiskBasinProps,
  GeoFirmsDetectionProps,
  GeoVehicleProps,
} from '@/types';

/* ────────── helpers ────────── */

/**
 * Format time ago from date (e.g., "2 minutes ago", "1 hour ago")
 */
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ────────── stable empty refs ────────── */

const EMPTY_RESOURCES: GeoFeatureCollection<GeoResourceProps> = { type: 'FeatureCollection', features: [] };
const EMPTY_INFRASTRUCTURE: GeoFeatureCollection<GeoInfrastructureProps> = { type: 'FeatureCollection', features: [] };
const EMPTY_RISK_BASINS: GeoFeatureCollection<RiskBasinProps> = { type: 'FeatureCollection', features: [] };
const EMPTY_FIRMS: GeoFeatureCollection<GeoFirmsDetectionProps> = { type: 'FeatureCollection', features: [] };
const EMPTY_VEHICLES: GeoFeatureCollection<GeoVehicleProps> = { type: 'FeatureCollection', features: [] };

/* ────────── component ────────── */

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl(() => new (MapboxOverlay as any)(props));
  overlay.setProps(props);
  return null;
}

export default function RicerMap() {
  const { t } = useTranslation();
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* store */
  const viewState = useMapStore((s) => s.viewState);
  const setViewState = useMapStore((s) => s.setViewState);
  const layers = useMapStore((s) => s.layers);
  const selectedIncidentId = useMapStore((s) => s.selectedIncidentId);
  const setSelectedIncidentId = useMapStore((s) => s.setSelectedIncidentId);
  const is3DEnabled = useMapStore((s) => s.is3DEnabled);
  const basemap = useMapStore((s) => s.basemap);
  const isHeatmapEnabled = useMapStore((s) => s.isHeatmapEnabled);
  const setDataError = useMapStore((s) => s.setDataError);
  const storeIncidents = useMapStore((s) => s.incidents);
  const setStoreIncidents = useMapStore((s) => s.setIncidents);
  const setLastSuccessfulSync = useMapStore((s) => s.setLastSuccessfulSync);

  /* dispatch store */
  const activeRoutes = useDispatchStore((s) => s.activeRoutes);
  const selectedTeams = useDispatchStore((s) => s.selectedTeams);

  /* local state — incidents live in the store (shared with map/page.tsx) */
  const incidents = storeIncidents;
  const setIncidents = setStoreIncidents;
  const [resources, setResources] = useState(EMPTY_RESOURCES);
  const [infrastructure, setInfrastructure] = useState(EMPTY_INFRASTRUCTURE);
  const [riskBasins, setRiskBasins] = useState(EMPTY_RISK_BASINS);
  const [firmsDetections, setFirmsDetections] = useState(EMPTY_FIRMS);
  const [firmsLastUpdate, setFirmsLastUpdate] = useState<Date | null>(null);
  const [hoveredIncident, setHoveredIncident] = useState<{
    id: string;
    properties: GeoIncidentProps;
    coordinates: [number, number];
  } | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number;
    latitude: number;
    layer: string;
    feature: any;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gpuTier, setGpuTier] = useState<GPUTier>('tier-c'); // Start with safest tier
  const [isochroneData, setIsochroneData] = useState<any | null>(null);
  const [vehiclesData, setVehiclesData] = useState(EMPTY_VEHICLES);

  const prevIs3D = useRef(is3DEnabled);

  // Memoize the GPU tier config so it doesn't recompute on every render
  const tierConfig = useMemo(() => getLayerConfigForTier(gpuTier), [gpuTier]);

  // Animation state for pulsing effects (Tier A/B only)
  const [pulsePhase, setPulsePhase] = useState(0);
  const phaseRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  /* ═══════════ GPU Detection (non-blocking) ═══════════ */

  useEffect(() => {
    // Detect GPU capabilities asynchronously, never blocks map boot
    detectGPUCapabilities(2000).then((capabilities) => {
      setGpuTier(capabilities.tier);
      console.info('[Map] GPU tier set:', capabilities.tier, capabilities);
    }).catch((error) => {
      console.error('[Map] GPU detection error, using Tier C:', error);
      setGpuTier('tier-c');
    });
  }, []);

  /* ═══════════ Animation loop (Tier A/B only) ═══════════ */

  useEffect(() => {
    if (!tierConfig.enableAnimations) return;
    const CYCLE = 2500; // ms for one full pulse cycle
    const tick = () => {
      phaseRef.current = (Date.now() % CYCLE) / CYCLE;
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    // Flush ref → state at ~10fps (visually identical for slow sinusoidal pulse)
    const flushInterval = setInterval(() => setPulsePhase(phaseRef.current), 100);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearInterval(flushInterval);
    };
  }, [tierConfig.enableAnimations]);

  /* ═══════════ Isochrone fetch ═══════════ */

  useEffect(() => {
    // Clear isochrones when layer is toggled off or incident is deselected
    if (!layers.isochrones || !selectedIncidentId) {
      setIsochroneData(null);
      return;
    }

    const feature = incidents.features.find(
      (f) => f.properties.id === selectedIncidentId,
    );
    if (!feature) {
      setIsochroneData(null);
      return;
    }

    const coords = feature.geometry.coordinates as [number, number];
    let cancelled = false;

    fetch('/api/dispatch/isochrones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: coords,
        profile: 'fire_truck',
        times: [10, 20, 30],
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setIsochroneData(data);
      })
      .catch(() => {
        if (!cancelled) setIsochroneData(null);
      });

    return () => {
      cancelled = true;
    };
  // Only refetch when incident selection or layer visibility changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIncidentId, layers.isochrones]);

  /* ═══════════ Data fetching — per-source intervals, tier-aware ═══════════ */

  useEffect(() => {
    let cancelled = false;
    let resourcesDisabled = false;
    const abortController = new AbortController();

    async function fetchIncidents() {
      if (cancelled) return;
      try {
        const res = await fetch('/api/geo/incidents', { signal: abortController.signal });
        if (!res.ok) {
          setDataError('incidents', `HTTP ${res.status}`);
          return;
        }
        const data = await res.json();
        setIncidents(data);
        setLastSuccessfulSync(new Date());
        setDataError('incidents', null);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setDataError('incidents', 'Network error');
      }
    }

    async function fetchResources() {
      if (cancelled || resourcesDisabled) return;
      try {
        const res = await fetch('/api/geo/resources', { signal: abortController.signal });
        if (!res.ok) {
          if (res.status === 403) {
            setDataError('resources', null);
            resourcesDisabled = true;
            return;
          }
          setDataError('resources', `HTTP ${res.status}`);
          return;
        }
        const data = await res.json();
        setResources(data);
        setLastSuccessfulSync(new Date());
        setDataError('resources', null);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setDataError('resources', 'Network error');
      }
    }

    async function fetchStatic() {
      if (cancelled) return;
      try {
        const [infraRes, riskRes] = await Promise.allSettled([
          fetch('/api/geo/infrastructure', { signal: abortController.signal }).then((r) =>
            r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`),
          ),
          fetch('/api/geo/risk-basins', { signal: abortController.signal }).then((r) =>
            r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`),
          ),
        ]);
        if (infraRes.status === 'fulfilled') {
          setInfrastructure(infraRes.value);
          setDataError('infrastructure', null);
        } else {
          const reason = String(infraRes.reason);
          if (!reason.includes('AbortError')) setDataError('infrastructure', reason);
        }
        if (riskRes.status === 'fulfilled') {
          setRiskBasins(riskRes.value);
          setDataError('riskBasins', null);
        } else {
          const reason = String(riskRes.reason);
          if (!reason.includes('AbortError')) setDataError('riskBasins', reason);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Failed to fetch static data:', error);
      }
    }

    async function fetchFirms() {
      if (cancelled) return;
      try {
        // If there was a previous FIRMS error, ask the server to reset the circuit breaker
        const hadError = useMapStore.getState().dataErrors.firmsDetections !== null;
        const firmsUrl = hadError ? '/api/detections/combined?reset=true' : '/api/detections/combined';
        const res = await fetch(firmsUrl, { signal: abortController.signal });
        if (!res.ok) {
          const errorText = await res.text().catch(() => '');
          setDataError('firmsDetections', `HTTP ${res.status}: ${errorText.slice(0, 50)}`);
          logger.warn({ event: 'firms_fetch_error', meta: { status: res.status, error: errorText.slice(0, 100) } });
          return;
        }
        const data = await res.json();
        setFirmsDetections(data);
        setFirmsLastUpdate(new Date());
        setLastSuccessfulSync(new Date());
        setDataError('firmsDetections', null);
        logger.info({ event: 'firms_fetch_success_frontend', meta: { detections: data.features?.length || 0 } });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        const errorMsg = error instanceof Error ? error.message : 'Network error';
        setDataError('firmsDetections', errorMsg);
        logger.error({ event: 'firms_fetch_exception', meta: { error: errorMsg } });
      }
    }

    let vehiclesDisabled = false;
    async function fetchVehicles() {
      if (cancelled || vehiclesDisabled) return;
      try {
        const res = await fetch('/api/geo/vehicles', { signal: abortController.signal });
        if (!res.ok) {
          if (res.status === 403) { vehiclesDisabled = true; return; }
          return;
        }
        const data = await res.json();
        setVehiclesData(data);
        setLastSuccessfulSync(new Date());
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }

    // Initial fetch
    fetchIncidents();
    fetchResources();
    fetchVehicles();
    fetchStatic();
    fetchFirms();

    // Per-source intervals using tier-aware durations
    const incidentInterval = setInterval(fetchIncidents, tierConfig.pollingInterval.incidents);
    const resourceInterval = setInterval(fetchResources, tierConfig.pollingInterval.resources);
    const vehicleInterval = setInterval(fetchVehicles, tierConfig.pollingInterval.resources);
    const firmsInterval = setInterval(fetchFirms, tierConfig.pollingInterval.firms);

    return () => {
      cancelled = true;
      abortController.abort();
      clearInterval(incidentInterval);
      clearInterval(resourceInterval);
      clearInterval(vehicleInterval);
      clearInterval(firmsInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setDataError, setLastSuccessfulSync, tierConfig.pollingInterval.incidents, tierConfig.pollingInterval.resources, tierConfig.pollingInterval.firms]);

  /* ═══════════ Fly-to on incident selection ═══════════ */

  useEffect(() => {
    if (!selectedIncidentId || !mapRef.current) return;
    const feature = incidents.features.find(
      (f) => f.properties.id === selectedIncidentId,
    );
    if (!feature) return;
    const coords = feature.geometry.coordinates as [number, number];
    mapRef.current.flyTo({
      center: coords,
      zoom: Math.max(viewState.zoom ?? 13, 15),
      duration: 1500,
      essential: true,
    });
    // Only react to selection changes, not incident data refreshes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIncidentId]);

  /* ═══════════ 3D toggle ═══════════ */

  useEffect(() => {
    if (prevIs3D.current !== is3DEnabled) {
      prevIs3D.current = is3DEnabled;
      setViewState({ ...viewState, pitch: is3DEnabled ? 50 : 0 });
    }
  }, [is3DEnabled, setViewState, viewState]);

  /* ═══════════ Terrain + Fog (3D mode) ═══════════ */

  useEffect(() => {
    const map = mapRef.current?.getMap() as any;
    if (!map) return;
    const apply = () => {
      if (is3DEnabled) {
        map.setTerrain({ source: 'terrain-dem', exaggeration: 1.5 });
        map.setFog({
          color: 'rgb(220, 230, 240)',
          'high-color': 'rgb(80, 130, 200)',
          'horizon-blend': 0.04,
          'space-color': 'rgb(8, 8, 20)',
          'star-intensity': 0.5,
        });
      } else {
        map.setTerrain(null);
        map.setFog({});
      }
    };
    if (map.isStyleLoaded()) {
      apply();
    } else {
      map.once('style.load', apply);
    }
  }, [is3DEnabled]);

  /* ═══════════ Fullscreen ═══════════ */

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  /* ═══════════ Prepared GeoJSON ═══════════ */

  const incidentSourceData = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: (layers.incidents ? incidents.features : []).map((f) => ({
      type: 'Feature' as const,
      geometry: f.geometry,
      properties: {
        ...f.properties,
        color: INCIDENT_STATUS_COLORS[f.properties.status] ?? '#6b7280',
        isActive: f.properties.status !== 'ETEINT' ? 1 : 0,
      },
    })),
  }), [incidents.features, layers.incidents]);

  const heatmapData = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: incidents.features.map((f) => ({
      type: 'Feature' as const,
      geometry: f.geometry,
      properties: { severity: f.properties.severity },
    })),
  }), [incidents.features]);

  /* ═══════════ Deck.gl layers — split into static + dispatch ═══════════ */

  // Shared route transform — used by both dispatchDeckLayers and animatedDeckLayers
  const routeLayerData = useMemo(
    () => activeRoutes.map((r) => transformRouteToLayerData(r.route, r.routeId, true)),
    [activeRoutes]
  );

  // Static layers: resources + infrastructure — only recomputes when data or tier changes
  const staticDeckLayers = useMemo(() => {
    // Tier C: use MapLibre native layers only; skip deck.gl
    if (!tierConfig.useDeckGL) return [];

    const list: any[] = [];
    const resourceLayer = createResourceLayer(resources, layers.resources);
    if (resourceLayer) list.push(resourceLayer);
    const infraLayers = createInfrastructureLayers(infrastructure, layers.infrastructure);
    list.push(...infraLayers);
    return list;
  }, [tierConfig.useDeckGL, resources, infrastructure, layers.resources, layers.infrastructure]);

  // Dispatch layers: routes + teams — recomputes only when dispatch state changes
  const dispatchDeckLayers = useMemo(() => {
    const list: any[] = [];

    const routeLayer = createRouteLayer(routeLayerData, layers.routes, pulsePhase);
    if (routeLayer) list.push(routeLayer);

    const activeTeamsData = selectedTeams
      .filter((team) => team.location && team.location.coordinates)
      .map((team) => transformTeamToLayerData(team));
    const activeTeamsLayer = createActiveTeamsLayer(activeTeamsData, layers.activeTeams);
    if (activeTeamsLayer) list.push(activeTeamsLayer);

    // Vehicle layer
    const vehicleLayerData = vehiclesData.features
      .filter((f) => f.geometry && f.geometry.coordinates)
      .map((f) => transformVehicleToLayerData({
        id: f.properties.id,
        callSign: f.properties.callSign,
        type: f.properties.type,
        status: f.properties.status,
        location: f.geometry as { type: 'Point'; coordinates: [number, number] },
      }));
    const vehicleLayer = createVehicleLayer(vehicleLayerData, layers.vehicles);
    if (vehicleLayer) list.push(vehicleLayer);

    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers.routes, layers.activeTeams, layers.vehicles, routeLayerData, selectedTeams, vehiclesData, pulsePhase]);

  // Animated layers: pulse + arcs — only on Tier A/B
  const animatedDeckLayers = useMemo(() => {
    if (!tierConfig.enableAnimations || !tierConfig.useDeckGL) return [];
    const list: any[] = [];

    const pulseLayer = createIncidentPulseLayer(incidents, pulsePhase, layers.incidents);
    if (pulseLayer) list.push(pulseLayer);

    const arcLayer = createDispatchArcLayer(routeLayerData, layers.routes);
    if (arcLayer) list.push(arcLayer);

    return list;
  }, [incidents, pulsePhase, layers.incidents, layers.routes, routeLayerData, tierConfig.enableAnimations, tierConfig.useDeckGL]);

  const deckLayers = useMemo(
    () => [...staticDeckLayers, ...dispatchDeckLayers, ...animatedDeckLayers],
    [staticDeckLayers, dispatchDeckLayers, animatedDeckLayers]
  );

  /* ═══════════ Click handler ═══════════ */

  const handleClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const features = event.features;
      if (!features || features.length === 0) return;
      const feature = features[0];
      if (!feature?.properties) return;

      if (feature.properties.cluster) {
        const geom = feature.geometry as { coordinates?: number[] };
        const coords = geom?.coordinates;
        if (
          coords &&
          typeof coords[0] === 'number' &&
          typeof coords[1] === 'number'
        ) {
          mapRef.current?.flyTo({
            center: [coords[0], coords[1]],
            zoom: (viewState.zoom ?? 13) + 2,
            duration: 800,
          });
        }
        return;
      }

      if (feature.properties.id) {
        setSelectedIncidentId(feature.properties.id as string);
        setHoveredIncident(null);
      }
    },
    [viewState, setSelectedIncidentId],
  );

  /* ═══════════ Hover handlers with debouncing ═══════════ */

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((event: MapLayerMouseEvent) => {
    // Clear any pending hover updates
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Debounce hover state updates by 100ms
    hoverTimeoutRef.current = setTimeout(() => {
      const features = event.features;
      if (!features || features.length === 0) {
        setHoverInfo(null);
        setHoveredIncident(null);
        return;
      }
      const feature = features[0];
      if (!feature?.properties) return;

      const geom = feature.geometry as { coordinates?: number[] };
      const coords = geom?.coordinates;
      if (
        !coords ||
        typeof coords[0] !== 'number' ||
        typeof coords[1] !== 'number'
      )
        return;

      // Handle cluster hover
      if (feature.properties.cluster) {
        setHoverInfo({
          longitude: coords[0],
          latitude: coords[1],
          layer: feature.layer?.id || '',
          feature,
        });
        setHoveredIncident(null);
        return;
      }

      // Handle FIRMS detections
      if (feature.layer?.id === 'firms-detections-unclustered') {
        setHoverInfo({
          longitude: coords[0],
          latitude: coords[1],
          layer: 'firms-detections-unclustered',
          feature,
        });
        setHoveredIncident(null);
        return;
      }

      // Handle incident hover (existing logic)
      if (feature.properties.id && feature.layer?.id === 'incidents-unclustered') {
        setHoveredIncident({
          id: feature.properties.id as string,
          properties: feature.properties as unknown as GeoIncidentProps,
          coordinates: [coords[0], coords[1]],
        });
        setHoverInfo(null);
      }
    }, 100);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Clear pending hover updates
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Immediately clear hover state on leave
    setHoveredIncident(null);
    setHoverInfo(null);
  }, []);

  /* ═══════════ Map style ═══════════ */

  const mapStyle = useMemo(() => getMapStyle(basemap), [basemap]);

  /* ═══════════ Render ═══════════ */

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      data-ricer-map-ready="true"
    >
      <ReactMapGL
        ref={mapRef}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapStyle={mapStyle as any}
        onClick={handleClick}
        interactiveLayerIds={[
          'incidents-unclustered',
          'incidents-cluster',
          'firms-detections-unclustered',
          'firms-cluster',
        ]}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ width: '100%', height: '100%' }}
        maxPitch={85}
        attributionControl={true}
      >
        {/* ═══ Terrain DEM source ═══ */}
        <Source
          id="terrain-dem"
          type="raster-dem"
          tiles={[
            HAS_PREMIUM_TILES
              ? `https://api.maptiler.com/tiles/terrain-rgb/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`
              : 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
          ]}
          tileSize={256}
          encoding={HAS_PREMIUM_TILES ? 'mapbox' : 'terrarium'}
        />

        {/* ═══ Sky atmosphere (3D mode only) ═══ */}
        {is3DEnabled && (
          <Layer
            id="sky"
            type="sky"
            paint={{
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 90.0],
              'sky-atmosphere-sun-intensity': 15,
            }}
          />
        )}

        {/* ═══ Heatmap layer ═══ */}
        {isHeatmapEnabled &&
          layers.incidents &&
          incidents.features.length > 0 && (
            <Source
              id="incidents-heat"
              type="geojson"
              data={heatmapData as any}
            >
              <Layer
                id="incidents-heatmap"
                type="heatmap"
                maxzoom={16}
                paint={{
                  'heatmap-weight': [
                    'interpolate',
                    ['linear'],
                    ['get', 'severity'],
                    1,
                    0.2,
                    5,
                    1,
                  ],
                  'heatmap-intensity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0,
                    1,
                    15,
                    3,
                  ],
                  'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0,
                    'rgba(0,0,0,0)',
                    0.15,
                    'rgb(255,255,204)',
                    0.3,
                    'rgb(255,237,160)',
                    0.45,
                    'rgb(254,178,76)',
                    0.6,
                    'rgb(253,141,60)',
                    0.75,
                    'rgb(240,59,32)',
                    0.9,
                    'rgb(189,0,38)',
                    1,
                    'rgb(128,0,38)',
                  ],
                  'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0,
                    4,
                    9,
                    30,
                    15,
                    50,
                  ],
                  'heatmap-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    7,
                    0.8,
                    15,
                    0.4,
                  ],
                }}
              />
            </Source>
          )}

        {/* ═══ Risk basin polygons / 3D extrusions ═══ */}
        {layers.riskBasins && riskBasins.features.length > 0 && (
          <Source
            id="risk-basins"
            type="geojson"
            data={asGeoJSON(riskBasins)}
          >
            {is3DEnabled ? (
              <Layer
                id="risk-basin-3d"
                type="fill-extrusion"
                paint={{
                  'fill-extrusion-color': [
                    'match',
                    ['get', 'riskLevel'],
                    1,
                    '#22c55e',
                    2,
                    '#f59e0b',
                    3,
                    '#f97316',
                    4,
                    '#ef4444',
                    5,
                    '#991b1b',
                    '#6b7280',
                  ],
                  'fill-extrusion-height': ['*', ['get', 'riskLevel'], 150],
                  'fill-extrusion-base': 0,
                  'fill-extrusion-opacity': 0.45,
                }}
              />
            ) : (
              <>
                <Layer
                  id="risk-basin-fill"
                  type="fill"
                  paint={{
                    'fill-color': [
                      'match',
                      ['get', 'riskLevel'],
                      1,
                      '#22c55e',
                      2,
                      '#f59e0b',
                      3,
                      '#f97316',
                      4,
                      '#ef4444',
                      5,
                      '#991b1b',
                      '#6b7280',
                    ],
                    'fill-opacity': 0.18,
                  }}
                />
                <Layer
                  id="risk-basin-border"
                  type="line"
                  paint={{
                    'line-color': [
                      'match',
                      ['get', 'riskLevel'],
                      1,
                      '#22c55e',
                      2,
                      '#f59e0b',
                      3,
                      '#f97316',
                      4,
                      '#ef4444',
                      5,
                      '#991b1b',
                      '#6b7280',
                    ],
                    'line-width': 2,
                    'line-opacity': 0.6,
                  }}
                />
              </>
            )}
          </Source>
        )}

        {/* ═══ Isochrone reachability polygons ═══ */}
        {layers.isochrones && isochroneData && isochroneData.features?.length > 0 && (
          <Source id="isochrones" type="geojson" data={isochroneData}>
            <Layer
              id="isochrone-fill"
              type="fill"
              paint={{
                'fill-color': [
                  'step',
                  ['get', 'time'],
                  '#22c55e', // 0–10 min: green
                  11, '#f59e0b', // 11–20 min: amber
                  21, '#ef4444', // 21+ min: red
                ],
                'fill-opacity': [
                  'step',
                  ['get', 'time'],
                  0.25,
                  11, 0.18,
                  21, 0.12,
                ],
              }}
            />
            <Layer
              id="isochrone-border"
              type="line"
              paint={{
                'line-color': [
                  'step',
                  ['get', 'time'],
                  '#22c55e',
                  11, '#f59e0b',
                  21, '#ef4444',
                ],
                'line-width': 1.5,
                'line-opacity': 0.7,
              }}
            />
          </Source>
        )}

        {/* ════════════════════════════════════════════════════════════
            EFFIS WMS RASTER OVERLAYS (Fire Weather Index + Burned Areas)
            Placed before point layers for correct z-order (raster underneath)
            ════════════════════════════════════════════════════════════ */}
        {tierConfig.dataLimits.enableWMSOverlays && layers.effisFWI && (
          <Source
            id="effis-fwi"
            type="raster"
            tiles={[
              'https://maps.effis.emergency.copernicus.eu/effis?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=fwi.fwi&STYLES=&FORMAT=image/png&TRANSPARENT=true&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}',
            ]}
            tileSize={256}
          >
            <Layer id="effis-fwi-layer" type="raster" paint={{ 'raster-opacity': 0.6 }} />
          </Source>
        )}
        {tierConfig.dataLimits.enableWMSOverlays && layers.effisBurnedAreas && (
          <Source
            id="effis-burned-areas"
            type="raster"
            tiles={[
              'https://maps.effis.emergency.copernicus.eu/effis?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=burnt.ba&STYLES=&FORMAT=image/png&TRANSPARENT=true&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}',
            ]}
            tileSize={256}
          >
            <Layer id="effis-burned-areas-layer" type="raster" paint={{ 'raster-opacity': 0.5 }} />
          </Source>
        )}

        {/* ════════════════════════════════════════════════════════════
            FIRMS SATELLITE FIRE DETECTIONS
            ════════════════════════════════════════════════════════════ */}
        {layers.firmsDetections && firmsDetections.features.length > 0 && (
          <Source
            id="firms-detections"
            type="geojson"
            data={asGeoJSON(firmsDetections)}
            cluster={true}
            clusterRadius={60}
            clusterMaxZoom={13}
          >
            {/* ═══ Cluster Glow (outer ring for visual prominence) ═══ */}
            <Layer
              id="firms-cluster-glow"
              type="circle"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': '#f97316',
                'circle-radius': [
                  'step',
                  ['to-number', ['get', 'point_count']],
                  30,
                  5, 40,
                  10, 50,
                ],
                'circle-blur': 0.8,
                'circle-opacity': 0.2,
              }}
            />

            {/* ═══ Cluster Solid Marker ═══ */}
            <Layer
              id="firms-cluster"
              type="circle"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': [
                  'step',
                  ['to-number', ['get', 'point_count']],
                  '#f59e0b',
                  10, '#f97316',
                  20, '#ef4444',
                ],
                'circle-radius': [
                  'step',
                  ['to-number', ['get', 'point_count']],
                  18,
                  5, 25,
                  10, 32,
                  20, 40,
                ],
                'circle-stroke-width': 2.5,
                'circle-stroke-color': '#ffffff',
                'circle-opacity': 0.9,
              }}
            />

            {/* ═══ Cluster Count Label ═══ */}
            <Layer
              id="firms-cluster-count"
              type="symbol"
              filter={['has', 'point_count']}
              layout={{
                'text-field': ['to-string', ['get', 'point_count']],
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold', 'sans-serif'],
                'text-size': 13,
              }}
              paint={{
                'text-color': '#ffffff',
                'text-halo-color': '#000000',
                'text-halo-width': 1,
              }}
            />

            {/* ═══ Unclustered - Outer Glow (FRP-based intensity) ═══ */}
            <Layer
              id="firms-detections-glow"
              type="circle"
              filter={['!', ['has', 'point_count']]}
              paint={{
                'circle-color': [
                  'match',
                  ['get', 'confidence'],
                  'low', FIRMS_CONFIDENCE_COLORS.low,
                  'nominal', FIRMS_CONFIDENCE_COLORS.nominal,
                  'high', FIRMS_CONFIDENCE_COLORS.high,
                  FIRMS_CONFIDENCE_COLORS.nominal,
                ],
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['to-number', ['get', 'frp']],
                  0, 15,
                  25, 22,
                  50, 30,
                  100, 40,
                ],
                'circle-blur': 0.9,
                'circle-opacity': [
                  'case',
                  ['get', 'isRecent'], 0.3,
                  0.2,
                ],
              }}
            />

            {/* ═══ Unclustered - Pulsing Ring (recent detections only) ═══ */}
            <Layer
              id="firms-detections-pulse"
              type="circle"
              filter={['all', ['!', ['has', 'point_count']], ['get', 'isRecent']]}
              paint={{
                'circle-color': '#ef4444',
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['to-number', ['get', 'frp']],
                  0, 12,
                  50, 18,
                  100, 24,
                ],
                'circle-opacity': 0.25,
                'circle-blur': 0.5,
              }}
            />

            {/* ═══ Unclustered - Solid Marker (confidence-colored, FRP-sized) ═══ */}
            <Layer
              id="firms-detections-unclustered"
              type="circle"
              filter={['!', ['has', 'point_count']]}
              paint={{
                'circle-color': [
                  'match',
                  ['get', 'confidence'],
                  'low', FIRMS_CONFIDENCE_COLORS.low,
                  'nominal', FIRMS_CONFIDENCE_COLORS.nominal,
                  'high', FIRMS_CONFIDENCE_COLORS.high,
                  FIRMS_CONFIDENCE_COLORS.nominal,
                ],
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['to-number', ['get', 'frp']],
                  0, 6,
                  25, 9,
                  50, 12,
                  100, 16,
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
                'circle-opacity': [
                  'match',
                  ['get', 'confidence'],
                  'low', 0.6,
                  'nominal', 0.85,
                  'high', 1.0,
                  0.85,
                ],
              }}
            />
          </Source>
        )}

        {/* ═══ Incident clusters with glow effect ═══ */}
        {layers.incidents && (
          <Source
            id="incidents"
            type="geojson"
            data={asGeoJSON(incidentSourceData)}
            cluster={true}
            clusterRadius={40}
            clusterMaxZoom={14}
          >
            {/* Cluster outer glow */}
            <Layer
              id="incidents-cluster-glow"
              type="circle"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': [
                  'step',
                  ['to-number', ['get', 'point_count']],
                  '#f59e0b',
                  3,
                  '#f97316',
                  7,
                  '#ef4444',
                ],
                'circle-radius': [
                  'step',
                  ['to-number', ['get', 'point_count']],
                  30,
                  3,
                  38,
                  7,
                  48,
                ],
                'circle-blur': 0.7,
                'circle-opacity': 0.2,
              }}
            />
            {/* Cluster solid */}
            <Layer
              id="incidents-cluster"
              type="circle"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': [
                  'step',
                  ['to-number', ['get', 'point_count']],
                  '#f59e0b',
                  3,
                  '#f97316',
                  7,
                  '#ef4444',
                ],
                'circle-radius': [
                  'step',
                  ['to-number', ['get', 'point_count']],
                  18,
                  3,
                  24,
                  7,
                  30,
                ],
                'circle-stroke-width': 3,
                'circle-stroke-color': '#ffffff',
              }}
            />
            {/* Cluster count label */}
            <Layer
              id="incidents-cluster-count"
              type="symbol"
              filter={['has', 'point_count']}
              layout={{
                'text-field': ['to-string', ['get', 'point_count']],
                'text-font': [
                  'Open Sans Bold',
                  'Arial Unicode MS Bold',
                  'sans-serif',
                ],
                'text-size': 13,
              }}
              paint={{ 'text-color': '#ffffff' }}
            />
            {/* Unclustered — outer glow for active incidents */}
            <Layer
              id="incidents-glow"
              type="circle"
              filter={[
                'all',
                ['!', ['has', 'point_count']],
                ['==', ['get', 'isActive'], 1],
              ]}
              paint={{
                'circle-color': ['get', 'color'],
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['to-number', ['get', 'severity']],
                  1,
                  18,
                  5,
                  30,
                ],
                'circle-blur': 0.7,
                'circle-opacity': 0.25,
              }}
            />
            {/* Unclustered — solid marker scaled by severity */}
            <Layer
              id="incidents-unclustered"
              type="circle"
              filter={['!', ['has', 'point_count']]}
              paint={{
                'circle-color': ['get', 'color'],
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['to-number', ['get', 'severity']],
                  1,
                  7,
                  3,
                  10,
                  5,
                  14,
                ],
                'circle-stroke-width': 2.5,
                'circle-stroke-color': '#ffffff',
              }}
            />
          </Source>
        )}

        {/* ═══ Map controls ═══ */}
        <NavigationControl
          position="top-right"
          showCompass={true}
          visualizePitch={true}
        />
        <ScaleControl position="bottom-left" maxWidth={100} unit="metric" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showAccuracyCircle={false}
        />

        {/* ═══ Hover popup ═══ */}
        {hoveredIncident && (
          <Popup
            longitude={hoveredIncident.coordinates[0]}
            latitude={hoveredIncident.coordinates[1]}
            anchor="bottom"
            closeButton={false}
            closeOnClick={false}
            offset={[0, -12]}
            className="incident-popup"
          >
            <div className="min-w-[220px] overflow-hidden rounded-lg bg-surface/90 backdrop-blur-md">
              {/* Gradient header bar */}
              <div
                className="px-3 py-2"
                style={{
                  background: `linear-gradient(135deg, ${INCIDENT_STATUS_COLORS[hoveredIncident.properties.status] ?? '#6b7280'}dd, ${INCIDENT_STATUS_COLORS[hoveredIncident.properties.status] ?? '#6b7280'}88)`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-white/90">
                    🔥 #{hoveredIncident.id.slice(0, 8)}
                  </span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white">
                    {hoveredIncident.properties.status}
                  </span>
                </div>
              </div>
              {/* Body */}
              <div className="p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="text-muted-foreground">{t('severity')}:</span>
                  <span className="text-base leading-none">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ color: i < (hoveredIncident.properties.severity ?? 0) ? (INCIDENT_STATUS_COLORS[hoveredIncident.properties.status] ?? '#f59e0b') : '#d1d5db' }}>★</span>
                    ))}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {hoveredIncident.properties.severity}/5
                  </span>
                </div>
                {hoveredIncident.properties.cause && (
                  <div className="mt-1.5 text-xs text-muted-foreground">
                    {hoveredIncident.properties.cause}
                  </div>
                )}
                <div className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground italic">
                  {t('clickForDetails')}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground/60">
                  {hoveredIncident.coordinates[1].toFixed(4)}°, {hoveredIncident.coordinates[0].toFixed(4)}°
                </div>
              </div>
            </div>
          </Popup>
        )}

        {/* ═══ FIRMS Detection Popup ═══ */}
        {hoverInfo && hoverInfo.layer === 'firms-detections-unclustered' && hoverInfo.feature?.properties && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            offset={[0, -12]}
            className="firms-popup"
          >
            <div className="p-2 min-w-[200px] rounded-lg bg-surface/90 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-orange-500">🛰️</span>
                <span className="font-bold text-sm">{t('firmsSatelliteDetection')}</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('firmsFirePower')}:</span>
                  <span className="font-semibold">{hoverInfo.feature.properties.frp} MW</span>
                </div>
                {/* FRP intensity bar */}
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (hoverInfo.feature.properties.frp / 200) * 100)}%`,
                      background: 'linear-gradient(to right, #fef3c7, #f59e0b, #dc2626)',
                    }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('firmsConfidence')}:</span>
                  <span
                    className="font-semibold capitalize"
                    style={{ color: FIRMS_CONFIDENCE_COLORS[hoverInfo.feature.properties.confidence] || FIRMS_CONFIDENCE_COLORS.nominal }}
                  >
                    {hoverInfo.feature.properties.confidence}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('firmsTemperature')}:</span>
                  <span className="font-semibold">{hoverInfo.feature.properties.brightness}K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('firmsTime')}:</span>
                  <span className="font-semibold">{hoverInfo.feature.properties.acqDateTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('firmsSatellite')}:</span>
                  <span className="font-semibold">{hoverInfo.feature.properties.instrument}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('firmsDayNight')}:</span>
                  <span className="font-semibold">
                    {hoverInfo.feature.properties.daynight === 'D' ? '☀️ ' : '🌙 '}
                    {hoverInfo.feature.properties.daynight === 'D' ? t('firmsDay') : t('firmsNight')}
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
                {hoverInfo.feature.properties.source === 'EFFIS'
                  ? 'Copernicus EFFIS'
                  : hoverInfo.feature.properties.source === 'FIRMS+EFFIS'
                    ? 'NASA FIRMS + Copernicus EFFIS'
                    : 'NASA FIRMS'}{' '}
                • {hoverInfo.feature.properties.satellite}
              </div>
            </div>
          </Popup>
        )}

        {/* ═══ FIRMS Cluster Popup ═══ */}
        {hoverInfo && hoverInfo.layer === 'firms-cluster' && hoverInfo.feature?.properties?.point_count && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            offset={[0, -12]}
            className="cluster-popup"
          >
            <div className="p-2 text-center">
              <div className="font-bold text-lg text-orange-500">{hoverInfo.feature.properties.point_count}</div>
              <div className="text-xs text-muted-foreground">{t('firmsSatelliteDetections')}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{t('firmsZoomToSeeDetails')}</div>
            </div>
          </Popup>
        )}

        {/* ═══ Incident Cluster Popup ═══ */}
        {hoverInfo && hoverInfo.layer === 'incidents-cluster' && hoverInfo.feature?.properties?.point_count && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            offset={[0, -12]}
            className="cluster-popup"
          >
            <div className="p-2 text-center">
              <div className="font-bold text-lg text-red-500">{hoverInfo.feature.properties.point_count}</div>
              <div className="text-xs text-muted-foreground">Fire Incidents</div>
              <div className="text-[10px] text-muted-foreground mt-1">Zoom in to see details</div>
            </div>
          </Popup>
        )}

        <DeckGLOverlay layers={deckLayers} />
      </ReactMapGL>

      {/* ═══ Overlay controls ═══ */}
      <MapControls gpuTier={gpuTier} />
      <MapLegend />

      {/* FIRMS data timestamp */}
      {firmsLastUpdate && layers.firmsDetections && (
        <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-border/50 shadow-sm">
          <span className="font-medium">FIRMS:</span> {formatTimeAgo(firmsLastUpdate)}
        </div>
      )}

      {/* Fullscreen toggle */}
      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute bottom-14 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface shadow-elev-1 transition-colors hover:bg-surface-2"
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isFullscreen ? (
            <>
              <polyline points="4 14 8 14 8 18" />
              <polyline points="20 10 16 10 16 6" />
              <line x1="14" y1="10" x2="21" y2="3" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </>
          ) : (
            <>
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </>
          )}
        </svg>
      </button>

      {/* Tooltip for dispatch layers */}
      <div
        id="map-tooltip"
        className="pointer-events-none fixed z-50 hidden rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-elev-3"
        style={{ transform: 'translate(-50%, -100%) translateY(-8px)' }}
      />
    </div>
  );
}
