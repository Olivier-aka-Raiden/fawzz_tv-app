import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { PROJECTS } from '../../data/adventures';

export default function AdventureDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const project = PROJECTS.find(p => p.id === id);

  if (!project) {
    return (
      <div className="py-32 text-center text-gray-500 px-4">
        <p className="text-lg">{t('adventures.notFound')}</p>
        <Link to="/aventures" className="block mt-4 text-twitch hover:text-twitch-glow">
          ← {t('adventures.back')}
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 px-4 max-w-6xl mx-auto">
      <Link to="/aventures" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={18} />
        {t('adventures.back')}
      </Link>

      <div className="mb-8">
        {project.badge && (
          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 bg-twitch/20 text-twitch rounded-full mb-3">
            {project.badge}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{project.title}</h1>
        <p className="text-gray-400 text-lg max-w-3xl">{project.description}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {project.stats.map((stat: { label: string; value: string }, i: number) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
          >
            <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">{t('adventures.story')}</h2>
        <p className="text-gray-600 text-sm">{t('adventures.relatedClipsComing')}</p>
      </div>
    </motion.div>
  );
}
