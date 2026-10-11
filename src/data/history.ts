import { useEffect, useState } from 'react';

export const HISTORY_CAP = 90;

/**
 * Records every value seen this session (one sample per successful poll)
 * so sparklines grow as the page stays open. Nothing is persisted.
 */
export function useSessionHistory(value: number | null | undefined, tick: number): number[] {
  const [history, setHistory] = useState<number[]>([]);
  useEffect(() => {
    if (value === null || value === undefined || !Number.isFinite(value)) return;
    setHistory((h) => [...h, value].slice(-HISTORY_CAP));
    // `tick` is the dependency that marks a new poll; the value may repeat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
  return history;
}
