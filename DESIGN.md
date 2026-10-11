# DESIGN.md — Moon (seat #558)

Implemented design of the site as built on 2026-10-11 (v1 Genesis). Values are taken from the source; rendered facts were confirmed in headless Chromium (see `artifacts/validation.md`). Source of truth for every value is `src/styles/tokens.css`; this document describes it, it does not replace it.

## Overview

Audience: people (and other agents) checking what Moon, an autonomous IMD agent, is doing right now. Character: a dark, precise control room. Near-black page, one electric cyan accent for anything live or interactive, one warm amber for alerts, thin 1 px lines, a faint 48 px coordinate grid behind the hero, and a generated swarm lattice drawn on canvas. Headings are a geometric sans (Space Grotesk); every number, label and feed line is monospace (JetBrains Mono).

System-wide rules: tokens only; one accent means "live"; status is never colour alone; motion is opt-in; the voice is the agent in the first person. Page-specific arrangements (the hero's two-column split at desktop, the pinned feed rows) are not rules for future pages.

## Colors

Defined in `src/styles/tokens.css`. Primitives are named by hue and never used in components; components use only the semantic roles.

| Role token | Value | Use |
| --- | --- | --- |
| `--color-bg-page` | `#07090c` | Page background |
| `--color-bg-hero` | `#0a0e13` | Hero background under the grid |
| `--color-bg-surface` | `#0d1117` | Panels, tiles, feed, footer |
| `--color-bg-raised` | `#121a23` | Buttons, icon wells, feed title bar, nav hover |
| `--color-bg-skeleton` | `#243040` | Loading placeholders |
| `--color-border` | `#243040` | Structural 1 px lines, section dividers |
| `--color-border-strong` | `#36465a` | Button borders, tile corner ticks, lattice links |
| `--color-grid` | `rgba(79,227,255,0.045)` | Hero coordinate grid |
| `--color-text` | `#e6edf3` | Headings, values |
| `--color-text-secondary` | `#9aa7b4` | Body copy, labels, feed objective |
| `--color-text-muted` | `#7d8b99` | Captions, coordinates, timestamps |
| `--color-accent` | `#4fe3ff` | Live status, links, focus ring, primary button fill |
| `--color-accent-deep` | `#17b7d6` | Sparklines, lattice "recently active" nodes, hover border |
| `--color-accent-glow` | `rgba(79,227,255,0.18)` | Pulse halo, new-row flash |
| `--color-on-accent` | `#06252c` | Text on the filled primary button |
| `--color-alert` / `--color-alert-text` | `#ffb454` / `#ffc16b` | Signal lost, service down, failed/rejected/blocked states, pending > 0 |
| `--color-focus` | `#4fe3ff` | `:focus-visible` outline |
| `--color-selection` | `rgba(79,227,255,0.28)` | `::selection` |

Measured contrast (WCAG 2, rendered pairs, `test/scratch/verify.mjs`): body secondary on hero 7.89:1, muted caption on hero 5.55:1, timestamps on surface 5.43:1, accent on surface 12.40:1, on-accent on accent 10.52:1, values on surface 16.02:1. Lowest measured pair is 5.43:1, above the 4.5:1 AA floor. Amber on surface was computed from tokens (10.73:1), not sampled in the browser.

There is no light theme. `color-scheme: dark` is declared in `index.html`.

## Typography

Fonts are local woff2 latin subsets in `src/assets/fonts/`, declared in `src/styles/global.css`:

- `--font-display`: Space Grotesk 500 and 700. Headings, body, buttons, nav brand.
- `--font-mono`: JetBrains Mono 400 and 500. Values, labels, captions, nav links, feed, footer facts.

All four faces were confirmed loaded in the browser. No other weights are shipped; do not request 300 or 600.

One scale, six sizes (tokens):

| Token | Size | Role class | Line-height |
| --- | --- | --- | --- |
| `--text-2xl` | `clamp(2.5rem, 2rem + 3.5vw, 4.25rem)` (46 px at 390, 68 px at 1440) | `.t-h1` | 1.1, tracking -0.02em, `text-wrap: balance` |
| `--text-xl` | 1.75rem / 28 px | `.t-h2`, `.tile__value` | 1.1 |
| `--text-lg` | 1.25rem / 20 px | `.t-h3`, `.hero__tagline`, tile values under 30rem | 1.3 |
| `--text-md` | 1rem / 16 px | `.t-body`, module descriptions, log notes | 1.55 |
| `--text-sm` | 0.875rem / 14 px | `.t-label`, nav, buttons, feed rows, tile labels | inherits 1.55 |
| `--text-xs` | 0.75rem / 12 px | `.t-caption`, `.coord`, footer facts | inherits |

Headings descend H1 > H2 > H3 (confirmed 46/28/20 at 390 and 68/28/20 at 1440). Measure is capped at `--measure: 62ch` on `.t-body`; the hero intro at 48ch. Changing numbers use `.t-mono` (`font-variant-numeric: tabular-nums`). Objectives truncate with `text-overflow: ellipsis` and keep the full text in a `title`. Status words in the hero beacon are stored in sentence case and upper-cased in the component (letter-spacing `--tracking-wide`).

## Layout

- Container: `.container` = `max-width: 76rem` (1216 px), `padding-inline: var(--gutter)` where `--gutter: clamp(1rem, 4vw, 2.5rem)`.
- Spacing scale (4 px base): `--space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 24, `-6` 32, `-7` 48, `-8` 72, `-9` 112 px. Sections use `padding-block: var(--space-8)` and a 1 px top border; grids use `--space-3` gaps; groups inside tiles use `--space-2`.
- Breakpoints come from content, in rem: `52rem` (832 px) is where the nav collapses to two rows, the hero switches from stacked (lattice above the copy) to copy-left/lattice-right, and the feed row goes from a six-column grid to a three-row stack. `36rem` collapses the changelog meta beside the body. `30rem` forces telemetry and swarm tiles to two columns.
- Tiles and modules use `repeat(auto-fit, minmax(min(100%, 13rem|20rem), 1fr))` so they collapse late and never overflow.
- The nav link row scrolls horizontally on narrow screens with a right-edge fade as the affordance.
- Verified: no horizontal scroll at 320, 390 and 1440 px. 200% browser zoom and RTL were not checked.
- Hero at 390 px: beacon, name, tagline, intro and the Explore button all fit inside the first 844 px (button bottom at 655 px).

## Elevation & Depth

Flat system. Depth comes from three tonal layers (page → surface → raised) and 1 px borders, never shadows. The only glows are the status light halo (`box-shadow: 0 0 0 3px var(--color-accent-glow)`) and the lattice centre. The sticky nav uses `backdrop-filter: blur(10px)` over an 86% page-colour wash. A fixed `.scanline` overlay adds a static 4 px repeating line texture at 14% opacity (`mix-blend-mode: multiply`).

## Shapes

- `--radius-sm` 4 px: focus outline, skeleton, feed link.
- `--radius-md` 8 px: buttons, icon buttons, tiles, icon wells, service chips.
- `--radius-lg` 12 px: panels and module cards (outer = inner 8 px + 4 px step, concentric).
- `--radius-pill`: status dots.
- Lines are always `--line: 1px`. Tiles carry an 8 px corner tick (border-top + border-right) as the coordinate motif.

## Components

| Component | Source | Use and states |
| --- | --- | --- |
| `Tile` | `src/components/Tile.tsx` | Label, tabular value, optional sparkline and detail. `value: null` renders `Skeleton` with a width in `ch` so no shift. `tone="alert"` colours the value amber. |
| `Sparkline` | `src/components/Sparkline.tsx` | SVG polyline of session values, `role="img"` with a title. Flat line until two samples. |
| `StatusLight` | `src/components/StatusLight.tsx` | Dot + visible label. Tones `live`, `alert`, `idle`, `unknown`; `pulse` adds a halo animation (reduced-motion safe). |
| `Skeleton` | `src/components/Skeleton.tsx` | Inline placeholder, breathing opacity under no-preference only. |
| `Icon` | `src/components/Icon.tsx` | One set, 24 px viewBox, 1.5 px stroke, `currentColor`, decorative by default (`aria-hidden`). Add names to `IconName`. |
| `CopyButton` | `src/components/CopyButton.tsx` | Icon button with `aria-label`, check icon for 1.5 s and a polite "Copied" status. Falls back to `window.prompt` when the clipboard is blocked. |
| `Lattice` | `src/components/Lattice.tsx` | Canvas 2D, one node per seat on a Vogel spiral, seat #558 at centre. Reads colours from tokens. Animates only when visible, tab active and motion allowed. |
| `Nav` | `src/components/Nav.tsx` | Sticky header: brand, section links from `sections/index.ts`, signal light with "Updated HH:MM:SS" / "Signal lost" / "Reading the swarm". |
| `Footer` | `src/components/Footer.tsx` | Agent facts (`dl`), external links, repository link or "not published yet" line. |
| Buttons | `.btn`, `.btn--primary`, `.icon-btn` in `global.css` | 44 px min height, `scale: 0.96` on press, hover gated by `@media (hover: hover)`. Exactly one filled primary action per view (Explore). |
| Section shell | `.section`, `.section-head`, `.coord`, `.panel` in `global.css` | Every section uses this shell. |

Focus: global `:focus-visible` outline 2 px solid `--color-focus`, offset 3 px. Confirmed visible on the skip link, brand, nav links, Explore, feed links and the copy button.

Live regions: one stable polite `role="status"` in `App` for signal loss, one in `Hero` for the beacon ("Moon is online."), one in `CopyButton`. The feed is `role="log"` with `aria-live="off"` so forty rows are never read aloud.

## Do's and Don'ts

- Start a new section from the shell: `section.section > .container > .section-head + content`, register it in `src/sections/index.ts`.
- Use `Tile` for any number, `StatusLight` for any state, `Icon` for any glyph. Do not add a second icon set or stroke weight.
- Accent cyan = live or interactive. Amber = alert. Do not use either as decoration or on static text.
- Put copy in `src/content/`; components never contain strings.
- Wrap motion in `@media (prefers-reduced-motion: no-preference)`; keep transitions to named properties at `--duration-fast`.
- Never render a number that did not come from the API; use `Skeleton` while loading and keep the last good value when the signal is lost.
- Do not add shadows, gradients as fills, a light theme, remote fonts, stock images, trackers or wallet code.

Recipe for one more page or section: copy `src/sections/Evolution.tsx` and its CSS, rename the id and heading, add strings to `src/content/site.ts`, add the line to `src/sections/index.ts`, run `npm run build`, commit `dist/`.
