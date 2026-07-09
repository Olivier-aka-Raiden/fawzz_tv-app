import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { Project } from '../../types/project';

const STAT_LABEL_KEYS: Record<string, string> = {
  Distance: 'adventures.statsDistance',
  Durée: 'adventures.statsDuration',
  Stream: 'adventures.statsStream',
  Watch: 'adventures.statsWatch',
};

export default function AdventureCard({ project, index }: { project: Project; index: number }) {
  const { t } = useTranslation();
  const tk = (suffix: string) => project.tKey ? t(`${project.tKey}.${suffix}`, project[suffix as keyof Project] as string) : (project as any)[suffix];
  const tv = (label: string, fallback: string) => project.tKey ? t(`${project.tKey}.statValue.${label}`, fallback) : fallback;

  const card = (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`bg-gray-900 border rounded-2xl overflow-hidden transition-all p-6 flex flex-col gap-4 h-full group ${
        project.comingSoon
          ? 'border-twitch/30 bg-gradient-to-br from-gray-900 via-gray-900 to-twitch/5 cursor-default'
          : 'border-gray-800 hover:border-gray-700 hover:bg-gray-900/80 cursor-pointer'
      }`}
    >
      {project.badge && (
        <span
          className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full w-fit ${
            project.comingSoon
              ? 'bg-twitch/10 text-twitch-glow border border-twitch/30'
              : 'bg-twitch/20 text-twitch'
          }`}
        >
          {project.tKey ? t(`${project.tKey}.badge`, project.badge) : project.badge}
        </span>
      )}
      <h3 className="text-xl font-bold text-white group-hover:text-twitch-glow transition-colors">
        {tk('title')}
      </h3>
      <p className="text-gray-500 text-sm">{tk('subtitle')}</p>
      <p className="text-gray-400 text-sm leading-relaxed flex-1">{tk('description')}</p>
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
        {project.stats.map(stat => (
          <div key={stat.label}>
            <div className={`text-lg font-bold ${stat.value === '???' ? 'text-gray-600' : 'text-white'}`}>
              {project.comingSoon && stat.value === '???' ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} className="text-twitch/50" />
                  <span className="text-gray-600 text-sm font-normal">{t('adventures.comingSoon')}</span>
                </span>
              ) : (
                tv(stat.label, stat.value)
              )}
            </div>
            <div className="text-xs text-gray-500">
              {t(STAT_LABEL_KEYS[stat.label] || stat.label, stat.label)}
            </div>
          </div>
        ))}
      </div>

      {project.comingSoon && (
        <div className="absolute top-4 right-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-twitch/60 animate-pulse">
            {t('adventures.comingSoon')}
          </span>
        </div>
      )}
    </motion.article>
  );

  if (project.comingSoon) {
    return <div className="h-full relative">{card}</div>;
  }

  return (
    <Link to={`/aventures/${project.id}`} className="block h-full group">
      {card}
    </Link>
  );
}
