import { useState, useEffect, useCallback } from 'react';
import type { ClipData } from '../data/clips';
import { fetchClips, type ClipFilters } from '../services/clipsService';
import { CLIPS as FALLBACK_CLIPS } from '../data/clips';

interface UseClipsResult {
  clips: ClipData[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useClips(filters?: ClipFilters): UseClipsResult {
  const [clips, setClips] = useState<ClipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchClips(filters);
      setClips(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      // Fall back to static data only when no date/game filters are applied
      if (!filters?.startedAt && !filters?.endedAt && !filters?.gameId) {
        setClips(FALLBACK_CLIPS);
      }
    } finally {
      setLoading(false);
    }
  }, [filters?.startedAt, filters?.endedAt, filters?.gameId, filters?.sort]);

  useEffect(() => {
    load();
  }, [load]);

  return { clips, loading, error, retry: load };
}

/**
 * Fetch clips for a specific adventure date range.
 */
export function useAdventureClips(startDate: string, endDate: string): UseClipsResult {
  return useClips({
    startedAt: `${startDate}T00:00:00Z`,
    endedAt: `${endDate}T23:59:59Z`,
  });
}
