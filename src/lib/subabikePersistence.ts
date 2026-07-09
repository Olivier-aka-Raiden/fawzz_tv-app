/**
 * SubaBike persistence helpers — localStorage mirror + server sync via /api/tracking.
 *
 * Server (Upstash Redis) is the single source of truth.
 * localStorage is a read-only mirror used only as fallback when server is unreachable.
 */

import type { TrackingData, SubabikeStep } from '../data/subabike';

const STORAGE_KEY = 'subabike-tracking';

export function empty(): TrackingData {
  return { steps: [], currentDayKey: null, lastPersistTime: null };
}

/** Validate and sanitize tracking data loaded from storage — strip NaN coordinates */
export function sanitize(data: TrackingData): TrackingData {
  if (!data || !Array.isArray(data.steps)) return empty();
  const cleanSteps = data.steps
    .map(step => {
      if (!step || !Array.isArray(step.points)) return null;
      const cleanPoints = step.points.filter(
        p => p && Array.isArray(p.coordinates) &&
          p.coordinates.length === 2 &&
          Number.isFinite(p.coordinates[0]) &&
          Number.isFinite(p.coordinates[1])
      );
      if (cleanPoints.length === 0) return null;
      return { ...step, points: cleanPoints };
    })
    .filter((s): s is SubabikeStep => s !== null);
  return { steps: cleanSteps, currentDayKey: data.currentDayKey || null, lastPersistTime: data.lastPersistTime || null };
}

export function loadFromStorage(): TrackingData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleaned = sanitize(parsed);
      if (cleaned.steps.length !== parsed?.steps?.length) {
        console.warn('[SubaBike Hook] 🧹 Sanitized localStorage data — removed corrupted steps');
      }
      return cleaned;
    }
  } catch { /* ignore */ }
  return empty();
}

export function saveToStorage(data: TrackingData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export async function fetchFromServer(): Promise<TrackingData | null> {
  try {
    const res = await fetch('/api/tracking');
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.steps?.length > 0) return sanitize(data);
  } catch (err) {
    console.warn('[SubaBike Hook] fetchFromServer failed:', err);
  }
  return null;
}

export async function saveToServer(data: TrackingData): Promise<boolean> {
  try {
    const res = await fetch('/api/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch { /* ignore */ }
  return false;
}

/** Clear the server-side staleness state when tracking is reset */
export async function clearLocationState(): Promise<void> {
  try {
    await fetch('/api/location', { method: 'DELETE' });
  } catch { /* ignore */ }
}
