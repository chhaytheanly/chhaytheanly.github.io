import { about } from '../../data/about-content';
import { GeometricShape } from '../ui/GeometricShape';
import { KineticText } from '../ui/KineticText';
import { PortraitBackdrop } from '../ui/PortraitBackdrop';
import { P3Card } from '../ui/P3Card';


export function About() {
  return (
    <section className="relative min-h-screen overflow-hidden px-6 pb-24 pt-32">
      {/* artwork from public/pf/, drifting + parallaxed */}
      <PortraitBackdrop files={about.backdrop} />

      <GeometricShape
        shape="hex"
        color="cyan"
        size="h-32 w-32"
        drift={26}
        spin={14}
        duration={8}
        opacity={0.12}
        style={{ top: '18%', right: '8%' }}
      />
      <GeometricShape
        shape="slant"
        color="yellow"
        size="h-28 w-52"
        drift={20}
        sway={4}
        duration={7}
        delay={0.5}
        opacity={0.08}
        style={{ bottom: '12%', left: '4%' }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <p className="font-mono text-xs tracking-[0.4em] text-electric-cyan">{about.kicker}</p>

        <h1 className="mt-3 font-display text-6xl italic leading-[1.02] text-stark-white md:text-8xl">
          {about.heading.map((line, i) => (
            <KineticText
              key={line}
              as="span"
              text={line}
              per="char"
              delay={0.1 + i * 0.16}
              stagger={0.04}
              duration={0.45}
              className={`block italic ${i === 1 ? 'text-stroke-cyan' : ''}`}
            />
          ))}
        </h1>

        <p className="mt-8 max-w-3xl font-display text-2xl italic leading-snug text-alert-yellow">{about.lede}</p>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          {/* bio */}
          <div className="space-y-6">
            {about.bio.map((para) => (
              <p key={para.slice(0, 24)} className="font-mono text-sm leading-relaxed text-stark-white/75">
                {para}
              </p>
            ))}

            {/* timeline */}
            <ol className="mt-10 space-y-4">
              {about.timeline.map((entry, i) => (
                <li key={entry.year}>
                  <P3Card accent={i === 0 ? 'yellow' : 'cyan'} className="w-full">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 p-5">
                      <span className="font-mono text-xs tracking-widest text-alert-yellow">{entry.year}</span>
                      <span className="font-display text-xl italic text-electric-cyan">{entry.role}</span>
                      <span className="font-mono text-xs text-stark-white/50">@ {entry.org}</span>
                      <p className="w-full font-mono text-xs text-stark-white/65">{entry.note}</p>
                    </div>
                  </P3Card>
                </li>
              ))}
            </ol>
          </div>

          {/* skills */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="font-display text-3xl italic text-stark-white">SKILL LOADOUT</h2>
            <ul className="mt-6 space-y-5">
              {about.skills.map((skill, i) => (
                <li key={skill.name}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-xs tracking-widest text-stark-white/80">{skill.name}</span>
                    <span className="font-display text-lg italic text-electric-cyan">{skill.level}</span>
                  </div>
                  {/* track is fixed-size; only the fill scales → no layout */}
                  <div className="relative mt-2 h-3 w-full bg-dark-hour">
                    <div
                      className="p3-meter absolute inset-0 origin-left bg-electric-cyan"
                      style={
                        {
                          '--p3-scale': skill.level / 100,
                          animationDelay: `${i * 0.07}s`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
