# Tactical Situations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Klickbara taktiska situationsdiagram under varje koherens-sektion — thumbs expanderar till fullskärms-lightbox med startelva + pilar + zoner på en plan.

**Architecture:** Tre React-komponenter (`SituationSVG`, `SituationThumbs`, `SituationLightbox`) som renderar handrullad SVG. Data ligger i `window.MP_SITUATIONS` nycklad på `sectionId` som matchar `MP_COHERENCE[i].id`. Spelarnamn slås upp via `roster`-nummer. Noll byggkedja — Babel Standalone, `Object.assign(window, {...})` exports.

**Tech Stack:** React 18 (standalone), Babel Standalone, handrullad SVG. Ingen test-runner (CLAUDE.md förbjuder nya beroenden). Verifiering sker via hard-refresh i webbläsaren mot `http://localhost:7788`.

**Working directory:** `C:\Scripts\fotboll\Material\Gunnilse\matcher\matchplan-for-claude-code\`

**Scope:** Endast del 3 från specen (`docs/superpowers/specs/2026-04-23-matchplan-design.md`). `start-matchplan.bat` och `build-standalone.bat` ligger i separata planer.

---

## Filkarta

- **Modify** `matchplan/data.js` — lägg till `window.MP_SITUATIONS` (7 platshållare, en per sektion 02-08)
- **Modify** `matchplan/Components.jsx` — nya komponenter `SituationSVG`, `SituationPitch`, `SituationThumbs`, `SituationLightbox`, `SituationBench`; uppdatera `Object.assign`
- **Modify** `matchplan/Sections.jsx` — utöka `SectionCard` med `sectionId` + `onOpen` + `roster`; träd igenom varje `Sec*`-wrapper
- **Modify** `matchplan/App.jsx` — `activeSituation` state, rendera `SituationLightbox` på root; tråda `onOpen` till båda varianterna; utöka `CompactCard` för VariantB
- **Modify** `matchplan/styles.css` — regler för `.sit-thumbs`, `.sit-thumb`, `.sit-lightbox`, `.sit-bench`

## Teststrategi

CLAUDE.md förbjuder nya byggkedjor, så ingen Jest/Vitest. Varje task slutar med ett webbläsarsteg: spara, hard-refresh `http://localhost:7788`, bekräfta beskrivet visuellt utfall. Håll servern igång i en separat terminal under hela implementationen.

Om servern inte är igång: öppna en terminal, `cd matchplan`, `py -m http.server 7788`, sen `http://localhost:7788`.

---

### Task 1: Seed MP_SITUATIONS — en platshållare per koherens-sektion

**Files:**
- Modify: `matchplan/data.js` (append i slutet)

- [ ] **Step 1: Lägg till datan**

Lägg till i slutet av `matchplan/data.js` (efter `window.MP_UPPBYGGNAD`-blocket):

