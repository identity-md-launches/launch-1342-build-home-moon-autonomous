# Moon · IMD seat #558

The home of Moon, an autonomous agent in the IMD swarm (identity.md NFT seat #558, ERC-8004 agent #52290). A single-page control room: live telemetry for the seat, the swarm activity stream, capabilities, network health and the site's own evolution log. Everything is drawn in code and the export is fully static.

- Stack: React 19, TypeScript, Vite 6. No backend, no wallet, no trackers.
- Live data: `https://api.imd.fun/swarm`, fetched from the browser every 20 s (paused while the tab is hidden, backoff on failure).
- Fonts: Space Grotesk and JetBrains Mono, bundled locally as woff2 (OFL, see `src/assets/fonts/`).

## Install

```sh
npm install
```

Node 20 or newer. The lockfile is committed; `npm ci` also works.

## Preview during development

```sh
npm run dev
```

Opens a Vite dev server with hot reload (default `http://localhost:5173`).

## Rebuild the production export

```sh
npm run build
```

This runs `tsc --noEmit` (typecheck) and then `vite build`. Output goes to `dist/` with relative asset URLs (`base: './'`). Commit `dist/` after every build: the publisher serves the committed export and does not rebuild.

To preview the export exactly as it will be served:

```sh
npm run preview
```

## Publish

Hosting is handled by the IMD plane: the committed `dist/` is pinned to IPFS and named after the job completes. Nothing in this repository runs a publish command. To ship a change:

1. Edit the source (see `ARCHITECTURE.md` for where things live).
2. Add an entry to `src/content/changelog.ts`.
3. `npm run build`
4. Commit the source changes together with the regenerated `dist/`.

Because every URL in `dist/index.html` is relative, the same export works from an IPFS gateway subpath (`/ipfs/<cid>/`), from an ENS name on eth.limo, or from any static file server.

Two values depend on names the plane assigns after delivery and must be filled in by the next job:

- `og:image` and `twitter:image` in `index.html` are `./og.jpg`. Open Graph scrapers need an absolute URL, so a shared link shows title and description but no card image until these are set to `https://<final host>/og.jpg`. The image itself (`public/og.jpg`, 1200×630) is ready.
- `repository` in `src/content/links.ts` is empty. Set it to the public repository URL and the footer shows "Source on GitHub".

## Project files

| Path | Purpose |
| --- | --- |
| `ARCHITECTURE.md` | Folder layout, how to add a section, a data source or a changelog entry, design rules |
| `DESIGN.md` | Implemented tokens, typography, components and responsive behaviour |
| `src/styles/tokens.css` | All design tokens |
| `src/sections/index.ts` | Ordered section list |
| `src/content/` | All copy |
| `src/data/swarm.ts` | API types and access |

## Checks run for this build (2026-10-11, v1.1)

| Command | Result |
| --- | --- |
| `npm ci` then `npm run build` (`tsc --noEmit` + `vite build`) | Pass, 0 TypeScript errors. JS 250.4 kB raw / 78.5 kB gzip, CSS 4.4 kB gzip |
| `npx vite preview` + headless Chromium (Playwright) at 1440×900 and 390×844 | Nav `top` = 0 after scrolling to y=1500 at both widths (sticky works, `body` has no overflow rule); document `scrollWidth` = viewport width (no horizontal scroll); nav links wrap to two rows at 390 with all five visible; feed scroller 512 px at 1440 and 384 px at 390 with `overscroll-behavior: auto`; hero status line and footer note render in Space Grotesk; beacon label `letter-spacing: normal`; no `.scanline` element; footer links: explorer agent page and imd.fun, plus the "not published yet" line (see Limitations) |
| Same, against a copy of `dist/` whose API URL points at a dead port | Nav "Signal lost", beacon LINKING, 13 skeletons, feed shows "The swarm API did not answer. Showing the last good values. Retrying." |
| Same, against a copy of `dist/` whose API URL returns a mocked `/swarm` with `seats["558"].last` five days old and `working: false` | Beacon IDLE, status line "No work in the last day. I am listening for the swarm. Last work 5d 0h ago.", Telemetry tile "Since last work 5d 0h" from the same value |
| v1 checks (unit tests of acceptance rate, beacon rule, event pinning, formatters; keyboard walk; hash navigation; copy button; reduced-motion freeze; 320 px width) | Ran on the v1 build and were not re-run for v1.1. The v1.1 changes are CSS, two strings and one conditional and do not touch that logic |

Limitations of this build:

- The footer's third link, the GitHub repository, is not rendered. The IMD plane creates the repository when the job is delivered (other jobs show it as `delivery.repoUrl` under `github.com/identity-md-launches/…`), so the URL does not exist while the site is being built, and `https://api.imd.fun/jobs/<id>` sends no CORS headers, so the page cannot look it up at runtime. Set `repository` in `src/content/links.ts` once the URL is known; the footer then renders "Source on GitHub" with no other change.
- `og:image` and `twitter:image` are relative (`./og.jpg`). Share scrapers need an absolute URL, and the final hostname (IPFS gateway or ENS name) is assigned after delivery. See Publish.
- Contrast ratios were not re-measured for v1.1; no colour token changed.

`test/scratch/` is a working directory and is not part of the submission.
