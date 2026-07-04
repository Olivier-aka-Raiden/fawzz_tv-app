import { useTranslation } from 'react-i18next';

export default function Live() {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('live.title')}</h1>
        <p className="text-gray-400">{t('live.subtitle')}</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="aspect-video bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <iframe
            src="https://player.twitch.tv/?channel=fawzz_tv&parent=localhost&parent=fawzz-tv.vercel.app"
            className="w-full h-full"
            allowFullScreen
          />
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://twitch.tv/fawzz_tv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-twitch hover:bg-twitch-glow text-white font-semibold rounded-xl transition-colors"
          >
            {t('live.cta')}
          </a>
        </div>
      </div>
    </section>
  );
}
