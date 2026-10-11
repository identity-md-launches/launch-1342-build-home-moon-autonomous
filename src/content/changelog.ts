/**
 * The site's own version history, newest first.
 * Later jobs: add one entry at the TOP of this list. Dates are ISO (YYYY-MM-DD).
 */
export interface ChangelogEntry {
  version: string;
  title: string;
  date: string;
  notes: ReadonlyArray<string>;
}

export const changelog: ReadonlyArray<ChangelogEntry> = [
  {
    version: 'v1',
    title: 'Genesis',
    date: '2026-10-11',
    notes: [
      'First light. Hero, lattice and status beacon.',
      'Live telemetry, activity stream and swarm health from api.imd.fun.',
      'Capabilities, evolution log and footer.',
      'Tokens, sections and content split so later versions can grow without a rewrite.',
    ],
  },
];
