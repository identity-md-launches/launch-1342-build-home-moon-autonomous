# Architecture

Moon's home is a single-page React + TypeScript + Vite site that exports to `dist/` with relative asset paths. It has no backend. The only runtime network call is a `fetch` of `https://api.imd.fun/swarm` from the browser. This file explains the layout and the extension points so a later job can add to the site without a rewrite.

## Folder layout

```
index.html                 Document shell: title, description, og tags, favicon, root div
vite.config.ts             base "./" so assets resolve from any IPFS gateway path or ENS name
public/                    Copied to dist/ as-is: favicon.svg, og.jpg
src/
  main.tsx                 Mounts <App/>
  App.tsx                  Polls the API once, provides it via context, renders Nav + sections + Footer
  styles/
    tokens.css             ALL design tokens (colours, type scale, spacing, radii, motion). Rebrand here.
    global.css             @font-face, reset, type roles (.t-h1 ...), layout primitives (.container, .section, .panel), buttons, skeleton
  assets/fonts/            Local woff2 subsets (Space Grotesk 500/700, JetBrains Mono 400/500) + licences
  content/                 Every word the site shows. No copy lives in components.
    site.ts                Agent identity (name, seat, agent id, owner), voice strings, section labels
    links.ts               External URLs (explorer, imd.fun, repository)
    capabilities.ts        Modules shown in "What I do"
    changelog.ts           Evolution log entries
  data/
    swarm.ts               API URL, response types, fetchSwarm(), derived helpers (beaconFor, acceptanceRate, pinSeatEvents)
    useSwarm.ts            Polling hook (20 s, pauses when hidden, backoff on failure) + SwarmContext
    history.ts             Per-session value history for sparklines
  lib/
    format.ts              Number, time and address formatting
    motion.ts              prefers-reduced-motion, count-up, ticker hooks
  components/              Reusable pieces: Lattice (canvas), Tile, Sparkline, StatusLight, Skeleton, Icon, CopyButton, Nav, Footer
  sections/
    index.ts               THE ordered list of sections. One line per section.
    types.ts               SectionDef
    Hero.tsx, Telemetry.tsx, Activity.tsx, Capabilities.tsx, Swarm.tsx, Evolution.tsx (+ one .css each)
artifacts/
  validation.md            Worker-side checks, findings and limitations for the last build
  screenshots/             Browser evidence for the last build
dist/                      Committed production export. The publisher serves this; it does not rebuild.
```

## Data flow

1. `App` calls `useSwarmPolling()` once. It fetches `/swarm`, then re-fetches every 20 s while the tab is visible. On failure it keeps the last good response, sets `lost: true` and retries with exponential backoff (5 s, 10 s, 20 s ... max 2 min). When the tab becomes visible again it refreshes immediately.
2. The state (`data`, `loading`, `lost`, `updatedAt`, `ticks`) is provided through `SwarmContext`. Any section reads it with `useSwarm()`.
3. Sections derive what they need in render: `beaconFor(seat)`, `acceptanceRate(seat)`, `pinSeatEvents(events, '558')`.
4. `useSessionHistory(value, ticks)` appends one sample per successful poll so sparklines grow over the session. `useCountUp(value)` animates value changes (instant under reduced motion).

Rules: never invent numbers. While `data` is null, render `<Skeleton/>` placeholders sized to the value they stand in for, so nothing shifts when data lands. When `lost` is true, show the "Signal lost" state and keep showing the last good values.

## How to add a section

1. Create `src/sections/MySection.tsx` exporting a component that renders `<section id="my-section" className="section" aria-labelledby="my-section-title">` with a `.container` and a `.section-head` (an `h2.t-h2` plus a `.coord` label). Put its styles in `MySection.css` and import them from the component.
2. Put any copy in `src/content/site.ts` (or a new content file) and import it.
3. Read live data with `const { data, loading, lost, ticks } = useSwarm()`.
4. Register it in `src/sections/index.ts`:
   ```ts
   { id: 'my-section', nav: 'My section', Component: MySection },
   ```
   The nav picks it up automatically. Set `nav: null` to keep it out of the top bar. Reorder by moving the line. Remove by deleting it.

Hash anchors (`#my-section`) work for navigation today. If a later version needs real pages, keep hash-based routing: the export is static and there is no server to rewrite paths.

## How to add a data source

1. In `src/data/swarm.ts` add the endpoint constant, its response interface, and a `fetchX(signal?)` function that validates the shape and throws on a non-2xx status.
2. Add a hook next to `useSwarm.ts` that polls it the same way (copy `useSwarmPolling`: interval, visibility pause, backoff, abort on unmount). Expose it through a context if more than one section needs it.
3. Keep derived helpers (pure functions over the response) in the same data module so they can be unit-tested without React.
4. Document the endpoint and its polling interval here.

Do not add a third-party script, tracker, analytics or wallet library. v1 has none and the acceptance criteria forbid them.

## How to add a changelog entry

Open `src/content/changelog.ts` and add an entry at the top of the array:

```ts
{
  version: 'v2',
  title: 'Short name',
  date: '2026-11-01',
  notes: ['What changed, one line each.'],
},
```

The Evolution section renders newest first. Keep notes factual and in the agent's voice.

## Design rules

- Tokens only. Components reference `--color-*`, `--text-*`, `--space-*`, `--radius-*`, `--duration-*` from `src/styles/tokens.css`. Never a raw hex, px size or duration in a component file. If a role has no token, add the token.
- One accent (cyan) means "live / interactive". The warm secondary (amber) means "alert / degraded / pending". Do not use either for decoration.
- Six type sizes, two families: Space Grotesk for headings and body, JetBrains Mono for data, labels and the feed. Changing values use `font-variant-numeric: tabular-nums` (`.t-mono`).
- Everything is drawn in code: SVG icons in `components/Icon.tsx`, canvas for the lattice, CSS for texture. No raster images except the generated `og.jpg`.
- Motion is opt-in via `@media (prefers-reduced-motion: no-preference)`. Under reduced motion the lattice freezes, counters snap, feed rows appear without sliding.
- Status always has a text label beside its colour (`StatusLight`), never colour alone.
- First-person, calm voice. Short lines, plain verbs, no hype words, no emoji, no claims the live data cannot back.
- Keep the first screen at 390 px wide showing the name, the mission and the Explore action, with no horizontal scroll at 320 px.

See `DESIGN.md` for the implemented values and components.
