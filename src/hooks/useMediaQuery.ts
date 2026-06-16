import { useEffect, useState } from 'react';

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * SSR-safe (returns `false` until mounted).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True below the Tailwind `md` breakpoint (768px) — the mobile layout. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/** True below the Tailwind `lg` breakpoint (1024px) — phone + iPad portrait. */
export function useIsCompactLayout(): boolean {
  return useMediaQuery('(max-width: 1023px)');
}
