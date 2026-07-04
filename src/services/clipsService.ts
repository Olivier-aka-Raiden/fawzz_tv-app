import type { ClipData } from '../data/clips';
import { CLIPS as FALLBACK_CLIPS } from '../data/clips';

/**
 * Fetch clips via the Vercel serverless function.
 * The `/api/clips` endpoint handles Twitch OAuth server-side —
 * no secrets are ever exposed to the browser.
 *
 * Falls back to static clip data if the API is unavailable.
 */
export async function fetchClips(): Promise<ClipData[]> {
  const res = await fetch('/api/clips');

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API ${res.status}`);
  }

  return res.json();
}

/**
 * Synchronous fallback for SSR or when the API is not available.
 */
export function getStaticClips(): ClipData[] {
  return FALLBACK_CLIPS;
}
