import { useCallback, useEffect, useState } from 'react';

/**
 * Zero-dependency hash router.
 *
 * A 3KB route table beats pulling in react-router for four screens — and it
 * keeps `PageTransition` fully in charge of the swap moment, which a router's
 * own lifecycle would otherwise race against.
 */
export function useHashRoute(fallback = '/'): string {
  const read = useCallback(() => window.location.hash.slice(1) || fallback, [fallback]);

  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [read]);

  return route;
}

/** Imperative navigation — works from anywhere, including GSAP callbacks. */
export function navigate(to: string) {
  if (window.location.hash.slice(1) === to) return;
  window.location.hash = to;
}

export const ROUTES = [
  { path: '/', label: 'HOME', index: '01' },
  { path: '/projects', label: 'PROJECTS', index: '02' },
  { path: '/about', label: 'ABOUT', index: '03' },
  { path: '/contact', label: 'CONTACT', index: '04' },
] as const;

export function routeMeta(path: string) {
  return ROUTES.find((r) => r.path === path) ?? ROUTES[0];
}
