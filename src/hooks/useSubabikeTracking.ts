import { useState, useEffect, useRef, useCallback } from 'react';
import type { TrackingData, SubabikeStep } from '../data/subabike';

const STORAGE_KEY = 'subabike-tracking';
const PERSIST_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const POLL_INTERVAL_MS = 30 * 1000;          // poll server every 30s

function getLocalDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function empty(): TrackingData {
  return { steps: [], currentDayKey: null, lastPersistTime: null };
}

/** Validate and sanitize tracking data loaded from storage — strip NaN coordinates */
function sanitize(data: TrackingData): TrackingData {
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

function loadFromStorage(): TrackingData {
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

function saveToStorage(data: TrackingData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

interface GeocodeFeature {
  text: string;
  place_type: string[];
  properties: { short_code?: string };
}

async function reverseGeocode(lng: number, lat: number): Promise<string> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) {
    console.warn('[SubaBike Geocode] ❌ No VITE_MAPBOX_TOKEN');
    return 'Unknown';
  }
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?language=fr&access_token=${token}`;
    console.log('[SubaBike Geocode] 🔍 Fetching:', `${lng},${lat}`);
    const res = await fetch(url);
    console.log('[SubaBike Geocode] Response:', res.status, res.statusText);
    if (!res.ok) {
      console.warn('[SubaBike Geocode] ⚠️ Non-OK status:', res.status);
      return 'Unknown';
    }
    const data = await res.json();
    const features: GeocodeFeature[] = data.features || [];
    console.log('[SubaBike Geocode] Features found:', features.length);

    const find = (type: string) => features.find(f => f.place_type.includes(type));
    const locality = find('locality');
    const place = find('place');
    const neighborhood = find('neighborhood');
    const region = find('region');
    const country = find('country');

    if (locality && place) return locality.text;
    if (neighborhood && locality) return locality.text;
    if (neighborhood && place) return place.text;
    if (place) return place.text;
    if (region) return region.text;
    if (country) return country.text;
    if (features.length > 0) return features[0].text;

    console.warn('[SubaBike Geocode] ⚠️ No recognizable feature types found');
  } catch (err) {
    console.error('[SubaBike Geocode] ❌ Failed:', err);
  }
  return 'Unknown';
}

async function fetchFromServer(): Promise<TrackingData | null> {
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

async function saveToServer(data: TrackingData): Promise<boolean> {
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

async function fetchCurrentLocation(): Promise<{ lng: number; lat: number; stale: boolean } | null> {
  try {
    const res = await fetch('/api/location');
    if (!res.ok) return null;
    const data = await res.json();
    // Validate before returning — block NaN at the boundary
    if (
      data &&
      typeof data.latitude === 'number' &&
      typeof data.longitude === 'number' &&
      Number.isFinite(data.latitude) &&
      Number.isFinite(data.longitude) &&
      data.latitude >= -90 && data.latitude <= 90 &&
      data.longitude >= -180 && data.longitude <= 180
    ) {
      return { lng: data.longitude, lat: data.latitude, stale: data.stale === true };
    }
    if (data?.error) {
      console.warn('[SubaBike Hook] ⚠️ API error:', data.error);
    }
  } catch (err) {
    console.error('[SubaBike Hook] ❌ fetchCurrentLocation:', err);
  }
  return null;
}

export default function useSubabikeTracking() {
  const [tracking, setTracking] = useState<TrackingData>(loadFromStorage);
  const [loaded, setLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [connected, setConnected] = useState(false);
  const trackingRef = useRef(tracking);
  trackingRef.current = tracking;

  // Load from server on init
  useEffect(() => {
    fetchFromServer().then(serverData => {
      if (serverData && serverData.steps.length > 0) {
        setTracking(serverData);
        saveToStorage(serverData);
      } else {
        const localData = loadFromStorage();
        if (localData.steps.length > 0) {
          setTracking(localData);
        }
      }
      setLoaded(true);
    });
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    saveToStorage(tracking);
  }, [tracking]);

  // Debounced server persistence
  const lastServerSave = useRef(0);
  const saveToServerDebounced = useCallback((data: TrackingData) => {
    const now = Date.now();
    if (now - lastServerSave.current < 30_000) return;
    lastServerSave.current = now;
    saveToServer(data);
  }, []);

  // State dedup ref — avoid setting same state repeatedly
  const prevConnected = useRef(false);
  const prevLocKey = useRef('');

  // Poll the server-side location proxy
  useEffect(() => {
    let running = true;
    let consecutiveFailures = 0;

    const poll = async () => {
      if (!running) return;

      const loc = await fetchCurrentLocation();
      if (!running) return;

      if (loc) {
        consecutiveFailures = 0;

        if (loc.stale) {
          // Location unchanged for > 11 min — app stopped sending new data
          if (prevConnected.current) {
            console.warn('[SubaBike Hook] 🕐 Location stale — treating as disconnected');
            prevConnected.current = false;
            setConnected(false);
          }
          return;
        }

        // Dedup: only update state if location changed meaningfully
        const newKey = `${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`;
        const changed = newKey !== prevLocKey.current;
        prevLocKey.current = newKey;

        if (changed || !prevConnected.current) {
          setCurrentLocation({ lng: loc.lng, lat: loc.lat });
          setConnected(true);
          prevConnected.current = true;
        }

        const now = Date.now();
        const current = trackingRef.current;

        // Throttle to PERSIST_INTERVAL_MS for persisted points
        if (current.lastPersistTime && now - current.lastPersistTime < PERSIST_INTERVAL_MS) {
          return;
        }

        const todayKey = getLocalDate(now);
        const newPoint = { coordinates: [loc.lng, loc.lat] as [number, number], timestamp: now };

        setTracking((prev: TrackingData) => {
          const steps = [...prev.steps];
          let currentDayKey = prev.currentDayKey;
          let lastStep = steps.length > 0 ? steps[steps.length - 1] : null;
          let needsServerSave = false;

          if (todayKey !== currentDayKey) {
            needsServerSave = true;
            currentDayKey = todayKey;
            const dayNumber = steps.length + 1;
            console.log('[SubaBike Hook] 🌅 New day:', todayKey, 'day', dayNumber);

            const newStep: SubabikeStep = {
              id: `day-${todayKey}`,
              dayNumber,
              name: '...',
              date: todayKey,
              points: [newPoint],
            };
            steps.push(newStep);

            reverseGeocode(loc.lng, loc.lat).then(name => {
              setTracking((p: TrackingData) => {
                const updated = {
                  ...p,
                  steps: p.steps.map((s: SubabikeStep) =>
                    s.id === newStep.id ? { ...s, name } : s
                  ),
                };
                saveToStorage(updated);
                saveToServer(updated);
                return updated;
              });
            });
          } else if (lastStep) {
            steps[steps.length - 1] = { ...lastStep, points: [...lastStep.points, newPoint] };
          } else {
            needsServerSave = true;
            currentDayKey = todayKey;
            const firstStep: SubabikeStep = {
              id: `day-${todayKey}`,
              dayNumber: 1,
              name: '...',
              date: todayKey,
              points: [newPoint],
            };
            steps.push(firstStep);

            reverseGeocode(loc.lng, loc.lat).then(name => {
              setTracking((p: TrackingData) => {
                const updated = {
                  ...p,
                  steps: p.steps.map((s: SubabikeStep) =>
                    s.id === firstStep.id ? { ...s, name } : s
                  ),
                };
                saveToStorage(updated);
                saveToServer(updated);
                return updated;
              });
            });
          }

          const result: TrackingData = { steps, currentDayKey, lastPersistTime: now };
          if (needsServerSave) saveToServerDebounced(result);
          return result;
        });
      } else {
        consecutiveFailures++;
        if (consecutiveFailures > 10) {
          if (prevConnected.current) {
            console.warn('[SubaBike Hook] 🔴 Disconnected after 10 failures');
            prevConnected.current = false;
            setConnected(false);
          }
        }
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      running = false;
      clearInterval(interval);
    };
  }, [saveToServerDebounced]);

  const resetTracking = useCallback(() => {
    const emptyData = empty();
    setTracking(emptyData);
    saveToStorage(emptyData);
    saveToServer(emptyData);
    prevLocKey.current = '';
    prevConnected.current = false;
    setCurrentLocation(null);
    setConnected(false);
  }, []);

  return { tracking, currentLocation, connected, resetTracking, loaded };
}
