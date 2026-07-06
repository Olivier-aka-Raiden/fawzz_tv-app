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

      {/* Sponsor CTA */}
      <div className="mt-16 bg-gradient-to-br from-twitch/10 to-purple-900/20 border border-twitch/30 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {t('sponsors.ctaTitle')}
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">
          {t('sponsors.ctaBody')}
        </p>
        <a
          href="mailto:fawzz_tv@hotmail.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-twitch text-white font-semibold rounded-xl hover:bg-twitch-glow transition-colors neon-glow-sm"
        >
          {t('sponsors.ctaButton')}
        </a>
      </div>
    </section>
  );
}
