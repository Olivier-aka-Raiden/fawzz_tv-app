import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, AlertCircle, RefreshCw } from 'lucide-react';
import ClipCard from './ClipCard';
import { useClips } from '../../hooks/useClips';
import type { ClipFilters } from '../../services/clipsService';

// ── Constants ────────────────────────────────────────────────────────────────

/** Twitch game IDs */
const GAME_IDS: Record<string, string> = {
  'counter-strike': '32399',
  'valorant': '516575',
};

/** Adventure date ranges for Périples à vélo filtering */
const ADVENTURE_RANGES = [
  { start: '2022-07-15', end: '2022-07-25' },
  { start: '2023-06-02', end: '2023-06-15' },
  { start: '2024-09-06', end: '2024-10-10' },
];

/** Keywords for Face caméra category */
const FACE_CAM_KEYWORDS = ['face', 'cam', 'caméra', 'irl', 'just chatting'];

type Category = 'all' | 'counter-strike' | 'valorant' | 'face-cam' | 'periples';
type SortMode = 'views' | 'date';

// ── Helpers ──────────────────────────────────────────────────────────────────

function clipYear(iso: string): number | null {
  if (!iso) return null;
  const y = parseInt(iso.slice(0, 4), 10);
  return Number.isNaN(y) ? null : y;
}

function inAdventureRange(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = dateStr.slice(0, 10);
  return ADVENTURE_RANGES.some(r => d >= r.start && d <= r.end);
}

function matchesFaceCam(title: string): boolean {
  const lower = title.toLowerCase();
  return FACE_CAM_KEYWORDS.some(kw => lower.includes(kw));
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-800" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Clips() {
  const { t } = useTranslation();

  const [category, setCategory] = useState<Category>('all');
  const [year, setYear] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('views');

  // Build API filters based on category
  const apiFilters: ClipFilters = useMemo(() => {
    const f: ClipFilters = { sort };

    if (category === 'counter-strike' || category === 'valorant') {
      f.gameId = GAME_IDS[category];
    }

    // Year filter → date range
    if (year !== 'all') {
      f.startedAt = `${year}-01-01T00:00:00Z`;
      f.endedAt = `${year}-12-31T23:59:59Z`;
    }

    return f;
  }, [category, year, sort]);

  const { clips, loading, error, retry } = useClips(apiFilters);

  // Client-side filtering for categories that can't be expressed as API params
  const filteredClips = useMemo(() => {
    let result = clips;

    // Face caméra → keyword match
    if (category === 'face-cam') {
      result = result.filter(c => matchesFaceCam(c.title));
    }

    // Périples à vélo → adventure date range match
    if (category === 'periples') {
      result = result.filter(c => inAdventureRange(c.createdAt));
    }

    // Search → title match
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q));
    }

    return result;
  }, [clips, category, search]);

  // Extract years for the dropdown
  const years = useMemo(() => {
    const set = new Set<number>();
    clips.forEach(c => {
      const y = clipYear(c.createdAt);
      if (y) set.add(y);
    });
    return [...set].sort((a, b) => b - a);
  }, [clips]);

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('clips.title')}</h1>
        <p className="text-gray-400 max-w-xl mx-auto">{t('clips.subtitle')}</p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {([
          ['all', t('clips.categories.all')],
          ['counter-strike', t('clips.categories.counterStrike')],
          ['valorant', t('clips.categories.valorant')],
          ['face-cam', t('clips.categories.faceCam')],
          ['periples', t('clips.categories.periples')],
        ] as [Category, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setCategory(key); setYear('all'); setSearch(''); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              category === key
                ? 'bg-twitch text-white shadow-md shadow-twitch/25'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + Filters row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder={t('clips.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-twitch/50 focus:ring-1 focus:ring-twitch/30 transition-colors"
          />
        </div>

        {/* Year dropdown */}
        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-twitch/50 cursor-pointer min-w-[100px]"
        >
          <option value="all">{t('clips.allYears')}</option>
          {years.map(y => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>

        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortMode)}
          className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-twitch/50 cursor-pointer min-w-[130px]"
        >
          <option value="views">{t('clips.sortViews')}</option>
          <option value="date">{t('clips.sortDate')}</option>
        </select>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-gray-500 text-sm mb-4">
          {filteredClips.length} {t('clips.results')}
          {category !== 'all' && ` · ${t(`clips.categories.${category}`)}`}
        </p>
      )}

      {/* Error banner */}
      {error && clips.length === 0 && (
        <div className="mb-6 flex items-center justify-between gap-3 bg-red-900/20 border border-red-800/40 rounded-xl px-5 py-3 text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={retry} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 rounded-lg transition-colors">
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && clips.length === 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Clip grid */}
      {filteredClips.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredClips.map((clip, i) => (
            <ClipCard key={clip.id} clip={clip} index={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredClips.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <SlidersHorizontal size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg">{t('clips.noResults')}</p>
          <p className="text-sm mt-1">{t('clips.noResultsHint')}</p>
        </div>
      )}
    </section>
  );
}