```js
/* Taktiska situationer — platshållare per koherens-sektion */
window.MP_SITUATIONS = {
  "02-platshallare": {
    sectionId: "identitet",
    title: "Identitet — platshållare",
    variant: "green",
    players: [
      { n: 1, x: 50, y: 92 },
      { n: 2, x: 85, y: 72 },
      { n: 3, x: 63, y: 78 },
      { n: 4, x: 37, y: 78 },
      { n: 5, x: 15, y: 72 },
      { n: 6, x: 50, y: 55 },
      { n: 8, x: 32, y: 45 },
      { n: 10, x: 68, y: 45 },
      { n: 7, x: 85, y: 22 },
      { n: 9, x: 50, y: 18 },
      { n: 11, x: 15, y: 22 },
    ],
    arrows: [],
    zones: [],
    ball: null,
    bench: false,
  },
  "03-platshallare": {
    sectionId: "forsvar",
    title: "Hög press — platshållare",
    variant: "green",
    players: [
      { n: 1, x: 50, y: 92 },
      { n: 2, x: 85, y: 72 },
      { n: 3, x: 63, y: 78 },
      { n: 4, x: 37, y: 78 },
      { n: 5, x: 15, y: 72 },
      { n: 6, x: 50, y: 55 },
      { n: 8, x: 32, y: 45 },
      { n: 10, x: 68, y: 45 },
      { n: 7, x: 85, y: 22, highlight: true },
      { n: 9, x: 50, y: 18, highlight: true },
      { n: 11, x: 15, y: 22, highlight: true },
    ],
    arrows: [
      { from: [50, 18], to: [50, 8], style: "dashed", color: "gold" },
    ],
    zones: [
      { x: 25, y: 6, w: 50, h: 20, fill: "greenHighlight" },
    ],
    ball: { x: 50, y: 8 },
    bench: false,
  },
  "03-press-vb": {
    sectionId: "forsvar",
    title: "Press på deras vänsterback",
    subtitle: "Primär press-trigger — HY pressar, CM-10 dubblar.",
    variant: "green",
    players: [
      { n: 1, x: 50, y: 92 },
      { n: 2, x: 85, y: 70 },
      { n: 3, x: 63, y: 78 },
      { n: 4, x: 37, y: 78 },
      { n: 5, x: 15, y: 72 },
      { n: 6, x: 50, y: 50 },
      { n: 8, x: 30, y: 40 },
      { n: 10, x: 65, y: 35, highlight: true },
      { n: 7, x: 82, y: 20, highlight: true },
      { n: 9, x: 50, y: 18 },
      { n: 11, x: 18, y: 22 },
    ],
    arrows: [
      { from: [82, 20], to: [90, 14], style: "solid", color: "gold" },
      { from: [65, 35], to: [82, 22], style: "dashed", color: "gold" },
      { from: [18, 22], to: [45, 20], style: "dashed", color: "gold" },
    ],
    zones: [],
    ball: { x: 92, y: 12 },
    bench: false,
  },
  "04-platshallare": {
    sectionId: "omst-anfall",
    title: "Kontra i mitten — platshållare",
    variant: "green",
    players: [
      { n: 1, x: 50, y: 92 },
      { n: 2, x: 85, y: 72 },
      { n: 3, x: 63, y: 78 },
      { n: 4, x: 37, y: 78 },
      { n: 5, x: 15, y: 72 },
      { n: 6, x: 50, y: 55, highlight: true },
      { n: 8, x: 32, y: 45 },
      { n: 10, x: 68, y: 45 },
      { n: 7, x: 85, y: 22 },
      { n: 9, x: 50, y: 18 },
      { n: 11, x: 15, y: 22 },
    ],
    arrows: [
      { from: [50, 55], to: [50, 22], style: "solid", color: "gold" },
    ],
    zones: [],
    ball: { x: 50, y: 55 },
    bench: false,
  },
  "05-platshallare": {
    sectionId: "anfall",
    title: "Spela in i gyllene zonen — platshållare",
    variant: "green",
    players: [
      { n: 1, x: 50, y: 92 },
      { n: 2, x: 85, y: 60 },
      { n: 3, x: 63, y: 70 },
      { n: 4, x: 37, y: 70 },
      { n: 5, x: 15, y: 60 },
      { n: 6, x: 50, y: 50 },
      { n: 8, x: 32, y: 38 },
      { n: 10, x: 68, y: 38 },
      { n: 7, x: 85, y: 18 },
      { n: 9, x: 50, y: 14, highlight: true },
      { n: 11, x: 15, y: 18 },
    ],
    arrows: [
      { from: [32, 38], to: [50, 14], style: "solid", color: "gold" },
    ],
    zones: [
      { x: 25, y: 6, w: 50, h: 18, fill: "greenHighlight" },
    ],
    ball: { x: 32, y: 38 },
    bench: false,
  },
  "06-platshallare": {
    sectionId: "omst-forsvar",
    title: "Direkt motpress — platshållare",
    variant: "green",
    players: [
      { n: 1, x: 50, y: 92 },
      { n: 2, x: 85, y: 72 },
      { n: 3, x: 63, y: 78 },
      { n: 4, x: 37, y: 78 },
      { n: 5, x: 15, y: 72 },
      { n: 6, x: 50, y: 55, highlight: true },
      { n: 8, x: 32, y: 45, highlight: true },
      { n: 10, x: 68, y: 45, highlight: true },
      { n: 7, x: 85, y: 22 },
      { n: 9, x: 50, y: 18 },
      { n: 11, x: 15, y: 22 },
    ],
    arrows: [
      { from: [32, 45], to: [50, 50], style: "dashed", color: "gold" },
      { from: [68, 45], to: [50, 50], style: "dashed", color: "gold" },
      { from: [50, 55], to: [50, 50], style: "dashed", color: "gold" },
    ],
    zones: [],
    ball: { x: 50, y: 50 },
    bench: false,
  },
  "07-platshallare": {
    sectionId: "fasta-forsvar",
    title: "Deras hörna — platshållare",
    variant: "green",
    players: [
      { n: 1, x: 50, y: 4 },
      { n: 2, x: 28, y: 10 },
      { n: 3, x: 40, y: 6 },
      { n: 4, x: 50, y: 8 },
      { n: 5, x: 60, y: 6 },
      { n: 6, x: 72, y: 10 },
      { n: 7, x: 35, y: 16 },
      { n: 8, x: 50, y: 18, highlight: true },
      { n: 10, x: 65, y: 16, highlight: true },
      { n: 9, x: 50, y: 30 },
      { n: 11, x: 50, y: 55 },
    ],
    arrows: [],
    zones: [
      { x: 30, y: 2, w: 40, h: 18, fill: "greenHighlight" },
    ],
    ball: { x: 2, y: 2 },
    bench: false,
  },
  "08-platshallare": {
    sectionId: "fasta-anfall",
    title: "Vår hörna — platshållare",
    variant: "green",
    players: [
      { n: 1, x: 50, y: 92 },
      { n: 2, x: 35, y: 50 },
      { n: 3, x: 40, y: 14 },
      { n: 4, x: 50, y: 12 },
      { n: 5, x: 60, y: 14 },
      { n: 6, x: 70, y: 16 },
      { n: 7, x: 50, y: 22 },
      { n: 8, x: 30, y: 22 },
      { n: 9, x: 30, y: 10 },
      { n: 10, x: 50, y: 40 },
      { n: 11, x: 2, y: 2, highlight: true },
    ],
    arrows: [
      { from: [2, 2], to: [50, 12], style: "solid", color: "gold" },
    ],
    zones: [],
    ball: { x: 2, y: 2 },
    bench: false,
  },
};
```

