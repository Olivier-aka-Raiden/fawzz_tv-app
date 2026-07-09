import { useRef, useCallback, useState, useEffect, type PointerEvent as RPointerEvent } from 'react';
import Map, { Source, Layer, Marker, type MapRef } from 'react-map-gl/mapbox';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, ChevronLeft, Wifi, WifiOff } from 'lucide-react';
import useSubabikeTracking from '../../hooks/useSubabikeTracking';
import type { TrackPoint, SubabikeStep } from '../../data/subabike';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const ROUTE_COLOR = '#9146FF';
const ROUTE_DIM_COLOR = '#4a4a5a';

/** Filter NaN coordinates from TrackPoints */
function validPoints(points: TrackPoint[]): TrackPoint[] {
  return points.filter(
    p => Array.isArray(p.coordinates) && p.coordinates.length === 2 &&
      Number.isFinite(p.coordinates[0]) && Number.isFinite(p.coordinates[1])
  );
}

/** Safe GeoJSON — strips NaN coordinates */
function pointsToGeoJSON(points: TrackPoint[]) {
  const clean = validPoints(points);
  if (clean.length === 0) return null;
  return {
    type: 'FeatureCollection' as const,
    features: [{
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: clean.map(p => p.coordinates),
      },
    }],
  };
}

