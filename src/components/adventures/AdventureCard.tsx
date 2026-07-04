import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Project } from '../../types/project';

export default function AdventureCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link to={`/aventures/${project.id}`} className="block group">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        viewport={{ once: true }}
        className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all hover:bg-gray-900/80"
      >
        <div className="p-6 space-y-4">
          {project.badge && (
            <span className="inline-block text-xs font-semibold px-2.5 py-0.5 bg-twitch/20 text-twitch rounded-full">
              {project.badge}
            </span>
          )}
          <h3 className="text-xl font-bold text-white group-hover:text-twitch-glow transition-colors">
            {project.title}
          </h3>
          <p className="text-gray-500 text-sm">{project.subtitle}</p>
          <p className="text-gray-400 text-sm leading-relaxed">{project.description}</p>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
            {project.stats.map(stat => (
              <div key={stat.label}>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
