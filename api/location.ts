/**
 * Vercel serverless function — proxies RTIRL location reads.
 *
 * GET /api/location → { latitude, longitude } | null
 *
 * Uses the server-side PULL_KEY (never exposed to the browser).
 * Does a one-shot Firebase read: subscribe → get value → immediately unsubscribe.
 * The client polls every 30s — each request lasts only a few ms.
 */

const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function GET(): Promise<Response> {
  const pullKey = process.env.PULL_KEY;
  console.log('[SubaBike API] GET /api/location called. PULL_KEY present:', !!pullKey);
  if (!pullKey) {
    console.warn('[SubaBike API] ❌ PULL_KEY is not set in environment variables');
    return new Response(JSON.stringify({ error: 'PULL_KEY not configured' }), { status: 200, headers: CORS_HEADERS });
  }

  try {
    // Dynamic import — @rtirl/api initializes Firebase which may fail in serverless.
    // If it fails, we return null gracefully (client will retry next poll).
    let forPullKey: (key: string) => {
      addLocationListener: (cb: (loc: { latitude: number; longitude: number }) => void) => () => void;
    };
    try {
      const api = await import('@rtirl/api');
      forPullKey = api.forPullKey;
      console.log('[SubaBike API] ✅ @rtirl/api imported successfully');
    } catch (err) {
      console.error('[SubaBike API] ❌ Failed to import @rtirl/api:', err);
      return new Response(JSON.stringify({ error: '@rtirl/api import failed' }), { status: 200, headers: CORS_HEADERS });
    }

    const location = await new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('[SubaBike API] ⏱️ RTIRL listener timed out after 5s — no location received');
        resolve(null);
      }, 5000);

      let unsub: (() => void) | undefined;
      try {
        unsub = forPullKey(pullKey).addLocationListener((loc) => {
          clearTimeout(timeout);
          try { unsub?.(); } catch { /* ignore */ }
          console.log('[SubaBike API] 📍 Location received from RTIRL:', JSON.stringify(loc));
          resolve(loc && typeof loc.latitude === 'number' ? loc : null);
        });
        console.log('[SubaBike API] 👂 RTIRL listener registered, waiting for location...');
      } catch (err) {
        clearTimeout(timeout);
        console.error('[SubaBike API] ❌ forPullKey/addLocationListener threw:', err);
        resolve(null);
      }
    });

    return new Response(JSON.stringify(location), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error('[SubaBike API] ❌ Unexpected error in GET /api/location:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 200, headers: CORS_HEADERS });
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
