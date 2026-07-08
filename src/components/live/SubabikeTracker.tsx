import { useRef, useCallback, useState, useEffect, type PointerEvent as RPointerEvent } from 'react';
import Map, { Source, Layer, Marker, type MapRef } from 'react-map-gl/mapbox';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  SUBABIKE_STEPS,
  SUBABIKE_LEGS,
  buildSubabikeGeoJSON,
} from '../../data/subabike';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const ROUTE_COLOR = '#9146FF'; // Twitch purple
const ROUTE_DIM_COLOR = '#4a4a5a'; // Dim gray for inactive segments

// Build a LineString geojson for a range of steps
function segmentGeoJSON(startIdx: number, endIdx: number) {
  const coords = SUBABIKE_STEPS.slice(startIdx, endIdx + 1).map(s => s.coordinates);
  return {
    type: 'FeatureCollection' as const,
    features: [{
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates: coords },
    }],
  };
}

export default function SubabikeTracker() {
  const { t } = useTranslation();
  const mapRef = useRef<MapRef>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const fullGeoJSON = buildSubabikeGeoJSON();

  const totalSteps = SUBABIKE_STEPS.length;
  const [startIdx, setStartIdx] = useState(0);
  const [endIdx, setEndIdx] = useState(totalSteps - 1);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
  const [activeLeg, setActiveLeg] = useState<string | null>(null);
  // Collapsed state for mobile
  const [collapsed, setCollapsed] = useState(false);

  // Fit map to the selected segment
  const fitToSegment = useCallback((sIdx: number, eIdx: number) => {
    if (!mapRef.current) return;
    const coords = SUBABIKE_STEPS.slice(sIdx, eIdx + 1).map(s => s.coordinates);
    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    mapRef.current.fitBounds(
      [[Math.min(...lngs) - 2, Math.min(...lats) - 1.5], [Math.max(...lngs) + 2, Math.max(...lats) + 1.5]],
      { padding: 80, duration: 800 }
    );
  }, []);

  // On mount, fit to full route
  const onMapLoad = useCallback(() => {
    fitToSegment(0, totalSteps - 1);
  }, [fitToSegment, totalSteps]);

  // Select a leg
  const selectLeg = useCallback((legId: string) => {
    const leg = SUBABIKE_LEGS.find(l => l.id === legId);
    if (!leg) return;
    setActiveLeg(legId);
    setStartIdx(leg.startIdx);
    setEndIdx(leg.endIdx);
    fitToSegment(leg.startIdx, leg.endIdx);
  }, [fitToSegment]);

  const selectFull = useCallback(() => {
    setActiveLeg(null);
    setStartIdx(0);
    setEndIdx(totalSteps - 1);
    fitToSegment(0, totalSteps - 1);
  }, [fitToSegment, totalSteps]);

  // Slider interaction
  const sliderPercent = (idx: number) => (idx / (totalSteps - 1)) * 100;

  const getIndexFromClientX = useCallback((clientX: number): number => {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * (totalSteps - 1));
  }, [totalSteps]);

  const handlePointerDown = useCallback((handle: 'start' | 'end') => (e: RPointerEvent) => {
    e.preventDefault();
    setDragging(handle);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: globalThis.PointerEvent) => {
      const idx = getIndexFromClientX(e.clientX);
      if (dragging === 'start') {
        setStartIdx(Math.min(idx, endIdx));
      } else {
        setEndIdx(Math.max(idx, startIdx));
      }
      setActiveLeg(null); // custom selection = no active leg
    };
    const handleUp = () => setDragging(null);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragging, startIdx, endIdx, getIndexFromClientX]);

  // Step button click on slider
  const clickStep = useCallback((idx: number) => {
    if (idx <= startIdx) {
      setStartIdx(idx);
    } else if (idx >= endIdx) {
      setEndIdx(idx);
    } else {
      // Click between handles: move closest handle
      const distStart = idx - startIdx;
      const distEnd = endIdx - idx;
      if (distStart <= distEnd) setStartIdx(idx);
      else setEndIdx(idx);
    }
    setActiveLeg(null);
  }, [startIdx, endIdx]);

  const startName = SUBABIKE_STEPS[startIdx].name;
  const endName = SUBABIKE_STEPS[endIdx].name;
  const numStops = endIdx - startIdx + 1;
  const numDays = SUBABIKE_STEPS[endIdx].day - SUBABIKE_STEPS[startIdx].day + 1;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-8 w-full"
    >
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-twitch" />
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            {t('subabike.title', 'SubaBike Tracker')}
          </h3>
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
        <div className="rounded-xl overflow-hidden border border-gray-800 h-[350px] sm:h-[420px] lg:h-[500px] shadow-xl">
          <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{ longitude: 3, latitude: 45, zoom: 5.5 }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            onLoad={onMapLoad}
            attributionControl={false}
          >
            {/* Full route — dim background */}
            <Source id="subabike-full" type="geojson" data={fullGeoJSON}>
              <Layer
                id="subabike-full-line"
                type="line"
                paint={{ 'line-color': ROUTE_DIM_COLOR, 'line-width': 2, 'line-opacity': 0.4 }}
              />
            </Source>

            {/* Active segment — glowing Twitch purple */}
            <Source
              id="subabike-active"
              type="geojson"
              data={segmentGeoJSON(startIdx, endIdx)}
            >
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

            {/* Step markers */}
            {SUBABIKE_STEPS.map((step, i) => {
              const isActive = i >= startIdx && i <= endIdx;
              const isEndpoint = i === startIdx || i === endIdx;
              return (
                <Marker key={step.id} longitude={step.coordinates[0]} latitude={step.coordinates[1]} anchor="center">
                  <button
                    className="group relative cursor-pointer"
                    onClick={() => clickStep(i)}
                    aria-label={`Step ${step.name}`}
                  >
                    {/* Outer ring for endpoints */}
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
                    {/* Tooltip on hover */}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-900 border border-gray-700 text-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {step.name} — J{step.day}
                    </span>
                  </button>
                </Marker>
              );
            })}
          </Map>
        </div>

        {/* Info bar */}
        <div className="flex flex-wrap items-center gap-3 mt-3 mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            {t('subabike.selected', 'Selected')}
          </span>
          <span className="text-sm font-semibold text-white">
            {startName} → {endName}
          </span>
          <span className="text-xs text-gray-500">·</span>
          <span className="text-xs text-gray-400">
            {numStops} {t('subabike.stops', 'stops')}
          </span>
          <span className="text-xs text-gray-500">·</span>
          <span className="text-xs text-gray-400">
            {numDays} {t('subabike.days', 'days')}
          </span>
        </div>

        {/* Leg buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {SUBABIKE_LEGS.map(leg => (
            <button
              key={leg.id}
              onClick={() => selectLeg(leg.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                activeLeg === leg.id
                  ? 'bg-twitch text-white neon-glow-sm'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              }`}
            >
              {leg.name}
            </button>
          ))}
          <button
            onClick={selectFull}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              activeLeg === null
                ? 'bg-twitch text-white neon-glow-sm'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            {t('subabike.fullRoute', 'Parcours complet')}
          </button>
        </div>

        {/* Dual-range slider */}
        <div className="relative px-2 sm:px-4">
          {/* Slider description */}
          <p className="text-[11px] text-gray-600 mb-2 text-center">
            {t('subabike.sliderHint', 'Drag the handles to choose your segment')}
          </p>

          <div
            ref={sliderRef}
            className="relative h-14 select-none touch-none cursor-pointer"
          >
            {/* Track background */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded bg-gray-800" />

            {/* Active segment highlight */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded bg-twitch neon-glow-sm transition-all duration-150"
              style={{
                left: `${sliderPercent(startIdx)}%`,
                width: `${sliderPercent(endIdx) - sliderPercent(startIdx)}%`,
              }}
            />

            {/* Step dots */}
            {SUBABIKE_STEPS.map((step, i) => {
              const isActive = i >= startIdx && i <= endIdx;
              return (
                <button
                  key={step.id}
                  onClick={() => clickStep(i)}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-all duration-200 hover:scale-150 ${
                    isActive ? 'bg-twitch' : 'bg-gray-600'
                  }`}
                  style={{
                    left: `${sliderPercent(i)}%`,
                    width: isActive ? 10 : 6,
                    height: isActive ? 10 : 6,
                  }}
                  aria-label={step.name}
                />
              );
            })}

            {/* Start handle */}
            <div
              onPointerDown={handlePointerDown('start')}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gray-900 border-2 border-twitch shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center transition-shadow hover:shadow-[0_0_12px_rgba(145,70,255,0.5)] z-10"
              style={{ left: `${sliderPercent(startIdx)}%` }}
            >
              <div className="w-2 h-2 rounded-full bg-twitch" />
            </div>

            {/* End handle */}
            <div
              onPointerDown={handlePointerDown('end')}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gray-900 border-2 border-twitch shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center transition-shadow hover:shadow-[0_0_12px_rgba(145,70,255,0.5)] z-10"
              style={{ left: `${sliderPercent(endIdx)}%` }}
            >
              <div className="w-2 h-2 rounded-full bg-twitch" />
            </div>

            {/* Step labels below track */}
            <div className="absolute left-0 right-0 top-full mt-3 flex justify-between">
              {/* Show subset of labels on mobile */}
              {SUBABIKE_STEPS.map((step, i) => {
                const isVisible = i === 0 || i === totalSteps - 1 || i === startIdx || i === endIdx;
                return (
                  <span
                    key={step.id}
                    className={`
                      absolute text-[9px] sm:text-[10px] font-medium transition-all duration-200
                      ${i === startIdx || i === endIdx ? 'text-twitch' : 'text-gray-600'}
                      ${isVisible ? 'opacity-100' : 'opacity-0 sm:opacity-100'}
                    `}
                    style={{ left: `${sliderPercent(i)}%`, transform: 'translateX(-50%)' }}
                  >
                    {step.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
