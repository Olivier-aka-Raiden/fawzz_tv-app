import { useState, useEffect, useRef, useCallback } from 'react';
import type { TrackingData, SubabikeStep } from '../data/subabike';
import { empty, loadFromStorage, saveToStorage, fetchFromServer, saveToServer, clearLocationState } from '../lib/subabikePersistence';
import { reverseGeocode } from '../lib/subabikeGeocode';

const PERSIST_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const POLL_INTERVAL_MS = 30 * 1000;          // poll server every 30s

function getLocalDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type LocationResult =
  | { ok: true; lng: number; lat: number; stale: boolean }
  | { ok: false; reason: 'not_configured' | 'no_data' | 'error' };

async function fetchCurrentLocation(): Promise<LocationResult> {
  try {
    const res = await fetch('/api/location');
    if (!res.ok) return { ok: false, reason: 'error' };
    const data = await res.json();
    if (
      data &&
      typeof data.latitude === 'number' &&
      typeof data.longitude === 'number' &&
      Number.isFinite(data.latitude) &&
      Number.isFinite(data.longitude) &&
      data.latitude >= -90 && data.latitude <= 90 &&
      data.longitude >= -180 && data.longitude <= 180
    ) {
      return { ok: true, lng: data.longitude, lat: data.latitude, stale: data.stale === true };
    }
    if (data?.error) {
      console.warn('[SubaBike Hook] ⚠️ API error:', data.error);
      if (typeof data.error === 'string' && data.error.includes('PULL_KEY')) {
        return { ok: false, reason: 'not_configured' };
      }
    }
    return { ok: false, reason: 'no_data' };
  } catch (err) {
    console.error('[SubaBike Hook] ❌ fetchCurrentLocation:', err);
  }
  return { ok: false, reason: 'error' };
}

export default function useSubabikeTracking() {
  const [tracking, setTracking] = useState<TrackingData>(loadFromStorage);
  const [loaded, setLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [connected, setConnected] = useState(false);
  const [configured, setConfigured] = useState(true); // assume configured until API says otherwise
  const [error, setError] = useState<string | null>(null);
  const trackingRef = useRef(tracking);
  trackingRef.current = tracking;

  // Load from server on init — server is the single source of truth
  useEffect(() => {
    let cancelled = false;

    // Safety timeout: force loaded=true after 12s even if fetch hangs
    const safetyTimer = setTimeout(() => {
      if (!cancelled) {
        console.warn('[SubaBike Hook] ⏱ Init safety timeout — forcing loaded');
        const localData = loadFromStorage();
        if (localData.steps.length > 0) setTracking(localData);
        setLoaded(true);
      }
    }, 12_000);

    fetchFromServer().then(serverData => {
      if (cancelled) return;
      clearTimeout(safetyTimer);
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
    }).catch(err => {
      if (cancelled) return;
      clearTimeout(safetyTimer);
      console.warn('[SubaBike Hook] Init fetch failed:', err);
      const localData = loadFromStorage();
      if (localData.steps.length > 0) setTracking(localData);
      setLoaded(true);
    });

    return () => { cancelled = true; };
  }, []);

  // Persist to localStorage on every change (mirror only)
  useEffect(() => {
    saveToStorage(tracking);
  }, [tracking]);

  // Debounced server persistence — reads latest data from ref, not captured args
  const lastServerSave = useRef(0);
  const saveToServerDebounced = useCallback(() => {
    const now = Date.now();
    if (now - lastServerSave.current < 30_000) return;
    lastServerSave.current = now;
    saveToServer(trackingRef.current);
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

      const result = await fetchCurrentLocation();
      if (!running) return;

      if (result.ok) {
        const { lng, lat, stale } = result;
        consecutiveFailures = 0;
        setError(null);

        if (!configured) setConfigured(true);

        if (stale) {
          if (prevConnected.current) {
            console.warn('[SubaBike Hook] 🕐 Location stale — treating as disconnected');
            prevConnected.current = false;
            setConnected(false);
          }
          return;
        }

        const newKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        const changed = newKey !== prevLocKey.current;
        prevLocKey.current = newKey;

        if (changed || !prevConnected.current) {
          setCurrentLocation({ lng, lat });
          setConnected(true);
          prevConnected.current = true;
        }

        const now = Date.now();
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

            reverseGeocode(lng, lat).then(name => {
              setTracking((p: TrackingData) => {
                const updatedSteps = p.steps.map((s: SubabikeStep) =>
                  s.id === newStep.id ? { ...s, name } : s
                );
                const updated = { ...p, steps: updatedSteps };
                saveToServer(updated); // persist resolved name to server immediately
                return updated;
              });
            });
          } else if (lastStep) {
            steps[steps.length - 1] = { ...lastStep, points: [...lastStep.points, newPoint] };
            needsServerSave = true;
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

            reverseGeocode(lng, lat).then(name => {
              setTracking((p: TrackingData) => {
                const updatedSteps = p.steps.map((s: SubabikeStep) =>
                  s.id === firstStep.id ? { ...s, name } : s
                );
                const updated = { ...p, steps: updatedSteps };
                saveToServer(updated); // persist resolved name to server immediately
                return updated;
              });
            });
          }

          const result: TrackingData = { steps, currentDayKey, lastPersistTime: now };
          if (needsServerSave) saveToServerDebounced();
          return result;
        });
      } else {
        if (result.reason === 'not_configured') {
          setConfigured(false);
          return; // Don't count as failure — just not set up
        }
        consecutiveFailures++;
        if (consecutiveFailures > 10) {
          if (prevConnected.current) {
            console.warn('[SubaBike Hook] 🔴 Disconnected after 10 failures');
            prevConnected.current = false;
            setConnected(false);
            setError('Connection lost — retrying…');
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
    clearLocationState(); // clears Redis staleness state
    prevLocKey.current = '';
    prevConnected.current = false;
    setCurrentLocation(null);
    setConnected(false);
    setError(null);
  }, []);

  return { tracking, currentLocation, connected, configured, error, resetTracking, loaded };
}
