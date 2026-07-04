import { useTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw } from 'lucide-react';
import ClipCard from './ClipCard';
import { useClips } from '../../hooks/useClips';

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

export default function Clips() {
  const { t } = useTranslation();
  const { clips, loading, error, retry } = useClips();

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('clips.title')}</h1>
        <p className="text-gray-400 max-w-xl mx-auto">{t('clips.subtitle')}</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center justify-between gap-3 bg-red-900/20 border border-red-800/40 rounded-xl px-5 py-3 text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={retry}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && clips.length === 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Clip grid */}
      {clips.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {clips.map((clip, i) => (
            <ClipCard key={clip.id} clip={clip} index={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && clips.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg">{t('clips.empty')}</p>
        </div>
      )}
    </section>
  );
}
