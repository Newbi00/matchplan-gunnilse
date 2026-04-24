# Taktiktavla V1 — Implementationsplan

> **För agentiska workers:** OBLIGATORISK SUB-SKILL: Använd superpowers:subagent-driven-development (rekommenderat) eller superpowers:executing-plans för att köra denna plan task-för-task. Steg använder checkbox-syntax (`- [ ]`) för spårning.

**Goal:** Byta ut nuvarande placeholder-`TacticBoard` i matchplanens sidopanel mot ett preview-kort som öppnar en fullscreen-lightbox med drag-drop av spelare, gul pilritning, återställning och märkning-toggle.

**Architecture:** Två React-komponenter i `matchplan/Components.jsx`: uppdaterad `TacticBoard` (preview-kort med mini-SVG + öppna-knapp) och ny `TacticBoardLightbox` (fullscreen overlay). State för `tacticBoardOpen` läggs i `App.jsx`. All interaktionslogik (drag, pil, märkning, reset) lever lokalt inuti `TacticBoardLightbox` — ingen persistens, state rensas vid stängning.

**Tech Stack:** React 18 + Babel Standalone (zero-build). SVG med `viewBox="0 0 100 118"`. Pointer events för drag (mus + grundläggande touch). `Object.assign(window, { ... })` för komponentexport. Ingen ny fil — bara Components.jsx, App.jsx, styles.css ändras.

---

## Verifieringsmönster

Projektet har ingen test-runner (se CLAUDE.md: "Inte lägga till nya paketberoenden / byggkedjor"). Varje task verifieras istället manuellt i webbläsaren:

1. Dev-servern kör redan på `http://localhost:7788`
2. Efter varje kodändring: **hard-refresh** (Ctrl+Shift+R på Windows) i fliken
3. Följ verifieringschecklistan i slutet av varje task
4. Om något inte syns som förväntat: rapportera observation, fixa, hard-refresh igen
5. **Ingen git-commit.** Mappen `matchplan-for-claude-code` är inte ett git-repo på den här nivån. Ändringarna sparas direkt till disk.

---

## Filstruktur

| Fil | Ändring | Syfte |
|---|---|---|
| `matchplan/Components.jsx` | Modifiera rader 142–205 (ersätt gamla `TacticBoard`), lägg till ny `TacticBoardLightbox` innan `Object.assign`, uppdatera `Object.assign`-raden | Preview-kort + fullscreen-lightbox |
| `matchplan/App.jsx` | Lägg till `tacticBoardOpen`-state, skicka props till båda `TacticBoard`-instanser, rendera `TacticBoardLightbox` | State + wiring |
| `matchplan/styles.css` | Lägg till `.tb-*`-klasser i slutet | Lightbox + pucks + toolbar |

Inga filer skapas, tas bort eller flyttas. Inga nya script-tags i `index.html`.

---

## Task 1: TacticBoard preview-knapp + tom lightbox som öppnar/stänger via ×

**Mål:** Lägg grunden. Klick på preview-kort öppnar tom fullscreen-lightbox; × stänger. Inget annat fungerar än.

**Files:**
- Modify: `matchplan/Components.jsx:142-205` (ersätt hela gamla `TacticBoard`)
- Modify: `matchplan/Components.jsx:348` (lägg till `TacticBoardLightbox` i `Object.assign`)
- Modify: `matchplan/App.jsx:16` (lägg till `tacticBoardOpen`-state)
- Modify: `matchplan/App.jsx:76` (rendera `TacticBoardLightbox`)
- Modify: `matchplan/App.jsx:111` (skicka `onOpen` till `TacticBoard` i VariantA)
- Modify: `matchplan/App.jsx:133` (skicka `onOpen` till `TacticBoard` i VariantB)
- Modify: `matchplan/styles.css` (lägg till `.tb-*`-grundklasser i slutet)

- [ ] **Steg 1.1: Ersätt gamla `TacticBoard` i `Components.jsx`**

Öppna `matchplan/Components.jsx`. Ersätt hela blocket mellan kommentarraden `/* ---------- Tactic board with draggable pucks ---------- */` och komponentens stängande `}` (rad 142–205) med följande:

```jsx
/* ---------- Tactic board preview (card) ---------- */
function TacticBoard({ onOpen }) {
  return (
    <div className="tb-preview">
      <div className="tb-preview-hint">Öppna fullscreen-taktiktavlan för att dra spelare och rita pilar.</div>
      <button className="tb-preview-btn" onClick={onOpen} type="button">
        Öppna taktiktavla
      </button>
    </div>
  );
}

/* ---------- Tactic board lightbox (fullscreen) ---------- */
function TacticBoardLightbox({ open, onClose, roster, assignments }) {
  if (!open) return null;
  return (
    <div className="tb-lightbox">
      <div className="tb-lightbox-inner">
        <button className="tb-lightbox-close" onClick={onClose} aria-label="Stäng" type="button">×</button>
        <div className="tb-lightbox-title">Taktiktavla — 4-3-3</div>
      </div>
    </div>
  );
}
```

Props `roster` och `assignments` läses in men används inte än (läggs in i Task 4). Preview-mini-SVG lägger vi i Task 9.

- [ ] **Steg 1.2: Uppdatera `Object.assign(window, {...})` i slutet av `Components.jsx`**

Ersätt sista raden:

```jsx
Object.assign(window, { Eyebrow, EditableLine, EditableText, Principles, Bullets, Pitch, Roster, TacticBoard, SituationSVG, SituationPitch, SituationThumbs, SituationLightbox, SituationBench });
```

Med:

```jsx
Object.assign(window, { Eyebrow, EditableLine, EditableText, Principles, Bullets, Pitch, Roster, TacticBoard, TacticBoardLightbox, SituationSVG, SituationPitch, SituationThumbs, SituationLightbox, SituationBench });
```

Bara `TacticBoardLightbox` har tillkommit.

- [ ] **Steg 1.3: Lägg till state `tacticBoardOpen` i `App.jsx`**

Öppna `matchplan/App.jsx`. Direkt efter raden `const [activeSituation, setActiveSituation] = useStateA(null);` (rad 16), lägg till:

```jsx
  const [tacticBoardOpen, setTacticBoardOpen] = useStateA(false);
```

- [ ] **Steg 1.4: Rendera `TacticBoardLightbox` i `App.jsx`**

