# Taktikbilder-port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portera innehållet från `C:\Scripts\fotboll\Mina interaktiva kartor\handoff-taktikbilder\` in i zero-build-projektet så att vi får tre statiska referensbilder (Zoner, Korridorer, Spelytor) i sektion 02/03/05 och fyra interaktiva taktikbilder (Försvar mot hörna, Försvar mot inläggsfrispark, Anfall från hörna, Målchans frispark) i sektion 07/08 — med spelare som drar, pilar som ritas, och trupp-namn som uppdateras automatiskt när Roster-editorn ändrar spelare.

**Architecture:** Vi konverterar handoff-filerna från TypeScript + Tailwind + `@/`-imports till vanilj-JSX + `window`-globals. `pitchGeometry.ts` blir ny fil `matchplan/pitchGeometry.js` som exponerar `window.MP_PITCH`, `window.MP_CORRIDORS`, `window.halfM` osv. `TaktikBilder.tsx` blir `matchplan/TaktikBilder.jsx` som exporterar både de tre statiska referensbilderna och en `TaktikHalv`-renderer + `TaktikLightbox`-komponent. Befintligt `SituationSVG/SituationLightbox`-system rörs inte. Placeholder-situationerna `07-platshallare` och `08-platshallare` i `MP_SITUATIONS` ersätts av fyra nya nycklar i `MP_TAKTIK` som renderas via den nya pipelinen. Taktiktavla V1 (`TacticBoard`/`TacticBoardLightbox`) är orörd.

**Tech Stack:** React 18 via Babel Standalone (unpkg), inline JSX, pointer events för drag, SVG för rendering, `Object.assign(window, {...})` för export. Ingen npm, ingen build, inget test-runner. Manuell verifiering via hard-refresh av `http://localhost:7788`.

---

## Filstruktur

**Nya filer:**
- `matchplan/pitchGeometry.js` — alla plangeometri-konstanter + helpers som `window`-globals.
- `matchplan/TaktikBilder.jsx` — tre statiska referensbilder, `TaktikHalv`-renderer, `TaktikBilderThumbs`, `TaktikLightbox`.

**Filer som ändras:**
- `matchplan/index.html` — lägg in `<script>`-tag för `pitchGeometry.js` och `<script type="text/babel">` för `TaktikBilder.jsx`.
- `matchplan/data.js` — lägg till `window.MP_TAKTIK`, ta bort `07-platshallare` och `08-platshallare` ur `window.MP_SITUATIONS`.
- `matchplan/Sections.jsx` — `SecIdentitet`/`SecForsvar`/`SecAnfall` får referensbild överst; `SecFastaForsvar`/`SecFastaAnfall` får `TaktikBilderThumbs` överst (SituationThumbs-raden blir tom).
- `matchplan/App.jsx` — ny state `taktikOpen`, render `<TaktikLightbox>` när state sätts, skicka `onOpenTaktik` ner till Sections.
- `matchplan/styles.css` — ny `.ref-image`-container + `.tk-*`-klasser för taktikbilder.

**Filer som inte rörs:**
- `matchplan/Components.jsx` — `TacticBoard`/`TacticBoardLightbox` och hjälpfunktioner är orörda.
- Taktiktavla V1-flödet (fullscreen-pusselknappen i sidopanelen).

---

## Namnkonventioner

För att undvika kollisioner med befintliga `Situation*`, `TacticBoard*` och `Pitch`-namn använder vi prefix:

- `MP_TAKTIK` (data-globaltal) istället för `MP_SITUATIONS`.
- `TaktikHalv`, `TaktikLightbox`, `TaktikBilderThumbs` (komponenter) — alla börjar på `Taktik...` så det aldrig kan förväxlas med `SituationSVG`/`SituationLightbox`/`SituationThumbs`.
- `ZonerBox`, `Korridorer`, `Spelytor` — referensbilder. Unika namn, kollision omöjlig.
- Interna helpers prefixas `_Taktik` (`_TaktikPitchDefs`, `_TaktikFullLines`, `_TaktikHalfLines`, `_TaktikDot`).
- Geometri-globals: `MP_PITCH`, `MP_CORRIDORS`, `MP_GOLDEN_ZONE`, `MP_LEFT_ASSIST`, `MP_RIGHT_ASSIST`, `MP_FRONT_ASSIST`, `MP_THIRDS`, `MP_FULL_VB`, `MP_HALF_VB`. Helpers: `window.fullM`, `window.halfM`, `window.metersToHalfPitchPct`.
- CSS: `.ref-image`, `.tk-thumb`, `.tk-thumbs-grid`, `.tk-lightbox`, `.tk-svg`, `.tk-toolbar`, `.tk-tool-btn`, `.tk-close-btn`. Ingen överlapp med `.tb-*` (Taktiktavla) eller `.sit-*` (Situation-lightbox).

---

## Datamodell för MP_TAKTIK

Varje nyckel i `MP_TAKTIK` har formen:

```js
{
  sectionId: "fasta-forsvar" | "fasta-anfall",
  title: "Försvar mot hörna",
  dots: [
    { id: "mv", n: 1, xM: 104.5, yM: 34, team: "us", r: 20 },   // roster-länkad: n → lookup i MP_DATA.roster
    { id: "t1", label: "A", xM: 97, yM: 30, team: "them", r: 17 } // motståndare: label används direkt
  ],
  arrows: [
    { from: { xM: 104.5, yM: 66 }, to: { xM: 100, yM: 35 }, kind: "ball", curve: 40 }
  ],
  zones: [
    { xMin: 99.5, xMax: 104.5, yMin: 24.84, yMax: 43.16,
      fill: "hsl(0 65% 55% / 0.25)", stroke: "hsl(0 65% 65%)",
      label: "ZONFÖRSVAR", labelColor: "hsl(0 80% 85%)" }
  ]
}
```

- `team: "us"` + `n: N` → `TaktikHalv` slår upp `MP_DATA.roster.find(p => p.n === N)` för namn/initialer. Etiketten visar nummer som default. Om spelaren saknas i roster visas bara `n`.
- `team: "them"` + `label: "X"` → `X` visas direkt (för opponent-positioner, kickare, murspelare etc.).
- Alla koordinater är meter. `xM` 0 = vår mållinje, 105 = motståndarmål. `yM` 0 = vänster sidolinje, 68 = höger.
- `arrows[].kind` styr färg: `"ball"` = vit, `"pass"` = gul streckad, `"run"` = guld streckad (default guld solid).
- `zones` ritas under pilar och spelare.

---

## Task 1: pitchGeometry.js + window-globals

**Files:**
- Create: `matchplan/pitchGeometry.js`
- Modify: `matchplan/index.html` (lägg script-tag efter React/Babel, före `data.js`)

- [ ] **Step 1: Skapa `matchplan/pitchGeometry.js` med alla konstanter och helpers**

```js
// Planens geometri — sanningen för var linjer, boxar och zoner ligger.
// Källa: FIFA-mått 105 × 68 meter. Alla koordinater i meter.
//
// x = 0 (vår mållinje) → 105 (motståndarmål).
// y = 0 (vänster sidolinje) → 68 (höger sidolinje).
//
// Vi renderar i två vyer:
//  - full: liggande helplan, SVG-viewBox 1050 × 680 (1 m = 10 SVG-enheter)
//  - half: stående motståndarhalva, SVG-viewBox 680 × 525

window.MP_PITCH = {
  length: 105,
  width: 68,
  centerY: 34,
  paDepth: 16.5,
  paHalfWidth: 20.16,
  paNear: 13.84,   // 34 - 20.16
  paFar: 54.16,    // 34 + 20.16
  gaDepth: 5.5,
  gaHalfWidth: 9.16,
  gaNear: 24.84,
  gaFar: 43.16,
  goalHalfWidth: 3.66,
  goalNear: 30.34,
  goalFar: 37.66,
  penaltyDistance: 11,
  centerCircleRadius: 9.15,
};

window.MP_CORRIDORS = {
  leftOuter:  { yMin: 0,     yMax: 13.84 },
  leftInner:  { yMin: 13.84, yMax: 24.84 },
  central:    { yMin: 24.84, yMax: 43.16 },
  rightInner: { yMin: 43.16, yMax: 54.16 },
  rightOuter: { yMin: 54.16, yMax: 68   },
};

window.MP_GOLDEN_ZONE  = { xMin: 88.5, xMax: 99.5, yMin: 24.84, yMax: 43.16 };
window.MP_LEFT_ASSIST  = { xMin: 84.5, xMax: 105,  yMin: 13.84, yMax: 24.84 };
window.MP_RIGHT_ASSIST = { xMin: 84.5, xMax: 105,  yMin: 43.16, yMax: 54.16 };
window.MP_FRONT_ASSIST = { xMin: 84.5, xMax: 88.5, yMin: 13.84, yMax: 54.16 };

window.MP_THIRDS = {
  first:  { xMin: 0,  xMax: 35  },
  middle: { xMin: 35, xMax: 70  },
  final:  { xMin: 70, xMax: 105 },
};

window.MP_FULL_VB = { width: 1050, height: 680, scale: 10 };
window.MP_HALF_VB = { width: 680,  height: 525, scale: 10 };

// Liggande helplan: meter (x,y) → SVG-koord
window.fullM = function (xM, yM) {
  return { x: xM * window.MP_FULL_VB.scale, y: yM * window.MP_FULL_VB.scale };
};

// Stående halvplan, motståndarens halva (x = 52.5..105 m).
// x=105 (motståndarmål) → svg-y=0 (topp).
// x=52.5 (mittlinjen) → svg-y=525 (botten).
// y=0 → svg-x=0. y=68 → svg-x=680.
window.halfM = function (xM, yM) {
  return {
    x: yM * window.MP_HALF_VB.scale,
    y: (105 - xM) * window.MP_HALF_VB.scale,
  };
};

// Meter → procent (kompatibilitet med PlayerDot, behövs inte i V1 men ligger kvar för framtida behov)
window.metersToHalfPitchPct = function (xM, yM) {
  return {
    x: (yM / 68) * 100,
    y: (xM / 105) * 100,
  };
};
```

