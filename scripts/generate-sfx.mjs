import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'audio');
const SR = 44100;

const clamp = (v) => Math.max(-1, Math.min(1, v));
const decay = (t, tau) => Math.exp(-t / tau);
const lowpass = (prev, input, cutoff) => prev + (input - prev) * cutoff;
const hpNoise = (() => {
  let prev = 0;
  return () => {
    const n = Math.random() * 2 - 1;
    const out = n - prev;
    prev = n;
    return out;
  };
})();
const noise = () => Math.random() * 2 - 1;

function toWav(samples) {
  const bytes = samples.length * 2;
  const buf = Buffer.alloc(44 + bytes);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + bytes, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); // PCM chunk size
  buf.writeUInt16LE(1, 20); // format = PCM
  buf.writeUInt16LE(1, 22); // channels = mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32); // block align
  buf.writeUInt16LE(16, 34); // bits per sample
  buf.write('data', 36);
  buf.writeUInt32LE(bytes, 40);
  for (let i = 0; i < samples.length; i++) {
    buf.writeInt16LE(Math.round(clamp(samples[i]) * 32767), 44 + i * 2);
  }
  return buf;
}

const render = (duration, fn) => {
  const n = Math.floor(SR * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / SR, i, n);
  // 3ms fade-out to kill clicks at the tail
  const fade = Math.floor(SR * 0.003);
  for (let i = 0; i < fade; i++) out[n - 1 - i] *= i / fade;
  return out;
};

const hover = render(0.07, (t) => {
  const env = decay(t, 0.018) * (1 - t / 0.07);
  const tone = Math.sin(2 * Math.PI * 1180 * t) * 0.55 + Math.sin(2 * Math.PI * 1770 * t) * 0.25;
  return (tone + hpNoise() * 0.08) * env * 0.45;
});

const clickLight = render(0.06, (t) => {
  const env = decay(t, 0.012);
  const tone = Math.sin(2 * Math.PI * 880 * t) * 0.6 + Math.sin(2 * Math.PI * 1320 * t) * 0.3;
  return (tone + hpNoise() * 0.22) * env * 0.6;
});

const clickHeavy = render(0.18, (t) => {
  const env = decay(t, 0.045);
  const f = 190 * Math.exp(-t * 11) + 55; // pitch drop
  const body = Math.sin(2 * Math.PI * f * t) * 0.85;
  const click = hpNoise() * 0.35 * decay(t, 0.008);
  return (body * env + click) * 0.85;
});

const menuSwoosh = render(0.26, (t) => {
  const p = t / 0.26;
  const env = Math.sin(Math.PI * Math.pow(p, 0.7)) ** 1.6; 
  const cutoff = 0.05 + Math.sin(Math.PI * p) * 0.5;
  const sweep = Math.sin(2 * Math.PI * (280 + 1500 * p) * t) * 0.18;
  return (lowpass(0, noise(), cutoff) * 1.4 + sweep) * env * 0.5;
});

const transitionImpact = render(0.42, (t) => {
  const boom = Math.sin(2 * Math.PI * (95 * Math.exp(-t * 6) + 38) * t) * decay(t, 0.11);
  const crash = noise() * decay(t, 0.05) * 0.5;
  const shimmer = Math.sin(2 * Math.PI * 2400 * t) * decay(t, 0.02) * 0.12;
  return (boom * 1.0 + crash + shimmer) * 0.9;
});

mkdirSync(OUT_DIR, { recursive: true });
const files = {
  hover,
  click_light: clickLight,
  click_heavy: clickHeavy,
  menu_swoosh: menuSwoosh,
  transition_impact: transitionImpact,
};

for (const [name, samples] of Object.entries(files)) {
  const file = join(OUT_DIR, `${name}.wav`);
  writeFileSync(file, toWav(samples));
  console.log(`✓ ${name}.wav  (${(samples.length / SR).toFixed(2)}s)`);
}
console.log(`\n→ ${OUT_DIR}`);
console.log('Replace these with real P3R rips using the same filenames.');


