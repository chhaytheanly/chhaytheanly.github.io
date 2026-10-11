export function DarkHourOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
      {/* multiply-blended blue tint — subtle enough that stark-white stays stark */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#001F3F',
          mixBlendMode: 'multiply',
          opacity: 0.3,
        }}
      />

      {/* faint Tartarus grid, cyan */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* vignette — radial gradients are paint-once, not per-frame */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(10,15,28,0) 55%, rgba(10,15,28,0.5) 100%)',
        }}
      />

      {/* slow scanline (CSS keyframes, transform-only) */}
      <div
        className="absolute inset-x-0 top-0 h-24 opacity-[0.06]"
        style={{
          background: 'linear-gradient(to bottom, transparent, #00E5FF, transparent)',
          animation: 'scan-line 9s linear infinite',
        }}
      />
    </div>
  );
}

export default DarkHourOverlay;
