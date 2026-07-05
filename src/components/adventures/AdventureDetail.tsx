import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Map, Star, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { PROJECTS } from '../../data/adventures';
import { ROUTES } from '../../data/routes';
import RouteMap from '../shared/RouteMap';
import ClipCard from '../clips/ClipCard';
import { useAdventureClips } from '../../hooks/useClips';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AdventureDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const project = PROJECTS.find(p => p.id === id);

  if (!project) {
    return (
      <div className="py-32 text-center text-gray-500 px-4">
        <p className="text-lg">{t('adventures.notFound')}</p>
        <Link to="/aventures" className="inline-flex items-center gap-2 mt-4 text-twitch hover:text-twitch-glow transition-colors">
          <ArrowLeft size={16} /> {t('adventures.back')}
        </Link>
      </div>
    );
  }

  const route = ROUTES.find(r => r.id === project.routeId);

  // Coming soon — teaser view
  if (project.comingSoon) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 px-4 max-w-6xl mx-auto">
        <Link to="/aventures" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft size={18} />
          {t('adventures.back')}
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-8 w-20 h-20 rounded-full border-2 border-twitch/30 flex items-center justify-center"
          >
            <Compass size={36} className="text-twitch" />
          </motion.div>

          {project.badge && (
            <span className="inline-block text-xs font-semibold px-2.5 py-0.5 bg-twitch/10 text-twitch-glow border border-twitch/30 rounded-full mb-4">
              {project.badge}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{project.title}</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mb-8">{project.description}</p>

          <div className="max-w-md mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-500 text-sm mb-4">{t('adventures.comingSoonTeaser')}</p>
            <div className="grid grid-cols-2 gap-4">
              {project.stats.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-gray-600">???</div>
                  <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-gray-600 text-sm">{t('adventures.comingSoonCta')}</p>
        </motion.div>
      </motion.div>
    );
  }

  // Fetch clips for this adventure's date range
  const adventureClips = useAdventureClips(
    project.dates?.start ?? '',
    project.dates?.end ?? '',
  );
  const hasDates = !!(project.dates?.start && project.dates?.end);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 px-4 max-w-6xl mx-auto">
      {/* Back link */}
      <Link
        to="/aventures"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm"
      >
        <ArrowLeft size={18} />
        {t('adventures.back')}
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        {project.badge && (
          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 bg-twitch/20 text-twitch rounded-full mb-4">
            {project.badge}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{project.title}</h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">{project.description}</p>
      </motion.div>

      {/* Dates */}
      {project.dates && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 text-gray-400 mb-8"
        >
          <Calendar size={18} className="text-twitch" />
          <span className="text-sm">
            {t('adventures.dates')} : {formatDate(project.dates.start)} → {formatDate(project.dates.end)}
          </span>
        </motion.div>
      )}

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
      >
        {project.stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center hover:border-gray-700 transition-colors"
          >
            <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1.5 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Route Map */}
      {route && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <Map size={18} className="text-twitch" />
            <h2 className="text-xl font-bold text-white">{t('adventures.route')}</h2>
          </div>
          <RouteMap route={route} className="h-[350px] md:h-[500px]" />
        </motion.div>
      )}

      {/* Story + Highlights — two columns on desktop */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Story */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">{t('adventures.story')}</h2>
          <div className="text-gray-400 leading-relaxed space-y-4">
            <p>{project.description}</p>
            <p>
              {project.id === 'sochaux-nice-2022' && (
                "En juillet 2022, Fawzz_tv se lance dans son premier grand défi IRL : traverser la France à vélo, de Sochaux à Nice, en streamant l'intégralité du parcours en direct sur Twitch. L'équipement était minimal, l'organisation artisanale — mais l'énergie de la communauté était au rendez-vous. L'arrivée sur la Méditerranée a marqué la naissance d'un nouveau format sur la chaîne."
              )}
              {project.id === 'sochaux-denmark-2023' && (
                "Forte du succès de la première édition, l'aventure 2023 voit plus grand : une traversée européenne jusqu'au Danemark. Avec 1 000 km au compteur et 4 pays traversés, cette édition a confirmé que le format longue distance en autonomie était viable — et que la communauté était prête à suivre sur la durée."
              )}
              {project.id === 'sochaux-malta-2024' && (
                "L'édition 2024 a tout changé avec l'introduction du format SubaBike : chaque abonnement ajoute des kilomètres au parcours. Un donateur a fait exploser le compteur en ajoutant 1 700 km d'un coup. Résultat : 34 jours de stream, 5 pays traversés, et une aventure dont la communauté a littéralement écrit le scénario en temps réel."
              )}
            </p>
          </div>
        </motion.div>

        {/* Highlights */}
        {project.highlights && project.highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-yellow-500" />
              <h2 className="text-xl font-bold text-white">{t('adventures.highlights')}</h2>
            </div>
            <ul className="space-y-4">
              {project.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-twitch shrink-0" />
                  <span className="leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Related Clips */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-12"
      >
        <h2 className="text-xl font-bold text-white mb-4">{t('adventures.relatedClips')}</h2>

        {hasDates ? (
          <>
            {adventureClips.loading && adventureClips.clips.length === 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-800" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-3/4" />
                      <div className="h-3 bg-gray-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adventureClips.clips.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {adventureClips.clips.slice(0, 6).map((clip, i) => (
                  <ClipCard key={clip.id} clip={clip} index={i} />
                ))}
              </div>
            )}

            {!adventureClips.loading && adventureClips.clips.length === 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                <p className="text-gray-500">{t('adventures.relatedClipsComing')}</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <p className="text-gray-500">{t('adventures.relatedClipsComing')}</p>
          </div>
        )}
      </motion.div>

      {/* Timeline — all adventures */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">{t('adventures.timeline')}</h2>
          <p className="text-gray-500 text-sm">{t('adventures.timelineSub')}</p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gray-800 md:-translate-x-px" />

          <div className="space-y-8">
            {PROJECTS.map((p, i) => {
              const isCurrent = p.id === project.id;
              return (
                <div key={p.id} className={`relative flex flex-col md:flex-row ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 top-6 -translate-x-1/2 z-10">
                    <div className={`w-4 h-4 rounded-full border-2 ${isCurrent ? 'bg-twitch border-twitch neon-glow-sm' : 'bg-gray-800 border-gray-600'}`} />
                  </div>

                  {/* Card */}
                  <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} pl-8 md:pl-0`}>
                    <Link
                      to={`/aventures/${p.id}`}
                      className={`block bg-gray-900 border rounded-2xl p-5 transition-all group ${
                        isCurrent
                          ? 'border-twitch/40 bg-twitch/5'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {p.badge && (
                          <span className="text-xs font-semibold px-2 py-0.5 bg-twitch/20 text-twitch rounded-full">
                            {p.badge}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] text-twitch font-medium uppercase tracking-wider">Actuel</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-twitch-glow transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.subtitle}</p>
                      <div className="flex gap-4 mt-3 text-xs text-gray-500">
                        {p.stats.slice(0, 2).map(s => (
                          <span key={s.label}>{s.value} {s.label.toLowerCase()}</span>
                        ))}
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
