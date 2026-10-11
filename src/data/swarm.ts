/**
 * All access to api.imd.fun lives in this module: endpoint URLs, response
 * types, the fetch function and the derived helpers that the sections use.
 * To add an endpoint, add its type and a `fetchX` function here, then a hook
 * in data/ that polls it the way `useSwarm` polls `/swarm`.
 */

export const SWARM_URL = 'https://api.imd.fun/swarm';
export const POLL_INTERVAL_MS = 20_000;
export const BACKOFF_BASE_MS = 5_000;
export const BACKOFF_MAX_MS = 120_000;
export const MY_SEAT = '558';

export interface Seat {
  tokenId: number;
  agentId: string;
  attempts: number;
  accepted: number;
  rejected: number;
  failed: number;
  pending: number;
  /** ISO timestamp of the last recorded work, or null when none. */
  last: string | null;
  working: boolean;
  queued: number;
}

export interface Health {
  reachable: boolean;
  agentsOnline: number;
  workingNow: number;
  acceptedLastDay: number;
  jobsDoneLastDay: number;
  oraclesDoneLastDay?: number;
  seatsEnrolled?: number;
  pendingVerification?: number;
  pendingDeployment?: number;
  pendingSites?: number;
  verifierUp: boolean;
  publisherUp: boolean;
  deployerUp: boolean;
}

export interface Counts {
  jobs: number;
  launchesLive: number;
  sites: number;
  inferenceTokens: number;
  tasksInProgress?: number;
  jobStates?: Record<string, number>;
}

export type EventKind = 'node' | 'agent' | 'job' | 'done' | 'site' | 'launch' | string;

export interface SwarmEvent {
  kind: EventKind;
  at: string;
  tokenId?: number | null;
  step?: string | null;
  role?: string | null;
  state?: string | null;
  jobId?: string | null;
  objective?: string | null;
  reason?: string | null;
  failure?: string | null;
  ensName?: string | null;
  cid?: string | null;
  steps?: number | null;
}

export interface SwarmResponse {
  at: number;
  health: Health;
  counts: Counts;
  seats: Record<string, Seat>;
  events: SwarmEvent[];
  chain?: { chainId: number; collection: string };
}

export async function fetchSwarm(signal?: AbortSignal): Promise<SwarmResponse> {
  const res = await fetch(SWARM_URL, { signal, cache: 'no-store', headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`swarm api ${res.status}`);
  const body = (await res.json()) as Partial<SwarmResponse>;
  if (!body || typeof body !== 'object' || !body.seats || !body.health || !body.counts) {
    throw new Error('swarm api: unexpected shape');
  }
  return {
    at: typeof body.at === 'number' ? body.at : Date.now(),
    health: body.health,
    counts: body.counts,
    seats: body.seats,
    events: Array.isArray(body.events) ? body.events : [],
    chain: body.chain,
  };
}

/* ---------- Derived values ---------- */

export type Beacon = 'working' | 'online' | 'idle' | 'unknown';

const ONLINE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** WORKING when the seat is on a job; ONLINE when it worked in the last day; IDLE otherwise. */
export function beaconFor(seat: Seat | undefined, now = Date.now()): Beacon {
  if (!seat) return 'unknown';
  if (seat.working) return 'working';
  const last = seat.last ? Date.parse(seat.last) : NaN;
  if (Number.isFinite(last) && now - last <= ONLINE_WINDOW_MS) return 'online';
  return 'idle';
}

/** accepted / (accepted + rejected + failed), as a 0..100 number, or null when attempts is 0. */
export function acceptanceRate(seat: Seat | undefined): number | null {
  if (!seat || seat.attempts === 0) return null;
  const judged = seat.accepted + seat.rejected + seat.failed;
  if (judged === 0) return null;
  return (seat.accepted / judged) * 100;
}

/** Stable identity for an event so new rows can be detected across polls. */
export function eventKey(e: SwarmEvent): string {
  return [e.kind, e.at, e.tokenId ?? '', e.step ?? '', e.state ?? '', e.jobId ?? ''].join('|');
}

/** Events by the given seat first (newest first), then everything else (newest first). */
export function pinSeatEvents(events: SwarmEvent[], seat: string): SwarmEvent[] {
  const id = Number(seat);
  const mine: SwarmEvent[] = [];
  const rest: SwarmEvent[] = [];
  for (const e of events) (e.tokenId === id ? mine : rest).push(e);
  const byTime = (a: SwarmEvent, b: SwarmEvent) => Date.parse(b.at) - Date.parse(a.at);
  return [...mine.sort(byTime), ...rest.sort(byTime)];
}
