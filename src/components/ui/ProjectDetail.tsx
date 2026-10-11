import { motion } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAudio } from '../../hooks/useAudio';
import { useScreenShake } from '../../hooks/useScreenShake';
import type { Project } from '../../types/project';

const ACCENT = {
  cyan: { border: 'border-electric-cyan', shadow: 'bg-electric-cyan', text: 'text-electric-cyan' },
  yellow: { border: 'border-alert-yellow', shadow: 'bg-alert-yellow', text: 'text-alert-yellow' },
  red: { border: 'border-blood-red', shadow: 'bg-blood-red', text: 'text-blood-red' },
} as const;

interface ProjectDetailProps {
  project: Project | null;
  onClose: () => void;
}

/**
 * PROJECT DETAIL — a P3 menu EXPANDING, not a modal.
 *
 * The panel carries the same `layoutId` as the card that opened it, so
 * Framer Motion projects the card's box out to full screen in one continuous
 * transform animation. No modal chrome, no backdrop fade-over, no jank.
 *
 * PERF: the expanding surface animates `transform` (x/y/scale) only. The
 * scrolling body is `overflow-y: auto` INSIDE the panel so the page behind
 * never reflows.
 */
export function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  const { play } = useAudio();
  const { shake } = useScreenShake();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock background scroll while open — via `overflow`, which is a one-off
  // layout change on open/close, never per frame.
  useEffect(() => {
    if (!project) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        play('menu_swoosh');
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [project, onClose, play]);

  if (!project) return null;
  const a = ACCENT[project.accent];

  return (
    <motion.div
      data-project-detail=""
      className="fixed inset-0 z-[70]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* dim the grid behind (opacity only) */}
      <motion.button
        aria-label="Close project"
        data-close-detail=""
        onClick={() => {
          play('menu_swoosh');
          onClose();
        }}
        className="absolute inset-0 h-full w-full cursor-default bg-midnight/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* THE EXPANDING SURFACE */}
      <motion.div
        layoutId={`project-${project.id}`}
        className={`absolute inset-0 overflow-y-auto border-2 bg-midnight ${a.border}`}
        transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
        style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 3rem) 100%, 0 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-5xl px-8 py-24"
        >
          {/* header */}
          <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-stark-white/15 pb-8">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] text-stark-white/50">
                FILE // {project.year}
              </p>
              <h2 className={`mt-3 font-display text-6xl italic md:text-8xl ${a.text}`}>
                {project.title}
              </h2>
              <p className="mt-2 font-mono text-sm text-stark-white/70">{project.subtitle}</p>
            </div>

            <button
              ref={closeRef}
              onClick={() => {
                play('menu_swoosh');
                onClose();
              }}
              className="group flex items-center gap-2 border-2 border-electric-cyan px-4 py-2 font-display text-sm uppercase italic text-electric-cyan transition-colors duration-150 hover:border-alert-yellow hover:text-alert-yellow"
            >
              CLOSE
              <X
                size={18}
                strokeWidth={3}
                className="transition-transform duration-200 ease-out group-hover:rotate-90"
              />
            </button>
          </div>

          {/* body */}
          <div className="mt-10 grid gap-12 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-5">
              {project.body.map((para, i) => (
                <p key={i} className="font-mono text-sm leading-relaxed text-stark-white/80">
                  {para}
                </p>
              ))}

              <div className="mt-8 flex flex-wrap gap-3">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="clip-p3-slant-sm border border-stark-white/25 px-3 py-1 font-mono text-[10px] tracking-widest text-stark-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => play('click_heavy')}
                  className={`mt-8 inline-flex items-center gap-2 border-2 ${a.border} px-5 py-3 font-display text-sm uppercase italic ${a.text} transition-colors duration-150 hover:bg-midnight hover:text-alert-yellow`}
                >
                  <ExternalLink size={16} strokeWidth={2.5} />
                  VIEW LIVE
                </a>
              )}
            </div>

            {/* side panel */}
            <aside className="space-y-6">
              <div>
                <h3 className={`font-display text-xl italic ${a.text}`}>STACK</h3>
                <ul className="mt-3 space-y-2">
                  {project.stack.map((tech) => (
                    <li key={tech} className="flex items-center gap-2 font-mono text-xs text-stark-white/75">
                      <span className={`inline-block h-2 w-2 ${a.shadow}`} />
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`clip-p3-sm border-2 ${a.border} bg-dark-hour/40 p-5`}>
                <p className="font-mono text-[10px] tracking-widest text-stark-white/50">// STATUS</p>
                <p className={`mt-2 font-display text-2xl italic ${a.text}`}>SHIPPED</p>
                <p className="mt-1 font-mono text-[11px] text-stark-white/60">{project.year}</p>
              </div>

              <p className="font-mono text-[11px] leading-relaxed text-stark-white/45">
                PRESS <span className="text-alert-yellow">ESC</span> OR CLICK OUTSIDE TO CLOSE
              </p>
            </aside>
          </div>
        </motion.div>
      </motion.div>

      {/* landing kick */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-electric-cyan"
        initial={{ opacity: 0.9, scaleY: 4 }}
        animate={{ opacity: 0, scaleY: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onAnimationComplete={() => shake(4)}
      />
    </motion.div>
  );
}

export default ProjectDetail;
