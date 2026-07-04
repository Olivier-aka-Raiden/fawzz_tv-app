import type { ClipData } from '../data/clips';

const CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID as string;
const CLIENT_SECRET = import.meta.env.VITE_TWITCH_CLIENT_SECRET as string;
const CHANNEL = 'fawzz_tv';

interface TokenCache {
  token: string;
  expiresAt: number;
}

interface BroadcasterCache {
  id: string;
  login: string;
}

let tokenCache: TokenCache | null = null;
let broadcasterCache: BroadcasterCache | null = null;

async function getToken(): Promise<string> {
  // Return cached token if still valid (with 5min buffer)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 300_000) {
    return tokenCache.token;
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' },
  );

  if (!res.ok) throw new Error(`OAuth failed: ${res.status}`);

  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.token;
}

async function twitchRequest<T>(query: string, retry = true): Promise<T> {
  const token = await getToken();

  const res = await fetch(`https://api.twitch.tv/helix/${query}`, {
    headers: {
      'Client-ID': CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });

  // Token expired — refresh and retry once
  if (res.status === 401 && retry) {
    tokenCache = null;
    return twitchRequest<T>(query, false);
  }

  if (!res.ok) throw new Error(`Twitch API ${res.status}: ${query}`);

  return res.json();
}

async function getBroadcasterId(): Promise<string> {
  if (broadcasterCache && broadcasterCache.login === CHANNEL) {
    return broadcasterCache.id;
  }

  const data = await twitchRequest<{ data: { id: string; login: string }[] }>(
    `users?login=${CHANNEL}`,
  );

  broadcasterCache = { id: data.data[0].id, login: CHANNEL };
  return broadcasterCache.id;
}

interface TwitchClip {
  id: string;
  url: string;
  embed_url: string;
  broadcaster_id: string;
  broadcaster_name: string;
  creator_id: string;
  creator_name: string;
  video_id: string;
  game_id: string;
  language: string;
  title: string;
  view_count: number;
  created_at: string;
  thumbnail_url: string;
  duration: number;
  vod_offset: number | null;
  is_featured: boolean;
}

function mapClip(clip: TwitchClip): ClipData {
  return {
    id: clip.id,
    title: clip.title,
    broadcasterName: clip.broadcaster_name,
    viewCount: clip.view_count,
    createdAt: clip.created_at,
    thumbnailUrl: clip.thumbnail_url,
    duration: clip.duration,
    clippedBy: clip.creator_name,
  };
}

/**
 * Fetch all clips for the channel, sorted by popularity.
 * Fetches multiple pages (up to 100 clips) and merges them.
 */
export async function fetchClips(): Promise<ClipData[]> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('VITE_TWITCH_CLIENT_ID and VITE_TWITCH_CLIENT_SECRET must be set in .env');
  }

  const broadcasterId = await getBroadcasterId();
  const allClips: ClipData[] = [];
  let cursor: string | undefined;

  // Fetch up to 5 pages (100 clips max)
  for (let page = 0; page < 5; page++) {
    const params = new URLSearchParams({
      broadcaster_id: broadcasterId,
      first: '20',
    });
    if (cursor) params.set('after', cursor);

    const data = await twitchRequest<{ data: TwitchClip[]; pagination: { cursor?: string } }>(
      `clips?${params.toString()}`,
    );

    allClips.push(...data.data.map(mapClip));

    cursor = data.pagination?.cursor;
    if (!cursor || data.data.length === 0) break;
  }

  // Sort by view count descending
  allClips.sort((a, b) => b.viewCount - a.viewCount);

  return allClips;
}
