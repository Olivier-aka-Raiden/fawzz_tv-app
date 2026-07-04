import { useTranslation } from 'react-i18next';
import { Tv, MessageCircle, Video, Heart } from 'lucide-react';

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

        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://twitch.tv/fawzz_tv" target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 px-6 py-3 bg-twitch/20 hover:bg-twitch/30 text-twitch rounded-xl transition-colors border border-twitch/30">
            <Tv size={20} /> Twitch
          </a>
          <a href="https://twitter.com/fawzz_tv" target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-colors border border-blue-600/30">
            <MessageCircle size={20} /> Twitter
          </a>
          <a href="https://youtube.com/@fawzz_tv" target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-colors border border-red-600/30">
            <Video size={20} /> YouTube
          </a>
        </div>

        <p className="text-center text-gray-600 text-sm">
          {t('footer.madeWith')} <Heart size={14} className="inline text-red-500" /> par la communauté
        </p>
      </div>
    </section>
  );
}
