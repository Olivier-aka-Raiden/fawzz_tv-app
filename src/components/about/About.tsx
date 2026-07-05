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
      {/* Two-column layout: portrait left, content right */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16">
        {/* Portrait — left side, full height visible */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:w-2/5 shrink-0 flex justify-center lg:justify-end"
        >
          <picture>
            <source srcSet="/assets/brand/fawzz-portrait-bg.jpg" media="(min-width: 1201px)" />
            <source srcSet="/assets/brand/fawzz-portrait-bg-md.jpg" media="(min-width: 641px)" />
            <img
              src="/assets/brand/fawzz-portrait-bg-sm.jpg"
              alt="Fawzz_tv"
              className="w-64 sm:w-80 lg:w-full max-w-md rounded-2xl shadow-2xl shadow-black/50 object-cover object-top"
              loading="eager"
            />
          </picture>
        </motion.div>

        {/* Content — right side */}
        <div className="lg:w-3/5 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h1 className="brand-text text-4xl sm:text-5xl md:text-6xl mb-3">
              FAWZZ_TV
            </h1>
            <p className="text-gray-400 text-lg">
              {t('about.title')} — {t('about.subtitle')}
            </p>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-5"
          >
            {(t('about.bio', { returnObjects: true }) as string[]).map((p, i) => (
              <p key={i} className="text-gray-300 leading-relaxed text-sm sm:text-base">{p}</p>
            ))}
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3"
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
                {social.label}
              </a>
            ))}
          </motion.div>

          <p className="text-gray-600 text-sm pt-4 border-t border-gray-800">
            {t('footer.madeWith')} <Heart size={14} className="inline text-red-500" /> {t('footer.madeBy')}
          </p>
        </div>
      </div>
    </section>
  );
}