Efter raden `<SituationLightbox situation={activeSituation} roster={roster} onClose={() => setActiveSituation(null)} />` (rad 76), lägg till:

```jsx
      <TacticBoardLightbox
        open={tacticBoardOpen}
        onClose={() => setTacticBoardOpen(false)}
        roster={roster}
        assignments={assignments}
      />
```

- [ ] **Steg 1.5: Skicka `onOpen` till `TacticBoard` i VariantA**

Hitta raden `<div className="card-body"><TacticBoard /></div>` i VariantA (rad 111). Ersätt med:

```jsx
          <div className="card-body"><TacticBoard onOpen={() => setTacticBoardOpen(true)} /></div>
```

Problem: `setTacticBoardOpen` är definierad i `App`-scope men VariantA är en separat funktion. Vi behöver skicka en callback via props. Uppdatera istället raden så att den läser callbacken från `p`:

```jsx
          <div className="card-body"><TacticBoard onOpen={p.onOpenTacticBoard} /></div>
```

Sen i `App`-funktionen, i båda `<VariantA ... />` och `<VariantB ... />` anropen (rad 61 och 68), lägg till propen `onOpenTacticBoard: () => setTacticBoardOpen(true)`. Så här ser hela App-returblocket ut efter ändringen:

```jsx
      <main className="page">
        {variant === "A" ? (
          <VariantA
            {...{ roster, setRoster, assignments, assign, clear, used,
              matchmal, setMatchmal, forutsattningar, setForutsattningar,
              roles, setRoles, press, setPress, uppbyggnad, setUppbyggnad,
              onOpen: setActiveSituation,
              onOpenTacticBoard: () => setTacticBoardOpen(true) }}
          />
        ) : (
          <VariantB
            {...{ roster, setRoster, assignments, assign, clear, used,
              matchmal, setMatchmal, forutsattningar, setForutsattningar,
              roles, setRoles, press, setPress, uppbyggnad, setUppbyggnad,
              onOpen: setActiveSituation,
              onOpenTacticBoard: () => setTacticBoardOpen(true) }}
          />
        )}
      </main>
      <SituationLightbox situation={activeSituation} roster={roster} onClose={() => setActiveSituation(null)} />
      <TacticBoardLightbox
        open={tacticBoardOpen}
        onClose={() => setTacticBoardOpen(false)}
        roster={roster}
        assignments={assignments}
      />
```

- [ ] **Steg 1.6: Skicka `onOpen` till `TacticBoard` i VariantB**

I `VariantB` (rad 133), ersätt `<div className="card-body"><TacticBoard /></div>` med:

```jsx
          <div className="card-body"><TacticBoard onOpen={p.onOpenTacticBoard} /></div>
```

- [ ] **Steg 1.7: Lägg till CSS-grundklasser i slutet av `styles.css`**

Lägg till i slutet av `matchplan/styles.css`:

```css
/* ---------- Taktiktavla (V1) ---------- */
.tb-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tb-preview-hint {
  font-size: 11px;
  color: var(--fg-dim);
  line-height: 1.4;
}
.tb-preview-btn {
  background: var(--accent);
  color: #111;
  font-weight: 800;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 0.04em;
}
.tb-preview-btn:hover {
  background: var(--accent-2);
}
.tb-lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.tb-lightbox-inner {
  background: #0b1220;
  border: 2px solid var(--accent);
  border-radius: 12px;
  max-width: 1200px;
  width: 100%;
  max-height: 95vh;
  padding: 20px;
  overflow: auto;
  position: relative;
}
.tb-lightbox-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: transparent;
  border: 1px solid hsl(0 0% 100% / 0.25);
  color: #fff;
  font-size: 20px;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  line-height: 1;
}
.tb-lightbox-close:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.tb-lightbox-title {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 14px;
  padding-right: 44px;
}
```

- [ ] **Steg 1.8: Verifiera i webbläsare**

Spara alla filer. Hard-refresh `http://localhost:7788` (Ctrl+Shift+R).

Förväntat:
- I sidopanelen (Variant A) finns kortet "TAK · Taktiktavla" med text och en gul knapp "Öppna taktiktavla"
- Klick på knappen öppnar en mörk fullscreen-overlay med ett navy innehållsblock centrerat
- Innehållsblocket har texten "Taktiktavla — 4-3-3" och en ×-knapp i övre högra hörnet
- Klick på × stänger overlayen och man är tillbaka på sidan
- Växla till "Matchblad" (Variant B) — samma preview-kort finns där, samma flöde fungerar
- Console (F12) är fri från röda fel
- Gamla "Återställ"-knappen + dra-pjäser-texten är borta (de hörde till gamla `TacticBoard`)

Om något misslyckas: kontrollera att `setTacticBoardOpen` skickas korrekt genom `p.onOpenTacticBoard`, och att `TacticBoardLightbox` är med i `Object.assign`.

---

## Task 2: Escape + klick-utanför stänger lightboxen

**Mål:** Komplettera stängningsvägarna. Escape och klick på den mörka bakgrunden ska också stänga.

**Files:**
- Modify: `matchplan/Components.jsx` (inne i `TacticBoardLightbox`)

- [ ] **Steg 2.1: Lägg till Escape-lyssnare och click-through på yttre lager**

Ersätt hela `TacticBoardLightbox`-funktionen med:

```jsx
function TacticBoardLightbox({ open, onClose, roster, assignments }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="tb-lightbox" onClick={onClose}>
      <div className="tb-lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="tb-lightbox-close" onClick={onClose} aria-label="Stäng" type="button">×</button>
        <div className="tb-lightbox-title">Taktiktavla — 4-3-3</div>
      </div>
    </div>
  );
}
```

`useEffect` är redan destrukturerad överst i `Components.jsx` (rad 2), så ingen import behövs.

- [ ] **Steg 2.2: Verifiera i webbläsare**

Hard-refresh. Öppna lightboxen via knappen.

Förväntat:
- Tryck Escape → lightbox stängs
- Öppna igen, klicka på den mörka halvtransparenta bakgrunden utanför innehållsblocket → lightbox stängs
- Öppna igen, klicka INOM innehållsblocket (exempelvis på titeln) → lightbox stängs INTE
- Klicka × → stängs fortfarande (gammal väg bevarad)
- Escape-lyssnaren ska vara borta när lightbox är stängd (ingen bugg där Escape triggar fel saker efter stängning)

---

## Task 3: Plan-SVG med grön bakgrund, linjer och bänk-band-avdelare