- [ ] **Step 2: Lägg script-tag i `matchplan/index.html`**

Redigera `matchplan/index.html` rad 11 (`<script src="data.js"></script>`). Lägg in `<script src="pitchGeometry.js"></script>` på raden **före** `data.js` så att geometri-globals är definierade innan någon annan skript-fil läses in.

Diff:

```html
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
<script src="pitchGeometry.js"></script>
<script src="data.js"></script>
```

- [ ] **Step 3: Manuell verifiering i webbläsaren**

1. Hard-refresha `http://localhost:7788` (Ctrl+F5).
2. Öppna DevTools-konsolen.
3. Kör:
   - `window.MP_PITCH.length` → förväntat `105`
   - `window.MP_PITCH.paNear` → förväntat `13.84`
   - `window.halfM(105, 34)` → förväntat `{ x: 340, y: 0 }`
   - `window.halfM(52.5, 0)` → förväntat `{ x: 0, y: 525 }`
   - `window.MP_GOLDEN_ZONE` → förväntat `{xMin:88.5, xMax:99.5, yMin:24.84, yMax:43.16}`

4. Sidan ska fortfarande rendera utan röda fel i konsolen. Taktiktavlan (TAK-kortet) ska fortfarande öppnas och fungera som innan.

---

## Task 2: TaktikBilder.jsx med 3 statiska referensbilder

**Files:**
- Create: `matchplan/TaktikBilder.jsx`
- Modify: `matchplan/index.html` (ny `<script type="text/babel">`-tag efter `Components.jsx`)
- Modify: `matchplan/styles.css` (lägg `.ref-image`-container)

- [ ] **Step 1: Skapa `matchplan/TaktikBilder.jsx` med skelett + tre referensbilder**

Filen innehåller allt vi behöver i V1 — i ett enda ställe så Sections.jsx/App.jsx kan importera via window-globals. Pitch-defs, lines och Dot är interna helpers. Referensbilderna är exportklara. `TaktikHalv` och `TaktikLightbox` fylls på i senare tasks (lägg tomma stubbar redan nu så att senare Object.assign inte går sönder).

