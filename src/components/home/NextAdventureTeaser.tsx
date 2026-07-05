import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';

export default function NextAdventureTeaser() {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          <Compass size={20} className="text-twitch/60" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t('home.teaser.title')}
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          {t('home.teaser.subtitle')}
        </p>

        <Link
          to="/aventures"
          className="inline-flex items-center gap-2 px-6 py-3 bg-twitch/10 hover:bg-twitch/20 text-twitch-glow border border-twitch/30 rounded-xl transition-all hover:scale-105 font-medium"
        >
          <Compass size={18} />
          {t('home.teaser.cta')}
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  );
}
