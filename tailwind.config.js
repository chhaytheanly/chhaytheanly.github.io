import plugin from 'tailwindcss/plugin';

/**
 * This Tailwind build ships without the `clipPath` core plugin, so the P3R
 * geometry tokens in `theme.extend.clipPath` are registered manually here.
 * Same public API (`clip-p3-slant`, `clip-p3-bolt`, ...) — pure `clip-path`.
 */
const p3ClipPaths = plugin(({ addUtilities, theme }) => {
  const shapes = theme('clipPath');
  const utilities = {};
  for (const [name, value] of Object.entries(shapes)) {
    if (name.startsWith('p3-')) utilities[`.clip-${name}`] = { 'clip-path': value };
  }
  addUtilities(utilities);
});

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0A0F1C',
        'dark-hour': '#001F3F',
        'electric-cyan': '#00E5FF',
        'stark-white': '#F8F9FA',
        'alert-yellow': '#FFD700',
        'blood-red': '#E60000',
      },
      fontFamily: {
        display: ['Anton', 'Archivo Black', 'Impact', 'sans-serif'],
        body: ['Inter', 'Roboto Mono', 'ui-monospace', 'monospace'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        // HARD, OFFSET, SOLID-COLOR SHADOWS ONLY. No soft/blur shadows in this design system.
        cyan: '8px 8px 0px #00E5FF',
        'cyan-sm': '4px 4px 0px #00E5FF',
        'cyan-lg': '14px 14px 0px #00E5FF',
        yellow: '8px 8px 0px #FFD700',
        'yellow-sm': '4px 4px 0px #FFD700',
        red: '8px 8px 0px #E60000',
        'red-sm': '4px 4px 0px #E60000',
      },
      clipPath: {
        // Aggressive P3R-style angles. Keyframes only — see src/index.css for hover variants.
        'p3-slant': 'polygon(0 0, 100% 0, calc(100% - 1.25rem) 100%, 0 100%)',
        'p3-slant-sm': 'polygon(0 0, 100% 0, calc(100% - 0.75rem) 100%, 0 100%)',
        'p3-slant-r': 'polygon(1.25rem 0, 100% 0, 100% 100%, 0 100%)',
        'p3-notch': 'polygon(0 0, 100% 0, 100% calc(100% - 1.25rem), calc(100% - 1.25rem) 100%, 0 100%)',
        'p3-cut': 'polygon(0 0, 100% 0, 92% 100%, 0 100%)',
        'p3-arrow': 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)',
        'p3-triangle': 'polygon(50% 0, 100% 100%, 0 100%)',
        'p3-diamond': 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
        'p3-hex': 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)',
        'p3-parallelogram': 'polygon(0 0, 88% 0, 100% 100%, 12% 100%)',
        'p3-bolt': 'polygon(0 0, 62% 0, 38% 42%, 100% 42%, 22% 100%, 44% 56%, 0 56%)',
      },
      keyframes: {
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.15' },
        },
      },
      animation: {
        'scan-line': 'scan-line 7s linear infinite',
        blink: 'blink 1.6s steps(2, end) infinite',
      },
    },
  },
  plugins: [p3ClipPaths],
};
