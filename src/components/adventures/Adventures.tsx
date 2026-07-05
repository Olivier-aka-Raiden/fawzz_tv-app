import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdventureCard from './AdventureCard';
import { PROJECTS } from '../../data/adventures';

export default function Adventures() {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
  };

  return (
    <section className="py-24 px-4 max-w-[90rem] mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{t('adventures.title')}</h1>
        <p className="text-gray-400 max-w-xl mx-auto">{t('adventures.subtitle')}</p>
      </div>

      {/* Desktop: horizontal scroll with arrows outside */}
      <div className="hidden md:flex items-stretch gap-0">
        {/* Left arrow slot — fixed width to prevent layout shift */}
        <div className="w-12 shrink-0 flex items-center justify-center">
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-gray-800/80 hover:bg-gray-700 border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-colors shadow-lg"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {/* Scrollable row */}
        <div className="relative flex-1 min-w-0">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          >
            {PROJECTS.map((project, i) => (
              <div key={project.id} className="min-w-[340px] max-w-[380px] flex-shrink-0 snap-start self-stretch">
                <div className="h-full">
                  <AdventureCard project={project} index={i} />
                </div>
              </div>
            ))}
          </div>

          {/* Gradient fade overlay — left edge, blocks clicks on faded cards */}
          {canScrollLeft && (
            <div
              className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-auto"
              style={{
                background: 'linear-gradient(to left, transparent 0%, rgb(3 7 18) 100%)',
              }}
            />
          )}

          {/* Gradient fade overlay — right edge, blocks clicks on faded cards */}
          {canScrollRight && (
            <div
              className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-auto"
              style={{
                background: 'linear-gradient(to right, transparent 0%, rgb(3 7 18) 100%)',
              }}
            />
          )}
        </div>

        {/* Right arrow slot */}
        <div className="w-12 shrink-0 flex items-center justify-center">
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-gray-800/80 hover:bg-gray-700 border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-colors shadow-lg"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          )}
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
