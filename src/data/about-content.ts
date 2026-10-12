import type { StackRow } from '../types/stack';

export const about = {
    heading: ['PROFILE', 'DOSSIER'],
    kicker: '// FILE 03 — SUBJECT PROFILE',

    /**
     * Artwork animated behind this page.
     * Drop images into `public/pf/` and list them here — each becomes its own
     * drifting, parallaxed, blend-moded layer.
     */
    backdrop: ['/pf/persona3.png'],
    backdropHint: 'DROP MORE ART INTO public/pf/ AND LIST IT HERE',

    lede: 'I currently enjoy working on AI & Backend Development. I also do some deployment and infrastructure work. I enjoy doing Pure Mathematics with the Passion, But most of the time I am working on AI and Engine Development. I am also a hobbyist in Game Development and WebGL.',

    bio: [
        'I started out tuning backend services and kept drifting toward the front end — not because it was easier, but because it is where a system finally has to answer to a human being. These days I live in the seam between the two: design systems, motion architecture, and the rendering work that keeps a busy interface at 60fps.',
        'My rule is simple. If an animation cannot be expressed as a transform or an opacity change, it is the wrong animation. That single constraint has made every interface I have shipped faster, lighter, and far easier for the next person to maintain.',
    ],

    /**
     * The two running tech-stack lines under the lede. Icons are brand marks
     * (Simple Icons), recoloured to the P3R palette by the component — drop a
     * new chip here and it shows up in the marquee immediately.
     */
    stack: [
        {
            label: 'Comfort Languages',
            reverse: true,
            items: [
                { icon: 'typescript', name: 'TYPESCRIPT' },
                { icon: 'python', name: 'PYTHON' },
                { icon: 'c', name: 'C' },
                { icon: 'cpp', name: 'C++' },
                { icon: 'bash', name: 'BASH' },
            ],
        },
        {
            label: 'AI & Backend Development',
            items: [
                { icon: 'pytorch', name: 'PYTORCH' },
                { icon: 'tensorflow', name: 'TENSORFLOW' },
                { icon: 'opencv', name: 'OPENCV' },
                { icon: 'sklearn', name: 'SCIKIT-LEARN' },
                { icon: 'nestjs', name: 'NESTJS' },
                { icon: 'node', name: 'NODE.JS' },
                { icon: 'fastapi', name: 'FASTAPI' },
                { icon: 'postgres', name: 'POSTGRESQL' },
                { icon: 'mongodb', name: 'MONGODB' },
                { icon: 'redis', name: 'REDIS' },
                { icon: 'docker', name: 'DOCKER' },
                { icon: 'ghactions', name: 'GITHUB ACTIONS' },
            ],
        },
        {
            label: 'UI',
            reverse: true,
            items: [
                { icon: 'react', name: 'REACT' },
                { icon: 'tailwind', name: 'TAILWIND' },
                { icon: 'gsap', name: 'GSAP' },
                { icon: 'nextjs', name: 'NEXT.JS' },
            ],
        },
    ] satisfies StackRow[],

    skills: [
        { name: 'AI / Machine Learning Engineering', level: 92 },
        { name: 'Backend Development & API Design', level: 91 },
        { name: 'Infrastructure & Deployment', level: 90 },
        { name: 'DevOps / MLOps Engineering', level: 90 },
        { name: 'System Design & Architecture', level: 88 },
    ],

    timeline: [
        { year: '2025 — Present', role: 'AI & Backend Developer ', org: 'FAKERS Organization', note: 'Built a Restful APIs and Infrastructure for Production Deployment' },
        { year: 'June 2026 — September 2026', role: 'AI Engineer', org: 'AI Farm Robotics', note: 'Built an end-to-end Inventory System Powered by AI.' },
        { year: 'July 2025 - October 2025', role: 'Backend Developer', org: 'Depth. AMS (ITC)', note: 'Built a Restful API using NestJS for University Management System.' },
        { year: '2025 - 2026', role: 'Assistant Professor', org: 'Institute of Technology of Cambodia', note: 'Where I learned that every frame has to earn its place.' },
    ],
};