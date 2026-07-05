import { useTranslation } from 'react-i18next';
import AdventureCard from './AdventureCard';
import { PROJECTS } from '../../data/adventures';

export default function Adventures() {
  const { t } = useTranslation();

  return (
    <section className="py-24 px-4 max-w-[90rem] mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{t('adventures.title')}</h1>
        <p className="text-gray-400 max-w-xl mx-auto">{t('adventures.subtitle')}</p>
      </div>

      {/* Desktop: horizontal scroll with right-edge fade */}
      <div className="hidden md:block relative">
        {/* Scrollable row */}
        <div
          className="flex gap-6 overflow-x-auto pb-4 pr-12 snap-x snap-mandatory scrollbar-hide"
          style={{
            maskImage: 'linear-gradient(to right, black 60%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 95%)',
          }}
        >
          {PROJECTS.map((project, i) => (
            <div key={project.id} className="min-w-[340px] max-w-[380px] flex-shrink-0 snap-start self-stretch">
              <div className="h-full">
                <AdventureCard project={project} index={i} />
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint — subtle arrow on the right */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none hidden lg:block">
          <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Mobile: stacked column */}
      <div className="flex flex-col gap-6 md:hidden">
        {PROJECTS.map((project, i) => (
          <AdventureCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
