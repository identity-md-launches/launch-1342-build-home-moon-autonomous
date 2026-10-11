import { useEffect, useRef, useState } from 'react';

const query = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(query).matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/**
 * Animates a number from its previous value to the new one over `duration` ms.
 * Instant under reduced motion and on the first value.
 */
export function useCountUp(target: number | null, duration = 600): number | null {
  const [shown, setShown] = useState<number | null>(target);
  const prev = useRef<number | null>(target);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (target === null) {
      setShown(null);
      prev.current = null;
      return;
    }
    const from = prev.current;
    prev.current = target;
    if (from === null || from === target || prefersReducedMotion()) {
      setShown(target);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setShown(from + (target - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return shown;
}

/** Re-renders every `ms` so relative times stay fresh. */
export function useTicker(ms: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}
