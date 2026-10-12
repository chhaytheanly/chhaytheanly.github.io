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

  heroLines: ['INTERFACES', 'THAT SLAM', 'INTO YOU'],

  heroKicker: '// AI Engineer · Backend · Dev/ML Ops',

  heroBody:
    'I design and build fast, high-contrast interfaces with the snappiness of a console menu. Every animation is transform-only, every frame earns its place.',

  stats: [
    { value: '60', suffix: 'FPS', label: 'LOCKED TARGET' },
    { value: '7', suffix: 'YRS', label: 'SHIPPING UI' },
    { value: '40', suffix: '+', label: 'PROJECTS' },
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
