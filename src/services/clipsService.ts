import type { ClipData } from '../data/clips';
import { CLIPS as FALLBACK_CLIPS } from '../data/clips';

export interface ClipFilters {
  startedAt?: string; // ISO date string
  endedAt?: string;   // ISO date string
}

/**
 * Fetch clips via the Vercel serverless function.
 * The `/api/clips` endpoint handles Twitch OAuth server-side —
 * no secrets are ever exposed to the browser.
 *
 * @param filters - Optional date range (started_at / ended_at)
 */
export async function fetchClips(filters?: ClipFilters): Promise<ClipData[]> {
  const url = new URL('/api/clips', window.location.origin);

  if (filters?.startedAt) url.searchParams.set('started_at', filters.startedAt);
  if (filters?.endedAt) url.searchParams.set('ended_at', filters.endedAt);

  const res = await fetch(url.toString());

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API ${res.status}`);
  }

  // If the response isn't valid JSON (e.g. local dev where API isn't running),
  // throw a clean error instead of a raw JSON parse failure.
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
