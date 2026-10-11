import { KineticText } from '../ui/KineticText';
import { GeometricShape } from '../ui/GeometricShape';
import { PortraitDrop } from '../ui/PortraitDrop';
import { P3Menu, type MenuItem } from '../ui/P3Menu';
import { navigate } from '../../hooks/useHashRoute';
import { site } from '../../data/siteContent';

/**
 * HERO — the P3 main menu.
 *
 * Beat sheet (all transform/opacity, nothing over 0.5s):
 *   0.00s  portrait SLAMS down from above the frame   expo.out  0.45s
 *   0.23s  accent plate snaps in behind it            power4.out
 *   0.15s  headline chars slam in per-letter          expo.out  stagger 0.05
 *   0.30s  menu rows stagger in from the left         power4.out stagger 0.06
 *   3.4s   portrait begins a slow idle drift          sine.inOut yoyo
 */
export function Hero() {
  const menu: MenuItem[] = [
    { id: 'projects', label: site.ctaPrimary, hint: 'TARTARUS', onSelect: () => navigate('/projects') },
    { id: 'about', label: site.ctaSecondary, hint: 'PROFILE', onSelect: () => navigate('/about') },
    { id: 'contact', label: 'CONTACT', hint: 'TRANSMIT', onSelect: () => navigate('/contact') },
  ];

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 pb-28 pt-32">
      {/* ---- the menu portrait drops in behind everything ---- */}
      <PortraitDrop className="top-[6%] hidden w-[44%] lg:block" />
      <PortraitDrop
        className="left-auto right-[-26%] top-[4%] w-[78%] opacity-[0.22] lg:hidden"
        delay={0.25}
        interactive={false}
      />

      {/* scrim: keeps copy + menu readable where the artwork sits behind it */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[68%] lg:block"
        style={{
          background:
            'linear-gradient(to right, rgba(10,15,28,0.96) 0%, rgba(10,15,28,0.9) 45%, rgba(10,15,28,0) 100%)',
        }}
      />

      {/* ---- ambient geometry ---- */}
      <GeometricShape
        shape="bolt"
        color="cyan"
        size="h-36 w-36"
        drift={30}
        spin={16}
        duration={8}
        opacity={0.14}
        style={{ top: '22%', right: '4%' }}
      />
      <GeometricShape
        shape="triangle"
        color="yellow"
        size="h-20 w-20"
        drift={22}
        sway={-8}
        duration={6.5}
        delay={0.8}
        opacity={0.14}
        style={{ top: '30%', left: '3%' }}
      />

      {/* ---- content ---- */}
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* kicker + identity */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="clip-p3-slant-sm bg-electric-cyan px-3 py-1 font-display text-xs italic text-midnight">
            {site.handle} // PORTFOLIO
          </span>
          <span className="font-mono text-xs tracking-[0.3em] text-alert-yellow">{site.heroKicker}</span>
        </div>

        <p className="mt-7 font-mono text-sm tracking-[0.5em] text-stark-white/70">{site.name}</p>

        {/* KINETIC HEADLINE */}
        <h1 className="mt-3 max-w-4xl font-display text-[11vw] leading-[0.98] text-stark-white md:text-[6.4vw] lg:text-[4.9vw]">
          {site.heroLines.map((line, i) => (
            <KineticText
              key={line}
              as="span"
              text={line}
              per="char"
              delay={0.15 + i * 0.18}
              stagger={0.05}
              duration={0.45}
              className={`block italic ${i === 1 ? 'text-stroke-cyan' : ''} ${i === 2 ? 'text-alert-yellow' : ''}`}
            />
          ))}
        </h1>

        <div className="mt-8 max-w-2xl">
          <p className="font-display text-xl italic text-electric-cyan">{site.role}</p>
          <p className="mt-3 font-mono text-sm leading-relaxed text-stark-white/70">{site.heroBody}</p>
        </div>

        {/* THE MENU */}
        <div className="mt-10 max-w-xl">
          <p className="font-mono text-[10px] tracking-[0.4em] text-stark-white/40">// SELECT</p>
          <div className="mt-3">
            <P3Menu items={menu} delay={0.3} />
          </div>
        </div>

        {/* stats */}
        <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
          {site.stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`clip-p3-sm border-2 p-4 ${
                i === 1 ? 'border-alert-yellow bg-alert-yellow/5' : 'border-electric-cyan/50 bg-dark-hour/40'
              }`}
            >
              <dt className="font-mono text-[10px] tracking-widest text-stark-white/60">{stat.label}</dt>
              <dd
                className={`mt-2 font-display text-3xl italic ${i === 1 ? 'text-alert-yellow' : 'text-electric-cyan'}`}
              >
                {stat.value}
                <span className="text-base">{stat.suffix}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ---- availability ticker ---- */}
      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping bg-alert-yellow opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 bg-alert-yellow" />
        </span>
        <span className="font-mono text-[11px] tracking-[0.25em] text-alert-yellow">{site.availability}</span>
      </div>
    </section>
  );
}

export default Hero;