**Mål:** Rendera hela SVG-planen (viewBox 0 0 100 118) med gräsmönster, ytterlinje, mittlinje, mittcirkel, två straffområden, och bänk-bandet under. Inga spelare än.

**Files:**
- Modify: `matchplan/Components.jsx` (inne i `TacticBoardLightbox`)
- Modify: `matchplan/styles.css` (lägg till `.tb-svg`)

- [ ] **Steg 3.1: Lägg till SVG-innehåll i `TacticBoardLightbox`**

Ersätt hela `TacticBoardLightbox`-funktionen med:

```jsx
function TacticBoardLightbox({ open, onClose, roster, assignments }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="tb-lightbox" onClick={onClose}>
      <div className="tb-lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="tb-lightbox-close" onClick={onClose} aria-label="Stäng" type="button">×</button>
        <div className="tb-lightbox-title">Taktiktavla — 4-3-3</div>
        <svg className="tb-svg" viewBox="0 0 100 118" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tb-grass" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#266b2a" />
              <rect x="5" width="5" height="10" fill="#215e24" />
            </pattern>
            <marker id="tb-arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#eac54f" />
            </marker>
          </defs>
          {/* Plan y=0..100 */}
          <rect x="0" y="0" width="100" height="100" fill="url(#tb-grass)" />
          <rect x="1" y="1" width="98" height="98" fill="none" stroke="#ffffffa0" strokeWidth="0.4" />
          <line x1="1" y1="50" x2="99" y2="50" stroke="#ffffffa0" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="8" fill="none" stroke="#ffffffa0" strokeWidth="0.3" />
          <rect x="25" y="1" width="50" height="14" fill="none" stroke="#ffffff80" strokeWidth="0.3" />
          <rect x="25" y="85" width="50" height="14" fill="none" stroke="#ffffff80" strokeWidth="0.3" />
          {/* Bänk-band y=100..118 */}
          <rect x="0" y="100" width="100" height="18" fill="#0b1220" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#eac54f" strokeWidth="0.3" />
          <text x="3" y="106" fontSize="2.4" fontWeight="700" fill="#eac54f" fontFamily="system-ui" letterSpacing="0.4">BÄNK</text>
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Steg 3.2: Lägg till `.tb-svg` i `styles.css`**

Lägg till i `.tb-*`-blocket i slutet av `styles.css`:

```css
.tb-svg {
  width: 100%;
  height: auto;
  display: block;
  touch-action: none;
  user-select: none;
  max-height: 80vh;
  background: #0b1220;
  border-radius: 8px;
}
```

- [ ] **Steg 3.3: Verifiera i webbläsare**

Hard-refresh, öppna lightbox.

Förväntat:
- En stor SVG-plan syns med grön, randig gräsmatta
- Vita linjer för ytterkant, mittlinje och mittcirkel
- Två straffområden: ett uppe (liten rektangel vid y=1–15) och ett nere (vid y=85–99)
- Under planen finns ett mörkt navy band med en gul linje överst och ordet "BÄNK" längst till vänster
- Planen skalar responsivt när fönstret ändrar storlek
- Inga spelare syns (de kommer i Task 4)
- Inga console-fel

---

## Task 4: Spelare initialiseras och renderas (plan + bänk)

**Mål:** När lightbox öppnas ska startelvan visas på rätt positioner (konverterat från `MP_DATA.formation433` med flipp), och reserver hamnar som mindre cirklar i bänk-bandet. Ingen interaktion än.

**Files:**
- Modify: `matchplan/Components.jsx` (lägg hjälpfunktioner + utbyggd `TacticBoardLightbox`)

- [ ] **Steg 4.1: Lägg till hjälpfunktioner ovanför `TacticBoardLightbox`**

Direkt före `function TacticBoardLightbox(...)` i `Components.jsx`, lägg till:

```jsx
/* ---------- Tactic board helpers ---------- */
function toTacticSvgY(dataY) {
  // MP_DATA har "0 = vår MV", vi vill ha "0 = motståndarmål (uppe i SVG)"
  return 100 - dataY;
}

function getPlayerInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ? parts[0][0].toUpperCase() : "";
  const second = parts[1] ? parts[1][0].toUpperCase() : "";
  return first + second;
}

const TACTIC_BENCH_SLOTS_X = [22, 32, 42, 52, 62, 72, 82];
const TACTIC_BENCH_Y = 110;

