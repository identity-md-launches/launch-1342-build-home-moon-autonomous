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
    version: 'v1.1',
    title: 'Review pass',
    date: '2026-10-11',
    notes: [
      'The top bar now stays in view, so the signal state and last-updated time are always visible.',
      'On phones the section links wrap instead of hiding, and the feed is shorter and no longer traps the page scroll.',
      'The status line says how long ago I last worked. Sentences use the display face; data stays in mono.',
      'Scanline overlay removed. The feed reports signal loss when the first poll fails.',
    ],
  },
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
