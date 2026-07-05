import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, AlertCircle, RefreshCw } from 'lucide-react';
import ClipCard from './ClipCard';
import { useClips } from '../../hooks/useClips';
import { PROJECTS } from '../../data/adventures';
import type { ClipFilters } from '../../services/clipsService';

type SortMode = 'views' | 'date';

// ── Helpers ──────────────────────────────────────────────────────────────────

function clipYear(iso: string): number | null {
  if (!iso) return null;
  const y = parseInt(iso.slice(0, 4), 10);
  return Number.isNaN(y) ? null : y;
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

  const [adventure, setAdventure] = useState<string>('all');
  const [year, setYear] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('views');

  // Build API filters — adventure date range or year range
  const apiFilters: ClipFilters = useMemo((): ClipFilters => {
    const f: ClipFilters = { sort };

    if (adventure !== 'all') {
      const adv = PROJECTS.find(p => p.id === adventure);
      if (adv?.dates?.start && adv?.dates?.end) {
        f.startedAt = `${adv.dates.start}T00:00:00Z`;
        f.endedAt = `${adv.dates.end}T23:59:59Z`;
      }
    } else if (year !== 'all') {
      f.startedAt = `${year}-01-01T00:00:00Z`;
      f.endedAt = `${year}-12-31T23:59:59Z`;
    }

    return f;
  }, [adventure, year, sort]);

  const { clips, loading, error, retry } = useClips(apiFilters);

  // Client-side search filter
  const filteredClips = useMemo(() => {
    if (!search.trim()) return clips;
    const q = search.toLowerCase();
    return clips.filter(c => c.title.toLowerCase().includes(q));
  }, [clips, search]);

  // Extract years from clips for dropdown
  const years = useMemo(() => {
    const set = new Set<number>();
    clips.forEach(c => {
      const y = clipYear(c.createdAt);
      if (y) set.add(y);
    });
    return [...set].sort((a, b) => b - a);
  }, [clips]);

  // Build adventure options from PROJECTS data
  const adventureOptions = useMemo(() => {
    const opts = PROJECTS.filter(p => !p.comingSoon && p.tKey && p.dates);
    return opts.map(p => ({
      id: p.id,
      label: t(`${p.tKey}.title`, p.title),
    }));
  }, [t]);

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('clips.title')}</h1>
        <p className="text-gray-400 max-w-xl mx-auto">{t('clips.subtitle')}</p>
      </div>

      {/* Filters row */}
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

        {/* Adventure dropdown */}
        <select
          value={adventure}
          onChange={e => { setAdventure(e.target.value); setYear('all'); }}
          className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-twitch/50 cursor-pointer min-w-[160px]"
        >
          <option value="all">{t('clips.allAdventures')}</option>
          {adventureOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>

        {/* Year dropdown */}
        <select
          value={year}
          onChange={e => { setYear(e.target.value); setAdventure('all'); }}
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
