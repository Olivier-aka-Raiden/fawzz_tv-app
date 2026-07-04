/**
 * Vercel serverless function — proxies Twitch clip requests.
 * Secrets stay server-side, never exposed to the client.
 *
 * GET /api/clips → returns ClipData[] as JSON
 */

const CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const CHANNEL = 'fawzz_tv';

// ── Token cache (lives for the function instance lifetime) ──────────────────
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' },
  );

  if (!res.ok) throw new Error(`OAuth failed: ${res.status}`);

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

async function twitchRequest<T>(query: string): Promise<T> {
  const token = await getToken();

  const res = await fetch(`https://api.twitch.tv/helix/${query}`, {
    headers: {
      'Client-ID': CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    cachedToken = null;
    return twitchRequest<T>(query);
  }

  if (!res.ok) throw new Error(`Twitch API ${res.status}`);
  return res.json() as Promise<T>;
}

interface TwitchClip {
  id: string;
  title: string;
  broadcaster_name: string;
  creator_name: string;
  view_count: number;
  created_at: string;
  thumbnail_url: string;
  duration: number;
}

interface ClipData {
  id: string;
  title: string;
  broadcasterName: string;
  viewCount: number;
  createdAt: string;
  thumbnailUrl: string;
  duration: number;
  clippedBy?: string;
}

export async function GET(): Promise<Response> {
  // CORS
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return new Response(
      JSON.stringify({ error: 'TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set' }),
      { status: 500, headers },
    );
  }

  try {
    // Resolve broadcaster ID
    const users = await twitchRequest<{ data: { id: string }[] }>(`users?login=${CHANNEL}`);
    const broadcasterId = users.data[0].id;

    // Fetch clips (3 pages, 60 clips max)
    const allClips: ClipData[] = [];
    let cursor: string | undefined;

    for (let page = 0; page < 3; page++) {
      const params = new URLSearchParams({
        broadcaster_id: broadcasterId,
        first: '20',
      });
      if (cursor) params.set('after', cursor);

      const data = await twitchRequest<{
        data: TwitchClip[];
        pagination: { cursor?: string };
      }>(`clips?${params.toString()}`);

      for (const clip of data.data) {
        allClips.push({
          id: clip.id,
          title: clip.title,
          broadcasterName: clip.broadcaster_name,
          viewCount: clip.view_count,
          createdAt: clip.created_at,
          thumbnailUrl: clip.thumbnail_url,
          duration: clip.duration,
          clippedBy: clip.creator_name || undefined,
        });
      }

      cursor = data.pagination?.cursor;
      if (!cursor || data.data.length === 0) break;
    }

    allClips.sort((a, b) => b.viewCount - a.viewCount);

    return new Response(JSON.stringify(allClips), { status: 200, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers });
  }
}

// Handle OPTIONS for CORS preflight
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
