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

    lede: 'I build interfaces that feel like hardware. Twelve years of shipping product UI taught me one thing: motion is not decoration, it is feedback. Every transition tells you what just happened and what will happen next.',

    bio: [
        'I started out tuning backend services and kept drifting toward the front end — not because it was easier, but because it is where a system finally has to answer to a human being. These days I live in the seam between the two: design systems, motion architecture, and the rendering work that keeps a busy interface at 60fps.',
        'My rule is simple. If an animation cannot be expressed as a transform or an opacity change, it is the wrong animation. That single constraint has made every interface I have shipped faster, lighter, and far easier for the next person to maintain.',
    ],

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