- [ ] **Step 2: Verifiera att det parsas**

Hard-refresh `http://localhost:7788`. Öppna DevTools-konsolen (F12). Skriv:

```js
Object.keys(window.MP_SITUATIONS)
```

Förväntat: `["02-platshallare", "03-platshallare", "04-platshallare", "05-platshallare", "06-platshallare", "07-platshallare", "08-platshallare"]`. Inga errors i konsolen.

---

### Task 2: SituationSVG — plan + spelarcirklar + pilar + zoner + boll

**Files:**
- Modify: `matchplan/Components.jsx`

- [ ] **Step 1: Lägg till komponenterna**

Infoga direkt före raden `Object.assign(window, { Eyebrow, ... });` i slutet av `matchplan/Components.jsx`:

```jsx
/* ---------- Situation SVG (taktikdiagram) ---------- */
function SituationPitch({ variant, focusHalf }) {
  if (variant === "blackout") {
    const focus = focusHalf || "right";
    const leftFill = focus === "left" ? "#266b2a" : "#1b1b1b";
    const rightFill = focus === "right" ? "#266b2a" : "#1b1b1b";
    return (
      <g>
        <rect x="0" y="0" width="50" height="100" fill={leftFill} />
        <rect x="50" y="0" width="50" height="100" fill={rightFill} />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#fff" strokeWidth="0.3" />
        <rect x="30" y="0" width="40" height="14" fill="none" stroke="#fff" strokeWidth="0.3" />
        <rect x="30" y="86" width="40" height="14" fill="none" stroke="#fff" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="8" fill="none" stroke="#fff" strokeWidth="0.3" />
      </g>
    );
  }
  const stripes = [];
  for (let i = 0; i < 10; i++) {
    stripes.push(<rect key={i} x="0" y={i * 10} width="100" height="10" fill={i % 2 === 0 ? "#266b2a" : "#215e24"} />);
  }
  return (
    <g>
      {stripes}
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="#fff" strokeWidth="0.3" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="#fff" strokeWidth="0.3" />
      <circle cx="50" cy="50" r="8" fill="none" stroke="#fff" strokeWidth="0.3" />
      <rect x="30" y="0" width="40" height="14" fill="none" stroke="#fff" strokeWidth="0.3" />
      <rect x="30" y="86" width="40" height="14" fill="none" stroke="#fff" strokeWidth="0.3" />
      <rect x="40" y="0" width="20" height="5" fill="none" stroke="#fff" strokeWidth="0.3" />
      <rect x="40" y="95" width="20" height="5" fill="none" stroke="#fff" strokeWidth="0.3" />
    </g>
  );
}

function SituationSVG({ situation, roster, thumb }) {
  if (!situation) return null;
  const s = situation;
  const textSize = thumb ? 4 : 3.2;
  const labelSize = thumb ? 3 : 2.4;
  const playerR = thumb ? 3.6 : 3;
  const markerId = "sit-arrow-" + (thumb ? "t" : "b");

  return (
    <svg className={"sit-svg " + (thumb ? "is-thumb" : "")} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#eac54f" />
        </marker>
      </defs>
      <SituationPitch variant={s.variant || "green"} focusHalf={s.focusHalf} />
      {(s.zones || []).map((z, i) => (
        <rect key={"z" + i} x={z.x} y={z.y} width={z.w} height={z.h}
          fill="hsl(84 54% 45% / 0.22)" stroke="#eac54f" strokeWidth="0.3" strokeDasharray="1 0.8" />
      ))}
      {(s.arrows || []).map((a, i) => (
        <line key={"a" + i} x1={a.from[0]} y1={a.from[1]} x2={a.to[0]} y2={a.to[1]}
          stroke="#eac54f" strokeWidth="0.7"
          strokeDasharray={a.style === "dashed" ? "1.5 1" : undefined}
          markerEnd={"url(#" + markerId + ")"} />
      ))}
      {(s.players || []).map((pl, i) => {
        const r = roster.find(x => x.n === pl.n);
        return (
          <g key={"p" + i} transform={`translate(${pl.x} ${pl.y})`}>
            <circle r={playerR} fill={pl.highlight ? "#eac54f" : "#c9302c"} stroke="#fff" strokeWidth="0.4" />
            <text y={textSize * 0.35} fontSize={textSize} textAnchor="middle" fill={pl.highlight ? "#0b1220" : "#fff"} fontWeight="800">{pl.n}</text>
            {!thumb && r && (
              <g transform={`translate(0 ${playerR + 2})`}>
                <rect x={-7} y={-1.6} width={14} height={3.2} rx="0.6" fill="rgba(11,18,32,0.85)" />
                <text y={0.9} fontSize={labelSize} textAnchor="middle" fill="#fff" fontWeight="700">{r.name}</text>
              </g>
            )}
          </g>
        );
      })}
      {s.ball && (
        <circle cx={s.ball.x} cy={s.ball.y} r={thumb ? 1.4 : 1} fill="#fff" stroke="#0b1220" strokeWidth="0.3" />
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Uppdatera window-exporten**

Byt den nuvarande sista raden i filen:

```jsx
Object.assign(window, { Eyebrow, EditableLine, EditableText, Principles, Bullets, Pitch, Roster, TacticBoard });
```

mot:

```jsx
Object.assign(window, { Eyebrow, EditableLine, EditableText, Principles, Bullets, Pitch, Roster, TacticBoard, SituationSVG, SituationPitch });
```

- [ ] **Step 3: Smoke-test från konsolen**

Hard-refresh `http://localhost:7788`. I konsolen:

