/**
 * Vercel serverless function — proxies RTIRL location reads.
 *
 * GET /api/location → { latitude, longitude } | { error: string }
 *
 * Uses Firebase REST API directly (no native bindings — works on Vercel).
 * RTIRL stores location data at:
 *   https://rtirl-a1d7f-default-rtdb.firebaseio.com/pullables/{pullKey}/location.json
 * The client polls every 30s.
 */

const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

const FIREBASE_DB = 'https://rtirl-a1d7f-default-rtdb.firebaseio.com';

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
      return new Response(JSON.stringify(location), { status: 200, headers: CORS_HEADERS });
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
