/**
 * Vercel serverless function — returns a Twitch app access token.
 * GET /api/twitch-token → { token, clientId }
 *
 * Used by the live status indicator to poll the Twitch API client-side
 * without exposing the client secret.
 */

const CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;

// Server-side token cache (instance lifetime)
let cached: { token: string; expiresAt: number } | null = null;

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
    // Reuse cached token if still valid
    if (cached && Date.now() < cached.expiresAt - 60_000) {
      return new Response(
        JSON.stringify({ token: cached.token, clientId: CLIENT_ID }),
        { status: 200, headers },
      );
    }

    const res = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
      { method: 'POST' },
    );

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `OAuth failed: ${res.status}` }),
        { status: 502, headers },
      );
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    cached = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return new Response(
      JSON.stringify({ token: cached.token, clientId: CLIENT_ID }),
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
