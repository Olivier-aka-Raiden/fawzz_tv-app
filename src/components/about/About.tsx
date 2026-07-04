import { useTranslation } from 'react-i18next';
import { Tv, MessageCircle, Video, Ghost, Music2, Heart } from 'lucide-react';

const SOCIALS = [
  {
    href: 'https://www.twitch.tv/fawzz_tv',
    label: 'Twitch',
    icon: Tv,
    color: 'text-twitch border-twitch/30 bg-twitch/20 hover:bg-twitch/30',
    hoverColor: 'hover:text-twitch',
  },
  {
    href: 'https://x.com/Fawzz_tv',
    label: 'X (Twitter)',
    icon: MessageCircle,
    color: 'text-gray-300 border-gray-600 bg-gray-800/40 hover:bg-gray-700',
    hoverColor: 'hover:text-gray-200',
  },
  {
    href: 'https://www.tiktok.com/@fawzztv',
    label: 'TikTok',
    icon: Music2,
    color: 'text-pink-400 border-pink-600/30 bg-pink-600/20 hover:bg-pink-600/30',
    hoverColor: 'hover:text-pink-400',
  },
  {
    href: 'https://snapchat.com/add/fawzz_tv',
    label: 'Snapchat',
    icon: Ghost,
    color: 'text-yellow-400 border-yellow-600/30 bg-yellow-600/20 hover:bg-yellow-600/30',
    hoverColor: 'hover:text-yellow-400',
  },
  {
    href: 'https://www.youtube.com/@Fawzztv',
    label: 'YouTube',
    icon: Video,
    color: 'text-red-400 border-red-600/30 bg-red-600/20 hover:bg-red-600/30',
    hoverColor: 'hover:text-red-400',
  },
];

export default function About() {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('about.title')}</h1>
        <p className="text-gray-400">{t('about.subtitle')}</p>
      </div>

      <div className="space-y-8 text-gray-300 leading-relaxed">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
          <p>
            Fawzz_tv est une chaîne Twitch française construite autour de l'authenticité,
            de la communauté et des défis ambitieux. Après 8 ans de streaming, ce qui a
            commencé comme une chaîne FPS compétitive (Counter-Strike, Valorant) est
            devenu un espace où le gaming coexiste avec des aventures IRL originales.
          </p>
          <p>
            La caractéristique principale de la chaîne est la relation avec sa communauté.
            Plutôt que de simplement regarder, les viewers façonnent activement le contenu
            à travers leurs décisions, interactions et soutien.
          </p>
          <p>
            La chaîne ne cherche pas les moments viraux — elle crée des aventures
            mémorables ensemble, avec une emphase sur les rencontres humaines, la
            spontanéité et le storytelling.
          </p>
        </div>

        {/* Social links */}
        <div className="flex flex-wrap justify-center gap-4">
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
        </div>

        <p className="text-center text-gray-600 text-sm">
          {t('footer.madeWith')} <Heart size={14} className="inline text-red-500" /> par la communauté
        </p>
      </div>
    </section>
  );
}
