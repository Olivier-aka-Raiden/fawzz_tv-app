import { useTranslation } from 'react-i18next';
import ClipCard from './ClipCard';
import { CLIPS } from '../../data/clips';

export default function Clips() {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('clips.title')}</h1>
        <p className="text-gray-400 max-w-xl mx-auto">{t('clips.subtitle')}</p>
      </div>

      {CLIPS.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {CLIPS.map((clip, i) => (
            <ClipCard key={clip.id} clip={clip} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg">{t('clips.empty')}</p>
        </div>
      )}
    </section>
  );
}
