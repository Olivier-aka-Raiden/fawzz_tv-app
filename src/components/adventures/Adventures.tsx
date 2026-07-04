import { useTranslation } from 'react-i18next';
import AdventureCard from './AdventureCard';
import { PROJECTS } from '../../data/adventures';

export default function Adventures() {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('adventures.title')}</h1>
        <p className="text-gray-400 max-w-xl mx-auto">{t('adventures.subtitle')}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROJECTS.map((project, i) => (
          <AdventureCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
