import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowDown } from 'lucide-react';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(145,70,255,0.12),transparent_70%)]" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <img
            src="/assets/brand/logo.png"
            alt="Fawzz_tv"
            className="h-24 md:h-32 w-auto mx-auto mb-6 drop-shadow-[0_0_30px_rgba(145,70,255,0.4)]"
          />
          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
            {t('home.hero.tagline')}
          </p>
          <a
            href="https://twitch.tv/fawzz_tv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-twitch hover:bg-twitch-glow text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-twitch/25"
          >
            <ExternalLink size={20} />
            {t('home.hero.cta')}
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-16">
          <ArrowDown className="mx-auto text-gray-600 animate-bounce" size={24} />
        </motion.div>
      </div>
    </section>
  );
}
