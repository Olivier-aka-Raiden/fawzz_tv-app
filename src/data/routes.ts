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
    name: 'Lille → Copenhague',
    year: 2023,
    color: '#3b82f6',
    startLabel: 'Lille',
    endLabel: 'Copenhague',
    geojson: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [3.0573, 50.6292],   // Lille
            [4.3517, 50.8503],   // Brussels
            [4.4025, 51.2194],   // Antwerp
            [4.9041, 52.3676],   // Amsterdam
            [6.5665, 53.2194],   // Groningen
            [8.8017, 53.0793],   // Bremen
            [9.9937, 53.5511],   // Hamburg
            [11.1833, 54.4333],  // Fehmarn (Puttgarden) ⛴
            [11.3833, 54.6667],  // Rødbyhavn ⛴
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
            [6.0245, 47.2378],   // Besançon
            [5.0378, 47.3230],   // Dijon
            [4.8357, 45.7640],   // Lyon
            [5.3698, 43.2965],   // Marseille
            [3.6961, 43.4028],   // Sète
            [3.2190, 43.3476],   // Béziers
            [3.0036, 43.1843],   // Narbonne
            [3.6961, 43.4028],   // Sète (retour)
            [5.3698, 43.2965],   // Marseille (retour)
            [7.4246, 43.7384],   // Monaco
            [8.4772, 44.3092],   // Savona
            [8.9463, 44.4056],   // Genoa
            [9.8241, 44.1078],   // La Spezia
            [10.4017, 43.7228],  // Pisa
            [11.7969, 42.0924],  // Civitavecchia ⛴
            [13.3615, 38.1157],  // Palermo
            [12.5108, 38.0176],  // Trapani
            [13.0830, 37.5079],  // Sciacca
            [14.8467, 36.7263],  // Pozzallo ⛴
            [14.5146, 35.8997],  // La Valette (Malta)
          ],
        },
      }],
    },
  },
];
