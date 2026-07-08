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

function loadFromStorage(): TrackingData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
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

/** Reverse geocode using the RTIRL project's approach: request all types, pick the most specific. */
async function reverseGeocode(lng: number, lat: number): Promise<string> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) return 'Unknown';
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?language=fr&access_token=${token}`
    );
    const data = await res.json();
    const features: GeocodeFeature[] = data.features || [];

    // Find features by type (same priority as RTIRL project)
    const find = (type: string) => features.find(f => f.place_type.includes(type));

    const locality = find('locality');
    const place = find('place');
    const neighborhood = find('neighborhood');
    const region = find('region');
    const country = find('country');

    // Smart selection: most specific first
    if (locality && place) return locality.text;        // e.g. "Montbéliard"
    if (neighborhood && locality) return locality.text;
    if (neighborhood && place) return place.text;       // fallback: town name
    if (place) return place.text;
    if (region) return region.text;                     // e.g. "Bourgogne-Franche-Comté"
    if (country) return country.text;                   // e.g. "France"
    if (features.length > 0) return features[0].text;
  } catch { /* ignore */ }
  return 'Unknown';
}

async function fetchFromServer(): Promise<TrackingData | null> {
  try {
    const res = await fetch('/api/tracking');
    console.log('[SubaBike Hook] fetchFromServer status:', res.status);
    if (!res.ok) return null;
    const data = await res.json();
    console.log('[SubaBike Hook] fetchFromServer data:', data?.steps?.length, 'steps');
    if (data?.steps?.length > 0) return data;
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

/** Poll the server-side proxy for current GPS location. Pull key stays server-side. */
async function fetchCurrentLocation(): Promise<{ lng: number; lat: number } | null> {
  try {
    console.log('[SubaBike Hook] 🔄 Polling /api/location...');
    const res = await fetch('/api/location');
    console.log('[SubaBike Hook] /api/location response:', res.status, res.statusText);
    if (!res.ok) {
      console.warn('[SubaBike Hook] /api/location returned non-OK status:', res.status);
      return null;
    }
    const data = await res.json();
    console.log('[SubaBike Hook] /api/location raw data:', JSON.stringify(data));
    if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      console.log('[SubaBike Hook] ✅ Valid location received:', data.latitude, data.longitude);
      return { lng: data.longitude, lat: data.latitude };
    }
    if (data?.error) {
      console.warn('[SubaBike Hook] ⚠️ API returned error:', data.error);
    } else {
      console.warn('[SubaBike Hook] ⚠️ API returned null or invalid data:', data);
    }
  } catch (err) {
    console.error('[SubaBike Hook] ❌ fetchCurrentLocation threw:', err);
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

  // Load from server on init (takes priority over localStorage)
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
        setConnected(true);
        setCurrentLocation(loc);
        console.log('[SubaBike Hook] 📍 connected=true, currentLocation=', loc);

        const now = Date.now();
        const current = trackingRef.current;

        // Throttle to every 10 minutes for persisted points
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
            console.log('[SubaBike Hook] 🌅 New day detected!', todayKey, '→ day', dayNumber);

            const newStep: SubabikeStep = {
              id: `day-${todayKey}`,
              dayNumber,
              name: '...',
              date: todayKey,
              points: [newPoint],
            };
            steps.push(newStep);
            lastStep = newStep;

            reverseGeocode(loc.lng, loc.lat).then((name: string) => {
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
            const updatedStep = { ...lastStep, points: [...lastStep.points, newPoint] };
            steps[steps.length - 1] = updatedStep;
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

            reverseGeocode(loc.lng, loc.lat).then((name: string) => {
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
        console.warn(`[SubaBike Hook] ⚠️ No location in poll #${consecutiveFailures} — /api/location returned null`);
        // Don't flip to "disconnected" on transient failures
        if (consecutiveFailures > 10) {
          console.warn('[SubaBike Hook] 🔴 setConnected(false) after 10 consecutive failures');
          setConnected(false);
        }
      }
    };

    // Initial poll
    poll();

    // Periodic polling
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
  }, []);

  return { tracking, currentLocation, connected, resetTracking, loaded };
}