function buildTacticPlayers(roster, assignments) {
  const positions = MP_DATA.formation433.positions;
  const usedNumbers = new Set();
  const onField = [];

  // 1) Fyll tilldelade positioner från assignments
  positions.forEach(pos => {
    const num = assignments[pos.id];
    if (num != null) {
      const p = roster.find(r => r.n === num);
      if (p) {
        onField.push({
          n: p.n,
          name: p.name,
          initials: getPlayerInitials(p.name),
          x: pos.x,
          y: toTacticSvgY(pos.y),
          onField: true,
        });
        usedNumbers.add(p.n);
      }
    }
  });

  // 2) Fyll luckor i positions-ordning med nästa oanvända roster-spelare
  positions.forEach(pos => {
    if (assignments[pos.id] != null) return; // redan fylld
    const nextPlayer = roster.find(r => !usedNumbers.has(r.n));
    if (!nextPlayer) return;
    onField.push({
      n: nextPlayer.n,
      name: nextPlayer.name,
      initials: getPlayerInitials(nextPlayer.name),
      x: pos.x,
      y: toTacticSvgY(pos.y),
      onField: true,
    });
    usedNumbers.add(nextPlayer.n);
  });

  // 3) Återstående roster-spelare hamnar på bänk
  const bench = [];
  roster.forEach(r => {
    if (usedNumbers.has(r.n)) return;
    const slotIndex = bench.length;
    const x = TACTIC_BENCH_SLOTS_X[slotIndex] ?? (TACTIC_BENCH_SLOTS_X[TACTIC_BENCH_SLOTS_X.length - 1] + (slotIndex - TACTIC_BENCH_SLOTS_X.length + 1) * 5);
    bench.push({
      n: r.n,
      name: r.name,
      initials: getPlayerInitials(r.name),
      x,
      y: TACTIC_BENCH_Y,
      onField: false,
    });
  });

  return [...onField, ...bench];
}
```

- [ ] **Steg 4.2: Lägg till `players`-state och rendering i `TacticBoardLightbox`**

Ersätt hela `TacticBoardLightbox`-funktionen med:

```jsx
function TacticBoardLightbox({ open, onClose, roster, assignments }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!open) return;
    setPlayers(buildTacticPlayers(roster, assignments));
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, roster, assignments]);

  if (!open) return null;

  return (
    <div className="tb-lightbox" onClick={onClose}>
      <div className="tb-lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="tb-lightbox-close" onClick={onClose} aria-label="Stäng" type="button">×</button>
        <div className="tb-lightbox-title">Taktiktavla — 4-3-3</div>
        <svg className="tb-svg" viewBox="0 0 100 118" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tb-grass" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#266b2a" />
              <rect x="5" width="5" height="10" fill="#215e24" />
            </pattern>
            <marker id="tb-arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#eac54f" />
            </marker>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#tb-grass)" />
          <rect x="1" y="1" width="98" height="98" fill="none" stroke="#ffffffa0" strokeWidth="0.4" />
          <line x1="1" y1="50" x2="99" y2="50" stroke="#ffffffa0" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="8" fill="none" stroke="#ffffffa0" strokeWidth="0.3" />
          <rect x="25" y="1" width="50" height="14" fill="none" stroke="#ffffff80" strokeWidth="0.3" />
          <rect x="25" y="85" width="50" height="14" fill="none" stroke="#ffffff80" strokeWidth="0.3" />
          <rect x="0" y="100" width="100" height="18" fill="#0b1220" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#eac54f" strokeWidth="0.3" />
          <text x="3" y="106" fontSize="2.4" fontWeight="700" fill="#eac54f" fontFamily="system-ui" letterSpacing="0.4">BÄNK</text>
          {players.map(p => (
            <g key={p.n} className="tb-puck" data-n={p.n}>
              <circle
                cx={p.x}
                cy={p.y}
                r={p.onField ? 3.2 : 2.6}
                fill={p.onField ? "#ff6b6b" : "#ff6b6b40"}
                stroke={p.onField ? "#fff" : "#ff6b6b"}
                strokeWidth="0.4"
              />
              <text
                x={p.x}
                y={p.y + 1}
                textAnchor="middle"
                fontSize={p.onField ? 2.8 : 2.3}
                fontWeight="700"
                fill="#fff"
                fontFamily="system-ui"
              >
                {p.n}
              </text>
              {p.onField && (
                <text
                  x={p.x}
                  y={p.y + 6}
                  textAnchor="middle"
                  fontSize="2.2"
                  fill="#fff"
                  fontFamily="system-ui"
                >
                  {p.name}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Steg 4.3: Verifiera i webbläsare**

Hard-refresh. Öppna lightbox.

Förväntat:
- 11 röda cirklar på planen i 4-3-3-formation:
  - Målvakt (n=1, "Ali") längst ner i mitten
  - Fyra backar (2,3,4,5) på nedre tredjedelen
  - Tre mittfältare (6,8,10) i mitten
  - Tre anfallare (7,9,11) på övre tredjedelen
- Varje spelare har nummer i cirkeln och namnet under
- Spelare 12–16 (Meisam, Pascal, Måns, Aldin, Maric) syns som mindre transparent-röda cirklar i bänk-bandet, jämnt fördelade
- Bänk-cirklar har bara nummer, ingen namn-etikett
- Stäng lightbox, öppna igen — startelvan ligger kvar på samma positioner (eftersom `assignments` är tom i båda fallen och fallback-ordningen är deterministisk)
- Inga console-fel

Om namn överlappar mellan spelare: det är acceptabelt i V1, fixas inte förrän V2.

---

## Task 5: Drag-drop plan↔bänk via pointer events

**Mål:** Användaren ska kunna dra en puck till valfri position. Släpp under y=100 → bänkas (onField=false, fyllning blir transparent, namn försvinner). Släpp över y=100 → hamnar på plan (onField=true, fyllning blir solid röd, namn dyker upp).

**Files:**
- Modify: `matchplan/Components.jsx` (utbyggd `TacticBoardLightbox`)
- Modify: `matchplan/styles.css` (lägg till `.tb-puck`-stil)

- [ ] **Steg 5.1: Lägg till drag-refs, pointer-handlers och clamp-logik i `TacticBoardLightbox`**

Ersätt hela `TacticBoardLightbox`-funktionen med:

```jsx
function TacticBoardLightbox({ open, onClose, roster, assignments }) {
  const [players, setPlayers] = useState([]);
  const svgRef = useRef(null);
  const dragRef = useRef(null); // { n, dx, dy }

  useEffect(() => {
    if (!open) return;
    setPlayers(buildTacticPlayers(roster, assignments));
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, roster, assignments]);

  function screenToSvg(clientX, clientY) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = clientX; pt.y = clientY;
      const inv = ctm.inverse();
      const local = pt.matrixTransform(inv);
      return { x: local.x, y: local.y };
    }
    // Fallback: räkna via bounding rect + viewBox
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 118,
    };
  }

  function onPuckPointerDown(e, n) {
    e.stopPropagation();
    const svgPt = screenToSvg(e.clientX, e.clientY);
    const player = players.find(p => p.n === n);
    if (!player) return;
    dragRef.current = { n, dx: svgPt.x - player.x, dy: svgPt.y - player.y };
    e.target.setPointerCapture(e.pointerId);
  }

  function onPuckPointerMove(e) {
    if (!dragRef.current) return;
    const svgPt = screenToSvg(e.clientX, e.clientY);
    const { n, dx, dy } = dragRef.current;
    let nextX = svgPt.x - dx;
    let nextY = svgPt.y - dy;
    nextX = Math.max(2, Math.min(98, nextX));
    nextY = Math.max(2, Math.min(116, nextY));
    setPlayers(ps => ps.map(p => p.n === n ? { ...p, x: nextX, y: nextY } : p));
  }

  function onPuckPointerUp(e) {
    if (!dragRef.current) return;
    const { n } = dragRef.current;
    dragRef.current = null;
    try { e.target.releasePointerCapture(e.pointerId); } catch (_) {}
    setPlayers(ps => ps.map(p => {
      if (p.n !== n) return p;
      const nowOnField = p.y <= 100;
      return { ...p, onField: nowOnField };
    }));
  }

  if (!open) return null;

  return (
    <div className="tb-lightbox" onClick={onClose}>
      <div className="tb-lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="tb-lightbox-close" onClick={onClose} aria-label="Stäng" type="button">×</button>
        <div className="tb-lightbox-title">Taktiktavla — 4-3-3</div>
        <svg
          ref={svgRef}
          className="tb-svg"
          viewBox="0 0 100 118"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="tb-grass" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#266b2a" />
              <rect x="5" width="5" height="10" fill="#215e24" />
            </pattern>
            <marker id="tb-arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#eac54f" />
            </marker>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#tb-grass)" />
          <rect x="1" y="1" width="98" height="98" fill="none" stroke="#ffffffa0" strokeWidth="0.4" />
          <line x1="1" y1="50" x2="99" y2="50" stroke="#ffffffa0" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="8" fill="none" stroke="#ffffffa0" strokeWidth="0.3" />
          <rect x="25" y="1" width="50" height="14" fill="none" stroke="#ffffff80" strokeWidth="0.3" />
          <rect x="25" y="85" width="50" height="14" fill="none" stroke="#ffffff80" strokeWidth="0.3" />
          <rect x="0" y="100" width="100" height="18" fill="#0b1220" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#eac54f" strokeWidth="0.3" />
          <text x="3" y="106" fontSize="2.4" fontWeight="700" fill="#eac54f" fontFamily="system-ui" letterSpacing="0.4">BÄNK</text>
          {players.map(p => (
            <g
              key={p.n}
              className="tb-puck"
              data-n={p.n}
              onPointerDown={e => onPuckPointerDown(e, p.n)}
              onPointerMove={onPuckPointerMove}
              onPointerUp={onPuckPointerUp}
              onPointerCancel={onPuckPointerUp}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={p.onField ? 3.2 : 2.6}
                fill={p.onField ? "#ff6b6b" : "#ff6b6b40"}
                stroke={p.onField ? "#fff" : "#ff6b6b"}
                strokeWidth="0.4"
              />
              <text
                x={p.x}
                y={p.y + 1}
                textAnchor="middle"
                fontSize={p.onField ? 2.8 : 2.3}
                fontWeight="700"
                fill="#fff"
                fontFamily="system-ui"
                style={{ pointerEvents: "none" }}
              >
                {p.n}
              </text>
              {p.onField && (
                <text
                  x={p.x}
                  y={p.y + 6}
                  textAnchor="middle"
                  fontSize="2.2"
                  fill="#fff"
                  fontFamily="system-ui"
                  style={{ pointerEvents: "none" }}
                >
                  {p.name}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
```

`useRef` är redan destrukturerad överst i `Components.jsx`, så ingen ändring där.

- [ ] **Steg 5.2: Lägg till cursor-stil för pucks i `styles.css`**

Lägg till i `.tb-*`-blocket i slutet av `styles.css`:

```css
.tb-puck {
  cursor: grab;
}
.tb-puck:active {
  cursor: grabbing;
}
```

- [ ] **Steg 5.3: Verifiera i webbläsare**

Hard-refresh, öppna lightbox.

Förväntat:
- Muspekaren är en "grab"-hand när den hovrar över en puck
- Klicka och dra en plan-spelare till mitten av planen → pucken följer musen och hamnar där du släpper
- Dra samma spelare ner under bänk-linjen (y > 100) → cirkeln blir mindre och transparent (blir bänkad), namnet försvinner
- Dra en bänkad spelare upp över y=100 → cirkeln blir röd och stor igen, namnet dyker upp
- Dra mot yttre kanten → pucken stannar innanför planen (clamp vid x=2/98, y=2/116)
- Namn och nummer skickar inte pointer-events vidare (vi pucken följer pekaren, inte bara cirkeln)
- Inga console-fel
- Försök på touch-enhet om möjligt: drag fungerar också (pointer events täcker båda)

---

## Task 6: Pil-ritning + "Rensa pilar"-knapp

**Mål:** När `toolMode === "arrow"`: klick-dra på tom plan ritar en gul pil med pilspets. Pucks slutar reagera på klick i detta läge. Knapp "Rensa pilar" tömmer alla pilar.

**Files:**
- Modify: `matchplan/Components.jsx` (utbyggd `TacticBoardLightbox` — toolbar + arrow-state + SVG-lager)
- Modify: `matchplan/styles.css` (lägg till `.tb-toolbar`, `.tb-tool-btn`, arrow-mode-undantag)

- [ ] **Steg 6.1: Lägg till toolbar + arrow-state + arrow-handlers i `TacticBoardLightbox`**

Ersätt hela `TacticBoardLightbox`-funktionen med:

```jsx
function TacticBoardLightbox({ open, onClose, roster, assignments }) {
  const [players, setPlayers] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [toolMode, setToolMode] = useState("move");
  const [arrowPreview, setArrowPreview] = useState(null); // { x1, y1, x2, y2 }
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const arrowRef = useRef(null); // { x1, y1 }

  useEffect(() => {
    if (!open) return;
    setPlayers(buildTacticPlayers(roster, assignments));
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, roster, assignments]);

  function screenToSvg(clientX, clientY) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = clientX; pt.y = clientY;
      const inv = ctm.inverse();
      const local = pt.matrixTransform(inv);
      return { x: local.x, y: local.y };
    }
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 118,
    };
  }

  function onPuckPointerDown(e, n) {
    if (toolMode !== "move") return;
    e.stopPropagation();
    const svgPt = screenToSvg(e.clientX, e.clientY);
    const player = players.find(p => p.n === n);
    if (!player) return;
    dragRef.current = { n, dx: svgPt.x - player.x, dy: svgPt.y - player.y };
    e.target.setPointerCapture(e.pointerId);
  }

  function onPuckPointerMove(e) {
    if (!dragRef.current) return;
    const svgPt = screenToSvg(e.clientX, e.clientY);
    const { n, dx, dy } = dragRef.current;
    let nextX = Math.max(2, Math.min(98, svgPt.x - dx));
    let nextY = Math.max(2, Math.min(116, svgPt.y - dy));
    setPlayers(ps => ps.map(p => p.n === n ? { ...p, x: nextX, y: nextY } : p));
  }

  function onPuckPointerUp(e) {
    if (!dragRef.current) return;
    const { n } = dragRef.current;
    dragRef.current = null;
    try { e.target.releasePointerCapture(e.pointerId); } catch (_) {}
    setPlayers(ps => ps.map(p => {
      if (p.n !== n) return p;
      return { ...p, onField: p.y <= 100 };
    }));
  }

  function onSvgPointerDown(e) {
    if (toolMode !== "arrow") return;
    const svgPt = screenToSvg(e.clientX, e.clientY);
    if (svgPt.y > 100) return; // inga pilar i bänk-bandet
    arrowRef.current = { x1: svgPt.x, y1: svgPt.y };
    setArrowPreview({ x1: svgPt.x, y1: svgPt.y, x2: svgPt.x, y2: svgPt.y });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
  }

  function onSvgPointerMove(e) {
    if (!arrowRef.current) return;
    const svgPt = screenToSvg(e.clientX, e.clientY);
    const x2 = Math.max(2, Math.min(98, svgPt.x));
    const y2 = Math.max(2, Math.min(98, svgPt.y));
    setArrowPreview({ x1: arrowRef.current.x1, y1: arrowRef.current.y1, x2, y2 });
  }

  function onSvgPointerUp(e) {
    if (!arrowRef.current) return;
    const start = arrowRef.current;
    arrowRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
    // Läs aktuell pointer-position direkt från eventet — undviker stale closure
    const svgPt = screenToSvg(e.clientX, e.clientY);
    const x2 = Math.max(2, Math.min(98, svgPt.x));
    const y2 = Math.max(2, Math.min(98, svgPt.y));
    const len = Math.hypot(x2 - start.x1, y2 - start.y1);
    if (len >= 2) {
      setArrows(as => [...as, { x1: start.x1, y1: start.y1, x2, y2 }]);
    }
    setArrowPreview(null);
  }

  if (!open) return null;

  return (
    <div className="tb-lightbox" onClick={onClose}>
      <div className="tb-lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="tb-lightbox-close" onClick={onClose} aria-label="Stäng" type="button">×</button>
        <div className="tb-lightbox-title">Taktiktavla — 4-3-3</div>
        <div className="tb-toolbar">
          <button
            className={"tb-tool-btn " + (toolMode === "arrow" ? "is-active" : "")}
            onClick={() => setToolMode(toolMode === "arrow" ? "move" : "arrow")}
            type="button"
          >
            Rita pil
          </button>
          <button
            className="tb-tool-btn"
            onClick={() => setArrows([])}
            type="button"
          >
            Rensa pilar
          </button>
        </div>
        <svg
          ref={svgRef}
          className={"tb-svg " + (toolMode === "arrow" ? "is-arrow-mode" : "")}
          viewBox="0 0 100 118"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          onPointerDown={onSvgPointerDown}
          onPointerMove={onSvgPointerMove}
          onPointerUp={onSvgPointerUp}
          onPointerCancel={onSvgPointerUp}
        >
          <defs>
            <pattern id="tb-grass" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#266b2a" />
              <rect x="5" width="5" height="10" fill="#215e24" />
            </pattern>
            <marker id="tb-arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#eac54f" />
            </marker>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#tb-grass)" />
          <rect x="1" y="1" width="98" height="98" fill="none" stroke="#ffffffa0" strokeWidth="0.4" />
          <line x1="1" y1="50" x2="99" y2="50" stroke="#ffffffa0" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="8" fill="none" stroke="#ffffffa0" strokeWidth="0.3" />
          <rect x="25" y="1" width="50" height="14" fill="none" stroke="#ffffff80" strokeWidth="0.3" />
          <rect x="25" y="85" width="50" height="14" fill="none" stroke="#ffffff80" strokeWidth="0.3" />
          <rect x="0" y="100" width="100" height="18" fill="#0b1220" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#eac54f" strokeWidth="0.3" />
          <text x="3" y="106" fontSize="2.4" fontWeight="700" fill="#eac54f" fontFamily="system-ui" letterSpacing="0.4">BÄNK</text>
          {arrows.map((a, i) => (
            <line
              key={"arrow-" + i}
              className="tb-arrow"
              x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
              stroke="#eac54f"
              strokeWidth="0.8"
              strokeLinecap="round"
              markerEnd="url(#tb-arrowhead)"
            />
          ))}
          {arrowPreview && (
            <line
              className="tb-arrow-preview"
              x1={arrowPreview.x1} y1={arrowPreview.y1}
              x2={arrowPreview.x2} y2={arrowPreview.y2}
              stroke="#eac54f"
              strokeWidth="0.6"
              strokeLinecap="round"
              markerEnd="url(#tb-arrowhead)"
              opacity="0.6"
            />
          )}
          {players.map(p => (
            <g
              key={p.n}
              className="tb-puck"
              data-n={p.n}
              onPointerDown={e => onPuckPointerDown(e, p.n)}
              onPointerMove={onPuckPointerMove}
              onPointerUp={onPuckPointerUp}
              onPointerCancel={onPuckPointerUp}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={p.onField ? 3.2 : 2.6}
                fill={p.onField ? "#ff6b6b" : "#ff6b6b40"}
                stroke={p.onField ? "#fff" : "#ff6b6b"}
                strokeWidth="0.4"
              />
              <text
                x={p.x}
                y={p.y + 1}
                textAnchor="middle"
                fontSize={p.onField ? 2.8 : 2.3}
                fontWeight="700"
                fill="#fff"
                fontFamily="system-ui"
                style={{ pointerEvents: "none" }}
              >
                {p.n}
              </text>
              {p.onField && (
                <text
                  x={p.x}
                  y={p.y + 6}
                  textAnchor="middle"
                  fontSize="2.2"
                  fill="#fff"
                  fontFamily="system-ui"
                  style={{ pointerEvents: "none" }}
                >
                  {p.name}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Steg 6.2: Lägg till toolbar-CSS + arrow-mode pointer-lock i `styles.css`**

Lägg till i `.tb-*`-blocket i slutet av `styles.css`:

```css
.tb-toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid hsl(0 0% 100% / 0.12);
}
.tb-tool-btn {
  background: #2a3852;
  color: #fff;
  border: 1px solid hsl(0 0% 100% / 0.12);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.tb-tool-btn:hover {
  border-color: var(--accent);
}
.tb-tool-btn.is-active {
  background: var(--accent);
  color: #111;
  border-color: var(--accent-2);
}
.tb-svg.is-arrow-mode .tb-puck {
  pointer-events: none;
  cursor: default;
}
.tb-arrow {
  pointer-events: none;
}
.tb-arrow-preview {
  pointer-events: none;
}
```

- [ ] **Steg 6.3: Verifiera i webbläsare**

Hard-refresh, öppna lightbox.

Förväntat:
- En toolbar med två knappar: "Rita pil" och "Rensa pilar" visas ovanför planen
- Klick på "Rita pil" → knappen blir gul (is-active)
- I pil-läge: dra på tom plan → en gul pil följer musen under dragning (halvtransparent preview), vid släpp blir den solid och har en pilspets
- Flera pilar kan ritas efter varandra utan att trycka "Rita pil" igen
- I pil-läge: pucks reagerar INTE på klick — klick på en puck ritar istället en pil från puckens mitt
- Korta "klick-utan-dra"-rörelser (< 2 enheter) skapar ingen pil
- Dra som börjar i bänk-bandet (y > 100) skapar ingen pil
- Klick på "Rita pil" igen → tillbaka till move-läge, pucks fungerar att dra
- Klick på "Rensa pilar" → alla pilar försvinner (pucks rörs inte)
- Inga console-fel

---

## Task 7: "Återställ till matchplan"-knapp

**Mål:** Knapp som återkör spelar-initialiseringen (bygger om `players` från `roster` + `assignments`). Pilar ska INTE rensas (spec 7.2).

**Files:**
- Modify: `matchplan/Components.jsx` (utbyggd `TacticBoardLightbox`)

- [ ] **Steg 7.1: Lägg till "Återställ"-knapp och reset-funktion**

Inne i `TacticBoardLightbox`-funktionen, lägg till funktionen `resetPlayers` direkt efter `screenToSvg`:

```jsx
  function resetPlayers() {
    setPlayers(buildTacticPlayers(roster, assignments));
  }
```

Uppdatera sedan toolbar-JSX så den ser ut så här (lägg till Återställ som första knapp):

```jsx
        <div className="tb-toolbar">
          <button className="tb-tool-btn" onClick={resetPlayers} type="button">
            Återställ
          </button>
          <button
            className={"tb-tool-btn " + (toolMode === "arrow" ? "is-active" : "")}
            onClick={() => setToolMode(toolMode === "arrow" ? "move" : "arrow")}
            type="button"
          >
            Rita pil
          </button>
          <button
            className="tb-tool-btn"
            onClick={() => setArrows([])}
            type="button"
          >
            Rensa pilar
          </button>
        </div>
```

- [ ] **Steg 7.2: Verifiera i webbläsare**

Hard-refresh, öppna lightbox.

Förväntat:
- Toolbar har nu tre knappar: "Återställ", "Rita pil", "Rensa pilar"
- Dra några spelare runt planen. Rita några pilar.
- Klick "Återställ" → alla spelare återgår till startelvans positioner. Bänken fylls på igen.
- Pilarna finns KVAR efter återställning
- Klick "Rensa pilar" → pilarna försvinner
- Toolbar-knapparna kan användas i vilken ordning som helst
- Inga console-fel

---

## Task 8: Märkning-toggle (Nummer / Initialer / Nummer+namn)

**Mål:** Tre knappar i toolbar som växlar mellan `labelMode`-värden. Default är `"number-name"` på plan-spelare (bänk-spelare visar alltid bara nummer).

**Files:**
- Modify: `matchplan/Components.jsx` (utbyggd `TacticBoardLightbox`)

- [ ] **Steg 8.1: Lägg till `labelMode`-state och knappgrupp**

I `TacticBoardLightbox`-funktionen, lägg till state-raden direkt efter `const [arrowPreview, setArrowPreview] = useState(null);`:

```jsx
  const [labelMode, setLabelMode] = useState("number-name");
```

Uppdatera toolbar-JSX så att det ligger en "Märkning:"-grupp i slutet:

```jsx
        <div className="tb-toolbar">
          <button className="tb-tool-btn" onClick={resetPlayers} type="button">
            Återställ
          </button>
          <button
            className={"tb-tool-btn " + (toolMode === "arrow" ? "is-active" : "")}
            onClick={() => setToolMode(toolMode === "arrow" ? "move" : "arrow")}
            type="button"
          >
            Rita pil
          </button>
          <button
            className="tb-tool-btn"
            onClick={() => setArrows([])}
            type="button"
          >
            Rensa pilar
          </button>
          <span className="tb-toolbar-sep">Märkning:</span>
          <button
            className={"tb-tool-btn " + (labelMode === "number" ? "is-active" : "")}
            onClick={() => setLabelMode("number")}
            type="button"
          >
            Nummer
          </button>
          <button
            className={"tb-tool-btn " + (labelMode === "initials" ? "is-active" : "")}
            onClick={() => setLabelMode("initials")}
            type="button"
          >
            Initialer
          </button>
          <button
            className={"tb-tool-btn " + (labelMode === "number-name" ? "is-active" : "")}
            onClick={() => setLabelMode("number-name")}
            type="button"
          >
            Nummer + namn
          </button>
        </div>
```

- [ ] **Steg 8.2: Byt ut puck-rendering så den använder `labelMode`**

Ersätt `{players.map(p => (...))}`-blocket i SVG (nuvarande slutet av SVG) med följande:

```jsx
          {players.map(p => {
            const inCircle = labelMode === "initials" ? p.initials : String(p.n);
            const showNameUnder = p.onField && labelMode === "number-name";
            const inCircleFontSize = labelMode === "initials"
              ? (p.onField ? 2.4 : 2.0)
              : (p.onField ? 2.8 : 2.3);
            return (
              <g
                key={p.n}
                className="tb-puck"
                data-n={p.n}
                onPointerDown={e => onPuckPointerDown(e, p.n)}
                onPointerMove={onPuckPointerMove}
                onPointerUp={onPuckPointerUp}
                onPointerCancel={onPuckPointerUp}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.onField ? 3.2 : 2.6}
                  fill={p.onField ? "#ff6b6b" : "#ff6b6b40"}
                  stroke={p.onField ? "#fff" : "#ff6b6b"}
                  strokeWidth="0.4"
                />
                <text
                  x={p.x}
                  y={p.y + 1}
                  textAnchor="middle"
                  fontSize={inCircleFontSize}
                  fontWeight="700"
                  fill="#fff"
                  fontFamily="system-ui"
                  style={{ pointerEvents: "none" }}
                >
                  {inCircle}
                </text>
                {showNameUnder && (
                  <text
                    x={p.x}
                    y={p.y + 6}
                    textAnchor="middle"
                    fontSize="2.2"
                    fill="#fff"
                    fontFamily="system-ui"
                    style={{ pointerEvents: "none" }}
                  >
                    {p.name}
                  </text>
                )}
              </g>
            );
          })}
```

- [ ] **Steg 8.3: Lägg till `.tb-toolbar-sep`-stil i `styles.css`**

Lägg till i `.tb-*`-blocket:

```css
.tb-toolbar-sep {
  font-size: 11px;
  color: var(--fg-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-left: 6px;
  padding-left: 10px;
  border-left: 1px solid hsl(0 0% 100% / 0.12);
}
```

- [ ] **Steg 8.4: Verifiera i webbläsare**

Hard-refresh, öppna lightbox.

Förväntat:
- Toolbar har nu tre extra knappar efter en "Märkning:"-avdelare: "Nummer", "Initialer", "Nummer + namn"
- "Nummer + namn" är gulmarkerad (is-active) vid öppning (default)
- Klick "Nummer": alla plan-spelare visar bara nummer, namnen försvinner. Bänk-spelare visar nummer (som vanligt).
- Klick "Initialer": plan-cirklar visar initialer ("A" för Ali, "M" för Meisam osv). Bänk-cirklar visar initialer också.
- Klick "Nummer + namn": plan-spelare har nummer i cirkeln och namnet under. Bänk-cirklar visar bara nummer (namnet skulle ta för mycket plats enligt spec 6.5).
- Bara en knapp kan vara aktiv åt gången
- Inga console-fel

---

## Task 9: Preview-kort mini-SVG + final polish

**Mål:** Ge preview-kortet i sidopanelen en mini-SVG-plan som liknar lightboxens layout, så tränaren ser direkt vad som finns att öppna.

**Files:**
- Modify: `matchplan/Components.jsx` (uppdatera `TacticBoard`)
- Modify: `matchplan/styles.css` (lägg till `.tb-preview-svg`)

- [ ] **Steg 9.1: Uppdatera `TacticBoard`-komponenten så den renderar mini-SVG**

Ersätt hela `TacticBoard`-funktionen (den korta preview-varianten från Task 1) med:

```jsx
function TacticBoard({ onOpen }) {
  const positions = MP_DATA.formation433.positions;
  return (
    <div className="tb-preview">
      <svg className="tb-preview-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tb-preview-grass" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#266b2a" />
            <rect x="5" width="5" height="10" fill="#215e24" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#tb-preview-grass)" />
        <rect x="1" y="1" width="98" height="98" fill="none" stroke="#ffffffa0" strokeWidth="0.4" />
        <line x1="1" y1="50" x2="99" y2="50" stroke="#ffffffa0" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="8" fill="none" stroke="#ffffffa0" strokeWidth="0.3" />
        <rect x="25" y="1" width="50" height="14" fill="none" stroke="#ffffff80" strokeWidth="0.3" />
        <rect x="25" y="85" width="50" height="14" fill="none" stroke="#ffffff80" strokeWidth="0.3" />
        {positions.map((pos, i) => (
          <circle
            key={pos.id}
            cx={pos.x}
            cy={100 - pos.y}
            r="3"
            fill="#ff6b6b"
            stroke="#fff"
            strokeWidth="0.4"
          />
        ))}
      </svg>
      <button className="tb-preview-btn" onClick={onOpen} type="button">
        Öppna taktiktavla
      </button>
    </div>
  );
}
```

- [ ] **Steg 9.2: Lägg till `.tb-preview-svg`-stil i `styles.css`**

Lägg till i `.tb-*`-blocket:

```css
.tb-preview-svg {
  display: block;
  width: 100%;
  height: auto;
  max-width: 260px;
  margin: 0 auto;
  border-radius: 6px;
  overflow: hidden;
  background: #0b1220;
}
```

- [ ] **Steg 9.3: Verifiera i webbläsare**

Hard-refresh.

Förväntat:
- Preview-kortet i sidopanelen visar nu en mini-plan med röda cirklar (11 st) i 4-3-3-formation
- Planen har samma gräsmönster och linjer som lightboxen (men utan bänk-band och utan namn-etiketter)
- Under mini-planen finns "Öppna taktiktavla"-knappen
- Klick på knappen öppnar fortfarande lightboxen som tidigare
- Layouten ser snyggt packad ut utan att pucks svämmar över kanten
- Samma sak i Variant B (Matchblad) — preview-kortet visar sig i col 1
- Inga console-fel

- [ ] **Steg 9.4: Slutlig 17-punkts verifieringssvep (spec-sektion 11)**

Öppna en hard-refresh-flik och gå igenom specets hela success criteria-lista:

1. Sidopanelens `TacticBoard`-kort visar mini-plan med röda pucks och "Öppna taktiktavla"-knapp → **ja**
2. Klick på knappen öppnar fullscreen-lightbox → **ja**
3. Startelvan visas på rätt positioner (4-3-3) → **ja**
4. Reserver (roster n >= 12) visas i bänk-bandet → **ja**
5. Drag en spelare över plan → hamnar där pointer släpps → **ja**
6. Drag en spelare under y=100 → syns i bänk-bandet, onField=false → **ja**
7. Drag en bänk-spelare upp över y=100 → tillbaka på plan → **ja**
8. "Rita pil" aktiveras → pucks slutar reagera på klick; klick-dra på tom plan ritar en gul pil → **ja**
9. Flera pilar kan ritas → **ja**
10. "Rensa pilar" tar bort alla pilar → **ja**
11. Märkning-toggle växlar alla spelare mellan nummer / initialer / nummer+namn → **ja**
12. "Återställ" sätter tillbaka alla positioner men lämnar pilarna orörda → **ja**
13. ×-knapp stänger lightboxen → **ja**
14. Escape stänger lightboxen → **ja**
15. Klick utanför lightbox-innehåll stänger lightboxen → **ja**
16. Inga JS-fel i console → **ja**
17. Inga nya dependencies i `index.html` eller någon annanstans → **ja**

Om alla 17 punkter checkas av: V1 är klar.

---

## Checklista — saker att INTE göra (per CLAUDE.md)

- Inte köra git-kommandon (projektmappen är inte ett git-repo)
- Inte lägga till npm/script-tags/byggkedjor
- Inte ändra `MP_DATA`-strukturen
- Inte röra `MP_COHERENCE`-ordningen
- Inte lägga in emoji
- Inte refactor-attacka filer som inte står i "Files"-listan ovan
- Inte byta språk i copy (allt är svenska, first-person plural)