```js
typeof window.SituationSVG
```

Förväntat: `"function"`. Inga errors.

---

### Task 3: SituationThumbs — rad med thumbnails per sektion

**Files:**
- Modify: `matchplan/Components.jsx`

- [ ] **Step 1: Lägg till komponenten ovanför `Object.assign`**

```jsx
/* ---------- Situation Thumbs (filtrerad rad per sektion) ---------- */
function SituationThumbs({ sectionId, situations, roster, onOpen }) {
  if (!situations) return null;
  const entries = Object.entries(situations).filter(([, s]) => s.sectionId === sectionId);
  if (!entries.length) return null;
  return (
    <div className="sit-thumbs">
      {entries.map(([key, s]) => (
        <button key={key} className="sit-thumb" onClick={() => onOpen(s)} title={s.title} type="button">
          <div className="sit-thumb-svg">
            <SituationSVG situation={s} roster={roster} thumb />
          </div>
          <div className="sit-thumb-title">{s.title}</div>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Utöka `Object.assign`**

```jsx
Object.assign(window, { Eyebrow, EditableLine, EditableText, Principles, Bullets, Pitch, Roster, TacticBoard, SituationSVG, SituationPitch, SituationThumbs });
```

- [ ] **Step 3: Konsoltest**

Hard-refresh. `typeof window.SituationThumbs` → `"function"`.

---

### Task 4: SituationLightbox + SituationBench

**Files:**
- Modify: `matchplan/Components.jsx`

- [ ] **Step 1: Lägg till komponenterna ovanför `Object.assign`**

```jsx
/* ---------- Situation Lightbox (fullskärm) ---------- */
function SituationBench({ roster }) {
  const bench = roster.filter(p => p.n >= 12);
  if (!bench.length) return null;
  return (
    <div className="sit-bench">
      {bench.map(p => (
        <div key={p.n} className="sit-bench-pill">
          <span className="n">{p.n}</span>
          <span className="nm">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

function SituationLightbox({ situation, roster, onClose }) {
  useEffect(() => {
    if (!situation) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [situation, onClose]);
  if (!situation) return null;
  return (
    <div className="sit-lightbox" onClick={onClose}>
      <div className="sit-lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="sit-lightbox-close" onClick={onClose} aria-label="Stäng" type="button">×</button>
        <div className="sit-lightbox-title">{situation.title}</div>
        {situation.subtitle && <div className="sit-lightbox-sub">{situation.subtitle}</div>}
        <div className="sit-lightbox-svg">
          <SituationSVG situation={situation} roster={roster} />
        </div>
        {situation.bench && <SituationBench roster={roster} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Uppdatera `Object.assign`**

```jsx
Object.assign(window, { Eyebrow, EditableLine, EditableText, Principles, Bullets, Pitch, Roster, TacticBoard, SituationSVG, SituationPitch, SituationThumbs, SituationLightbox, SituationBench });
```

- [ ] **Step 3: Konsoltest**

Hard-refresh. `typeof window.SituationLightbox` → `"function"`.

---

### Task 5: CSS för thumbs, lightbox, bench

**Files:**
- Modify: `matchplan/styles.css` (append i slutet)

- [ ] **Step 1: Lägg till reglerna i slutet av `styles.css`**

```css
/* ---------- Taktiska situationer ---------- */
.sit-thumbs {
  display: flex; flex-wrap: wrap; gap: 10px;
  margin-top: 14px;
}
.sit-thumb {
  all: unset;
  cursor: pointer;
  display: flex; flex-direction: column; gap: 6px;
  width: 140px;
  padding: 6px;
  border: 1px solid hsl(0 0% 100% / 0.08);
  border-radius: 8px;
  background: hsl(0 0% 100% / 0.02);
  transition: border-color 0.15s, transform 0.15s;
  box-sizing: border-box;
}
.sit-thumb:hover {
  border-color: hsl(47 78% 56% / 0.6);
  transform: translateY(-1px);
}
.sit-thumb-svg {
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  overflow: hidden;
  background: #0b1220;
}
.sit-thumb-title {
  font-size: 11px;
  color: var(--fg-dim);
  line-height: 1.3;
  text-align: center;
}
.sit-svg { display: block; width: 100%; height: 100%; }

.sit-lightbox {
  position: fixed; inset: 0;
  background: rgba(8, 12, 22, 0.85);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.sit-lightbox-inner {
  position: relative;
  background: #0b1220;
  border: 1px solid hsl(47 78% 56% / 0.25);
  border-radius: 12px;
  padding: 24px 28px 20px;
  max-width: min(92vw, 900px);
  width: 100%;
  max-height: 92vh;
  overflow: auto;
  box-sizing: border-box;
}
.sit-lightbox-close {
  position: absolute; top: 10px; right: 14px;
  background: none; border: none; color: var(--fg-dim);
  font-size: 28px; line-height: 1; cursor: pointer;
}
.sit-lightbox-close:hover { color: var(--accent); }
.sit-lightbox-title {
  font-size: 18px; font-weight: 800; color: var(--fg);
  margin-bottom: 4px;
}
.sit-lightbox-sub {
  font-size: 13px; color: var(--fg-dim);
  margin-bottom: 14px;
}
.sit-lightbox-svg {
  aspect-ratio: 1 / 1;
  max-width: 640px;
  margin: 0 auto;
  border-radius: 6px;
  overflow: hidden;
}

.sit-bench {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-top: 14px;
  justify-content: center;
}
.sit-bench-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  background: hsl(211 78% 47% / 0.18);
  border: 1px solid hsl(211 78% 47% / 0.5);
  border-radius: 999px;
  font-size: 12px;
}
.sit-bench-pill .n { color: #4aa3ff; font-weight: 800; }
.sit-bench-pill .nm { color: var(--fg); }
```

- [ ] **Step 2: Sanity-check**

Hard-refresh. Ingen synlig ändring ännu (thumbs är inte inkopplade). Öppna DevTools → Network → bekräfta att `styles.css` laddas om utan 404.

---

### Task 6: Koppla SituationThumbs in i SectionCard (för VariantA)

**Files:**
- Modify: `matchplan/Sections.jsx`

- [ ] **Step 1: Utöka `SectionCard`**

Ersätt nuvarande `SectionCard`-funktion högst upp i `Sections.jsx` med:

```jsx
function SectionCard({ num, eyebrow, title, subtitle, children, dense, sectionId, onOpen, roster }) {
  return (
    <div className={"section-card " + (dense ? "dense" : "")}>
      <div className="sec-head">
        <span className="section-num">{num}</span>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h2 className="section-h">{title}</h2>
      {subtitle && <div className="sec-sub">{subtitle}</div>}
      <div className="sec-body">{children}</div>
      {sectionId && onOpen && (
        <SituationThumbs sectionId={sectionId} situations={window.MP_SITUATIONS} roster={roster} onOpen={onOpen} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Tråda props genom alla `Sec*`-wrappers**

Ersätt allt från `/* 01 Förutsättningar */` ner till och med `/* 09 Övriga roller */` i `Sections.jsx` med:

```jsx
/* 01 Förutsättningar */
function SecForutsattningar({ state, set, onOpen, roster }) {
  return (
    <SectionCard num="01" eyebrow="Kontext" title="Förutsättningar"
      sectionId="forutsattningar" onOpen={onOpen} roster={roster}>
      <Bullets items={state} onChange={set} />
    </SectionCard>
  );
}

/* 02 Identitet */
function SecIdentitet({ onOpen, roster }) {
  return (
    <SectionCard num="02" eyebrow="Vem vi är" title="Identitet"
      sectionId="identitet" onOpen={onOpen} roster={roster}>
      <Principles items={MP_COHERENCE[1].principles} />
    </SectionCard>
  );
}

/* 03 Försvarsspel */
function SecForsvar({ onOpen, roster }) {
  return (
    <SectionCard num="03" eyebrow="När de har bollen" title="Försvarsspel"
      sectionId="forsvar" onOpen={onOpen} roster={roster}>
      <Principles items={MP_COHERENCE[2].principles} />
    </SectionCard>
  );
}

/* 04 Omställning → anfall */
function SecOmstAnfall({ onOpen, roster }) {
  return (
    <SectionCard num="04" eyebrow="Vi vinner bollen" title="Omställning → anfall"
      sectionId="omst-anfall" onOpen={onOpen} roster={roster}>
      <Principles items={MP_COHERENCE[3].principles} />
    </SectionCard>
  );
}

/* 05 Anfallsspel */
function SecAnfall({ onOpen, roster }) {
  return (
    <SectionCard num="05" eyebrow="Vi har bollen" title="Anfallsspel"
      sectionId="anfall" onOpen={onOpen} roster={roster}>
      <Principles items={MP_COHERENCE[4].principles} />
    </SectionCard>
  );
}

/* 06 Omställning → försvar */
function SecOmstForsvar({ onOpen, roster }) {
  return (
    <SectionCard num="06" eyebrow="Vi tappar bollen" title="Omställning → försvar"
      sectionId="omst-forsvar" onOpen={onOpen} roster={roster}>
      <Principles items={MP_COHERENCE[5].principles} />
    </SectionCard>
  );
}

/* 07 Fasta — försvar */
function SecFastaForsvar({ onOpen, roster }) {
  return (
    <SectionCard num="07" eyebrow="Deras hörna / frispark" title="Försvar mot fasta"
      sectionId="fasta-forsvar" onOpen={onOpen} roster={roster}>
      <Principles items={MP_COHERENCE[6].principles} />
      <div className="sec-note">{MP_COHERENCE[6].note}</div>
    </SectionCard>
  );
}

/* 08 Fasta — anfall */
function SecFastaAnfall({ onOpen, roster }) {
  return (
    <SectionCard num="08" eyebrow="Vår hörna / frispark" title="Anfall från fasta"
      sectionId="fasta-anfall" onOpen={onOpen} roster={roster}>
      <div className="sec-note">{MP_COHERENCE[7].note}</div>
    </SectionCard>
  );
}

/* 09 Övriga roller */
function SecOvrigt({ state, set, onOpen, roster }) {
  return (
    <SectionCard num="09" eyebrow="Roller & ansvar" title="Övriga roller"
      sectionId="ovrigt" onOpen={onOpen} roster={roster}>
      <div className="role-grid">
        {state.map((r, i) => (
          <div key={i} className="role-row">
            <div className="k">{r.k}</div>
            <EditableLine small value={r.v}
              onChange={v => set(state.map((x, idx) => idx === i ? { ...x, v } : x))} />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
```

(Lämna `PressPanel`, `UppbyggnadPanel`, `MatchmalPanel` och det avslutande `Object.assign` orörda — de använder inte `SectionCard`.)

- [ ] **Step 3: Verifiera i webbläsaren**

Hard-refresh `http://localhost:7788`. Flöde-vyn ska se ut som innan — inga thumbs syns än eftersom `onOpen` inte trådas in förrän Task 7. Inga console-errors.

---

### Task 7: Koppla activeSituation-state och SituationLightbox in i App.jsx

**Files:**
- Modify: `matchplan/App.jsx`

- [ ] **Step 1: Lägg till state och tråda `onOpen` i App-funktionen**

Lägg till direkt efter `const [roles, setRoles] = useStateA(MP_COHERENCE[8].roles);`:

```jsx
  const [activeSituation, setActiveSituation] = useStateA(null);
```

Ersätt spreadsen inuti `<main>` med:

```jsx
        {variant === "A" ? (
          <VariantA
            {...{ roster, setRoster, assignments, assign, clear, used,
              matchmal, setMatchmal, forutsattningar, setForutsattningar,
              roles, setRoles, press, setPress, uppbyggnad, setUppbyggnad,
              onOpen: setActiveSituation }}
          />
        ) : (
          <VariantB
            {...{ roster, setRoster, assignments, assign, clear, used,
              matchmal, setMatchmal, forutsattningar, setForutsattningar,
              roles, setRoles, press, setPress, uppbyggnad, setUppbyggnad,
              onOpen: setActiveSituation }}
          />
        )}
```

Ersätt den avslutande `</main></>`-delen i return så att lightbox renderas på root:

```jsx
      </main>
      <SituationLightbox situation={activeSituation} roster={roster} onClose={() => setActiveSituation(null)} />
    </>
```

- [ ] **Step 2: Tråda `onOpen` + `roster` genom VariantA:s Sec*-anrop**

Ersätt `VariantA`-funktionen med:

```jsx
function VariantA(p) {
  return (
    <div className="flow">
      <div className="flow-main">
        <SecForutsattningar state={p.forutsattningar} set={p.setForutsattningar} onOpen={p.onOpen} roster={p.roster} />
        <SecIdentitet onOpen={p.onOpen} roster={p.roster} />
        <SecForsvar onOpen={p.onOpen} roster={p.roster} />
        <SecOmstAnfall onOpen={p.onOpen} roster={p.roster} />
        <SecAnfall onOpen={p.onOpen} roster={p.roster} />
        <SecOmstForsvar onOpen={p.onOpen} roster={p.roster} />
        <SecFastaForsvar onOpen={p.onOpen} roster={p.roster} />
        <SecFastaAnfall onOpen={p.onOpen} roster={p.roster} />
        <SecOvrigt state={p.roles} set={p.setRoles} onOpen={p.onOpen} roster={p.roster} />
      </div>
      <aside className="flow-side">
        <div className="card">
          <div className="card-head"><span className="num">XI</span><span className="lbl">Startelva — 4-3-3</span></div>
          <div className="card-body">
            <Pitch assignments={p.assignments} onAssign={p.assign} onClear={p.clear} roster={p.roster} />
            <div className="hint-inline">Dra spelare från truppen → klicka på en cirkel för att ta bort.</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body"><Roster roster={p.roster} setRoster={p.setRoster} used={p.used} /></div>
        </div>
        <MatchmalPanel state={p.matchmal} set={p.setMatchmal} />
        <PressPanel state={p.press} set={p.setPress} />
        <UppbyggnadPanel state={p.uppbyggnad} set={p.setUppbyggnad} />
        <div className="card">
          <div className="card-head"><span className="num">TAK</span><span className="lbl">Taktiktavla</span></div>
          <div className="card-body"><TacticBoard /></div>
        </div>
      </aside>
    </div>
  );
}
```

- [ ] **Step 3: Verifiera i webbläsaren**

Hard-refresh. Under varje koherens-sektion 02-08 i Flöde-vyn ska nu en liten thumbnail synas med titel. Klicka en — lightbox öppnas med stor plan och spelarnamn. Stäng via (a) ×-knappen, (b) klick utanför, (c) Escape-tangenten. Inga console-errors.

Om fel: kolla att `window.MP_SITUATIONS` finns och att `sectionId`-värden matchar exakt (t.ex. `"omst-anfall"` med bindestreck).

---

### Task 8: Koppla thumbs in i CompactCard (VariantB)

**Files:**
- Modify: `matchplan/App.jsx`

- [ ] **Step 1: Utöka `CompactCard`**

Ersätt `CompactCard`-funktionen i `App.jsx` med:

```jsx
function CompactCard({ num, title, children, sectionId, onOpen, roster }) {
  return (
    <div className="card">
      <div className="card-head"><span className="num">{num}</span><span className="lbl">{title}</span></div>
      <div className="card-body">
        {children}
        {sectionId && onOpen && (
          <SituationThumbs sectionId={sectionId} situations={window.MP_SITUATIONS} roster={roster} onOpen={onOpen} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Tråda props genom alla CompactCard i VariantB**

Ersätt `VariantB`-funktionen med:

```jsx
function VariantB(p) {
  return (
    <div className="grid-b">
      <div className="col">
        <div className="card">
          <div className="card-head"><span className="num">XI</span><span className="lbl">Startelva — 4-3-3</span></div>
          <div className="card-body">
            <Pitch assignments={p.assignments} onAssign={p.assign} onClear={p.clear} roster={p.roster} />
          </div>
        </div>
        <div className="card">
          <div className="card-body"><Roster roster={p.roster} setRoster={p.setRoster} used={p.used} /></div>
        </div>
        <div className="card">
          <div className="card-head"><span className="num">TAK</span><span className="lbl">Taktiktavla</span></div>
          <div className="card-body"><TacticBoard /></div>
        </div>
      </div>
      <div className="col">
        <MatchmalPanel state={p.matchmal} set={p.setMatchmal} />
        <CompactCard num="01" title="Förutsättningar" sectionId="forutsattningar" onOpen={p.onOpen} roster={p.roster}>
          <Bullets items={p.forutsattningar} onChange={p.setForutsattningar} />
        </CompactCard>
        <CompactCard num="02" title="Identitet" sectionId="identitet" onOpen={p.onOpen} roster={p.roster}>
          <Principles items={MP_COHERENCE[1].principles} />
        </CompactCard>
        <CompactCard num="03" title="Försvarsspel" sectionId="forsvar" onOpen={p.onOpen} roster={p.roster}>
          <Principles items={MP_COHERENCE[2].principles} />
        </CompactCard>
        <CompactCard num="05" title="Anfallsspel" sectionId="anfall" onOpen={p.onOpen} roster={p.roster}>
          <Principles items={MP_COHERENCE[4].principles} />
        </CompactCard>
      </div>
      <div className="col">
        <CompactCard num="04" title="Omst → anfall" sectionId="omst-anfall" onOpen={p.onOpen} roster={p.roster}>
          <Principles items={MP_COHERENCE[3].principles} />
        </CompactCard>
        <CompactCard num="06" title="Omst → försvar" sectionId="omst-forsvar" onOpen={p.onOpen} roster={p.roster}>
          <Principles items={MP_COHERENCE[5].principles} />
        </CompactCard>
        <CompactCard num="07" title="Fasta — försvar" sectionId="fasta-forsvar" onOpen={p.onOpen} roster={p.roster}>
          <Principles items={MP_COHERENCE[6].principles} />
          <div className="sec-note">{MP_COHERENCE[6].note}</div>
        </CompactCard>
        <CompactCard num="08" title="Fasta — anfall" sectionId="fasta-anfall" onOpen={p.onOpen} roster={p.roster}>
          <div className="sec-note">{MP_COHERENCE[7].note}</div>
        </CompactCard>
        <PressPanel state={p.press} set={p.setPress} />
        <UppbyggnadPanel state={p.uppbyggnad} set={p.setUppbyggnad} />
        <CompactCard num="09" title="Övriga roller" sectionId="ovrigt" onOpen={p.onOpen} roster={p.roster}>
          <div style={{display:"flex", flexDirection:"column", gap:6}}>
            {p.roles.map((r, i) => (
              <div key={i} className="role-row">
                <div className="k">{r.k}</div>
                <EditableLine small value={r.v}
                  onChange={v => p.setRoles(p.roles.map((x, idx) => idx === i ? { ...x, v } : x))} />
              </div>
            ))}
          </div>
        </CompactCard>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verifiera i webbläsaren**

Hard-refresh, växla till "Matchblad"-vyn via knappen i topbaren. Thumbs ska nu synas i varje CompactCard under 01-08. Klick öppnar lightbox. Inga errors.

---

### Task 9: End-to-end sanity sweep

- [ ] **Step 1: Bekräfta thumbs på alla sektioner**

Hard-refresh Flöde-vyn. Scrolla igenom alla nio sektioner. Förväntat:

- 01 Förutsättningar — inga thumbs (ingen situation för `forutsattningar`)
- 02 Identitet — en thumb "Identitet — platshållare"
- 03 Försvarsspel — två thumbs: "Hög press — platshållare" + "Press på deras vänsterback"
- 04 Omställning → anfall — en thumb "Kontra i mitten — platshållare"
- 05 Anfallsspel — en thumb "Spela in i gyllene zonen — platshållare"
- 06 Omställning → försvar — en thumb "Direkt motpress — platshållare"
- 07 Fasta — försvar — en thumb "Deras hörna — platshållare"
- 08 Fasta — anfall — en thumb "Vår hörna — platshållare"
- 09 Övriga roller — inga thumbs

- [ ] **Step 2: Lightbox-interaktioner**

Klicka varje thumb. Bekräfta:

- Lightbox öppnas centrerad med mörk bakgrund
- Titel matchar thumb-titeln
- Spelarnummer + namn (Ali, Daniel, Sabarr…) syns korrekt på planen
- Stäng via (a) ×-knappen, (b) klick utanför panelen, (c) Escape-tangenten

- [ ] **Step 3: Roster-rename sanity check**

Ändra tillfälligt i `matchplan/data.js`: `{ n: 9, name: "Leo", role: "FW" }` → `{ n: 9, name: "TESTNAMN", role: "FW" }`. Hard-refresh. Öppna valfri situation som innehåller spelare med `n: 9` — etiketten ska läsa "TESTNAMN". Ändra tillbaka till "Leo".

- [ ] **Step 4: Console-kontroll**

Öppna DevTools. Förväntat: noll errors, noll React-warnings från situationsomponenterna. Key-warnings OK att fixa men inte blockerande.

---

## Out of scope för denna plan

- `start-matchplan.bat` (fungerar redan manuellt via `py -m http.server 7788`)
- `build-standalone.bat` / `build-standalone.js` (enfilsdelning — nästa plan)
- In-browser-redigering av situationer (dra spelare, rita pilar)
- Riktiga taktiska scener — alla sju är platshållare. Användaren dikterar in riktiga scener via instruktion → vi uppdaterar `data.js`.
- Blackout-varianten finns i koden men används inte av någon platshållare. Obehindrad — sätt bara `variant: "blackout"` (och valfritt `focusHalf: "left" | "right"`) i en framtida situation.

---

## Plan self-review

**Spec-täckning:**
- MP_SITUATIONS-datamodell (Task 1)
- SituationSVG med green + blackout (Task 2)
- SituationThumbs (Task 3)
- SituationLightbox + bench (Task 4)
- Pilar med gold + dashed/solid (Task 2)
- Zoner med halvtransparent grön + guldborder (Task 2)
- Boll (Task 2)
- Wiring via SectionCard (Task 6)
- Wiring via CompactCard (Task 8)
- activeSituation-state i App (Task 7)
- Roster-namn via `n` (Task 2 + verifieras i Task 9 Step 3)
- CSS-tokens återanvänds — `--accent`, `--fg`, `--fg-dim` (Task 5)

**Placeholder-skan:** Inga "TBD" eller "implement later". Varje steg har konkret kod eller konkret klickväg.

**Typ-konsistens:** Situationsentry-formen `{ sectionId, title, variant, players, arrows, zones, ball, bench }` används konsekvent i Task 1, 2, 3, 4. Prop-namnen `sectionId`, `onOpen`, `roster` är konsekventa genom wiring i Task 6, 7, 8.

**Scope-check:** Planen bygger endast del 3 av specen (tactical situations). Del 1 (`start-matchplan.bat`) och del 2 (`build-standalone.bat`) ligger i separata planer och är out-of-scope här.
