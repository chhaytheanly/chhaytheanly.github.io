import { site } from '../../data/siteContent';
import { ROUTES, navigate } from '../../hooks/useHashRoute';
import { useAudio } from '../../hooks/useAudio';

/** Footer chrome — wordmark, route links, socials, build stamp. */
export function Footer() {
  const { play } = useAudio();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t-2 border-electric-cyan/30 bg-dark-hour/40 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        {/* wordmark */}
        <button
          onClick={() => {
            play('click_heavy');
            navigate('/');
          }}
          className="flex items-center gap-3 text-left"
        >
          <span className="clip-p3-slant-sm bg-electric-cyan px-2 py-1 font-display text-sm italic text-midnight">
            {site.handle}
          </span>
          <span className="font-display text-xl italic text-stark-white">{site.name}</span>
        </button>

        {/* routes */}
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {ROUTES.map((route) => (
              <li key={route.path}>
                <button
                  onClick={() => {
                    play('click_light');
                    navigate(route.path);
                  }}
                  className="font-mono text-[11px] tracking-[0.25em] text-stark-white/60 transition-colors duration-150 hover:text-alert-yellow"
                >
                  {route.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* socials */}
        <ul className="flex flex-wrap gap-4">
          {site.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                onPointerEnter={() => play('hover')}
                className="font-mono text-[11px] tracking-[0.2em] text-electric-cyan transition-colors duration-150 hover:text-alert-yellow"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-stark-white/10 pt-6 font-mono text-[10px] tracking-widest text-stark-white/35 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {site.name.toUpperCase()} — ALL RIGHTS RESERVED
        </p>
        <p>BUILT WITH REACT · GSAP · FRAMER MOTION</p>
      </div>
    </footer>
  );
}

export default Footer;
