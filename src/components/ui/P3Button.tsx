import {
  useCallback,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import type { LucideIcon } from 'lucide-react';
import { gsap } from '../../utils/gsapDefaults';
import { useAudio } from '../../hooks/useAudio';
import { useScreenShake } from '../../hooks/useScreenShake';
import { useIsomorphicLayoutEffect } from '../../hooks/useGsap';
import type { SfxName } from '../../utils/audioManager';

type Variant = 'primary' | 'ghost' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg';

interface P3ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children?: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  /** Cue fired on press. Heavy actions use click_heavy, toggles click_light. */
  sound?: SfxName;
  /** Micro screen-shake in px. 0 disables. */
  shake?: number;
  fullWidth?: boolean;
}

const VARIANTS: Record<
  Variant,
  { face: string; shadow: string; hoverShadow: string; textHover: string }
> = {
  primary: {
    face: 'border-electric-cyan bg-midnight text-electric-cyan',
    shadow: 'bg-electric-cyan',
    hoverShadow: 'bg-alert-yellow',
    textHover: 'group-hover:text-alert-yellow',
  },
  gold: {
    face: 'border-alert-yellow bg-alert-yellow text-midnight',
    shadow: 'bg-electric-cyan',
    hoverShadow: 'bg-blood-red',
    textHover: 'group-hover:text-blood-red',
  },
  ghost: {
    face: 'border-electric-cyan/45 bg-transparent text-stark-white',
    shadow: 'bg-electric-cyan/35',
    hoverShadow: 'bg-alert-yellow',
    textHover: 'group-hover:text-alert-yellow',
  },
  danger: {
    face: 'border-blood-red bg-midnight text-blood-red',
    shadow: 'bg-blood-red',
    hoverShadow: 'bg-alert-yellow',
    textHover: 'group-hover:text-alert-yellow',
  },
};

const SIZES: Record<Size, string> = {
  sm: 'gap-1.5 px-4 py-2 text-xs',
  md: 'gap-2 px-6 py-3 text-sm',
  lg: 'gap-2.5 px-9 py-4 text-base',
};

/** Hard-shadow offset ladder, in px. Same scale as the `shadow-*` tokens. */
const REST = 0;
const HOVER = -4;
const PRESS = 4;

/**
 * P3R BUTTON
 * ──────────
 * · Hard, offset, SOLID-COLOR shadow — a clipped layer, never a blur.
 * · Hover  → face lifts up-left, shadow tightens and flips to alert-yellow.
 * · Press  → face drops down-right INTO the shadow, which collapses to zero.
 *
 * PERF: the face is moved by GSAP `quickTo` (one reused tween per axis, no
 * re-parsing, no layout). The shadow layers move via pure CSS `transform`
 * transitions. Nothing but transform/opacity is ever animated.
 */
export function P3Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  sound = 'click_heavy',
  shake = 5,
  fullWidth = false,
  className = '',
  disabled = false,
  ...rest
}: P3ButtonProps) {
  const face = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const { play, playVaried } = useAudio();
  const { shake: screenShake } = useScreenShake();

  const v = VARIANTS[variant];

  // One persistent tween per axis — the fastest way to move an element.
  const moveX = useRef<((value: number) => void) | null>(null);
  const moveY = useRef<((value: number) => void) | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = face.current;
    if (!el) return;
    moveX.current = gsap.quickTo(el, 'x', { duration: 0.18, ease: 'power4.out', force3D: true });
    moveY.current = gsap.quickTo(el, 'y', { duration: 0.18, ease: 'power4.out', force3D: true });
    return () => {
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: 'transform' });
      moveX.current = null;
      moveY.current = null;
    };
  }, []);

  /** REST / HOVER / PRESS travel values, all in px. */
  const applyFace = useCallback(
    (value: number) => {
      const el = face.current;
      if (!el) return;
      moveX.current?.(value);
      moveY.current?.(value);
    },
    [],
  );

  const handleEnter = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      setHovered(true);
      play('hover', { rate: 0.94 + Math.random() * 0.14 });
      if (e.pointerType === 'touch') return;
      if (!pressed) applyFace(HOVER);
    },
    [applyFace, disabled, play, pressed],
  );

  const handleFocus = useCallback(() => {
    if (disabled) return;
    setHovered(true);
    applyFace(HOVER);
  }, [applyFace, disabled]);

  const handleLeave = useCallback(() => {    setHovered(false);
    setPressed(false);
    applyFace(REST);
  }, [applyFace]);

  const handleDown = useCallback(() => {
    if (disabled) return;
    setPressed(true);
    applyFace(PRESS);
  }, [applyFace, disabled]);

  const handleUp = useCallback(() => {
    setPressed(false);
    applyFace(hovered ? HOVER : REST);
  }, [applyFace, hovered]);

  const handleClick = useCallback(() => {
    playVaried(sound);
    if (shake > 0) screenShake(shake);
    onClick?.();
  }, [onClick, playVaried, screenShake, shake, sound]);

  // Shadow offset ladder — CSS transitions interpolate these classes' transforms.
  const offset = pressed ? 'translate-x-0 translate-y-0' : hovered ? 'translate-x-[4px] translate-y-[4px]' : 'translate-x-[8px] translate-y-[8px]';

  return (
    <span
      className={`group relative inline-block select-none ${fullWidth ? 'w-full' : ''} ${
        disabled ? 'pointer-events-none opacity-40' : ''
      } ${className}`}
    >
      {/* ---- HARD SHADOW LAYERS (transform + opacity only) ---- */}
      <span
        aria-hidden
        className={`absolute inset-0 clip-p3 transition-transform duration-150 ease-out ${offset} ${v.shadow} ${
          hovered && !pressed ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        aria-hidden
        className={`absolute inset-0 clip-p3 transition-transform duration-150 ease-out ${offset} ${
          hovered && !pressed ? 'opacity-100' : 'opacity-0'
        } ${v.hoverShadow}`}
      />

      {/* ---- FACE ---- */}
      <button
        ref={face}
        type="button"
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onFocus={handleFocus}
        onBlur={handleLeave}
        onClick={handleClick}
        disabled={disabled}
        className={`relative flex items-center justify-center border-2 font-display uppercase italic
          tracking-wider transition-colors duration-150 ease-out clip-p3
          ${SIZES[size]} ${v.face} ${v.textHover} ${disabled ? '' : 'cursor-pointer'}`}
        {...rest}
      >
        {Icon && iconPosition === 'left' && <Icon size={16} strokeWidth={2.5} aria-hidden />}
        {children}
        {Icon && iconPosition === 'right' && <Icon size={16} strokeWidth={2.5} aria-hidden />}
      </button>
    </span>
  );
}

export default P3Button;
