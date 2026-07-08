import { useState, useEffect, useRef, useCallback } from 'react';
import { forPullKey } from '@rtirl/api';
import type { TrackingData, SubabikeStep } from '../data/subabike';

const STORAGE_KEY = 'subabike-tracking';
const PERSIST_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function getLocalDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadFromStorage(): TrackingData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { steps: [], currentDayKey: null, lastPersistTime: null };
}

function saveToStorage(data: TrackingData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

async function reverseGeocode(lng: number, lat: number): Promise<string> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) return 'Unknown';
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place,locality,village&limit=1&language=fr&access_token=${token}`
    );
    const data = await res.json();
    if (data.features?.length > 0) {
      return data.features[0].text || data.features[0].place_name || 'Unknown';
    }
  } catch { /* ignore */ }
  return 'Unknown';
}

async function fetchFromServer(): Promise<TrackingData | null> {
  try {
    const res = await fetch('/api/tracking');
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.steps?.length > 0) return data;
  } catch { /* ignore */ }
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

export default function useSubabikeTracking(pullKey: string) {
  const [tracking, setTracking] = useState<TrackingData>(loadFromStorage);
  const [_loaded, setLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [connected, setConnected] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(false);
  const trackingRef = useRef(tracking);
  trackingRef.current = tracking;

  // Load from server on init (takes priority over localStorage)
  useEffect(() => {
    fetchFromServer().then(serverData => {
      if (serverData && serverData.steps.length > 0) {
        setServerAvailable(true);
        setTracking(serverData);
        saveToStorage(serverData); // sync localStorage
      } else {
        // Server unavailable or empty — use localStorage
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

  // Persist to server on significant changes (new step, new point)
  const lastServerSave = useRef(0);
  const saveToServerDebounced = useCallback((data: TrackingData) => {
    const now = Date.now();
    // Only save to server every 30 seconds max to avoid spamming
    if (now - lastServerSave.current < 30_000) return;
    lastServerSave.current = now;
    saveToServer(data);
  }, []);

  // Connect to RTIRL
  useEffect(() => {
    if (!pullKey) return;

    const unsub = forPullKey(pullKey).addListener((data: Record<string, unknown>) => {
      setConnected(true);

      const loc = data.location as { latitude: number; longitude: number } | undefined;
      if (!loc || loc.latitude == null || loc.longitude == null) return;

      const lng = loc.longitude;
      const lat = loc.latitude;
      const now = Date.now();

      setCurrentLocation({ lng, lat });

      // Throttle to every 10 minutes
      const current = trackingRef.current;
      if (current.lastPersistTime && now - current.lastPersistTime < PERSIST_INTERVAL_MS) {
        return;
      }

      const todayKey = getLocalDate(now);
      const newPoint = { coordinates: [lng, lat] as [number, number], timestamp: now };

      setTracking((prev: TrackingData) => {
        const steps = [...prev.steps];
        let currentDayKey = prev.currentDayKey;
        let lastStep = steps.length > 0 ? steps[steps.length - 1] : null;

        let needsServerSave = false;

        // Check if it's a new day (different from current tracking day)
        if (todayKey !== currentDayKey) {
          needsServerSave = true; // new step → save to server
          currentDayKey = todayKey;
          const dayNumber = steps.length + 1;

          // Create new step
          const newStep: SubabikeStep = {
            id: `day-${todayKey}`,
            dayNumber,
            name: '...', // placeholder, filled async via reverse geocode
            date: todayKey,
            points: [newPoint],
          };
          steps.push(newStep);
          lastStep = newStep;

          // Reverse geocode asynchronously
          reverseGeocode(lng, lat).then((name: string) => {
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
          // Same day — append point to existing step
          const updatedStep = { ...lastStep, points: [...lastStep.points, newPoint] };
          steps[steps.length - 1] = updatedStep;
        } else {
          // First-ever point, no steps exist yet
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

          reverseGeocode(lng, lat).then((name: string) => {
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

        // Debounced server save
        if (needsServerSave) {
          saveToServerDebounced(result);
        }

        return result;
      });
    });

    return () => { unsub(); };
  }, [pullKey, saveToServerDebounced]);

  // Manually reset tracking (for testing)
  const resetTracking = useCallback(() => {
    const empty: TrackingData = { steps: [], currentDayKey: null, lastPersistTime: null };
    setTracking(empty);
    saveToStorage(empty);
    saveToServer(empty);
  }, []);

  return { tracking, currentLocation, connected, resetTracking, serverAvailable };
}
