import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, AlertCircle, RefreshCw } from 'lucide-react';
import ClipCard from './ClipCard';
import { useClips } from '../../hooks/useClips';
import { PROJECTS } from '../../data/adventures';
import type { ClipFilters } from '../../services/clipsService';

type SortMode = 'views' | 'date';

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

// ── Constants ────────────────────────────────────────────────────────────────

const YEARS = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];

const ADVENTURES = PROJECTS.filter(p => !p.comingSoon && p.dates);

type FilterValue = { type: 'all' } | { type: 'year'; year: string } | { type: 'adventure'; id: string };

// ── Component ────────────────────────────────────────────────────────────────

export default function Clips() {
  const { t } = useTranslation();

  const [filter, setFilter] = useState<FilterValue>({ type: 'all' });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('views');

  // Build API filters — adventure date range or year range
  const apiFilters: ClipFilters = useMemo((): ClipFilters => {
    const f: ClipFilters = { sort };

    if (filter.type === 'adventure') {
      const adv = ADVENTURES.find(p => p.id === filter.id);
      if (adv?.dates?.start && adv?.dates?.end) {
        f.startedAt = `${adv.dates.start}T00:00:00Z`;
        f.endedAt = `${adv.dates.end}T23:59:59Z`;
      }
    } else if (filter.type === 'year') {
      f.startedAt = `${filter.year}-01-01T00:00:00Z`;
      f.endedAt = `${filter.year}-12-31T23:59:59Z`;
    }

    return f;
  }, [filter, sort]);

  const { clips, loading, error, retry } = useClips(apiFilters);

  // Client-side search filter
  const filteredClips = useMemo(() => {
    if (!search.trim()) return clips;
    const q = search.toLowerCase();
    return clips.filter(c => c.title.toLowerCase().includes(q));
  }, [clips, search]);

  // Build adventure option labels from i18n
  const adventureOptions = useMemo(() => {
    return ADVENTURES.map(p => ({
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

      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
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

        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortMode)}
          className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-twitch/50 cursor-pointer min-w-[140px]"
        >
          <option value="views">{t('clips.sortViews')}</option>
          <option value="date">{t('clips.sortDate')}</option>
        </select>
      </div>

      {/* Filter tags — single selection */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-xs text-gray-500 uppercase tracking-wider mr-1">{t('clips.filterBy')}</span>

        {/* All */}
        <button
          onClick={() => setFilter({ type: 'all' })}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
            filter.type === 'all'
              ? 'bg-twitch text-white shadow-sm shadow-twitch/30'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
          }`}
        >
          {t('clips.allTag')}
        </button>

        {/* Years */}
        {YEARS.map(y => (
          <button
            key={y}
            onClick={() => setFilter({ type: 'year', year: y })}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter.type === 'year' && filter.year === y
                ? 'bg-twitch text-white shadow-sm shadow-twitch/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {y}
          </button>
        ))}

        {/* Divider */}
        <span className="w-px h-5 bg-gray-700 mx-1 hidden sm:block" />

        {/* Adventures */}
        {adventureOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilter({ type: 'adventure', id: opt.id })}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter.type === 'adventure' && filter.id === opt.id
                ? 'bg-twitch text-white shadow-sm shadow-twitch/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
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
