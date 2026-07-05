import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Tv, MessageCircle, Video, Ghost, Music2, Heart } from 'lucide-react';

const SOCIALS = [
  {
    href: 'https://www.twitch.tv/fawzz_tv',
    label: 'Twitch',
    icon: Tv,
    color: 'text-twitch border-twitch/30 bg-twitch/20 hover:bg-twitch/30',
  },
  {
    href: 'https://x.com/Fawzz_tv',
    label: 'X (Twitter)',
    icon: MessageCircle,
    color: 'text-gray-300 border-gray-600 bg-gray-800/40 hover:bg-gray-700',
  },
  {
    href: 'https://www.tiktok.com/@fawzztv',
    label: 'TikTok',
    icon: Music2,
    color: 'text-pink-400 border-pink-600/30 bg-pink-600/20 hover:bg-pink-600/30',
  },
  {
    href: 'https://snapchat.com/add/fawzz-tv',
    label: 'Snapchat',
    icon: Ghost,
    color: 'text-yellow-400 border-yellow-600/30 bg-yellow-600/20 hover:bg-yellow-600/30',
  },
  {
    href: 'https://www.youtube.com/@Fawzztv',
    label: 'YouTube',
    icon: Video,
    color: 'text-red-400 border-red-600/30 bg-red-600/20 hover:bg-red-600/30',
  },
];

export default function About() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero — full-width portrait background */}
      <section className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Portrait image — fills the section */}
        <picture className="absolute inset-0">
          <source srcSet="/assets/brand/fawzz-portrait-bg.jpg" media="(min-width: 1201px)" />
          <source srcSet="/assets/brand/fawzz-portrait-bg-md.jpg" media="(min-width: 641px)" />
          <img
            src="/assets/brand/fawzz-portrait-bg-sm.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        </picture>

        {/* Gradient overlay — darkens bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/30" />

        {/* Content overlaid on portrait */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="brand-text text-5xl sm:text-6xl md:text-7xl mb-4"
          >
            FAWZZ_TV
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg sm:text-xl mb-8"
          >
            {t('about.title')} — {t('about.subtitle')}
          </motion.p>

          {/* Bio — semi-transparent card on top of portrait */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-950/70 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 sm:p-8 space-y-5 text-left"
          >
            {(t('about.bio', { returnObjects: true }) as string[]).map((p, i) => (
              <p key={i} className="text-gray-300 leading-relaxed text-sm sm:text-base">{p}</p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Socials + footer — below the portrait */}
      <section className="py-12 px-4 max-w-3xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {SOCIALS.map(social => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors border ${social.color}`}
            >
              <social.icon size={20} />
              {social.label}
            </a>
          ))}
        </motion.div>

        <p className="text-center text-gray-600 text-sm">
          {t('footer.madeWith')} <Heart size={14} className="inline text-red-500" /> {t('footer.madeBy')}
        </p>
      </section>
    </div>
  );
}
