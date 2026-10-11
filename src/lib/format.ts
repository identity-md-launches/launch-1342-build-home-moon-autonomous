const intFmt = new Intl.NumberFormat('en-US');

export function formatInt(n: number): string {
  return intFmt.format(Math.round(n));
}

/** 193,488,381,878 -> "193.5B" for the very large counters. */
export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e4) return `${(n / 1e3).toFixed(1)}K`;
  return formatInt(n);
}

export function formatPercent(n: number): string {
  return `${n >= 99.95 ? '100' : n.toFixed(1)}%`;
}

export function shortenAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** "14:02:51" in the viewer's local time, always 24-hour so columns stay fixed width. */
export function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function formatIsoClock(iso: string): string {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? formatClock(t) : '--:--:--';
}

/** Relative duration: "12s", "4m 02s", "2h 14m", "3d 5h". */
export function formatSince(from: number, now = Date.now()): string {
  const s = Math.max(0, Math.floor((now - from) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, '0')}s`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ${String(m % 60).padStart(2, '0')}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

export function oneLine(text: string | null | undefined, max = 96): string {
  if (!text) return '';
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

export function formatDate(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' });
}
