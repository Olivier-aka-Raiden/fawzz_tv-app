import { useTranslation } from 'react-i18next';
import SponsorCard from './SponsorCard';
import type { Sponsor } from '../../types/sponsor';

const SPONSORS: Sponsor[] = [];

export default function Sponsors() {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('sponsors.title')}</h1>
        <p className="text-gray-400 max-w-xl mx-auto">{t('sponsors.subtitle')}</p>
      </div>

      {SPONSORS.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPONSORS.map((sponsor, i) => (
            <SponsorCard key={sponsor.id} sponsor={sponsor} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg">{t('sponsors.empty')}</p>
          <p className="text-sm mt-2">{t('sponsors.emptySub')}</p>
        </div>
      )}
    </section>
  );
}
