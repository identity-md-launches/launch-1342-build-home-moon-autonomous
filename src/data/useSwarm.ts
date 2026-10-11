import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  BACKOFF_BASE_MS,
  BACKOFF_MAX_MS,
  POLL_INTERVAL_MS,
  fetchSwarm,
  type SwarmResponse,
} from './swarm';

export interface SwarmState {
  /** Last good response. Stays populated after a failure. */
  data: SwarmResponse | null;
  /** True until the first response (success or failure) arrives. */
  loading: boolean;
  /** True after a failed poll until the next success. */
  lost: boolean;
  /** Wall-clock ms of the last successful poll. */
  updatedAt: number | null;
  /** Number of successful polls this session. */
  ticks: number;
}

const initial: SwarmState = { data: null, loading: true, lost: false, updatedAt: null, ticks: 0 };

/**
 * Polls /swarm every POLL_INTERVAL_MS while the tab is visible.
 * On failure: keeps the last good values, flags `lost`, retries with
 * exponential backoff (5s, 10s, 20s ... capped at 2 min). Hidden tab: paused;
 * on return it refreshes at once.
 */
export function useSwarmPolling(): SwarmState {
  const [state, setState] = useState<SwarmState>(initial);
  const failures = useRef(0);
  const timer = useRef<number | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;

    const clear = () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };

    const schedule = (ms: number) => {
      clear();
      if (document.visibilityState === 'hidden') return;
      timer.current = window.setTimeout(run, ms);
    };

    const run = async () => {
      clear();
      controller.current?.abort();
      const ac = new AbortController();
      controller.current = ac;
      try {
        const data = await fetchSwarm(ac.signal);
        if (!active || ac.signal.aborted) return;
        failures.current = 0;
        setState((s) => ({ data, loading: false, lost: false, updatedAt: Date.now(), ticks: s.ticks + 1 }));
        schedule(POLL_INTERVAL_MS);
      } catch (err) {
        if (!active || ac.signal.aborted) return;
        failures.current += 1;
        setState((s) => ({ ...s, loading: false, lost: true }));
        const wait = Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** (failures.current - 1));
        schedule(wait);
        if (import.meta.env.DEV) console.warn('swarm poll failed', err);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void run();
      else clear();
    };

    document.addEventListener('visibilitychange', onVisibility);
    void run();

    return () => {
      active = false;
      clear();
      controller.current?.abort();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return state;
}

export const SwarmContext = createContext<SwarmState>(initial);

export function useSwarm(): SwarmState {
  return useContext(SwarmContext);
}
