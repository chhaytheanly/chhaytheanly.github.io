import { Check, Mail, MapPin, Send, Timer } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { contact } from '../../data/contact';
import { site } from '../../data/siteContent';
import { GeometricShape } from '../ui/GeometricShape';
import { KineticText } from '../ui/KineticText';
import { P3Button } from '../ui/P3Button';

const CHANNEL_ICON = [Mail, MapPin, Timer];

/**
 * CONTACT — the transmit panel.
 *
 * Form state is local; submitting runs a short GSAP "transmit" sequence
 * (button slam + screen shake) and flips to a confirmed state. Wire `onSubmit`
 * to a real endpoint when you have one.
 */
export function Contact() {
  const [subject, setSubject] = useState(contact.subjects[0]);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-6 pb-24 pt-32">
      <GeometricShape
        shape="bolt"
        color="yellow"
        size="h-36 w-36"
        drift={26}
        spin={-14}
        duration={7.5}
        opacity={0.12}
        style={{ top: '20%', left: '6%' }}
      />
      <GeometricShape
        shape="parallelogram"
        color="cyan"
        size="h-32 w-64"
        drift={22}
        sway={5}
        duration={9}
        delay={0.4}
        opacity={0.07}
        style={{ bottom: '14%', right: '8%' }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-[0.4em] text-electric-cyan">{contact.kicker}</p>

        <h1 className="mt-3 font-display text-6xl italic leading-[1.02] text-stark-white md:text-8xl">
          {contact.heading.map((line, i) => (
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

        <p className="mt-8 max-w-2xl font-display text-2xl italic leading-snug text-alert-yellow">{contact.lede}</p>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.25fr]">
          {/* channels */}
          <ul className="space-y-4">
            {contact.channels.map((channel, i) => {
              const Icon = CHANNEL_ICON[i] ?? Mail;
              const inner = (
                <>
                  <Icon size={20} strokeWidth={2.5} className="shrink-0 text-electric-cyan" />
                  <span className="font-mono text-xs text-stark-white/50">{channel.label}</span>
                  <span className="ml-auto font-mono text-sm text-stark-white">{channel.value}</span>
                </>
              );
              const cls =
                'clip-p3-sm flex w-full items-center gap-4 border-2 border-electric-cyan/40 bg-dark-hour/40 p-4 text-left transition-colors duration-150 hover:border-alert-yellow';

              return (
                <li key={channel.label}>
                  {channel.href ? (
                    <a href={channel.href} className={cls}>
                      {inner}
                    </a>
                  ) : (
                    <div className={cls}>{inner}</div>
                  )}
                </li>
              );
            })}

            <li className="pt-4">
              <p className="font-mono text-[10px] tracking-widest text-stark-white/40">// ELSEWHERE</p>
              <ul className="mt-3 flex flex-wrap gap-3">
                {site.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="clip-p3-slant-sm border-2 border-electric-cyan px-4 py-2 font-display text-xs italic uppercase tracking-wider text-electric-cyan transition-colors duration-150 hover:border-alert-yellow hover:text-alert-yellow"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>

          {/* transmit form */}
          <form
            onSubmit={handleSubmit}
            className="clip-p3-sm border-2 border-electric-cyan bg-midnight/80 p-8"
          >
            <fieldset disabled={sent}>
              <legend className="font-mono text-[10px] tracking-widest text-stark-white/50">// SUBJECT</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {contact.subjects.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSubject(option)}
                    className={`border-2 px-3 py-2 font-mono text-[11px] tracking-widest transition-colors duration-150 ${
                      subject === option
                        ? 'border-alert-yellow bg-alert-yellow text-midnight'
                        : 'border-electric-cyan/40 text-stark-white/75 hover:border-electric-cyan hover:text-electric-cyan'
                    }`}
                    style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 0.5rem) 100%, 0 100%)' }}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <label className="mt-6 block">
                <span className="font-mono text-[10px] tracking-widest text-stark-white/50">// YOUR NAME</span>
                <input
                  required
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="NAME"
                  className="mt-2 w-full border-2 border-electric-cyan/40 bg-midnight px-4 py-3 font-mono text-sm text-stark-white outline-none transition-colors duration-150 placeholder:text-stark-white/25 focus:border-alert-yellow"
                />
              </label>

              <label className="mt-5 block">
                <span className="font-mono text-[10px] tracking-widest text-stark-white/50">// EMAIL</span>
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="YOU@EXAMPLE.COM"
                  className="mt-2 w-full border-2 border-electric-cyan/40 bg-midnight px-4 py-3 font-mono text-sm text-stark-white outline-none transition-colors duration-150 placeholder:text-stark-white/25 focus:border-alert-yellow"
                />
              </label>

              <label className="mt-5 block">
                <span className="font-mono text-[10px] tracking-widest text-stark-white/50">// MESSAGE</span>
                <textarea
                  required
                  name="message"
                  rows={5}
                  placeholder="TRANSMIT YOUR BRIEF…"
                  className="mt-2 w-full resize-y border-2 border-electric-cyan/40 bg-midnight px-4 py-3 font-mono text-sm text-stark-white outline-none transition-colors duration-150 placeholder:text-stark-white/25 focus:border-alert-yellow"
                />
              </label>

              <div className="mt-8">
                <P3Button type="submit" size="lg" icon={Send} sound="transition_impact" shake={7}>
                  TRANSMIT
                </P3Button>
              </div>
            </fieldset>

            {sent && (
              <div className="mt-2 flex items-center gap-3 border-2 border-alert-yellow bg-alert-yellow/10 p-4">
                <Check size={20} strokeWidth={3} className="text-alert-yellow" />
                <p className="font-mono text-sm text-alert-yellow">
                  MESSAGE QUEUED — REPLY WITHIN 24H.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
