import p3 from '../assets/audio/p3.mp3';

export const music = {
  volume: 0.3,
  tracks: [
    // { id: 'dark-hour', title: 'THE DARK HOUR', mood: 'AMBIENT', src: bgmDarkHour },
    { id: 'p3', title: 'Memories of You!', mood: 'NOSTALGIC', src: p3 },
  ],
} as const;

export const site = {
  name: 'ChhayThean',
  handle: 'LCT',
  role: 'AI & Backend Engineer',

  heroLines: ['INFRA', 'API', 'INTO YOU'],

  heroKicker: '// AI Engineer · Backend · Dev/ML Ops',

  heroBody:
    'I currently work on AI infrastructure and backend systems. I also build web interfaces and tooling for creative workflows. I enjoy doing Pure Mathematics with the Passion, But most of the time I am working on AI and Engine Development. I am also a hobbyist in Game Development and WebGL. I am currently available for work in 2026.',

  stats: [
    { value: '60', suffix: 'FPS', label: 'LOCKED TARGET' },
    { value: '2', suffix: 'YRS', label: 'BACKEND DEVELOPMENT' },
    { value: '2', suffix: 'YRS', label: 'AI ENGINEERING & INFRASTRUCTURE' },
  ],

  ctaPrimary: 'ENTER PROJECTS',
  ctaSecondary: 'ABOUT ME',

  socials: [
    { label: 'GITHUB', href: 'https://github.com/chhaytheanly' },
    { label: 'TWITTER', href: 'https://twitter.com' },
    { label: 'LINKEDIN', href: 'https://linkedin.com' },
  ],

  availability: 'AVAILABLE FOR WORK — 2026',
};
