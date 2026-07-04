import { useState, useEffect, useCallback } from 'react';
import type { ClipData } from '../data/clips';
import { fetchClips } from '../services/clipsService';
import { CLIPS as FALLBACK_CLIPS } from '../data/clips';

interface UseClipsResult {
  clips: ClipData[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Dynamically fetch clips from the Twitch API.
 * Falls back to the static clip list if the API is unavailable
 * or if env keys are not configured.
 */
export function useClips(): UseClipsResult {
  const [clips, setClips] = useState<ClipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchClips();
      setClips(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      // Fall back to static data if API fails
      setClips(FALLBACK_CLIPS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { clips, loading, error, retry: load };
}
