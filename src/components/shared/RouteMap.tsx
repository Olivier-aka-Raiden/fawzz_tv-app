import { useRef, useCallback } from 'react';
import Map, { Source, Layer, Marker, type MapRef } from 'react-map-gl/mapbox';
import type { RouteData } from '../../data/routes';

interface Props {
  route: RouteData;
  className?: string;
  interactive?: boolean;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function RouteMap({ route, className = '', interactive = true }: Props) {
  const mapRef = useRef<MapRef>(null);

  const onLoad = useCallback(() => {
    if (!mapRef.current) return;
    const coords = route.geojson.features[0].geometry.coordinates;
    if (coords.length < 2) return;

    const bounds = coords.reduce(
      (acc, [lng, lat]) => ({
        minLng: Math.min(acc.minLng, lng),
        maxLng: Math.max(acc.maxLng, lng),
        minLat: Math.min(acc.minLat, lat),
        maxLat: Math.max(acc.maxLat, lat),
      }),
      { minLng: 180, maxLng: -180, minLat: 90, maxLat: -90 }
    );

    mapRef.current.fitBounds(
      [[bounds.minLng, bounds.minLat], [bounds.maxLng, bounds.maxLat]],
      { padding: 60, duration: 1000 }
    );
  }, [route]);

  const start = route.geojson.features[0].geometry.coordinates[0] as [number, number];
  const end = route.geojson.features[0].geometry.coordinates[route.geojson.features[0].geometry.coordinates.length - 1] as [number, number];

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-800 ${className}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: 6, latitude: 47, zoom: 5 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onLoad={onLoad}
        interactive={interactive}
        attributionControl={false}
      >
        <Source id={`route-${route.id}`} type="geojson" data={route.geojson}>
          <Layer id={`route-line-${route.id}`} type="line" paint={{ 'line-color': route.color, 'line-width': 3, 'line-opacity': 0.8 }} />
          <Layer id={`route-glow-${route.id}`} type="line" paint={{ 'line-color': route.color, 'line-width': 8, 'line-opacity': 0.2, 'line-blur': 4 }} />
        </Source>

        <Marker longitude={start[0]} latitude={start[1]} anchor="bottom">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-950 shadow-lg" />
            <span className="text-[10px] text-gray-400 mt-0.5 font-mono">{route.startLabel}</span>
          </div>
        </Marker>

        <Marker longitude={end[0]} latitude={end[1]} anchor="bottom">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full border-2 border-gray-950 shadow-lg" style={{ backgroundColor: route.color }} />
            <span className="text-[10px] text-gray-400 mt-0.5 font-mono">{route.endLabel}</span>
          </div>
        </Marker>
      </Map>
    </div>
  );
}
