import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import type { Project } from '../../types/project';

const ACCENT = {
  cyan: { border: 'border-electric-cyan', shadow: 'bg-electric-cyan', text: 'text-electric-cyan' },
  yellow: { border: 'border-alert-yellow', shadow: 'bg-alert-yellow', text: 'text-alert-yellow' },
  red: { border: 'border-blood-red', shadow: 'bg-blood-red', text: 'text-blood-red' },
} as const;

/** Matches the card's clip so the shadow reads as one solid geometric slab. */
const SLANT = 'polygon(0 0, 100% 0, calc(100% - 1rem) 100%, 0 100%)';

/** The house layout curve: fast out, hard settle. Never floaty. */
const EASE = [0.16, 1, 0.3, 1] as const;

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpen: (project: Project) => void;
}

/**
 * TARTARUS CARD
 *
 * Structure matters here: the hard shadow layers live in a WRAPPER, not inside
 * the face. A negative-`z-index` child paints ABOVE its own parent's
 * background, so nesting them inside the card would flood the face with accent
 * colour and swallow the title.
 *
 * · wrapper `layout`       → the grid REFLOWS on filter change as a transform,
 *                            never a layout pass.
 * · face    `layoutId`     → the same id the full-screen detail uses, so opening
 *                            a project MORPHS the card into the panel instead of
 *                            stacking a modal on top of it.
 * · shadows `whileHover`   → snap in tight and flip to alert-yellow.
 */
export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  const { play, playVaried } = useAudio();
  const a = ACCENT[project.accent];

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.35, ease: EASE } }}
      className="group relative"
    >
      {/* ---- hard offset shadows (siblings of the face, behind it) ---- */}
      <motion.span
        aria-hidden
        className={`absolute inset-0 ${a.shadow}`}
        initial={false}
        animate={{ x: 14, y: 14, opacity: 1 }}
        whileHover={{ x: 7, y: 7 }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{ clipPath: SLANT }}
      />
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-alert-yellow"
        initial={false}
        animate={{ x: 14, y: 14, opacity: 0 }}
        whileHover={{ x: 7, y: 7, opacity: 1 }}
        transition={{ duration: 0.2, ease: EASE }}
        style={{ clipPath: SLANT }}
      />

      {/* ---- face ---- */}
      <motion.div
        layoutId={`project-${project.id}`}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.28, ease: EASE }}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.99 }}
        role="button"
        tabIndex={0}
        aria-label={`Open project ${project.title}`}
        onClick={() => {
          playVaried('click_heavy');
          onOpen(project);
        }}
        onPointerEnter={() => play('hover')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            playVaried('click_heavy');
            onOpen(project);
          }
        }}
        className={`relative flex min-h-[15rem] cursor-pointer flex-col border-2 bg-midnight p-6 ${a.border}`}
        style={{ clipPath: SLANT }}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="font-mono text-[10px] tracking-[0.3em] text-stark-white/50">
            {String(index + 1).padStart(2, '0')} // {project.year}
          </span>
          <ArrowUpRight
            size={18}
            strokeWidth={2.5}
            className={`${a.text} opacity-70 transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100`}
          />
        </div>

        <h3 className={`mt-4 font-display text-3xl italic ${a.text}`}>{project.title}</h3>
        <p className="mt-1 font-mono text-xs text-stark-white/60">{project.subtitle}</p>

        <p className="mt-4 flex-1 font-mono text-xs leading-relaxed text-stark-white/70">{project.blurb}</p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="clip-p3-slant-sm border border-stark-white/25 px-2 py-0.5 font-mono text-[9px] tracking-widest text-stark-white/70"
            >
              {tag}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

export default ProjectCard;
