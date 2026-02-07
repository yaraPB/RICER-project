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
  type MapRef,
  type MapLayerMouseEvent,
} from 'react-map-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { IconLayer, PathLayer } from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '@/store/useMapStore';
import MapControls from '@/components/map/MapControls';
import MapLegend from './MapLegend';
import { useTranslation } from '@/hooks/useTranslation';
import { getMapStyle } from '@/lib/map/styles';
import { INCIDENT_STATUS_COLORS } from '@/lib/map/colors';
import { circleIcon, asGeoJSON } from '@/lib/map/helpers';
import { createResourceLayer, createInfrastructureLayers } from '@/lib/map/layers';
import type {
  GeoFeatureCollection,
  GeoIncidentProps,
  GeoResourceProps,
  GeoInfrastructureProps,
  RiskBasinProps,
} from '@/types';

/* ────────── component ────────── */

export default function RicerMap() {
  const { t } = useTranslation();
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* store */
  const viewState = useMapStore((s) => s.viewState);
  const setViewState = useMapStore((s) => s.setViewState);
  const activeLayers = useMapStore((s) => s.activeLayers);
  const selectedIncidentId = useMapStore((s) => s.selectedIncidentId);
  const setSelectedIncidentId = useMapStore((s) => s.setSelectedIncidentId);
  const is3DEnabled = useMapStore((s) => s.is3DEnabled);
  const basemap = useMapStore((s) => s.basemap);
  const isHeatmapEnabled = useMapStore((s) => s.isHeatmapEnabled);
  const setDataError = useMapStore((s) => s.setDataError);

  /* local state */
  const [incidents, setIncidents] = useState<GeoFeatureCollection<GeoIncidentProps>>({
    type: 'FeatureCollection',
    features: [],
  });
  const [resources, setResources] = useState<GeoFeatureCollection<GeoResourceProps>>({
    type: 'FeatureCollection',
    features: [],
  });
  const [infrastructure, setInfrastructure] = useState<GeoFeatureCollection<GeoInfrastructureProps>>({
    type: 'FeatureCollection',
    features: [],
  });
  const [riskBasins, setRiskBasins] = useState<GeoFeatureCollection<RiskBasinProps>>({
    type: 'FeatureCollection',
    features: [],
  });
  const [hoveredIncident, setHoveredIncident] = useState<{
    id: string;
    properties: GeoIncidentProps;
    coordinates: [number, number];
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const prevIs3D = useRef(is3DEnabled);

  /* ═══════════ Data fetching ═══════════ */

  useEffect(() => {
    let cancelled = false;
    let tickCount = 0;
    let resourcesDisabled = false; // Track if resources should be skipped

    async function fetchIncidents() {
      if (cancelled) return;
      try {
        const res = await fetch('/api/geo/incidents');
        if (!res.ok) {
          setDataError('incidents', `HTTP ${res.status}`);
          return;
        }
        const data = await res.json();
        setIncidents(data);
        setDataError('incidents', null);
      } catch {
        setDataError('incidents', 'Network error');
      }
    }

    async function fetchResources() {
      if (cancelled || resourcesDisabled) return;
      try {
        const res = await fetch('/api/geo/resources');
        if (!res.ok) {
          if (res.status === 403) {
            // Permission denied - stop polling this endpoint
            setDataError('resources', null);
            resourcesDisabled = true; // Stop future polling
            return;
          }
          setDataError('resources', `HTTP ${res.status}`);
          return;
        }
        const data = await res.json();
        setResources(data);
        setDataError('resources', null);
      } catch {
        setDataError('resources', 'Network error');
      }
    }

    async function fetchStatic() {
      if (cancelled) return;
      try {
        const [infraRes, riskRes] = await Promise.allSettled([
          fetch('/api/geo/infrastructure').then((r) =>
            r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`),
          ),
          fetch('/api/geo/risk-basins').then((r) =>
            r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`),
          ),
        ]);
        if (infraRes.status === 'fulfilled') {
          setInfrastructure(infraRes.value);
          setDataError('infrastructure', null);
        } else {
          setDataError('infrastructure', String(infraRes.reason));
        }
        if (riskRes.status === 'fulfilled') {
          setRiskBasins(riskRes.value);
          setDataError('riskBasins', null);
        } else {
          setDataError('riskBasins', String(riskRes.reason));
        }
      } catch (error) {
        console.error('Failed to fetch static data:', error);
      }
    }

    fetchIncidents();
    fetchResources();
    fetchStatic();

    const interval = setInterval(() => {
      tickCount++;
      if (tickCount % 2 === 0 && !resourcesDisabled) fetchResources();
      if (tickCount % 3 === 0) fetchIncidents();
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setDataError]);

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
      setViewState((prev) => ({ ...prev, pitch: is3DEnabled ? 50 : 0 }));
    }
  }, [is3DEnabled, setViewState]);

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
    features: (activeLayers.has('incidents') ? incidents.features : []).map((f) => ({
      type: 'Feature' as const,
      geometry: f.geometry,
      properties: {
        ...f.properties,
        color: INCIDENT_STATUS_COLORS[f.properties.status] ?? '#6b7280',
        isActive: f.properties.status !== 'ETEINT' ? 1 : 0,
      },
    })),
  }), [incidents.features, activeLayers]);

  const heatmapData = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: incidents.features.map((f) => ({
      type: 'Feature' as const,
      geometry: f.geometry,
      properties: { severity: f.properties.severity },
    })),
  }), [incidents.features]);

  /* ═══════════ Deck.gl layers ═══════════ */

  const deckLayers = useMemo(() => {
    const layers: any[] = [];

    const resourceLayer = createResourceLayer(resources, activeLayers.has('resources'));
    if (resourceLayer) layers.push(resourceLayer);

    const infraLayers = createInfrastructureLayers(infrastructure, activeLayers.has('infrastructure'));
    layers.push(...infraLayers);

    return layers;
  }, [activeLayers, resources, infrastructure]);

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

  /* ═══════════ Hover handlers ═══════════ */

  const handleMouseEnter = useCallback((event: MapLayerMouseEvent) => {
    const features = event.features;
    if (!features || features.length === 0) return;
    const feature = features[0];
    if (!feature?.properties || feature.properties.cluster) return;
    const geom = feature.geometry as { coordinates?: number[] };
    const coords = geom?.coordinates;
    if (
      !coords ||
      typeof coords[0] !== 'number' ||
      typeof coords[1] !== 'number'
    )
      return;
    setHoveredIncident({
      id: feature.properties.id as string,
      properties: feature.properties as unknown as GeoIncidentProps,
      coordinates: [coords[0], coords[1]],
    });
  }, []);

  const handleMouseLeave = useCallback(() => setHoveredIncident(null), []);

  /* ═══════════ Map style ═══════════ */

  const mapStyle = getMapStyle(basemap);

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
        interactiveLayerIds={['incidents-unclustered', 'incidents-cluster']}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ width: '100%', height: '100%' }}
        maxPitch={85}
        attributionControl={true}
      >
        {/* ═══ Heatmap layer ═══ */}
        {isHeatmapEnabled &&
          activeLayers.has('incidents') &&
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
        {activeLayers.has('riskBasins') && riskBasins.features.length > 0 && (
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

        {/* ═══ Incident clusters with glow effect ═══ */}
        {activeLayers.has('incidents') && (
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
            <div className="min-w-[220px] overflow-hidden">
              {/* Gradient header bar */}
              <div
                className="px-3 py-2"
                style={{
                  background: `linear-gradient(135deg, ${INCIDENT_STATUS_COLORS[hoveredIncident.properties.status] ?? '#6b7280'}dd, ${INCIDENT_STATUS_COLORS[hoveredIncident.properties.status] ?? '#6b7280'}88)`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase text-white/90">
                    #{hoveredIncident.id.slice(0, 8)}
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
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-2 w-4 rounded-sm"
                        style={{
                          backgroundColor:
                            i < (hoveredIncident.properties.severity ?? 0)
                              ? (INCIDENT_STATUS_COLORS[hoveredIncident.properties.status] ?? '#6b7280')
                              : '#e5e7eb',
                        }}
                      />
                    ))}
                  </div>
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
              </div>
            </div>
          </Popup>
        )}

        <MapboxOverlay layers={deckLayers} />
      </ReactMapGL>

      {/* ═══ Overlay controls ═══ */}
      <MapControls />
      <MapLegend />

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
    </div>
  );
}
