import type { ClipData } from '../data/clips';
import { CLIPS as FALLBACK_CLIPS } from '../data/clips';

export interface ClipFilters {
  startedAt?: string;
  endedAt?: string;
  gameId?: string;
  sort?: 'views' | 'date';
}

/**
 * Fetch clips via the Vercel serverless function.
 * The `/api/clips` endpoint handles Twitch OAuth server-side —
 * no secrets are ever exposed to the browser.
 */
export async function fetchClips(filters?: ClipFilters): Promise<ClipData[]> {
  const url = new URL('/api/clips', window.location.origin);

  if (filters?.startedAt) url.searchParams.set('started_at', filters.startedAt);
  if (filters?.endedAt) url.searchParams.set('ended_at', filters.endedAt);
  if (filters?.gameId) url.searchParams.set('game_id', filters.gameId);
  if (filters?.sort) url.searchParams.set('sort', filters.sort);

  const res = await fetch(url.toString());

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API ${res.status}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('API unavailable — using cached clips');
  }
}

/**
 * Synchronous fallback for SSR or when the API is not available.
 */
export function getStaticClips(): ClipData[] {
  return FALLBACK_CLIPS;
}
