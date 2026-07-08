import type { FeatureCollection, LineString } from 'geojson';

export interface SubabikeStep {
  id: string;
  name: string;
  day: number;
  coordinates: [number, number]; // [lng, lat]
}

export interface SubabikeLeg {
  id: string;
  name: string;
  startIdx: number;
  endIdx: number;
}

// Mock SubaBike 2026 route — simulated steps across France
// Starting from Sochaux (traditional start) heading south-west through France
export const SUBABIKE_STEPS: SubabikeStep[] = [
  { id: 'sochaux',     name: 'Sochaux',         day: 1,  coordinates: [6.8333, 47.5167] },
  { id: 'besancon',    name: 'Besançon',        day: 2,  coordinates: [6.0245, 47.2378] },
  { id: 'dijon',       name: 'Dijon',           day: 3,  coordinates: [5.0378, 47.3230] },
  { id: 'nevers',      name: 'Nevers',          day: 4,  coordinates: [3.1578, 46.9906] },
  { id: 'clermont',    name: 'Clermont-Ferrand', day: 5,  coordinates: [3.0870, 45.7772] },
  { id: 'le-puy',      name: 'Le Puy-en-Velay', day: 6,  coordinates: [3.8842, 45.0422] },
  { id: 'mende',       name: 'Mende',           day: 7,  coordinates: [3.4993, 44.5185] },
  { id: 'rodez',       name: 'Rodez',           day: 8,  coordinates: [2.5731, 44.3502] },
  { id: 'albi',        name: 'Albi',            day: 9,  coordinates: [2.1486, 43.9278] },
  { id: 'toulouse',    name: 'Toulouse',        day: 10, coordinates: [1.4442, 43.6047] },
  { id: 'carcassonne', name: 'Carcassonne',     day: 11, coordinates: [2.3474, 43.2126] },
  { id: 'perpignan',   name: 'Perpignan',       day: 12, coordinates: [2.8945, 42.6970] },
  { id: 'beziers',     name: 'Béziers',         day: 13, coordinates: [3.2190, 43.3476] },
  { id: 'montpellier', name: 'Montpellier',     day: 14, coordinates: [3.8767, 43.6108] },
  { id: 'marseille',   name: 'Marseille',       day: 15, coordinates: [5.3698, 43.2965] },
];

export const SUBABIKE_LEGS: SubabikeLeg[] = [
  { id: 'leg1', name: 'Étape 1', startIdx: 0,  endIdx: 4  },
  { id: 'leg2', name: 'Étape 2', startIdx: 5,  endIdx: 9  },
  { id: 'leg3', name: 'Étape 3', startIdx: 10, endIdx: 14 },
];

// Full route geoJSON (LineString connecting all steps)
export function buildSubabikeGeoJSON(): FeatureCollection<LineString> {
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: SUBABIKE_STEPS.map(s => s.coordinates),
      },
    }],
  };
}
