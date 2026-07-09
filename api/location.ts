/**
 * Vercel serverless function — proxies RTIRL location reads.
 *
 * GET /api/location → { latitude, longitude, stale?: boolean } | { error: string }
 *
 * Uses Firebase REST API directly (no native bindings — works on Vercel).
 * RTIRL stores location data at:
 *   https://rtirl-a1d7f-default-rtdb.firebaseio.com/pullables/{pullKey}/location.json
 * The client polls every 30s.
 *
 * Staleness detection: compares current location with last known (stored in Redis).
 * If coordinates haven't changed for > 11 minutes, returns stale: true so the
 * frontend can stop showing a live pulsar dot and "Live" status.
 */

import { getRedis } from './lib/redis';

const STALE_THRESHOLD_MS = 11 * 60 * 1000; // 11 minutes

const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

const FIREBASE_DB = 'https://rtirl-a1d7f-default-rtdb.firebaseio.com';
const STATE_KEY = 'subabike-location-state';

interface LocationState {
  /** Hash of last known coordinates */
  coordHash: string;
  /** Unix ms when this location was FIRST seen */
  firstSeenAt: number;
}

export async function GET(): Promise<Response> {
  const pullKey = process.env.PULL_KEY;
  console.log('[SubaBike API] GET /api/location called. PULL_KEY present:', !!pullKey);

  if (!pullKey) {
    console.warn('[SubaBike API] ❌ PULL_KEY is not set in environment variables');
    return new Response(
      JSON.stringify({ error: 'PULL_KEY not configured' }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  try {
    const url = `${FIREBASE_DB}/pullables/${pullKey}/location.json`;
    console.log('[SubaBike API] 🔄 Fetching:', url.replace(pullKey, '***'));

    const res = await fetch(url);
    console.log('[SubaBike API] Firebase response:', res.status, res.statusText);

    if (!res.ok) {
      console.warn('[SubaBike API] ⚠️ Firebase returned non-OK:', res.status);
      return new Response(
        JSON.stringify({ error: `Firebase returned ${res.status}` }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const text = await res.text();
    console.log('[SubaBike API] Raw response body:', text);

    // Firebase returns "null" (string) when no data exists
    if (!text || text === 'null') {
      console.log('[SubaBike API] 📭 No location data (null)');
      return new Response(JSON.stringify(null), { status: 200, headers: CORS_HEADERS });
    }

    const location = JSON.parse(text);
    console.log('[SubaBike API] 📍 Location received:', JSON.stringify(location));

    if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      // Staleness detection: compare with last known location in Redis
      const coordHash = `${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`;
      const now = Date.now();
      let stale = false;

      const redis = getRedis();
      if (redis) {
        try {
          const prevState = await redis.get<LocationState>(STATE_KEY);
          if (prevState && prevState.coordHash === coordHash) {
            // Same location as before — check how long it's been
            const age = now - prevState.firstSeenAt;
            if (age > STALE_THRESHOLD_MS) {
              stale = true;
              console.log('[SubaBike API] 🕐 Location stale — unchanged for', Math.round(age / 1000), 's');
            }
          } else {
            // New location or first time — update state
            await redis.set(STATE_KEY, { coordHash, firstSeenAt: now });
            console.log('[SubaBike API] 📝 Location state updated:', coordHash);
          }
        } catch (redisErr) {
          console.warn('[SubaBike API] ⚠️ Redis state check failed:', redisErr);
          // Degrade gracefully: no staleness detection without Redis
        }
      }

      return new Response(
        JSON.stringify({ latitude: location.latitude, longitude: location.longitude, stale }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    console.warn('[SubaBike API] ⚠️ Invalid location format:', location);
    return new Response(JSON.stringify(null), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error('[SubaBike API] ❌ Fetch failed:', err);
    return new Response(
      JSON.stringify({ error: 'Firebase fetch failed' }),
      { status: 200, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/** Clear staleness state — called when tracking is reset */
export async function DELETE(): Promise<Response> {
  try {
    const redis = getRedis();
    if (redis) await redis.del(STATE_KEY);
    console.log('[SubaBike API] 🧹 Location state cleared');
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error('[SubaBike API] ❌ DELETE failed:', err);
    return new Response(JSON.stringify({ ok: false }), { status: 200, headers: CORS_HEADERS });
  }
}
