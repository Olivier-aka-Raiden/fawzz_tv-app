import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Tv, Play, ArrowDown } from 'lucide-react';
import { useTwitchLive } from '../../hooks/useTwitchLive';

export default function Hero() {
  const { t } = useTranslation();
  const isLive = useTwitchLive();

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(145,70,255,0.15),transparent_70%)]" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Avatar — rounded like Twitch profile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="h-20 w-20 md:h-28 md:w-28 rounded-full overflow-hidden border-2 border-twitch/40 shadow-lg shadow-twitch/20 mx-auto mb-6">
            <img
              src="/assets/brand/fawzz-subabike.jpg"
              alt="FAWZZ_TV"
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="brand-text text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6"
        >
          FAWZZ_TV
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {t('home.hero.tagline')}
        </motion.p>

        {/* CTA — conditional: live → /live, offline → /clips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {isLive ? (
            <Link
              to="/live"
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl shadow-red-600/30 hover:shadow-red-500/40 overflow-hidden"
            >
              {/* Subtle animated background shimmer */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {/* Live pulsar dot */}
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
              </span>
              <span className="relative">{t('home.hero.ctaLive')}</span>
              <Tv size={18} className="relative" />
            </Link>
          ) : (
            <Link
              to="/clips"
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-twitch hover:bg-twitch-glow text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl shadow-twitch/25 hover:shadow-twitch/40 overflow-hidden"
            >
              {/* Subtle animated background shimmer */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Play size={18} className="relative" />
              <span className="relative">{t('home.hero.ctaClips')}</span>
            </Link>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16"
        >
          <ArrowDown className="mx-auto text-gray-600 animate-bounce" size={24} />
        </motion.div>
      </div>
    </section>
  );
}
