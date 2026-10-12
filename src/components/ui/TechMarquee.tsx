import { useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import {
    SiBlender,
    SiC,
    SiCplusplus,
    SiCss,
    SiDjango,
    SiDocker,
    SiFastapi,
    SiGithubactions,
    SiGsap,
    SiHtml5,
    SiJavascript,
    SiKubernetes,
    SiLinux,
    SiMongodb,
    SiNestjs,
    SiNodedotjs,
    SiNumpy,
    SiOpenaigym,
    SiOpencv,
    SiPandas,
    SiPostgresql,
    SiPrometheus,
    SiPython,
    SiPytorch,
    SiReact,
    SiRedis,
    SiScikitlearn,
    SiTailwindcss,
    SiTensorflow,
    SiTerraform,
    SiThreedotjs,
    SiTypescript,
    SiUnity,
    SiVite,
    SiWebgl,
} from 'react-icons/si';
import { useIsomorphicLayoutEffect } from '../../hooks/useGsap';
import type { StackItem, StackRow } from '../../types/stack';
import { gsap, prefersReducedMotion, setWillChange } from '../../utils/gsapDefaults';

/**
 * Brand marks, keyed by the `icon` string in `data/about-content.ts`.
 * Add a new tech = add one import + one line here. Nothing else changes.
 */
export const ICON_MAP: Record<string, IconType> = {
    blender: SiBlender,
    css: SiCss,
    django: SiDjango,
    docker: SiDocker,
    fastapi: SiFastapi,
    ghactions: SiGithubactions,
    gsap: SiGsap,
    html: SiHtml5,
    javascript: SiJavascript,
    kubernetes: SiKubernetes,
    linux: SiLinux,
    mongodb: SiMongodb,
    nestjs: SiNestjs,
    node: SiNodedotjs,
    numpy: SiNumpy,
    openai: SiOpenaigym,
    opencv: SiOpencv,
    pandas: SiPandas,
    postgres: SiPostgresql,
    prometheus: SiPrometheus,
    pytorch: SiPytorch,
    python: SiPython,
    react: SiReact,
    redis: SiRedis,
    sklearn: SiScikitlearn,
    tailwind: SiTailwindcss,
    terraform: SiTerraform,
    tensorflow: SiTensorflow,
    three: SiThreedotjs,
    typescript: SiTypescript,
    unity: SiUnity,
    vite: SiVite,
    webgl: SiWebgl,
    bash: SiLinux, 
    c: SiC,
    cpp: SiCplusplus,
    nextjs: SiReact,
};

export interface TechMarqueeProps {
    rows: StackRow[];
    /** Pixels per second. Shared by every row so they read at the same pace. */
    speed?: number;
    className?: string;
}

/** One chip: brand mark + mono label, followed by a P3R triangle separator. */
function Chip({ item, duplicate }: { item: StackItem; duplicate: boolean }) {
    const Icon = ICON_MAP[item.icon];
    return (
        <span
            className="group/chip inline-flex shrink-0 items-center gap-2.5 px-4 text-electric-cyan transition-colors duration-200 ease-out hover:text-alert-yellow"
            aria-hidden={duplicate || undefined}
        >
            {Icon && <Icon className="h-6 w-6 shrink-0" aria-hidden />}
            <span className="font-mono text-xs uppercase tracking-[0.2em]">{item.name}</span>
            <span aria-hidden className="clip-p3-triangle -ml-1 h-2.5 w-2.5 shrink-0 bg-alert-yellow/70" />
        </span>
    );
}

/**
 * A single running line.
 *
 * The group is rendered N times, where N is chosen at layout time so the track
 * is always wider than the frame. The tween then travels exactly one group
 * width — so the loop always lands pixel-on-pixel, whatever the viewport does.
 */
function MarqueeRow({ row, speed }: { row: StackRow; speed: number }) {
    const frame = useRef<HTMLDivElement>(null);
    const track = useRef<HTMLDivElement>(null);
    const [copies, setCopies] = useState(2);
    const reverse = row.reverse ?? false;

    // Overflow the frame: one group must cover the full width plus a little,
    // otherwise the line runs out of content and the edge shows empty space.
    useIsomorphicLayoutEffect(() => {
        const box = frame.current;
        const el = track.current;
        if (!box || !el || prefersReducedMotion()) return;

        const fit = () => {
            const needed = Math.ceil(box.clientWidth / (el.scrollWidth / copies)) + 1;
            setCopies((n) => (n === needed ? n : needed));
        };

        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(box);
        return () => ro.disconnect();
    }, [copies]);

    useIsomorphicLayoutEffect(() => {
        const el = track.current;
        if (!el || prefersReducedMotion()) return;

        const release = setWillChange(el);
        let tween: gsap.core.Tween | undefined;

        /** One loop = the width of a single group, measured live. */
        const measure = () => {
            const step = el.scrollWidth / copies;
            if (!step) return;
            tween?.kill();
            tween = gsap.fromTo(
                el,
                { x: reverse ? -step : 0 },
                {
                    x: reverse ? 0 : -step,
                    duration: step / speed,
                    ease: 'none',
                    repeat: -1,
                    force3D: true,
                    overwrite: 'auto',
                },
            );
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);

        // Park the line while the pointer is over it — the P3R "hold to read".
        const hold = () => tween?.pause();
        const resume = () => tween?.resume();
        frame.current?.addEventListener('pointerenter', hold);
        frame.current?.addEventListener('pointerleave', resume);

        return () => {
            ro.disconnect();
            tween?.kill();
            frame.current?.removeEventListener('pointerenter', hold);
            frame.current?.removeEventListener('pointerleave', resume);
            release();
        };
    }, [reverse, speed, copies]);

    return (
        <div
            ref={frame}
            className="clip-p3-sm relative overflow-hidden border-2 border-electric-cyan/45 bg-dark-hour/40"
        >
            {/* label tab — the track's left padding keeps chips clear of it */}
            <span className="clip-p3-sm absolute inset-y-0 left-0 z-10 flex w-32 items-center bg-alert-yellow pl-5 pr-7 font-mono text-[10px] uppercase tracking-[0.25em] text-midnight">
                {row.label}
            </span>

            <div ref={track} className="flex w-max py-3 pl-32">
                {Array.from({ length: copies }, (_, copy) =>
                    row.items.map((item) => (
                        // Every copy past the first is decorative: hidden from AT
                        // and from hover so the colour flip only tracks the real one.
                        <Chip key={`${item.name}-${copy}`} item={item} duplicate={copy > 0} />
                    )),
                )}
            </div>
        </div>
    );
}

/**
 * TECH MARQUEE
 *
 * Counter-running lines of tech-stack chips under the About lede. Each row
 * repeats its chip group until it overflows the frame, then translates the
 * track by exactly one group width — so the loop is seamless at any size.
 *
 * PERF: the only tweened property is `x` on a single `w-max` element — no
 * layout, no per-frame React work. `will-change` lives only while it runs, the
 * tween is re-measured through a ResizeObserver, and reduced-motion users get
 * a static, fully readable row instead.
 */
export function TechMarquee({ rows, speed = 55, className = '' }: TechMarqueeProps) {
    return (
        <div className={`space-y-3 ${className}`} aria-label="Tech stack">
            {rows.map((row) => (
                <MarqueeRow key={row.label} row={row} speed={speed} />
            ))}
        </div>
    );
}

export default TechMarquee;
