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
    <section className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
      {/* Header: portrait left, title right — same width as bio card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-14"
      >
        {/* Portrait — left */}
        <div className="md:w-2/5 shrink-0 flex justify-center">
          <picture>
            <source srcSet="/assets/brand/fawzz-portrait-bg.jpg" media="(min-width: 1201px)" />
            <source srcSet="/assets/brand/fawzz-portrait-bg-md.jpg" media="(min-width: 641px)" />
            <img
              src="/assets/brand/fawzz-portrait-bg-sm.jpg"
              alt="Fawzz_tv"
              className="w-56 sm:w-72 md:w-full max-w-xs rounded-2xl shadow-2xl shadow-black/40 object-cover object-top"
              loading="eager"
            />
          </picture>
        </div>

        {/* Title — right */}
        <div className="md:w-3/5 text-center md:text-left">
          <h1 className="brand-text text-4xl sm:text-5xl md:text-6xl mb-3">FAWZZ_TV</h1>
          <p className="text-gray-400 text-base sm:text-lg">
            {t('about.title')} — {t('about.subtitle')}
          </p>
        </div>
      </motion.div>

      {/* Bio card — centered */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-5 mb-12"
      >
        {(t('about.bio', { returnObjects: true }) as string[]).map((p, i) => (
          <p key={i} className="text-gray-300 leading-relaxed text-sm sm:text-base">{p}</p>
        ))}
      </motion.div>

      {/* Social links — centered */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-3 mb-6"
      >
        {SOCIALS.map(social => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors border text-sm ${social.color}`}
          >
            <social.icon size={18} />
            <span className="hidden sm:inline">{social.label}</span>
          </a>
        ))}
      </motion.div>

      {/* Footer — centered */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-gray-600 text-sm"
      >
        {t('footer.madeWith')} <Heart size={14} className="inline text-red-500" /> {t('footer.madeBy')}
      </motion.p>
    </section>
  );
}