```jsx
// Taktikbilder — tre statiska referensbilder (helplan) + interaktiva halvplansbilder.
// Konverterad från handoff-taktikbilder (TypeScript + Tailwind → vanilj-JSX + styles.css).

// Varje <script type="text/babel"> har eget scope. Dekonstruera React-hooks lokalt
// (samma mönster som Components.jsx rad 2).
const { useState, useRef, useEffect } = React;

const TK_COLORS = {
  pitchDark:  "hsl(142 35% 16%)",
  pitchLight: "hsl(142 35% 22%)",
  line:       "hsl(0 0% 100% / 0.55)",
  gold:       "hsl(47 78% 56%)",
  goldBright: "hsl(48 100% 72%)",
  goldTxt:    "hsl(215 30% 6%)",
  blue:       "hsl(215 70% 45%)",
  blueBright: "hsl(210 80% 85%)",
  red:        "hsl(0 65% 50%)",
  redBright:  "hsl(0 80% 85%)",
  green:      "hsl(142 55% 45%)",
  greenBright:"hsl(142 45% 75%)",
  white:      "hsl(0 0% 96%)",
  panelBg:    "hsl(215 30% 6% / 0.88)",
};

const TK_SVG_STYLE = { width: "100%", height: "auto", display: "block" };

/* ---------- Interna defs + linjer ---------- */

function _TaktikPitchDefs({ id }) {
  return (
    <defs>
      <linearGradient id={`tk-grass-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={TK_COLORS.pitchLight} />
        <stop offset="1" stopColor={TK_COLORS.pitchDark} />
      </linearGradient>
      <pattern id={`tk-mow-${id}`} width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill={`url(#tk-grass-${id})`} />
        <rect x="50" width="50" height="100" fill="hsl(0 0% 100% / 0.025)" />
      </pattern>
      <marker id={`tk-arrG-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill={TK_COLORS.gold} />
      </marker>
      <marker id={`tk-arrW-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill={TK_COLORS.white} />
      </marker>
      <marker id={`tk-arrR-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill={TK_COLORS.red} />
      </marker>
    </defs>
  );
}

function _TaktikFullLines() {
  const P = window.MP_PITCH;
  const V = window.MP_FULL_VB;
  const s = V.scale;
  const paL = { x: 0, y: P.paNear, w: P.paDepth, h: P.paFar - P.paNear };
  const paR = { x: P.length - P.paDepth, y: P.paNear, w: P.paDepth, h: P.paFar - P.paNear };
  const gaL = { x: 0, y: P.gaNear, w: P.gaDepth, h: P.gaFar - P.gaNear };
  const gaR = { x: P.length - P.gaDepth, y: P.gaNear, w: P.gaDepth, h: P.gaFar - P.gaNear };
  return (
    <g fill="none" stroke={TK_COLORS.line} strokeWidth="2">
      <rect x={0} y={0} width={P.length * s} height={P.width * s} strokeWidth="3" />
      <line x1={P.length / 2 * s} y1={0} x2={P.length / 2 * s} y2={P.width * s} />
      <circle cx={P.length / 2 * s} cy={P.width / 2 * s} r={P.centerCircleRadius * s} />
      <circle cx={P.length / 2 * s} cy={P.width / 2 * s} r={3} fill={TK_COLORS.line} stroke="none" />
      <rect x={paL.x * s} y={paL.y * s} width={paL.w * s} height={paL.h * s} />
      <rect x={paR.x * s} y={paR.y * s} width={paR.w * s} height={paR.h * s} />
      <rect x={gaL.x * s} y={gaL.y * s} width={gaL.w * s} height={gaL.h * s} />
      <rect x={gaR.x * s} y={gaR.y * s} width={gaR.w * s} height={gaR.h * s} />
      <rect x={-8} y={P.goalNear * s} width={8} height={(P.goalFar - P.goalNear) * s} fill={TK_COLORS.white} stroke={TK_COLORS.white} />
      <rect x={P.length * s} y={P.goalNear * s} width={8} height={(P.goalFar - P.goalNear) * s} fill={TK_COLORS.white} stroke={TK_COLORS.white} />
      <circle cx={P.penaltyDistance * s} cy={P.width / 2 * s} r={3} fill={TK_COLORS.line} stroke="none" />
      <circle cx={(P.length - P.penaltyDistance) * s} cy={P.width / 2 * s} r={3} fill={TK_COLORS.line} stroke="none" />
    </g>
  );
}

function _TaktikHalfLines() {
  const P = window.MP_PITCH;
  const V = window.MP_HALF_VB;
  const s = V.scale;
  const paTL = window.halfM(P.length, P.paNear);
  const paBR = window.halfM(P.length - P.paDepth, P.paFar);
  const gaTL = window.halfM(P.length, P.gaNear);
  const gaBR = window.halfM(P.length - P.gaDepth, P.gaFar);
  const penalty = window.halfM(P.length - P.penaltyDistance, P.width / 2);
  const goalL = window.halfM(P.length, P.goalNear);
  const goalR = window.halfM(P.length, P.goalFar);
  const midCenter = window.halfM(P.length / 2, P.width / 2);
  const r = P.centerCircleRadius * s;
  return (
    <g fill="none" stroke={TK_COLORS.line} strokeWidth="2">
      <rect x={0} y={0} width={V.width} height={V.height} strokeWidth="3" />
      <rect x={paTL.x} y={paTL.y} width={paBR.x - paTL.x} height={paBR.y - paTL.y} />
      <rect x={gaTL.x} y={gaTL.y} width={gaBR.x - gaTL.x} height={gaBR.y - gaTL.y} />
      <rect x={goalL.x} y={-10} width={goalR.x - goalL.x} height={10} fill={TK_COLORS.white} stroke={TK_COLORS.white} />
      <circle cx={penalty.x} cy={penalty.y} r={3} fill={TK_COLORS.line} stroke="none" />
      <path d={`M ${midCenter.x - r} ${midCenter.y} A ${r} ${r} 0 0 0 ${midCenter.x + r} ${midCenter.y}`} />
      <circle cx={midCenter.x} cy={midCenter.y} r={3} fill={TK_COLORS.line} stroke="none" />
      <line x1={0} y1={midCenter.y} x2={V.width} y2={midCenter.y} strokeDasharray="8 5" />
    </g>
  );
}

function _TaktikDot({ x, y, r, label, team, fontSize }) {
  const rr = r != null ? r : 20;
  const fill = team === "them" ? TK_COLORS.blue : team === "ref" ? "hsl(215 25% 30%)" : TK_COLORS.gold;
  const stroke = team === "us" ? TK_COLORS.goldBright : "hsl(0 0% 100% / 0.6)";
  const color = team === "us" ? TK_COLORS.goldTxt : TK_COLORS.white;
  const fs = fontSize != null ? fontSize : (String(label).length > 2 ? rr * 0.7 : rr * 0.95);
  return (
    <g>
      <circle cx={x} cy={y} r={rr} fill={fill} stroke={stroke} strokeWidth="2" />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
            fontFamily="Inter, sans-serif" fontWeight="900" fontSize={fs} fill={color}>
        {label}
      </text>
    </g>
  );
}

/* ---------- Referensbild 1: ZonerBox ---------- */
function ZonerBox() {
  const V = window.MP_FULL_VB;
  const s = V.scale;
  const GZ = window.MP_GOLDEN_ZONE;
  const LA = window.MP_LEFT_ASSIST;
  const RA = window.MP_RIGHT_ASSIST;
  const FA = window.MP_FRONT_ASSIST;
  const gz = { x: GZ.xMin * s, y: GZ.yMin * s, w: (GZ.xMax - GZ.xMin) * s, h: (GZ.yMax - GZ.yMin) * s };
  const la = { x: LA.xMin * s, y: LA.yMin * s, w: (LA.xMax - LA.xMin) * s, h: (LA.yMax - LA.yMin) * s };
  const ra = { x: RA.xMin * s, y: RA.yMin * s, w: (RA.xMax - RA.xMin) * s, h: (RA.yMax - RA.yMin) * s };
  const fa = { x: FA.xMin * s, y: FA.yMin * s, w: (FA.xMax - FA.xMin) * s, h: (FA.yMax - FA.yMin) * s };
  return (
    <svg viewBox={`0 0 ${V.width} ${V.height}`} xmlns="http://www.w3.org/2000/svg" style={TK_SVG_STYLE}>
      <_TaktikPitchDefs id="zb" />
      <rect width={V.width} height={V.height} fill="url(#tk-mow-zb)" />
      <_TaktikFullLines />
      <rect x={fa.x} y={fa.y} width={fa.w} height={fa.h} fill="hsl(215 70% 55% / 0.35)" stroke="hsl(215 70% 70%)" strokeWidth="1.5" />
      <rect x={la.x} y={la.y} width={la.w} height={la.h} fill="hsl(215 70% 55% / 0.35)" stroke="hsl(215 70% 70%)" strokeWidth="1.5" />
      <text x={la.x + la.w / 2} y={la.y + la.h / 2} textAnchor="middle" dominantBaseline="central"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="14" fill={TK_COLORS.blueBright} letterSpacing="1.2">VÄNSTER ASSISTZON</text>
      <rect x={ra.x} y={ra.y} width={ra.w} height={ra.h} fill="hsl(215 70% 55% / 0.35)" stroke="hsl(215 70% 70%)" strokeWidth="1.5" />
      <text x={ra.x + ra.w / 2} y={ra.y + ra.h / 2} textAnchor="middle" dominantBaseline="central"
            fontFamily="Inter, sans-serif" fontWeight="800" fontSize="14" fill={TK_COLORS.blueBright} letterSpacing="1.2">HÖGER ASSISTZON</text>
      <rect x={gz.x} y={gz.y} width={gz.w} height={gz.h} fill="hsl(47 78% 56% / 0.45)" stroke={TK_COLORS.gold} strokeWidth="2.5" />
      <text x={gz.x + gz.w / 2} y={gz.y + gz.h / 2} textAnchor="middle" dominantBaseline="central"
            fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" fill={TK_COLORS.gold} letterSpacing="1.5">GOLDEN ZON</text>
      <rect x={V.width / 2 - 180} y={20} width={360} height={36} rx="3" fill={TK_COLORS.panelBg} />
      <text x={V.width / 2} y={44} textAnchor="middle"
            fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill={TK_COLORS.gold} letterSpacing="2">
        ZONER I OCH RUNT BOXEN
      </text>
    </svg>
  );
}

/* ---------- Referensbild 2: Korridorer ---------- */
function Korridorer() {
  const V = window.MP_FULL_VB;
  const P = window.MP_PITCH;
  const C = window.MP_CORRIDORS;
  const s = V.scale;
  const band = (y1, y2, fill) => (
    <rect x={0} y={y1 * s} width={V.width} height={(y2 - y1) * s} fill={fill} />
  );
  return (
    <svg viewBox={`0 0 ${V.width} ${V.height}`} xmlns="http://www.w3.org/2000/svg" style={TK_SVG_STYLE}>
      <_TaktikPitchDefs id="ko" />
      <rect width={V.width} height={V.height} fill="url(#tk-mow-ko)" />
      {band(C.leftOuter.yMin, C.leftOuter.yMax,   "hsl(142 55% 45% / 0.55)")}
      {band(C.leftInner.yMin, C.leftInner.yMax,   "hsl(215 70% 55% / 0.50)")}
      {band(C.central.yMin,   C.central.yMax,     "hsl(0 65% 50% / 0.45)")}
      {band(C.rightInner.yMin,C.rightInner.yMax,  "hsl(215 70% 55% / 0.50)")}
      {band(C.rightOuter.yMin,C.rightOuter.yMax,  "hsl(142 55% 45% / 0.55)")}
      <rect x={P.paDepth * s} y={P.gaNear * s}
            width={(88.5 - P.paDepth - 68.5) * s + 1} height={(P.gaFar - P.gaNear) * s}
            fill="hsl(47 78% 56% / 0.55)" stroke={TK_COLORS.gold} strokeWidth="1.5" />
      <rect x={(P.length - P.paDepth - 4) * s} y={P.gaNear * s}
            width={4 * s} height={(P.gaFar - P.gaNear) * s}
            fill="hsl(47 78% 56% / 0.55)" stroke={TK_COLORS.gold} strokeWidth="1.5" />
      <_TaktikFullLines />
      <text x={V.width / 2} y={C.leftOuter.yMin * s + 55} textAnchor="middle"
            fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill={TK_COLORS.white} letterSpacing="2.5">YTTRE KORRIDOR</text>
      <text x={V.width / 2} y={C.leftInner.yMin * s + 50} textAnchor="middle"
            fontFamily="Inter, sans-serif" fontWeight="900" fontSize="15" fill={TK_COLORS.blueBright} letterSpacing="2">INRE KORRIDOR</text>
      <text x={V.width / 2} y={C.central.yMin * s + (C.central.yMax - C.central.yMin) * s / 2 + 6}
            textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22" fill={TK_COLORS.white} letterSpacing="3">CENTRAL KORRIDOR</text>
      <text x={V.width / 2} y={C.rightInner.yMin * s + 50} textAnchor="middle"
            fontFamily="Inter, sans-serif" fontWeight="900" fontSize="15" fill={TK_COLORS.blueBright} letterSpacing="2">INRE KORRIDOR</text>
      <text x={V.width / 2} y={C.rightOuter.yMin * s + 55} textAnchor="middle"
            fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill={TK_COLORS.white} letterSpacing="2.5">YTTRE KORRIDOR</text>
      <text x={P.paDepth * s + 20} y={P.width / 2 * s + 5} textAnchor="middle"
            fontFamily="Inter, sans-serif" fontWeight="900" fontSize="11" fill={TK_COLORS.goldTxt}>ZON 14</text>
      <text x={(P.length - P.paDepth - 2) * s} y={P.width / 2 * s + 5} textAnchor="middle"
            fontFamily="Inter, sans-serif" fontWeight="900" fontSize="11" fill={TK_COLORS.goldTxt}>ZON 14</text>
      <rect x={20} y={20} width={210} height={32} rx="3" fill={TK_COLORS.panelBg} />
      <text x={125} y={42} textAnchor="middle"
            fontFamily="Inter, sans-serif" fontWeight="900" fontSize="16" fill={TK_COLORS.gold} letterSpacing="2.5">
        KORRIDORER
      </text>
    </svg>
  );
}

/* ---------- Referensbild 3: Spelytor ---------- */
function Spelytor() {
  const V = window.MP_FULL_VB;
  const P = window.MP_PITCH;
  const s = V.scale;
  const x0 = 0, x1 = 33, x2 = 56, x3 = 78, x4 = P.length;
  const space = (xa, xb, fill, stroke, label, sub) => (
    <g>
      <rect x={xa * s + 2} y={2} width={(xb - xa) * s - 4} height={P.width * s - 4}
            fill={fill} stroke={stroke} strokeWidth="1.5" strokeDasharray="8 5" />
      <text x={(xa + (xb - xa) / 2) * s} y={P.width / 2 * s - 8} textAnchor="middle"
            fontFamily="Inter, sans-serif" fontWeight="900" fontSize="18" fill={stroke} letterSpacing="1.5">{label}</text>
      <text x={(xa + (xb - xa) / 2) * s} y={P.width / 2 * s + 14} textAnchor="middle"
            fontFamily="Inter, sans-serif" fontWeight="500" fontSize="13" fill={stroke} opacity="0.85">{sub}</text>
    </g>
  );
  return (
    <svg viewBox={`0 0 ${V.width} ${V.height}`} xmlns="http://www.w3.org/2000/svg" style={TK_SVG_STYLE}>
      <_TaktikPitchDefs id="sp" />
      <rect width={V.width} height={V.height} fill="url(#tk-mow-sp)" />
      <_TaktikFullLines />
      {space(x0, x1, "hsl(215 70% 55% / 0.22)", "hsl(210 80% 85%)", "UTGÅNGSYTA", "Säkra bakom")}
      {space(x1, x2, "hsl(47 78% 56% / 0.15)",  "hsl(47 80% 70%)",  "SPELYTA 1",  "Spela in")}
      {space(x2, x3, "hsl(47 78% 56% / 0.22)",  "hsl(47 80% 70%)",  "SPELYTA 2",  "Ta dig framåt")}
      {space(x3, x4, "hsl(47 78% 56% / 0.32)",  TK_COLORS.gold,     "SPELYTA 3",  "Fyll på i box")}
      <line x1={30} y1={40} x2={V.width - 50} y2={40}
            stroke={TK_COLORS.gold} strokeWidth="4" markerEnd="url(#tk-arrG-sp)" />
      <text x={V.width / 2} y={28} textAnchor="middle"
            fontFamily="Inter, sans-serif" fontWeight="900" fontSize="15" fill={TK_COLORS.gold} letterSpacing="3">ANFALLSVÄG →</text>
    </svg>
  );
}

/* ---------- Stubs som fylls på i senare tasks ---------- */
function TaktikHalv() { return null; }
function TaktikBilderThumbs() { return null; }
function TaktikLightbox() { return null; }

Object.assign(window, {
  ZonerBox, Korridorer, Spelytor,
  TaktikHalv, TaktikBilderThumbs, TaktikLightbox,
});
```

- [ ] **Step 2: Lägg script-tag i `matchplan/index.html`**

Efter `<script type="text/babel" src="Components.jsx"></script>` (rad 31), infoga:

```html
<script type="text/babel" src="TaktikBilder.jsx"></script>
```

Resulterande rad 31–34:

```html
<script type="text/babel" src="Components.jsx"></script>
<script type="text/babel" src="TaktikBilder.jsx"></script>
<script type="text/babel" src="Sections.jsx"></script>
<script type="text/babel" src="App.jsx"></script>
```

- [ ] **Step 3: Lägg `.ref-image` i `matchplan/styles.css`**

Leta upp sista CSS-regeln och lägg till följande block i slutet:

```css
/* Referensbilder (ZonerBox, Korridorer, Spelytor) */
.ref-image {
  margin: 16px 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border, rgba(255,255,255,0.08));
  background: #0b1220;
}
.ref-image svg { display: block; }
```

- [ ] **Step 4: Manuell verifiering i webbläsaren**

Temporär test: öppna DevTools-konsolen på `http://localhost:7788` (hard-refresha). Kör:

```js
window.ZonerBox
// → function ZonerBox() { ... }

window.Korridorer
// → function Korridorer() { ... }

window.Spelytor
// → function Spelytor() { ... }
```

Alla tre ska finnas som funktioner. Inga röda fel i konsolen. Sidan ska fortfarande rendera som innan (ingen visuell förändring ännu eftersom ingen komponent har monterat referensbilderna).

---

## Task 3: Referensbilder i sektion 02/03/05

**Files:**
- Modify: `matchplan/Sections.jsx`

- [ ] **Step 1: Uppdatera `SecIdentitet`, `SecForsvar`, `SecAnfall`**

Öppna `matchplan/Sections.jsx`. Ersätt de tre sektionerna med följande. Render referensbilden överst i `sec-body` via `.ref-image`-containern så rundade hörn och border appliceras.

Ersätt raderna för `SecIdentitet` (rad 32–39):

```jsx
/* 02 Identitet */
function SecIdentitet({ onOpen, roster }) {
  return (
    <SectionCard num="02" eyebrow="Vem vi är" title="Identitet"
      sectionId="identitet" onOpen={onOpen} roster={roster}>
      <div className="ref-image"><ZonerBox /></div>
      <Principles items={MP_COHERENCE[1].principles} />
    </SectionCard>
  );
}
```

Ersätt raderna för `SecForsvar` (rad 42–49):

```jsx
/* 03 Försvarsspel */
function SecForsvar({ onOpen, roster }) {
  return (
    <SectionCard num="03" eyebrow="När de har bollen" title="Försvarsspel"
      sectionId="forsvar" onOpen={onOpen} roster={roster}>
      <div className="ref-image"><Korridorer /></div>
      <Principles items={MP_COHERENCE[2].principles} />
    </SectionCard>
  );
}
```

Ersätt raderna för `SecAnfall` (rad 62–69):

```jsx
/* 05 Anfallsspel */
function SecAnfall({ onOpen, roster }) {
  return (
    <SectionCard num="05" eyebrow="Vi har bollen" title="Anfallsspel"
      sectionId="anfall" onOpen={onOpen} roster={roster}>
      <div className="ref-image"><Spelytor /></div>
      <Principles items={MP_COHERENCE[4].principles} />
    </SectionCard>
  );
}
```

- [ ] **Step 2: Manuell verifiering i webbläsaren**

1. Hard-refresha `http://localhost:7788`.
2. I VariantA (flöde): scrolla till sektion 02 → **Zoner i och runt boxen**-grafiken ska synas ovanför principerna. Scrolla till 03 → **Korridorer**-grafiken. Scrolla till 05 → **Spelytor**-grafiken.
3. I VariantB (matchblad): samma sak för 02/03/05.
4. Bildernas rubrik-band ska visa rubriken tydligt i guld. Grön bakgrund, vita linjer. Containern har rundade hörn och tunn border mot bakgrunden.
5. Inga röda fel i konsolen.
6. Taktiktavlan (TAK-kortet) fungerar fortfarande.
7. Situations-raderna på respektive sektion syns fortfarande nedanför (platshållare som innan).

---

## Task 4: MP_TAKTIK + Situations-rensning i data.js

**Files:**
- Modify: `matchplan/data.js`

- [ ] **Step 1: Ta bort `07-platshallare` och `08-platshallare` ur `MP_SITUATIONS`**

I `matchplan/data.js`, leta upp `window.MP_SITUATIONS = { ... }` (rad 168). Ta bort hela blocket för `"07-platshallare": { ... }` och `"08-platshallare": { ... }`. Övriga nycklar (`02-platshallare`, `03-platshallare`, `03-press-vb`, `04-platshallare`, `05-platshallare`, `06-platshallare`) blir kvar.

- [ ] **Step 2: Lägg till `window.MP_TAKTIK` efter `window.MP_SITUATIONS`**

Efter det avslutande `};` för `MP_SITUATIONS`, lägg till:

```js
/* Taktikbilder (halvplan, meter-koord) — fyra interaktiva bilder för sektion 07/08.
 * team:"us" + n:N → slår upp i MP_DATA.roster för namn/initialer (etiketten visar default n).
 * team:"them" + label:"X" → visas som-det-är. */
window.MP_TAKTIK = {
  "forsvar-horna": {
    sectionId: "fasta-forsvar",
    title: "Försvar mot hörna",
    dots: [
      { id: "mv",    n: 1,        xM: 104.5, yM: 34,   team: "us",   r: 20 },
      { id: "z1",    n: 3,        xM: 102,   yM: 27,   team: "us" },
      { id: "z2",    n: 4,        xM: 102,   yM: 32,   team: "us" },
      { id: "z3",    n: 6,        xM: 102,   yM: 36,   team: "us" },
      { id: "z4",    n: 8,        xM: 102,   yM: 41,   team: "us" },
      { id: "m1",    n: 2,        xM: 95,    yM: 29,   team: "us" },
      { id: "m2",    n: 5,        xM: 95,    yM: 34,   team: "us" },
      { id: "m3",    n: 10,       xM: 95,    yM: 40,   team: "us" },
      { id: "press", n: 11,       xM: 102,   yM: 55,   team: "us" },
      { id: "cnt",   n: 9,        xM: 60,    yM: 24,   team: "us" },
      { id: "t1",    label: "A",  xM: 97,    yM: 30,   team: "them", r: 17 },
      { id: "t2",    label: "B",  xM: 97,    yM: 35,   team: "them", r: 17 },
      { id: "t3",    label: "C",  xM: 97,    yM: 40,   team: "them", r: 17 },
      { id: "tkick", label: "K",  xM: 104.7, yM: 66.5, team: "them", r: 17 },
    ],
    arrows: [
      { from: { xM: 104.5, yM: 66 }, to: { xM: 100, yM: 35 }, kind: "ball", curve: 40 },
      { from: { xM: 62,    yM: 26 }, to: { xM: 82,  yM: 45 }, kind: "run" },
    ],
    zones: [
      { xMin: 99.5, xMax: 104.5, yMin: 24.84, yMax: 43.16,
        fill: "hsl(0 65% 55% / 0.25)", stroke: "hsl(0 65% 65%)",
        label: "ZONFÖRSVAR", labelColor: "hsl(0 80% 85%)" },
    ],
  },

  "forsvar-inlaggsfrispark": {
    sectionId: "fasta-forsvar",
    title: "Försvar mot inläggsfrispark",
    dots: [
      { id: "mv",   n: 1,        xM: 104.5, yM: 34,   team: "us", r: 20 },
      { id: "l0",   n: 3,        xM: 98.5,  yM: 27,   team: "us" },
      { id: "l1",   n: 4,        xM: 98.5,  yM: 30,   team: "us" },
      { id: "l2",   n: 5,        xM: 98.5,  yM: 32.5, team: "us" },
      { id: "l3",   n: 6,        xM: 98.5,  yM: 35,   team: "us" },
      { id: "l4",   n: 8,        xM: 98.5,  yM: 37.5, team: "us" },
      { id: "l5",   n: 10,       xM: 98.5,  yM: 40,   team: "us" },
      { id: "l6",   n: 2,        xM: 98.5,  yM: 44,   team: "us" },
      { id: "l7",   n: 7,        xM: 98.5,  yM: 48,   team: "us" },
      { id: "w1",   n: 9,        xM: 87,    yM: 55,   team: "us" },
      { id: "w2",   n: 11,       xM: 87,    yM: 58,   team: "us" },
      { id: "kick", label: "K",  xM: 81,    yM: 64,   team: "them", r: 18 },
      { id: "tm1",  label: "A",  xM: 92,    yM: 46,   team: "them", r: 17 },
    ],
    arrows: [
      { from: { xM: 82, yM: 63 }, to: { xM: 101, yM: 37 }, kind: "ball", curve: 30 },
    ],
    zones: [],
  },

  "anfall-horna-v": {
    sectionId: "fasta-anfall",
    title: "Anfall från hörna V",
    dots: [
      { id: "k",   n: 10,       xM: 104.5, yM: 2,  team: "us" },
      { id: "b1",  n: 9,        xM: 100,   yM: 28, team: "us" },
      { id: "b2",  n: 4,        xM: 100,   yM: 34, team: "us" },
      { id: "b3",  n: 3,        xM: 100,   yM: 40, team: "us" },
      { id: "r1",  n: 6,        xM: 89,    yM: 30, team: "us" },
      { id: "r2",  n: 8,        xM: 89,    yM: 38, team: "us" },
      { id: "s1",  n: 11,       xM: 92,    yM: 15, team: "us" },
      { id: "s2",  n: 7,        xM: 92,    yM: 54, team: "us" },
      { id: "saf", n: 2,        xM: 60,    yM: 34, team: "us" },
      { id: "tmv", label: "MV", xM: 104.5, yM: 34, team: "them", r: 18 },
    ],
    arrows: [
      { from: { xM: 104.2, yM: 4 },  to: { xM: 100.5, yM: 35 }, kind: "ball", curve: -35 },
      { from: { xM: 100,   yM: 28 }, to: { xM: 102,   yM: 32 }, kind: "run" },
    ],
    zones: [
      { xMin: 85, xMax: 91, yMin: 24.84, yMax: 43.16,
        fill: "hsl(0 65% 50% / 0.28)", stroke: "hsl(0 65% 60%)",
        label: "ÅTERERÖVRINGSZON", labelColor: "hsl(0 80% 85%)" },
    ],
  },

  "malchans-frispark": {
    sectionId: "fasta-anfall",
    title: "Målchans frispark",
    dots: [
      { id: "kick", label: "IA", xM: 80, yM: 8,  team: "us",   r: 20 },
      { id: "d0",   label: "DB", xM: 98, yM: 20, team: "them", r: 15 },
      { id: "d1",   label: "FJ", xM: 98, yM: 26, team: "them", r: 15 },
      { id: "d2",   label: "TH", xM: 98, yM: 31, team: "them", r: 15 },
      { id: "d3",   label: "KK", xM: 98, yM: 35, team: "them", r: 15 },
      { id: "d4",   label: "KS", xM: 98, yM: 39, team: "them", r: 15 },
      { id: "d5",   label: "AH", xM: 98, yM: 44, team: "them", r: 15 },
      { id: "d6",   label: "SU", xM: 98, yM: 50, team: "them", r: 15 },
      { id: "r1",   label: "YY", xM: 92, yM: 22, team: "us" },
      { id: "r2",   n: 9,        xM: 90, yM: 32, team: "us" },
      { id: "r3",   n: 7,        xM: 92, yM: 48, team: "us" },
      { id: "saf",  n: 6,        xM: 70, yM: 34, team: "us" },
    ],
    arrows: [
      { from: { xM: 81, yM: 10 }, to: { xM: 101, yM: 37 }, kind: "ball", curve: -55 },
      { from: { xM: 92, yM: 22 }, to: { xM: 99,  yM: 30 }, kind: "run" },
      { from: { xM: 90, yM: 32 }, to: { xM: 100, yM: 37 }, kind: "run" },
      { from: { xM: 92, yM: 48 }, to: { xM: 99,  yM: 42 }, kind: "run" },
    ],
    zones: [],
  },
};
```

- [ ] **Step 2: Manuell verifiering i webbläsaren**

1. Hard-refresha `http://localhost:7788`.
2. Öppna DevTools-konsolen.
3. Kör:
   - `Object.keys(window.MP_TAKTIK)` → förväntat `["forsvar-horna","forsvar-inlaggsfrispark","anfall-horna-v","malchans-frispark"]`
   - `window.MP_TAKTIK["forsvar-horna"].dots.length` → förväntat `14`
   - `window.MP_TAKTIK["malchans-frispark"].arrows.length` → förväntat `4`
   - `Object.keys(window.MP_SITUATIONS)` → `07-platshallare` och `08-platshallare` ska **inte** finnas med längre.
4. Scrolla till sektion 07 **Försvar mot fasta** och 08 **Anfall från fasta**: situations-raden (`SituationThumbs`) ska nu vara tom (inga platshållare syns). Övriga sektioner (02–06) ska visa sina situations-kort som innan.
5. Inga röda fel i konsolen.

---

## Task 5: TaktikHalv-renderer + TaktikBilderThumbs i sektion 07/08

**Files:**
- Modify: `matchplan/TaktikBilder.jsx` (fyll in `TaktikHalv`- och `TaktikBilderThumbs`-stubben)
- Modify: `matchplan/Sections.jsx` (`SecFastaForsvar`, `SecFastaAnfall`)

- [ ] **Step 1: Lägg till `_taktikLabelFor`-helper och fyll i `TaktikHalv` i `TaktikBilder.jsx`**

Ersätt `function TaktikHalv() { return null; }`-stubben med:

```jsx
/* Översätter en dot till en visningsetikett.
 * team:"us" + n:N → slå upp i MP_DATA.roster, visa nummer som default (eller initialer / nummer+namn
 *   styrs av labelMode-parametern).
 * team:"them" eller saknar n → använd dot.label direkt. */
function _taktikLabelFor(dot, roster, labelMode) {
  if (dot.team !== "us" || dot.n == null) {
    return dot.label != null ? String(dot.label) : "";
  }
  const player = roster && roster.find(p => p.n === dot.n);
  if (!player) return String(dot.n);
  if (labelMode === "initials") {
    const parts = (player.name || "").trim().split(/\s+/);
    const first = parts[0] ? parts[0][0].toUpperCase() : "";
    const second = parts[1] ? parts[1][0].toUpperCase() : "";
    return (first + second) || String(dot.n);
  }
  if (labelMode === "numberName") {
    const first = (player.name || "").trim().split(/\s+/)[0] || "";
    return first ? `${dot.n} ${first}` : String(dot.n);
  }
  return String(dot.n);
}

/* TaktikHalv — stående halvplan, ritar zones + pilar + spelare från meter-koord.
 * Props:
 *  - id: string (unikt per instans för defs)
 *  - title: string (rubrikband)
 *  - dots, arrows, zones: från MP_TAKTIK-posten
 *  - roster: MP_DATA.roster-arrayen (för namn-uppslag)
 *  - labelMode: "number" | "initials" | "numberName" (default "number") */
function TaktikHalv({ id, title, dots, arrows, zones, roster, labelMode }) {
  const V = window.MP_HALF_VB;
  const mode = labelMode || "number";
  return (
    <svg viewBox={`0 0 ${V.width} ${V.height}`} xmlns="http://www.w3.org/2000/svg" style={TK_SVG_STYLE}>
      <_TaktikPitchDefs id={id} />
      <rect width={V.width} height={V.height} fill={`url(#tk-mow-${id})`} />
      {zones && zones.map((z, i) => {
        const tl = window.halfM(z.xMax, z.yMin);
        const br = window.halfM(z.xMin, z.yMax);
        const cx = (tl.x + br.x) / 2;
        const cy = (tl.y + br.y) / 2;
        return (
          <g key={`z-${i}`}>
            <rect x={tl.x} y={tl.y} width={br.x - tl.x} height={br.y - tl.y}
                  fill={z.fill} stroke={z.stroke || "none"} strokeWidth="1.5" strokeDasharray="5 4" />
            {z.label && (
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                    fontFamily="Inter, sans-serif" fontWeight="800" fontSize="12"
                    fill={z.labelColor || TK_COLORS.white} letterSpacing="1">{z.label}</text>
            )}
          </g>
        );
      })}
      <_TaktikHalfLines />
      {arrows && arrows.map((a, i) => {
        const f = window.halfM(a.from.xM, a.from.yM);
        const t = window.halfM(a.to.xM,   a.to.yM);
        const color = a.kind === "ball" ? TK_COLORS.white : a.kind === "pass" ? "hsl(50 95% 60%)" : TK_COLORS.gold;
        const marker = a.kind === "ball" ? `url(#tk-arrW-${id})` : `url(#tk-arrG-${id})`;
        const dash = a.kind === "run" ? "8 5" : a.kind === "pass" ? "10 4" : null;
        if (a.curve) {
          const mx = (f.x + t.x) / 2;
          const my = (f.y + t.y) / 2;
          const dx = t.x - f.x, dy = t.y - f.y;
          const len = Math.hypot(dx, dy) || 1;
          const ox = -dy / len * a.curve;
          const oy =  dx / len * a.curve;
          return (
            <path key={`a-${i}`} d={`M ${f.x} ${f.y} Q ${mx + ox} ${my + oy} ${t.x} ${t.y}`}
                  fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={dash || undefined} markerEnd={marker} />
          );
        }
        return (
          <line key={`a-${i}`} x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                stroke={color} strokeWidth="3" strokeLinecap="round"
                strokeDasharray={dash || undefined} markerEnd={marker} />
        );
      })}
      {dots && dots.map((d, i) => {
        const p = window.halfM(d.xM, d.yM);
        return (
          <_TaktikDot key={d.id || `d-${i}`} x={p.x} y={p.y} r={d.r}
            label={_taktikLabelFor(d, roster, mode)} team={d.team || "us"} />
        );
      })}
      {title && (
        <g>
          <rect x={V.width / 2 - 170} y={V.height - 54} width={340} height={34} rx="3" fill={TK_COLORS.panelBg} />
          <text x={V.width / 2} y={V.height - 32} textAnchor="middle"
                fontFamily="Inter, sans-serif" fontWeight="900" fontSize="16" fill={TK_COLORS.gold} letterSpacing="1.8">
            {title.toUpperCase()}
          </text>
        </g>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Fyll i `TaktikBilderThumbs` i `TaktikBilder.jsx`**

Ersätt `function TaktikBilderThumbs() { return null; }`-stubben med:

```jsx
/* TaktikBilderThumbs — renderar alla MP_TAKTIK-poster vars sectionId matchar
 * som små klickbara mini-SVG:er. Klick → onOpen(taktikKey). */
function TaktikBilderThumbs({ sectionId, taktik, roster, onOpen }) {
  const keys = Object.keys(taktik || {}).filter(k => taktik[k].sectionId === sectionId);
  if (keys.length === 0) return null;
  return (
    <div className="tk-thumbs-grid">
      {keys.map(k => {
        const t = taktik[k];
        return (
          <button key={k} type="button" className="tk-thumb" onClick={() => onOpen(k)}
            title={`Öppna ${t.title}`}>
            <TaktikHalv id={`thumb-${k}`} title={t.title} dots={t.dots}
              arrows={t.arrows} zones={t.zones} roster={roster} labelMode="number" />
            <div className="tk-thumb-caption">{t.title}</div>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Lägg CSS för `.tk-thumbs-grid` och `.tk-thumb` i `matchplan/styles.css`**

Lägg till i slutet av filen:

```css
/* Taktikbilder — thumbs-raden */
.tk-thumbs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin: 12px 0 4px;
}
.tk-thumb {
  display: block;
  width: 100%;
  padding: 0;
  background: #0b1220;
  border: 1px solid var(--border, rgba(255,255,255,0.08));
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  color: var(--fg, #eaeaea);
  text-align: left;
  transition: border-color 120ms ease, transform 120ms ease;
}
.tk-thumb:hover { border-color: var(--accent, #eac54f); transform: translateY(-1px); }
.tk-thumb svg { display: block; width: 100%; height: auto; }
.tk-thumb-caption {
  padding: 6px 10px 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--fg, #eaeaea);
}
```

- [ ] **Step 4: Uppdatera `SecFastaForsvar` och `SecFastaAnfall` i `Sections.jsx`**

Ersätt `SecFastaForsvar` (rad 82–90):

```jsx
/* 07 Fasta — försvar */
function SecFastaForsvar({ onOpen, onOpenTaktik, roster }) {
  return (
    <SectionCard num="07" eyebrow="Deras hörna / frispark" title="Försvar mot fasta"
      sectionId="fasta-forsvar" onOpen={onOpen} roster={roster}>
      <TaktikBilderThumbs sectionId="fasta-forsvar" taktik={window.MP_TAKTIK}
        roster={roster} onOpen={onOpenTaktik} />
      <Principles items={MP_COHERENCE[6].principles} />
      <div className="sec-note">{MP_COHERENCE[6].note}</div>
    </SectionCard>
  );
}
```

Ersätt `SecFastaAnfall` (rad 93–100):

```jsx
/* 08 Fasta — anfall */
function SecFastaAnfall({ onOpen, onOpenTaktik, roster }) {
  return (
    <SectionCard num="08" eyebrow="Vår hörna / frispark" title="Anfall från fasta"
      sectionId="fasta-anfall" onOpen={onOpen} roster={roster}>
      <TaktikBilderThumbs sectionId="fasta-anfall" taktik={window.MP_TAKTIK}
        roster={roster} onOpen={onOpenTaktik} />
      <div className="sec-note">{MP_COHERENCE[7].note}</div>
    </SectionCard>
  );
}
```

- [ ] **Step 5: Uppdatera `App.jsx` så `onOpenTaktik` skickas in + ny state**

Öppna `matchplan/App.jsx`. Leta upp state-deklarationerna (runt rad 10–20). Lägg till:

```jsx
const [taktikOpen, setTaktikOpen] = useState(null); // taktikKey eller null
```

I de två JSX-sektionerna (VariantA och VariantB) där `<SecFastaForsvar ... />` och `<SecFastaAnfall ... />` renderas, lägg till prop:

```jsx
<SecFastaForsvar onOpen={...} onOpenTaktik={setTaktikOpen} roster={roster} />
<SecFastaAnfall  onOpen={...} onOpenTaktik={setTaktikOpen} roster={roster} />
```

(Övriga `onOpen=`-prop:ar kvar som de är för situations-lightboxen.)

Inga TaktikLightbox-renderingar ännu — det kommer i Task 6.

- [ ] **Step 6: Manuell verifiering i webbläsaren**

1. Hard-refresha `http://localhost:7788`.
2. Scrolla till sektion 07: du ska nu se **två** mini-SVG-kort med titlarna "Försvar mot hörna" och "Försvar mot inläggsfrispark". Varje kort visar halvplanen stående med zoner, pilar och gul/blå-markerade spelare. Våra spelare (us) visar roster-numret.
3. Scrolla till sektion 08: du ska se **två** mini-SVG-kort "Anfall från hörna V" och "Målchans frispark".
4. Hovra över ett kort: border byter till guld, kortet lyfter lite. Muspekaren är `pointer`.
5. Klick på ett kort gör inget synligt ännu (ingen lightbox implementerad — `taktikOpen`-state sätts, men det renderas inte).
6. Inga röda fel i konsolen.
7. Situations-rad för övriga sektioner (02/03/04/05/06) fungerar som innan.

---

## Task 6: TaktikLightbox — fullscreen + stäng

**Files:**
- Modify: `matchplan/TaktikBilder.jsx` (fyll i `TaktikLightbox`-stubben)
- Modify: `matchplan/App.jsx` (rendera `<TaktikLightbox>` när `taktikOpen` är satt)
- Modify: `matchplan/styles.css` (`.tk-lightbox`-regler)

- [ ] **Step 1: Fyll i `TaktikLightbox` i `TaktikBilder.jsx`**

Ersätt `function TaktikLightbox() { return null; }`-stubben med:

```jsx
/* TaktikLightbox — fullscreen-view av en taktikbild med möjlighet att stänga
 * via ×, Escape eller klick-utanför. Interaktivitet (drag, pilar, återställ)
 * kommer i Task 7–8. */
function TaktikLightbox({ taktikKey, roster, onClose }) {
  const t = window.MP_TAKTIK && window.MP_TAKTIK[taktikKey];

  // Escape → stäng
  useEffect(() => {
    if (!t) return;
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [t, onClose]);

  if (!t) return null;

  return (
    <div className="tk-lightbox" onClick={onClose}>
      <div className="tk-lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="tk-close-btn" onClick={onClose} type="button" aria-label="Stäng">×</button>
        <div className="tk-svg-wrap">
          <TaktikHalv id={`lb-${taktikKey}`} title={t.title} dots={t.dots}
            arrows={t.arrows} zones={t.zones} roster={roster} labelMode="number" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lägg CSS för lightboxen i `matchplan/styles.css`**

Lägg till i slutet:

```css
/* Taktikbilder — lightbox */
.tk-lightbox {
  position: fixed;
  inset: 0;
  background: rgba(5, 10, 20, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.tk-lightbox-inner {
  position: relative;
  max-width: 900px;
  max-height: 95vh;
  width: 100%;
  background: #0b1220;
  border: 1px solid var(--border, rgba(255,255,255,0.1));
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.tk-close-btn {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 2;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid var(--border, rgba(255,255,255,0.15));
  color: var(--fg, #eaeaea);
  font-size: 24px;
  line-height: 1;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tk-close-btn:hover { background: rgba(0,0,0,0.8); border-color: var(--accent, #eac54f); }
.tk-svg-wrap {
  padding: 12px;
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.tk-svg-wrap svg { max-height: 80vh; }
```

- [ ] **Step 3: Rendera `<TaktikLightbox>` i `App.jsx`**

I `App.jsx`, efter `<TacticBoardLightbox ... />`-renderingen (eller nära den), lägg till:

```jsx
{taktikOpen && (
  <TaktikLightbox taktikKey={taktikOpen} roster={roster}
    onClose={() => setTaktikOpen(null)} />
)}
```

- [ ] **Step 4: Manuell verifiering i webbläsaren**

1. Hard-refresha `http://localhost:7788`.
2. Scrolla till sektion 07, klicka på "Försvar mot hörna"-kortet.
3. Lightbox öppnas → mörk overlay fyller skärmen. Centrerad dialog visar den stora SVG:n av taktikbilden med alla dots, pilar och zonen "ZONFÖRSVAR".
4. Tryck **Escape** → lightboxen stängs.
5. Öppna kortet igen. Klicka på den mörka overlayen (utanför dialogen) → lightboxen stängs.
6. Öppna igen. Klicka på **×**-knappen uppe i högra hörnet → lightboxen stängs.
7. Öppna alla fyra taktikbilderna (sektion 07 och 08), verifiera att varje visar rätt titel och rätt spelar-/zonupplägg.
8. Inga röda fel i konsolen. Taktiktavla (TAK-kortet) och övriga situations-lightboxes fungerar fortfarande.

---

## Task 7: Drag-drop av spelare + Återställ

**Files:**
- Modify: `matchplan/TaktikBilder.jsx` (gör `TaktikLightbox` interaktiv med lokal state + pointer events)
- Modify: `matchplan/styles.css` (`.tk-toolbar`, `.tk-tool-btn`)

- [ ] **Step 1: Gör TaktikLightbox interaktiv med lokal dots-state**

Ersätt den `TaktikLightbox`-funktion vi skrev i Task 6 med den interaktiva versionen. Vi dupliceras dots-arrayen lokalt så användaren kan flytta dem. Stängs lightboxen kastas state — det är by design (ingen persistens).

```jsx
function TaktikLightbox({ taktikKey, roster, onClose }) {
  const t = window.MP_TAKTIK && window.MP_TAKTIK[taktikKey];
  const svgRef = useRef(null);
  const [dots, setDots] = useState(() => t ? t.dots.map(d => ({ ...d })) : []);
  const [dragId, setDragId] = useState(null);

  // Escape-stäng
  useEffect(() => {
    if (!t) return;
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [t, onClose]);

  // Reset-funktion — återställ till default
  const resetDots = () => {
    if (!t) return;
    setDots(t.dots.map(d => ({ ...d })));
  };

  // Hjälpare: konvertera skärm-pixel till SVG-koord
  const screenToSvg = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  };

  // Pointer event handlers — drag-logik
  const onPointerDown = (dotId) => (e) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDragId(dotId);
  };
  const onPointerMove = (e) => {
    if (dragId == null) return;
    const svgPt = screenToSvg(e.clientX, e.clientY);
    if (!svgPt) return;
    const scale = window.MP_HALF_VB.scale;
    // svg-x → yM (bredd), svg-y → xM (djup, 52.5..105)
    const yM = svgPt.x / scale;
    const xM = 105 - svgPt.y / scale;
    // Clamp till motståndarhalvan
    const clampedXM = Math.max(52.5, Math.min(105, xM));
    const clampedYM = Math.max(0, Math.min(68, yM));
    setDots(prev => prev.map(d => d.id === dragId
      ? { ...d, xM: clampedXM, yM: clampedYM }
      : d));
  };
  const onPointerUp = (e) => {
    if (dragId == null) return;
    try { e.target.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    setDragId(null);
  };

  if (!t) return null;

  const V = window.MP_HALF_VB;
  const lbId = `lb-${taktikKey}`;

  return (
    <div className="tk-lightbox" onClick={onClose}>
      <div className="tk-lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="tk-close-btn" onClick={onClose} type="button" aria-label="Stäng">×</button>
        <div className="tk-toolbar">
          <button className="tk-tool-btn" type="button" onClick={resetDots}>Återställ</button>
        </div>
        <div className="tk-svg-wrap">
          <svg ref={svgRef}
               viewBox={`0 0 ${V.width} ${V.height}`}
               xmlns="http://www.w3.org/2000/svg"
               style={TK_SVG_STYLE}
               onPointerMove={onPointerMove}
               onPointerUp={onPointerUp}
               onPointerCancel={onPointerUp}>
            <_TaktikPitchDefs id={lbId} />
            <rect width={V.width} height={V.height} fill={`url(#tk-mow-${lbId})`} />
            {t.zones && t.zones.map((z, i) => {
              const tl = window.halfM(z.xMax, z.yMin);
              const br = window.halfM(z.xMin, z.yMax);
              const cx = (tl.x + br.x) / 2;
              const cy = (tl.y + br.y) / 2;
              return (
                <g key={`z-${i}`}>
                  <rect x={tl.x} y={tl.y} width={br.x - tl.x} height={br.y - tl.y}
                        fill={z.fill} stroke={z.stroke || "none"} strokeWidth="1.5" strokeDasharray="5 4" />
                  {z.label && (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                          fontFamily="Inter, sans-serif" fontWeight="800" fontSize="12"
                          fill={z.labelColor || TK_COLORS.white} letterSpacing="1">{z.label}</text>
                  )}
                </g>
              );
            })}
            <_TaktikHalfLines />
            {t.arrows && t.arrows.map((a, i) => {
              const f = window.halfM(a.from.xM, a.from.yM);
              const tp = window.halfM(a.to.xM, a.to.yM);
              const color = a.kind === "ball" ? TK_COLORS.white : a.kind === "pass" ? "hsl(50 95% 60%)" : TK_COLORS.gold;
              const marker = a.kind === "ball" ? `url(#tk-arrW-${lbId})` : `url(#tk-arrG-${lbId})`;
              const dash = a.kind === "run" ? "8 5" : a.kind === "pass" ? "10 4" : null;
              if (a.curve) {
                const mx = (f.x + tp.x) / 2;
                const my = (f.y + tp.y) / 2;
                const dx = tp.x - f.x, dy = tp.y - f.y;
                const len = Math.hypot(dx, dy) || 1;
                const ox = -dy / len * a.curve;
                const oy =  dx / len * a.curve;
                return (
                  <path key={`a-${i}`} d={`M ${f.x} ${f.y} Q ${mx + ox} ${my + oy} ${tp.x} ${tp.y}`}
                        fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={dash || undefined} markerEnd={marker} />
                );
              }
              return (
                <line key={`a-${i}`} x1={f.x} y1={f.y} x2={tp.x} y2={tp.y}
                      stroke={color} strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={dash || undefined} markerEnd={marker} />
              );
            })}
            {dots.map((d, i) => {
              const p = window.halfM(d.xM, d.yM);
              const r = d.r != null ? d.r : 20;
              const label = _taktikLabelFor(d, roster, "number");
              const fill = d.team === "them" ? TK_COLORS.blue : d.team === "ref" ? "hsl(215 25% 30%)" : TK_COLORS.gold;
              const stroke = d.team === "us" ? TK_COLORS.goldBright : "hsl(0 0% 100% / 0.6)";
              const color = d.team === "us" ? TK_COLORS.goldTxt : TK_COLORS.white;
              const fs = String(label).length > 2 ? r * 0.7 : r * 0.95;
              return (
                <g key={d.id || `d-${i}`}
                   style={{ cursor: "grab", touchAction: "none" }}
                   onPointerDown={onPointerDown(d.id)}>
                  <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke={stroke} strokeWidth="2" />
                  <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                        fontFamily="Inter, sans-serif" fontWeight="900" fontSize={fs} fill={color}
                        style={{ pointerEvents: "none", userSelect: "none" }}>
                    {label}
                  </text>
                </g>
              );
            })}
            <rect x={V.width / 2 - 170} y={V.height - 54} width={340} height={34} rx="3" fill={TK_COLORS.panelBg} />
            <text x={V.width / 2} y={V.height - 32} textAnchor="middle"
                  fontFamily="Inter, sans-serif" fontWeight="900" fontSize="16" fill={TK_COLORS.gold} letterSpacing="1.8">
              {t.title.toUpperCase()}
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lägg CSS för `.tk-toolbar` och `.tk-tool-btn`**

Lägg till i `matchplan/styles.css`:

```css
.tk-toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 48px 8px 12px;
  border-bottom: 1px solid var(--border, rgba(255,255,255,0.08));
  background: rgba(255,255,255,0.02);
  flex-wrap: wrap;
}
.tk-tool-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--border, rgba(255,255,255,0.12));
  color: var(--fg, #eaeaea);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease;
}
.tk-tool-btn:hover { background: rgba(255,255,255,0.1); border-color: var(--accent, #eac54f); }
.tk-tool-btn.is-active { background: var(--accent, #eac54f); border-color: var(--accent, #eac54f); color: #0b1220; }
```

- [ ] **Step 3: Manuell verifiering i webbläsaren**

1. Hard-refresha `http://localhost:7788`.
2. Öppna "Försvar mot hörna"-kortet i sektion 07.
3. Klicka-håll på en av våra gula spelare (t.ex. `1`, målvakten). Dra runt den — cirkeln ska följa muspekaren smidigt. Håller vi inom motståndarens halva (övre halvan av viewBox:en).
4. Släpp — spelaren stannar där du släppte.
5. Dra en blå motståndar-dot (A, B, C, K) — fungerar likadant.
6. Klicka **Återställ** i toolbaren → alla dots hoppar tillbaka till default-positionerna från `MP_TAKTIK["forsvar-horna"].dots`.
7. Stäng lightboxen (Escape eller ×), öppna igen → positionerna är default igen (ingen persistens).
8. Upprepa i övriga tre taktikbilder (inläggsfrispark, anfall-hörna-v, målchans-frispark) för att se att drag + återställ fungerar.
9. Under drag ska cursorn bli `grab`/`grabbing`. Text-etiketterna ska inte bli markerade när vi drar.
10. Inga röda fel i konsolen.

---

## Task 8: Pilar — rita + rensa

**Files:**
- Modify: `matchplan/TaktikBilder.jsx` (lägg pil-verktyg i `TaktikLightbox`)

- [ ] **Step 1: Utöka TaktikLightbox med pil-state + verktygsläge**

I `TaktikLightbox`-funktionen, lägg till state direkt efter `const [dragId, setDragId] = useState(null);`:

```jsx
const [toolMode, setToolMode] = useState("move"); // "move" | "arrow"
const [userArrows, setUserArrows] = useState([]);  // { from:{xM,yM}, to:{xM,yM} }
const [arrowDraft, setArrowDraft] = useState(null); // { from:{xM,yM}, to:{xM,yM} } under drag
```

Lägg till ytterligare hjälpare innan `if (!t) return null;`:

```jsx
// Skärm-punkt till meter-koord (djup, bredd)
const screenToMeters = (clientX, clientY) => {
  const svgPt = screenToSvg(clientX, clientY);
  if (!svgPt) return null;
  const scale = window.MP_HALF_VB.scale;
  const yM = Math.max(0, Math.min(68, svgPt.x / scale));
  const xM = Math.max(52.5, Math.min(105, 105 - svgPt.y / scale));
  return { xM, yM };
};

// Pil-drag: onPointerDown på SVG-bakgrund
const onArrowStart = (e) => {
  if (toolMode !== "arrow") return;
  if (e.target !== svgRef.current && e.target.tagName !== "rect") return;
  // bakgrunden är första <rect>; om event-target är en dot hoppar vi ur (dot-handlers har stopPropagation)
  const m = screenToMeters(e.clientX, e.clientY);
  if (!m) return;
  try { svgRef.current.setPointerCapture(e.pointerId); } catch (_) {}
  setArrowDraft({ from: m, to: m });
};

const onArrowMove = (e) => {
  if (toolMode !== "arrow" || !arrowDraft) return;
  const m = screenToMeters(e.clientX, e.clientY);
  if (!m) return;
  setArrowDraft({ from: arrowDraft.from, to: m });
};

const onArrowEnd = (e) => {
  if (toolMode !== "arrow" || !arrowDraft) return;
  try { svgRef.current.releasePointerCapture(e.pointerId); } catch (_) {}
  // Minsta avstånd för att registrera (undvik oavsiktliga klick-pilar)
  const dx = arrowDraft.to.xM - arrowDraft.from.xM;
  const dy = arrowDraft.to.yM - arrowDraft.from.yM;
  if (Math.hypot(dx, dy) > 1.5) {
    setUserArrows(prev => [...prev, arrowDraft]);
  }
  setArrowDraft(null);
};

const clearUserArrows = () => {
  setUserArrows([]);
  setArrowDraft(null);
};
```

Uppdatera `resetDots` så den också rensar pilar + återställer verktygsläge:

```jsx
const resetAll = () => {
  if (!t) return;
  setDots(t.dots.map(d => ({ ...d })));
  setUserArrows([]);
  setArrowDraft(null);
  setToolMode("move");
};
```

(Döp om befintliga referenser till `resetDots` → `resetAll`.)

Uppdatera toolbar-JSX:

```jsx
<div className="tk-toolbar">
  <button className={`tk-tool-btn${toolMode === "move" ? " is-active" : ""}`} type="button"
          onClick={() => setToolMode("move")}>Flytta</button>
  <button className={`tk-tool-btn${toolMode === "arrow" ? " is-active" : ""}`} type="button"
          onClick={() => setToolMode("arrow")}>Rita pil</button>
  <button className="tk-tool-btn" type="button" onClick={clearUserArrows}>Rensa pilar</button>
  <button className="tk-tool-btn" type="button" onClick={resetAll}>Återställ</button>
</div>
```

Uppdatera SVG-elementets event-handlers så pil-drag börjar på bakgrunden:

```jsx
<svg ref={svgRef}
     viewBox={`0 0 ${V.width} ${V.height}`}
     xmlns="http://www.w3.org/2000/svg"
     style={{ ...TK_SVG_STYLE, touchAction: "none" }}
     onPointerDown={onArrowStart}
     onPointerMove={(e) => { onPointerMove(e); onArrowMove(e); }}
     onPointerUp={(e) => { onPointerUp(e); onArrowEnd(e); }}
     onPointerCancel={(e) => { onPointerUp(e); onArrowEnd(e); }}>
```

Rendera user-pilar + draft efter default-pilar, innan dots:

```jsx
{userArrows.map((a, i) => {
  const f = window.halfM(a.from.xM, a.from.yM);
  const tp = window.halfM(a.to.xM, a.to.yM);
  return (
    <line key={`ua-${i}`} x1={f.x} y1={f.y} x2={tp.x} y2={tp.y}
          stroke={TK_COLORS.gold} strokeWidth="3" strokeLinecap="round"
          markerEnd={`url(#tk-arrG-${lbId})`} />
  );
})}
{arrowDraft && (() => {
  const f = window.halfM(arrowDraft.from.xM, arrowDraft.from.yM);
  const tp = window.halfM(arrowDraft.to.xM, arrowDraft.to.yM);
  return (
    <line x1={f.x} y1={f.y} x2={tp.x} y2={tp.y}
          stroke={TK_COLORS.goldBright} strokeWidth="2" strokeLinecap="round"
          strokeDasharray="6 4" opacity="0.8" />
  );
})()}
```

Blockera drag av dots när toolMode = "arrow" genom att villkora `onPointerDown`:

```jsx
onPointerDown={toolMode === "move" ? onPointerDown(d.id) : undefined}
```

- [ ] **Step 2: Manuell verifiering i webbläsaren**

1. Hard-refresha `http://localhost:7788`.
2. Öppna en taktikbild (t.ex. Försvar mot hörna).
3. I toolbaren: **Flytta** är aktiv (guld). Klicka **Rita pil** → guld flyttas dit.
4. Klicka-dra från en tom punkt på planen till en annan → en streckad guld-preview ska synas under dragningen. Släpp → en solid guld-pil med pilspets ska ligga kvar.
5. Dra fler pilar. Klicka **Rensa pilar** → alla dina egna pilar försvinner (default-pilarna i taktikbilden ska finnas kvar).
6. Med **Rita pil**-läget aktivt ska klick-drag på en spelar-dot **inte** starta en spelar-drag (spelare förblir stilla — drag-handler är avslagen).
7. Klicka **Flytta** → nu ska spelar-drag fungera igen (som i Task 7). Klick-drag på tom yta ska **inte** rita pil.
8. Klicka **Återställ** → spelare tillbaka till default, egna pilar borta, verktygsläge tillbaka till Flytta.
9. Inga röda fel i konsolen.

---

## Task 9: Verifiering — roster-propagering

**Files:** ingen kodändring. Detta är en verifieringstask för att bekräfta att trupp-ändringar genomslår i alla fyra taktikbilder via roster-prop.

- [ ] **Step 1: Manuell verifiering i webbläsaren**

1. Hard-refresha `http://localhost:7788`.
2. I VariantA: scrolla till **Trupp (16)**-sektionen i sidopanelen.
3. Hitta spelare med nummer **9**. Ändra namnet i text-inputen till t.ex. "Bengt Testsson".
4. Scrolla till sektion 07 → mini-kortet "Försvar mot hörna". Dots visar nummer som default — `9` ska fortfarande synas i position `xM:60 yM:24` (kontringsspelaren långt fram).
5. Öppna lightboxen för det kortet. Spelare-`9`-dotten ska fortfarande synas med nummer `9` (default labelMode är "number").
6. Öppna sektion 08 → "Målchans frispark". Spelare-`9` sitter på `xM:90 yM:32`. Hovra muspekaren över den — SVG-titeln/title-attributet krävs inte, men visuellt ska `9` synas oavsett namnändring (eftersom labelMode är "number" i V1).
7. **Viktigast:** Kontrollera att MP_TAKTIK fortsatt bygger på `roster`-prop via TaktikHalv. I DevTools-konsolen: `window.MP_DATA.roster.find(p => p.n === 9)` — namnet ska visa "Bengt Testsson" (state-persistens via React, inte data.js-persistens).
8. I VariantB: samma kontroll — samma roster-state, samma namn syns.
9. Ingen visuell förändring av etiketten syns i V1 (vi visar bara nummer). Men: när vi senare (post-V1) slår på labelMode="initials" eller "numberName" kommer namnändringen direkt att visas. Det är designat så.

- [ ] **Step 2: Slutsvep 10-punkts-checklista**

Bocka av följande i webbläsaren efter hard-refresh:

1. Sektion 02 visar ZonerBox-grafiken överst, principerna nedanför.
2. Sektion 03 visar Korridorer-grafiken.
3. Sektion 05 visar Spelytor-grafiken.
4. Sektion 07 visar **två** nya taktikbild-kort (Försvar mot hörna, Försvar mot inläggsfrispark). Inga gamla platshållare.
5. Sektion 08 visar **två** nya taktikbild-kort (Anfall från hörna V, Målchans frispark).
6. Klick på ett kort öppnar lightboxen med fullstor taktikbild.
7. Lightboxen stängs via ×, Escape och klick-utanför.
8. Toolbaren i lightboxen har fyra knappar: Flytta, Rita pil, Rensa pilar, Återställ.
9. Spelare kan dras i Flytta-läget. Pilar ritas i Rita-pil-läget. Rensa pilar tar bort egna pilar men lämnar default. Återställ nollställer allt.
10. Taktiktavla V1 (fullscreen TAK-kortet) öppnar/stänger som tidigare — inga regressioner.

Om alla tio punkter bockas, är Taktikbilder-porten komplett.

---

## Efter planen

Efter Task 9 återstår Taktiktavla V1 Task 8 (Märkning-toggle) och Task 9 (Preview-kort mini-SVG + 17-punkts slutsvep) som paussades inför den här porten. De körs separat enligt sin egen plan: `docs/superpowers/plans/2026-04-24-taktiktavla-v1.md`.
