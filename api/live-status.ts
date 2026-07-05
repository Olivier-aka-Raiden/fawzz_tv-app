/**
 * Vercel serverless function — checks if fawzz_tv is live.
 * GET /api/live-status → { live: boolean }
 *
 * All Twitch API calls happen server-side (no CORS issues).
 */

const CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;

let cached: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt - 60_000) {
    return cached.token;
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' },
  );

  if (!res.ok) throw new Error(`OAuth failed: ${res.status}`);

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cached.token;
}

export async function GET(): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return new Response(
      JSON.stringify({ error: 'Missing credentials' }),
      { status: 500, headers },
    );
  }

  try {
    const token = await getToken();

    const res = await fetch(
      'https://api.twitch.tv/helix/streams?user_login=fawzz_tv',
      {
        headers: {
          'Client-ID': CLIENT_ID,
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Twitch API ${res.status}` }),
        { status: 502, headers },
      );
    }

    const data = (await res.json()) as { data: unknown[] };
    return new Response(
      JSON.stringify({ live: data.data.length > 0 }),
      { status: 200, headers },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers },
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
