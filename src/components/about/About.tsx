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
    <section className="py-16 px-4 max-w-3xl mx-auto">
      {/* Brand name — main element */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <h1 className="brand-text text-5xl sm:text-6xl md:text-7xl">
          FAWZZ_TV
        </h1>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-gray-500 text-lg mb-12"
      >
        {t('about.title')} — {t('about.subtitle')}
      </motion.p>

      <div className="space-y-8 text-gray-300 leading-relaxed">
        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6"
        >
          {(t('about.bio', { returnObjects: true }) as string[]).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
      </div>
    </section>
  );
}
