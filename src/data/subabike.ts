/**
 * Dynamic SubaBike tracking data types — powered by RTIRL real-time GPS.
 * Steps are created dynamically as new days are detected.
 */

export interface TrackPoint {
  coordinates: [number, number]; // [lng, lat]
  timestamp: number;             // Unix ms
}

export interface SubabikeStep {
  id: string;        // e.g. "day-2026-07-08"
  dayNumber: number; // 1, 2, 3...
  name: string;      // reverse-geocoded town/village name
  date: string;        // ISO date YYYY-MM-DD
  points: TrackPoint[]; // all persisted points for this day
}

export interface TrackingData {
  steps: SubabikeStep[];
  currentDayKey: string | null; // ISO date string of current tracking day
  lastPersistTime: number | null; // Unix ms of last persisted point
}
