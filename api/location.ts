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
  if (!pullKey) {
    return new Response(JSON.stringify(null), { status: 200, headers: CORS_HEADERS });
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
    } catch {
      return new Response(JSON.stringify(null), { status: 200, headers: CORS_HEADERS });
    }

    const location = await new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
      const timeout = setTimeout(() => resolve(null), 5000);

      let unsub: (() => void) | undefined;
      try {
        unsub = forPullKey(pullKey).addLocationListener((loc) => {
          clearTimeout(timeout);
          try { unsub?.(); } catch { /* ignore */ }
          resolve(loc && typeof loc.latitude === 'number' ? loc : null);
        });
      } catch {
        clearTimeout(timeout);
        resolve(null);
      }
    });

    return new Response(JSON.stringify(location), { status: 200, headers: CORS_HEADERS });
  } catch {
    return new Response(JSON.stringify(null), { status: 200, headers: CORS_HEADERS });
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
