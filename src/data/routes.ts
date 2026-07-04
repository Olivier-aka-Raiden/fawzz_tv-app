import type { FeatureCollection, LineString } from 'geojson';

export interface RouteData {
  id: string;
  name: string;
  year: number;
  color: string;
  startLabel: string;
  endLabel: string;
  geojson: FeatureCollection<LineString>;
}

// Placeholder straight-line routes — replace with real GPX data from Raiden
export const ROUTES: RouteData[] = [
  {
    id: 'sochaux-nice-2022',
    name: 'Sochaux → Nice',
    year: 2022,
    color: '#a855f7',
    startLabel: 'Sochaux',
    endLabel: 'Nice',
    geojson: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [[6.8333, 47.5167], [7.2661, 43.7031]],
        },
      }],
    },
  },
  {
    id: 'sochaux-denmark-2023',
    name: 'Sochaux → Danemark',
    year: 2023,
    color: '#3b82f6',
    startLabel: 'Sochaux',
    endLabel: 'Danemark',
    geojson: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [[6.8333, 47.5167], [9.5018, 56.2639]],
        },
      }],
    },
  },
  {
    id: 'sochaux-malta-2024',
    name: 'Sochaux → Malte',
    year: 2024,
    color: '#22c55e',
    startLabel: 'Sochaux',
    endLabel: 'La Valette',
    geojson: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [[6.8333, 47.5167], [14.5146, 35.8997]],
        },
      }],
    },
  },
];