export default function SubabikeTracker() {
  const { t } = useTranslation();
  const { tracking, currentLocation, connected } = useSubabikeTracking();
  const mapRef = useRef<MapRef>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const steps = tracking.steps;
  const totalSteps = steps.length;

  // NaN guard for current location
  const safeLocation = currentLocation &&
    Number.isFinite(currentLocation.lng) &&
    Number.isFinite(currentLocation.lat)
    ? currentLocation
    : null;

  // Selected step range
  const [startIdx, setStartIdx] = useState(0);
  const [endIdx, setEndIdx] = useState(Math.max(0, totalSteps - 1));
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  // Reset selection when steps change
  useEffect(() => {
    setStartIdx(0);
    setEndIdx(Math.max(0, totalSteps - 1));
  }, [totalSteps]);

  // Fit map to selected steps (with NaN guard)
  const fitToSteps = useCallback((sIdx: number, eIdx: number) => {
    if (!mapRef.current || totalSteps === 0) return;
    const selectedSteps = steps.slice(sIdx, eIdx + 1);
    const allCoords = selectedSteps
      .flatMap((s: SubabikeStep) => validPoints(s.points).map((p: TrackPoint) => p.coordinates));
    if (allCoords.length === 0) return;

    const lngs = allCoords.map(c => c[0]);
    const lats = allCoords.map(c => c[1]);
    if (lngs.length === 0) return;

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    if (!Number.isFinite(minLng)) return;

    const pad = allCoords.length === 1 ? 0.5 : 1;
    mapRef.current.fitBounds(
      [[minLng - pad, minLat - pad], [maxLng + pad, maxLat + pad]],
      { padding: 80, duration: 800 }
    );
  }, [steps, totalSteps]);

  // Fit to full range on mount / steps change
  useEffect(() => {
    fitToSteps(0, Math.max(0, totalSteps - 1));
  }, [totalSteps, fitToSteps]);

  // Fly to current location on change
  useEffect(() => {
    if (!safeLocation || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [safeLocation.lng, safeLocation.lat],
      duration: 2000,
      zoom: mapRef.current.getZoom(),
    });
  }, [safeLocation]);

  // Slider helpers
  const sliderPercent = (idx: number) => totalSteps <= 1 ? 50 : (idx / (totalSteps - 1)) * 100;

  const getIndexFromClientX = useCallback((clientX: number): number => {
    if (!sliderRef.current || totalSteps <= 1) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * (totalSteps - 1));
  }, [totalSteps]);

  const handlePointerDown = useCallback((handle: 'start' | 'end') => (e: RPointerEvent) => {
    e.preventDefault();
    if (totalSteps <= 1) return;
    setDragging(handle);
  }, [totalSteps]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: globalThis.PointerEvent) => {
      const idx = getIndexFromClientX(e.clientX);
      if (dragging === 'start') {
        const newStart = Math.min(idx, endIdx);
        setStartIdx(newStart);
        fitToSteps(newStart, endIdx);
      } else {
        const newEnd = Math.max(idx, startIdx);
        setEndIdx(newEnd);
        fitToSteps(startIdx, newEnd);
      }
    };
    const handleUp = () => setDragging(null);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragging, startIdx, endIdx, getIndexFromClientX, fitToSteps]);

  // Build GeoJSON with NaN filtering
  const selectedPoints = steps.slice(startIdx, endIdx + 1).flatMap(s => s.points);
  const selectedGeoJSON = pointsToGeoJSON(selectedPoints);

  const beforePoints = steps.slice(0, startIdx).flatMap(s => s.points);
  const afterPoints = steps.slice(endIdx + 1).flatMap(s => s.points);
  const dimGeoJSON = pointsToGeoJSON([...beforePoints, ...afterPoints]);

  // Info bar
  const startName = totalSteps > 0 ? steps[startIdx].name : '—';
  const endName = totalSteps > 0 ? steps[endIdx].name : '—';
  const numDays = endIdx - startIdx + 1;

  // Safe default center
  const defaultCenter: [number, number] = safeLocation
    ? [safeLocation.lng, safeLocation.lat]
    : [6.8333, 47.5167];

  // Validate token presence
  if (!MAPBOX_TOKEN) {
    return (
      <div className="mt-8 p-8 text-center text-gray-500 border border-gray-800 rounded-xl">
        <MapPin size={24} className="mx-auto mb-2 text-gray-600" />
        <p className="text-sm">Mapbox token not configured</p>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-8 w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-twitch" />
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            {t('subabike.title', 'SubaBike Tracker')}
          </h3>
          <span className={`flex items-center gap-1 text-[10px] ${connected ? 'text-green-400' : 'text-gray-600'}`}>
            {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
            {connected ? 'Live' : 'Waiting'}
          </span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="md:hidden text-gray-500 hover:text-gray-300 transition-colors p-1"
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className={`${collapsed ? 'hidden md:block' : 'block'}`}>
        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-gray-800 h-[350px] sm:h-[420px] lg:h-[500px] shadow-xl relative">
          <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{ longitude: defaultCenter[0], latitude: defaultCenter[1], zoom: 5.5 }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            attributionControl={false}
          >
            {/* Dim background route */}
            {dimGeoJSON && (
              <Source id="subabike-dim" type="geojson" data={dimGeoJSON}>
                <Layer
                  id="subabike-dim-line"
                  type="line"
                  paint={{ 'line-color': ROUTE_DIM_COLOR, 'line-width': 2, 'line-opacity': 0.35 }}
                />
              </Source>
            )}

            {/* Active segment */}
            {selectedGeoJSON && (
              <Source id="subabike-active" type="geojson" data={selectedGeoJSON}>
                <Layer
                  id="subabike-active-glow"
                  type="line"
                  paint={{ 'line-color': ROUTE_COLOR, 'line-width': 10, 'line-opacity': 0.2, 'line-blur': 6 }}
                />
                <Layer
                  id="subabike-active-line"
                  type="line"
                  paint={{ 'line-color': ROUTE_COLOR, 'line-width': 3.5, 'line-opacity': 0.9 }}
                />
              </Source>
            )}

            {/* Day markers — with NaN guard */}
            {steps.map((step: SubabikeStep, i: number) => {
              const clean = validPoints(step.points);
              if (clean.length === 0) return null;
              const firstPt = clean[0];
              const [lng, lat] = firstPt.coordinates;
              if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

              const isActive = i >= startIdx && i <= endIdx;
              const isEndpoint = i === startIdx || i === endIdx;
              return (
                <Marker key={step.id} longitude={lng} latitude={lat} anchor="center">
                  <button
                    className="group relative cursor-pointer"
                    aria-label={`Day ${step.dayNumber}: ${step.name}`}
                  >
                    {isEndpoint && (
                      <div
                        className="absolute inset-0 rounded-full animate-pulse"
                        style={{
                          width: 24, height: 24,
                          left: '50%', top: '50%',
                          transform: 'translate(-50%, -50%)',
                          boxShadow: isActive
                            ? '0 0 12px rgba(145, 70, 255, 0.6), 0 0 24px rgba(145, 70, 255, 0.3)'
                            : '0 0 6px rgba(145, 70, 255, 0.3)',
                        }}
                      />
                    )}
                    <div
                      className="rounded-full border-2 transition-all duration-300"
                      style={{
                        width: isEndpoint ? 14 : isActive ? 10 : 7,
                        height: isEndpoint ? 14 : isActive ? 10 : 7,
                        backgroundColor: isActive ? ROUTE_COLOR : '#4a4a5a',
                        borderColor: isActive ? ROUTE_COLOR : '#3a3a4a',
                      }}
                    />
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-900 border border-gray-700 text-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      J{step.dayNumber} — {step.name}
                    </span>
                  </button>
                </Marker>
              );
            })}

            {/* Live position dot — only when actively receiving fresh location data */}
            {connected && safeLocation && (
              <Marker longitude={safeLocation.lng} latitude={safeLocation.lat} anchor="center">
                <div className="relative">
                  <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-lg animate-pulse"
                    style={{ boxShadow: '0 0 16px rgba(239, 68, 68, 0.7), 0 0 32px rgba(239, 68, 68, 0.3)' }}
                  />
                </div>
              </Marker>
            )}
          </Map>

          {/* Empty overlay */}
          {totalSteps === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-950/60 pointer-events-none">
              <div className="text-center">
                <MapPin size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {connected
                    ? t('subabike.waitingLocation', 'Waiting for GPS data...')
                    : t('subabike.connecting', 'Connecting...')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info bar */}
        {totalSteps > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-3 mb-4">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {t('subabike.selected', 'Selected')}
            </span>
            {totalSteps === 1 ? (
              <span className="text-sm font-semibold text-white">{steps[0].name}</span>
            ) : (
              <>
                <span className="text-sm font-semibold text-white">{startName} → {endName}</span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-400">
                  {numDays} {numDays === 1 ? t('subabike.day', 'day') : t('subabike.days', 'days')}
                </span>
              </>
            )}
          </div>
        )}

        {/* Range slider — 2+ steps */}
        {totalSteps >= 2 && (
          <div className="relative px-2 sm:px-4 mt-2">
            <p className="text-[11px] text-gray-600 mb-2 text-center">
              {t('subabike.sliderHint', 'Drag the handles to choose your segment')}
            </p>
            <div ref={sliderRef} className="relative h-14 select-none touch-none cursor-pointer">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded bg-gray-800" />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded bg-twitch neon-glow-sm transition-all duration-150"
                style={{
                  left: `${sliderPercent(startIdx)}%`,
                  width: `${sliderPercent(endIdx) - sliderPercent(startIdx)}%`,
                }}
              />
              {steps.map((step, i) => {
                const isActive = i >= startIdx && i <= endIdx;
                return (
                  <button
                    key={step.id}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-all duration-200 hover:scale-150 ${
                      isActive ? 'bg-twitch' : 'bg-gray-600'
                    }`}
                    style={{ left: `${sliderPercent(i)}%`, width: isActive ? 10 : 6, height: isActive ? 10 : 6 }}
                    aria-label={`${step.name} — J${step.dayNumber}`}
                    tabIndex={-1}
                  />
                );
              })}
              <div
                onPointerDown={handlePointerDown('start')}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gray-900 border-2 border-twitch shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center transition-shadow hover:shadow-[0_0_12px_rgba(145,70,255,0.5)] z-10"
                style={{ left: `${sliderPercent(startIdx)}%` }}
              >
                <div className="w-2 h-2 rounded-full bg-twitch" />
              </div>
              <div
                onPointerDown={handlePointerDown('end')}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gray-900 border-2 border-twitch shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center transition-shadow hover:shadow-[0_0_12px_rgba(145,70,255,0.5)] z-10"
                style={{ left: `${sliderPercent(endIdx)}%` }}
              >
                <div className="w-2 h-2 rounded-full bg-twitch" />
              </div>
              <div className="absolute left-0 right-0 top-full mt-3">
                {steps.map((step, i) => {
                  const isVisible = i === 0 || i === totalSteps - 1 || i === startIdx || i === endIdx;
                  return (
                    <span
                      key={step.id}
                      className={`absolute text-[9px] sm:text-[10px] font-medium whitespace-nowrap transition-all duration-200 ${
                        i === startIdx || i === endIdx ? 'text-twitch' : 'text-gray-600'
                      } ${isVisible ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}
                      style={{ left: `${sliderPercent(i)}%`, transform: 'translateX(-50%)' }}
                    >
                      {step.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Single step */}
        {totalSteps === 1 && (
          <div className="relative px-2 sm:px-4 mt-2">
            <div className="relative h-10 flex items-center justify-center">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded bg-gray-800" />
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-twitch border-2 border-gray-900 shadow-md z-10" />
              <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 text-[10px] font-medium text-twitch whitespace-nowrap">
                {steps[0].name}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
