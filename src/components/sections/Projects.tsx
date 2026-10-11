import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { projectFilters, projects } from '../../data/project';
import { useAudio } from '../../hooks/useAudio';
import type { Project } from '../../types/project';
import { ProjectCard } from '../ui/ProjectCard';
import { ProjectDetail } from '../ui/ProjectDetail';

export function Projects() {
  const [filter, setFilter] = useState<string>('ALL');
  const [active, setActive] = useState<Project | null>(null);
  const { play } = useAudio();

  const visible = useMemo(
    () =>
      filter === 'ALL'
        ? projects
        : projects.filter((p) => p.tags.some((t) => t.toUpperCase() === filter)),
    [filter],
  );

  return (
    <section className="relative min-h-screen px-6 pb-24 pt-32">
      <div className="mx-auto max-w-7xl">
        {/* header */}
        <header className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-electric-cyan/30 pb-6">
          <div>
            <p className="font-mono text-xs tracking-[0.4em] text-electric-cyan">// INDEX 02</p>
            <h1 className="mt-3 font-display text-6xl italic text-stark-white md:text-7xl">TARTARUS</h1>
          </div>
          <p className="font-mono text-xs text-stark-white/50">
            {visible.length} / {projects.length} FILES LOADED
          </p>
        </header>

        {/* filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          {projectFilters.map((tag) => {
            const isActive = filter === tag;
            return (
              <button
                key={tag}
                onClick={() => {
                  play(isActive ? 'click_light' : 'click_heavy');
                  setFilter(tag);
                }}
                onPointerEnter={() => !isActive && play('hover')}
                aria-pressed={isActive}
                className={`relative border-2 px-4 py-2 font-mono text-[11px] tracking-widest transition-colors duration-150 ${
                  isActive
                    ? 'border-alert-yellow text-midnight'
                    : 'border-electric-cyan/40 text-stark-white/75 hover:border-electric-cyan hover:text-electric-cyan'
                }`}
                style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 0.6rem) 100%, 0 100%)' }}
              >
                {isActive && (
                  <motion.span
                    layoutId="filter-active"
                    className="absolute inset-0 -z-10 bg-alert-yellow"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                {tag}
              </button>
            );
          })}
        </div>

        {/* grid */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} onOpen={setActive} />
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 && (
          <p className="mt-16 text-center font-mono text-sm text-stark-white/50">
            // NO FILES IN THIS SECTOR
          </p>
        )}
      </div>

      {/* the card that becomes the page */}
      <AnimatePresence>{active && <ProjectDetail project={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </section>
  );
}

export default Projects;
