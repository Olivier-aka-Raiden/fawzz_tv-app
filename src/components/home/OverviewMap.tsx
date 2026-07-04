import { useRef, useCallback } from 'react';
import Map, { Source, Layer, type MapRef } from 'react-map-gl/mapbox';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ROUTES } from '../../data/routes';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function OverviewMap() {
  const { t } = useTranslation();
  const mapRef = useRef<MapRef>(null);

  const onLoad = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.fitBounds([[-5, 41], [15, 57]], { padding: 40, duration: 1500 });
  }, []);

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{t('home.overview.title')}</h2>
        <p className="text-gray-400">{t('home.overview.subtitle')}</p>
      </motion.div>

      <div className="h-[300px] md:h-[500px] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{ longitude: 5, latitude: 47, zoom: 5 }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          onLoad={onLoad}
          attributionControl={false}
        >
          {ROUTES.map(route => (
            <Source key={route.id} id={`overview-${route.id}`} type="geojson" data={route.geojson}>
              <Layer id={`overview-line-${route.id}`} type="line" paint={{ 'line-color': route.color, 'line-width': 3, 'line-opacity': 0.9 }} />
              <Layer id={`overview-glow-${route.id}`} type="line" paint={{ 'line-color': route.color, 'line-width': 8, 'line-opacity': 0.15, 'line-blur': 4 }} />
            </Source>
          ))}
        </Map>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        {ROUTES.map(route => (
          <div key={route.id} className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: route.color }} />
            {route.year}
          </div>
        ))}
      </div>
    </section>
  );
}
