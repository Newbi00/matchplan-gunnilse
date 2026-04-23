# Matchplan Lerum IS — edit, share, tactical situations

**Status:** Design approved 2026-04-23
**Scope:** `matchplan-for-claude-code/` (Gunnilse IS matchplan, zero-build React + Babel Standalone)

## Context

The matchplan lives in two forms:

- **Source** — `matchplan/` with `index.html`, `styles.css`, `data.js`, `Components.jsx`, `Sections.jsx`, `App.jsx`. Editable.
- **Standalone** — `../Matchplan - Gunnilse vs Lerum.html` (1.5 MB bundled artifact, generated in claude.ai Design System).

Investigation confirmed the two render identically once the source is served over HTTP (file:// breaks Babel JSX loading). Design tokens, layout, and components are already in place. The user's perceived "boring" look was a rendering-path issue, not a design issue.

What is missing is:

1. A frictionless way to **edit + see changes live**.
2. A frictionless way to **share one file** with others (coaches, players, parents).
3. A way to **attach tactical situations** to each coherence section, with the starting eleven visible, swappable by instruction.

## Schema extension — `principles` (added 2026-04-23)

Several coherence sections get a short `principles: string[]` field in `MP_COHERENCE[]`. Principles are terse, non-editable declaratives ("Tre korridorer", "Duellspel") rendered as gold pill-chips above the section's detailed bullets. They establish the "rules of the game" for that phase; bullets stay as the how-tos.

Seeded in V1:
- `02 Identitet`: Duellspel, Andrabollsspel
- `03 Försvarsspel`: Tre korridorer, Splitta planen, Aldrig på insidan, Aldrig i oss
- `05 Anfallsspel`: Säkra kontringsläge, Spela in, Krossa ut, Spring framåt, Fyll på boxen

Adds a `Principles` component to `Components.jsx`, renders in both VariantA (`Sections.jsx`) and VariantB (`App.jsx`). CSS tokens reuse `--accent`.

## Non-goals

- No new build chain, no module bundler, no npm deps in the runtime. Zero-build stays.
- No refactor of existing JSX. All current components and the 9-section coherence order (`MP_COHERENCE`) are preserved.
- No port of `Interaktiv_Taktik_Tavla.html`. Situations render inside the matchplan as SVG — no external tool dance.
- No persistence. State still resets on refresh (existing design decision).

## Deliverables

### 1. `start-matchplan.bat` — live editing

Plain Windows batch file at repo root:

- Changes into `matchplan/`.
- Starts `py -m http.server 7788`.
- Opens `http://localhost:7788/` in the default browser.

User edits `data.js` / JSX / `styles.css` → F5 in browser → sees the change. No watcher, no reload glue. Matches the project's zero-build principle from `CLAUDE.md`.

### 2. `build-standalone.bat` + `build-standalone.js` — one-file sharing

Node script that reads the `matchplan/` source and writes a single self-contained HTML to `../Matchplan - Gunnilse vs Lerum.html` (next to the existing bundle, replacing it).

Structure of the output:

- `<head>` with inlined `styles.css`.
- React + ReactDOM + Babel loaded from `unpkg` CDN (same URLs `matchplan/index.html` already uses) — keeps output ~50 KB.
- Inline `<script>` for `data.js` (window globals).
- Inline `<script type="text/babel">` blocks for `Components.jsx`, `Sections.jsx`, `App.jsx`, in that order.
- Inline situation data (`MP_SITUATIONS`, see below).
- Google Fonts `@import` for Inter is preserved (already present in `styles.css`).

Constraint accepted: first open requires network (CDN + Google Fonts). Subsequent opens are cached. If fully-offline sharing is needed later, a V2 can inline React/Babel/fonts — not in scope now.

### 3. Tactical situations in each section

**Data model** — new global in `data.js`:

```js
window.MP_SITUATIONS = {
  "03-hog-press": {
    sectionId: "forsvar",                    // matches MP_COHERENCE[i].id
    title: "Hög press vs 4-2-3-1",
    subtitle: "Målvaktens utspel",           // optional
    variant: "green" | "blackout",           // pitch style
    players: [
      { n: 1, x: 10, y: 50 },                // name looked up via roster.find(r => r.n === n)
      { n: 2, x: 75, y: 55, highlight: true },
      // ... up to 11 entries
    ],
    arrows: [
      { from: [65, 75], to: [50, 85], style: "dashed", color: "gold" }
      // style: "solid" | "dashed" · color: "gold" | "white" (V1 supports these two)
    ],
    zones: [
      { x: 30, y: 70, w: 40, h: 25, fill: "greenHighlight" }
    ],
    ball: { x: 65, y: 75 } | null,
    bench: true                              // show bench row under pitch
  },
  "03-mellanblock": { ... },
  "04-kontra-center": { ... }
};
```

Coordinates are 0–100 percentages of the pitch (same convention as `MP_DATA.formation433`).

**Player names from roster.** `n` references `MP_DATA.roster[].n`. Rename a player once in `roster` and every situation updates.

**New components** in `Components.jsx`:

- `SituationSVG({ situation, roster, thumb })` — renders the scene. `thumb=true` produces a compact variant (no bench, smaller labels).
- `SituationThumbs({ sectionId, situations, roster, onOpen })` — renders a horizontal row of thumbnails filtered by `sectionId`.
- `SituationLightbox({ situation, roster, onClose })` — fullscreen modal (ESC + click-outside to close). Shows `SituationSVG` at full size with title, subtitle, and an "X" close affordance.

**Wiring into sections.** `Sections.jsx` adds `<SituationThumbs>` at the bottom of each section's card body. `App.jsx` owns `activeSituation` state and renders `<SituationLightbox>` when set.

**Visual style** (matches user's reference images):

- `variant: "green"` — alternating-stripe green pitch (`#266b2a` / `#215e24`), white lines.
- `variant: "blackout"` — black pitch; an optional `focusHalf: "left" | "right"` (default `"right"`) renders that half in green with all lines, the other half in dark grey with only the penalty box outlined. Only zones in the blackout half are painted green. Matches the user's second reference image.
- Player circles: red fill (`#c9302c`), white number, black name plate below with white text.
- Arrows: gold (`#eac54f`), `solid` for passes, `dashed` for runs, arrowhead at target.
- Zones: semi-transparent green fill with gold border.
- Bench row: blue circles (`#1976d2`) with roster numbers and names, rendered outside the pitch box when `bench: true`.

**Instruction workflow** (user → me → data.js):

> "Skapa 'hog-press' i 03. Spelare 7 pressar GKs utspel, 2 kliver upp på deras VB, 3/4 håller. Pil från 7 in mot GKs långa bana. Grön zon över deras första tredjedel."

I translate into a `MP_SITUATIONS` entry and update `data.js`. User reloads → sees it.

## Architecture notes

- **Naming collisions.** Per `CLAUDE.md`: all new names are unique — `SituationSVG`, `SituationThumbs`, `SituationLightbox`, `MP_SITUATIONS`. Exported via `Object.assign(window, { ... })` at the end of `Components.jsx`.
- **SVG, not canvas.** Crisp at any size (thumbnail → lightbox → print). Easy to diff/edit as text.
- **No external libs.** Rendering is hand-written SVG in JSX.
- **Sections that have no situations render no thumbs row** — `SituationThumbs` returns `null` when its filter is empty.

## File changes summary

**New files:**

- `start-matchplan.bat`
- `build-standalone.bat` (thin wrapper calling `node build-standalone.js`)
- `build-standalone.js`
- `matchplan/situationer/` (empty dir, placeholder for exported reference images if ever needed — not required by the SVG renderer)

**Modified files:**

- `matchplan/data.js` — adds `window.MP_SITUATIONS = { ... }` with 1–2 seed entries so the UI has something to render out of the gate.
- `matchplan/Components.jsx` — adds `SituationSVG`, `SituationThumbs`, `SituationLightbox`; updates window export.
- `matchplan/Sections.jsx` — embeds `<SituationThumbs sectionId=... situations=MP_SITUATIONS />` at the end of each `SectionCard` body.
- `matchplan/App.jsx` — adds `activeSituation` state, renders `<SituationLightbox>` at root when set, passes `onOpen` down through Sections.
- `matchplan/styles.css` — adds rules for `.sit-thumbs`, `.sit-thumb`, `.sit-lightbox`, `.sit-lightbox-inner`, using the existing `:root` design tokens (no new colors).

## Verification

- `start-matchplan.bat` boots and opens the browser; matchplan renders identically to the current `http://localhost:7788`.
- `build-standalone.bat` produces a single HTML; double-clicking it (with network) renders identically to the served source.
- At least one seed situation ("03-hog-press") shows a thumbnail under the Försvarsspel section; clicking it opens the lightbox with the starting eleven visible on a pitch.
- Changing a roster name in `data.js` and reloading updates every situation's player labels.

## Out of scope (for later iterations)

- Fully-offline standalone (inline React/Babel/fonts).
- Editing situations in the browser (drag players, draw arrows). Today: all edits go via instruction → `data.js`.
- Loading tactic-board state from URL (link from matchplan into Interaktiv_Taktik_Tavla).
- Printing/exporting a situation as PNG.
