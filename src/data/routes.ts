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

// Realistic routes with intermediate waypoints (approximate paths)
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
          coordinates: [
            [6.8333, 47.5167],   // Sochaux
            [6.0245, 47.2378],   // Besançon
            [5.0378, 47.3230],   // Dijon
            [4.8357, 45.7640],   // Lyon
            [4.8917, 44.9333],   // Valence
            [4.8055, 43.9493],   // Avignon
            [5.3698, 43.2965],   // Marseille
            [5.9280, 43.1242],   // Toulon
            [6.9200, 43.5830],   // Cannes
            [7.2661, 43.7031],   // Nice
          ],
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
    endLabel: 'Copenhague',
    geojson: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [6.8333, 47.5167],   // Sochaux
            [7.7521, 48.5734],   // Strasbourg
            [8.4037, 49.0069],   // Karlsruhe
            [8.6821, 50.1109],   // Frankfurt
            [9.7320, 52.3759],   // Hannover
            [9.9937, 53.5511],   // Hamburg
            [9.4330, 54.7937],   // Flensburg
            [10.2000, 55.4500],  // Odense
            [12.5683, 55.6761],  // Copenhague
          ],
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
          coordinates: [
            [6.8333, 47.5167],   // Sochaux
            [4.8357, 45.7640],   // Lyon
            [5.7245, 45.1885],   // Grenoble
            [7.2661, 43.7031],   // Nice
            [8.9463, 44.4056],   // Genoa
            [10.4017, 43.7228],  // Pisa
            [11.7969, 42.0924],  // Civitavecchia
            [12.4964, 41.9028],  // Rome
            [14.2681, 40.8518],  // Naples
            [13.3615, 38.1157],  // Palermo
            [14.5146, 35.8997],  // La Valette (Malta)
          ],
        },
      }],
    },
  },
];
