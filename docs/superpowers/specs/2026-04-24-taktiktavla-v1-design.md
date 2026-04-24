# Taktiktavla V1 — Designspec

**Datum:** 2026-04-24
**Projekt:** `matchplan-for-claude-code`
**Scope:** V1 (MVP). V2 och V3 beskrivs kort i slutet men är inte i scope för denna spec.

---

## 1. Syfte

Interaktiv taktiktavla integrerad i matchplan-projektet. Tränaren öppnar en fullscreen-lightbox från sidopanelen, drar spelare fritt över plan och bänk, ritar gula pilar för att visa rörelse, växlar mellan tre märknings-lägen, och återställer till matchplanens startelva med ett klick.

V1 byter ut nuvarande tomma `TacticBoard`-platshållare i sidopanelen mot en fungerande preview + fullscreen-vy.

## 2. Bakgrund och motivering

Två källor ligger till grund:

1. **`C:\Scripts\fotboll\Mina interaktiva kartor\Interaktiv_Taktik_Tavla.html`** (2314 rader, vanilla JS) — tränarens befintliga taktiktavla. Har mycket funktionalitet (12 formationer, 5 ritverktyg, 5 lager, 10-frame timeline) men använder egen spelarlista och är inte integrerad med matchplanen.
2. **`pespila/Soccer-Tactics`** (Python + Streamlit + Canvas) — referens med prydlig arkitektur men färre features.

Beslut: bygg in taktiktavlan i matchplan-projektet istället för att fortsätta utveckla den externa HTML:en eller byta stack. Detta ger en sanningskälla för roster/startelva, matchar existerande arkitektur (zero-build React + Babel Standalone), och återanvänder det `SituationLightbox`-mönster som redan finns.

## 3. V1-scope (ingår)

- Fullscreen-lightbox som öppnas från ett preview-kort i sidopanelen
- Läser startelva och bänk från matchplanens `MP_DATA.roster`, `MP_DATA.formation433` och App-statens `assignments`
- Drag-drop av spelare mellan plan och bänk (pointer events, funkar mus + grundläggande touch)
- Ett ritverktyg: gul pil med pilspets
- "Återställ till matchplan"-knapp
- "Rensa pilar"-knapp
- Märkning-toggle: `Nummer` / `Initialer` / `Nummer + namn`
- Stängs med ×, Escape, eller klick utanför lightbox-innehållet
- All state försvinner vid stängning (ingen persistens)

## 4. V1 ingår INTE

- Motståndarlag (blåa pucks)
- Fler ritverktyg (frihand, kurvor, vågor, text)
- Lager (gyllene zon, korridorer, spelytor, straffzoner)
- Formation-byte (låst till 4-3-3)
- Timeline/frames, "spela upp som film"
- JSON save/load
- PNG-export
- Undo/redo
- Koppling pil ↔ spelare (pil som följer med när spelare flyttas)
- Mobil-polering (touch fungerar men layout är inte optimerad för små skärmar)

Dessa är V2 eller V3 och täcks av egna specar senare.

## 5. Arkitektur

### 5.1 Filer som ändras

| Fil | Ändring |
|---|---|
| `matchplan/Components.jsx` | Uppdatera befintlig `TacticBoard` till preview-kort. Lägg till ny `TacticBoardLightbox`. |
| `matchplan/App.jsx` | Lägg till `tacticBoardOpen` state. Skicka `onOpen`-prop till `TacticBoard`. Rendera `TacticBoardLightbox`. |
| `matchplan/styles.css` | Lägg till `.tb-*`-klasser. |

### 5.2 Filer som INTE ändras

| Fil | Kommentar |
|---|---|
| `matchplan/data.js` | V1 läser från befintlig struktur. Ingen ny data. |
| `matchplan/Sections.jsx` | Taktiktavlan bor i sidopanelen, inte som sektion. |
| `matchplan/index.html` | Inga nya script-tags. |

### 5.3 Nya komponenter

**`TacticBoard` (uppdaterad — preview-kort):**
- Props: `onOpen: () => void`, `roster: Player[]`, `assignments: { [positionId]: number }`
- Renderar mini-SVG (viewBox 0 0 100 118) med röda pucks på default-positioner och "Öppna taktiktavla"-knapp
- Exponeras via befintlig `Object.assign(window, { ..., TacticBoard })`

**`TacticBoardLightbox` (ny — fullscreen):**
- Props: `open: boolean`, `onClose: () => void`, `roster: Player[]`, `assignments: { [positionId]: number }`
- Om `open === false`: returnerar null
- Hanterar all drag/pil/märkning-logik lokalt
- Exponeras via `Object.assign(window, { ..., TacticBoardLightbox })`

**Namnunika enligt CLAUDE.md:** `TacticBoardLightbox` är nytt och kolliderar inte med befintliga namn.

### 5.4 State-placering

| State | Var | Kommentar |
|---|---|---|
| `tacticBoardOpen: boolean` | `App.jsx` | Samma pattern som `activeSituation`. |
| `players: PlayerOnBoard[]` | Lokalt i `TacticBoardLightbox` | Byggs vid öppning, försvinner vid stängning. |
| `arrows: Arrow[]` | Lokalt i `TacticBoardLightbox` | Som ovan. |
| `toolMode: "move" \| "arrow"` | Lokalt | Default `"move"`. |
| `labelMode: "number" \| "initials" \| "number-name"` | Lokalt | Default `"number-name"` på plan, `"number"` på bänk (se 6.3). |
| `dragState` | Lokalt (ref eller state) | Aktiv puck, offset, preview-pil. |

## 6. SVG-layout

### 6.1 Koordinatsystem

- `<svg viewBox="0 0 100 118" preserveAspectRatio="xMidYMid meet">`
- **Plan:** y = 0–100. y = 0 är motståndarmålet (uppe i SVG), y = 100 är vårt mål (nere i SVG). Vi attackerar uppåt visuellt.
- **Bänk-band:** y = 100–118. Guld-linje vid y = 100 som avdelare. Etikett "BÄNK" vid y ≈ 106, x = 3.

**Koordinat-konvertering från `MP_DATA.formation433`:** MP_DATA använder omvänd konvention (kommentar i `data.js`: "0 = vår MV"). Befintlig `Pitch`-komponent flippar via CSS: `top: ${100 - pos.y}%`. Taktiktavlan gör samma sak en gång vid initialisering och arbetar sen i SVG-koordinater direkt: `svgY = 100 - dataY`. Exempel: GK med `data.y = 8` → `svgY = 92` (nedtill). Alla drag/bänk-regler nedan använder SVG-koordinaterna.

### 6.2 Planritning

- Bakgrund: samma "green striped" pattern som befintlig `SituationPitch` (`#266b2a` med `#215e24`-ränder var 5:e enhet)
- Ytterlinje: rect 1,1,98,98 `stroke="#ffffffa0" stroke-width="0.4"`
- Mittlinje: y = 50, stroke 0.3
- Mittcirkel: cx=50, cy=50, r=8
- Straffområde uppe: rect 25,1,50,14
- Straffområde nere: rect 25,85,50,14

### 6.3 Spelare

**På plan:**
- `<circle cx={x} cy={y} r="3.2" fill="#ff6b6b" stroke="#fff" stroke-width="0.4" />`
- `<text>` med nummer (font-size 2.8, font-weight 700, fill=#fff, text-anchor middle)
- `<text>` med märkning enligt `labelMode` (se 6.5)

**På bänk:**
- `<circle cx={x} cy={110} r="2.6" fill="#ff6b6b40" stroke="#ff6b6b" stroke-width="0.4" />`
- Nummer inuti cirkeln

Bänk-cirklar fördelas jämnt på y=110 med x mellan 18 och 82 beroende på hur många som är bänkade.

### 6.4 Pilar

- `<line x1 y1 x2 y2 stroke="#eac54f" stroke-width="0.8" marker-end="url(#tb-arrowhead)" stroke-linecap="round" />`
- Marker-definition: `<marker id="tb-arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#eac54f"/></marker>`
- Pil under drag: stroke-width 0.6, opacity 0.6 (preview-style)
- Pilar ritas i ett SVG-lager ovan plan-bakgrund men under pucks.

### 6.5 Märkning (labelMode)

Tre lägen:

| Läge | På plan | På bänk |
|---|---|---|
| `"number"` | Bara nummer i cirkeln | Bara nummer |
| `"initials"` | Initialer i cirkeln | Initialer |
| `"number-name"` | Nummer i cirkeln + namn under | Bara nummer (namn tar för mycket plats) |

**Default vid öppning:** `"number-name"`.

**Initialer genereras automatiskt** vid initialisering: ta första bokstaven i första ordet av `player.name`, plus första bokstaven i andra ordet om det finns. "Lova Eriksson" → "LE". "Tilda" → "T".

## 7. Data flow

### 7.1 Initialisering (vid `open` blir `true`)

Hjälpfunktion: `toSvgY(dataY) = 100 - dataY`.

1. Läs `roster` från prop (array av `{ n, name, role }` enligt `data.js`).
2. Läs `assignments` från prop (objekt `{ [positionId]: number }`).
3. Bygg `players`-arrayen:
   - För varje `(positionId, playerNumber)` i `assignments`: hitta `pos` i `MP_DATA.formation433.positions` med matchande `id`, hitta `player` i `roster` med `n === playerNumber`. Lägg till `{ n, name, initials, x: pos.x, y: toSvgY(pos.y), onField: true }`.
   - Om `assignments` saknar en eller flera positioner: fyll dem i positions-arrayens ordning med nästa roster-spelare som ännu inte använts. (Positions-ordning idag: GK, VB, VMB, HMB, HB, CM-6, CM-8, CM-10, VY, FW, HY.)
   - Övriga roster-spelare (inte på plan): `onField = false`, fördelas på bänk (se steg 4).
4. Bänk-layout: bänk-slots är fasta på y = 110, x = 22, 32, 42, 52, 62, 72, 82 (max 7 reserver får plats komfortabelt). Tilldela första lediga slot till varje bänkad spelare i roster-ordning. Om fler än 7 reserver — acceptera överlapp i V1.
5. Generera `initials` för varje spelare en gång: första bokstaven i första ord av `name`, plus första bokstaven i andra ord om det finns. Exempel: "Ahmed" → "A", "Lova Eriksson" → "LE".

**Fallback — tom `assignments`:** Tilldela roster-spelare 1–11 i roster-ordning till positions-arrayens ordning (GK får första roster-spelaren, VB får andra, osv). Roster 12+ → bänk.

### 7.2 Återställ-knappen

Kör om initialiseringen (7.1). Pilar rörs inte.

### 7.3 Vid stängning

`onClose()` → App sätter `tacticBoardOpen = false`. Nästa öppning initialiserar på nytt.

## 8. Interaktioner

### 8.1 Drag spelare (`toolMode === "move"`)

- `onPointerDown` på `<g class="tb-puck">`:
  - `event.target.setPointerCapture(event.pointerId)` — låser pointer till elementet
  - Lagra offset: `{ dx = pointerSVG.x - puck.x, dy = pointerSVG.y - puck.y }`
  - Markera puck som aktiv
- `onPointerMove` (på samma element):
  - Konvertera `clientX/Y` till SVG-koordinater via `svg.getScreenCTM().inverse()`
  - Uppdatera puck.x = pointer.x - dx, puck.y = pointer.y - dy
  - Clamp: x in [2, 98], y in [2, 116]
- `onPointerUp`:
  - Om puck.y > 100 → `onField = false` och omfördela x till bänk-layout (nästa lediga x-slot)
  - Om puck var `onField = false` och puck.y < 100 → `onField = true`
  - Släpp pointer capture
  - Nollställ aktiv puck

### 8.2 Rita pil (`toolMode === "arrow"`)

- SVG-elementet får klassen `is-arrow-mode` när `toolMode === "arrow"`. CSS (se sektion 10) sätter `.tb-svg.is-arrow-mode .tb-puck { pointer-events: none; cursor: default; }` så pointer-events går igenom till bakgrunden och drag på pucks är avstängt.
- `onPointerDown` på SVG-bakgrunden (eller pucks som nu är transparent för events):
  - Konvertera `clientX/Y` → SVG-koord
  - Starta preview-pil: `{ x1, y1, x2: x1, y2: y1 }`
  - Ignorera om y > 100 (ingen pil-ritning i bänk-bandet)
- `onPointerMove`:
  - Uppdatera preview-pilens x2, y2
  - Clamp x till [2, 98], y till [2, 98] (pilar stannar inom plan)
- `onPointerUp`:
  - Längd = `Math.hypot(x2-x1, y2-y1)`
  - Om längd >= 2: lägg till i `arrows`
  - Annars: ignorera (klick, inte drag)
  - Nollställ preview

### 8.3 Toolbar

| Knapp | Effekt |
|---|---|
| `Återställ` | Kör 7.1 på nytt. Pilar rörs inte. |
| `Rita pil` (toggle) | `toolMode` växlar mellan `"move"` och `"arrow"`. Visar `.is-active` när `"arrow"`. |
| `Rensa pilar` | `arrows = []` |
| `Märkning` (dropdown / knappgrupp) | Sätter `labelMode` till ett av tre värden. |
| `×` | `onClose()` |

### 8.4 Stängning

- Klick på `.tb-lightbox-close` → `onClose()`
- `keydown` Escape (på window, medan `open === true`) → `onClose()`
- Klick på `.tb-lightbox` men inte på `.tb-lightbox-inner` → `onClose()`

## 9. Edge cases

| Fall | Hantering |
|---|---|
| Tom `assignments` | Spelare 1–11 enligt `MP_DATA.formation433.positions`-ordning. |
| Puck dras ovanpå annan puck | Överlappar. Ingen auto-swap i V1. |
| Pil med längd < 2 enheter | Ignoreras (räknas som klick). |
| `svg.getScreenCTM()` returnerar null | Fallback: beräkna via `svg.getBoundingClientRect()` och skala manuellt med viewBox-dimensionerna. |
| Puck släpps exakt på y=100 | Räknas som `onField = true` (gränsen räknas till planen). |
| Spelarnummer >11 i `assignments` | Den ska ändå visas på plan där assignments pekar; övriga bänkas. |
| Samma nummer flera gånger i `assignments` | Antas inte hända — App-logiken förhindrar det i nuvarande `assign`-funktion. |

## 10. Styling (`styles.css`)

Nya klasser:

```css
.tb-lightbox { position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; }
.tb-lightbox-inner { background:#0b1220; border:2px solid #eac54f; border-radius:12px; max-width:1200px; width:100%; max-height:95vh; padding:20px; overflow:auto; position:relative; }
.tb-lightbox-close { position:absolute; top:12px; right:14px; background:transparent; border:1px solid #ffffff40; color:#fff; font-size:20px; width:32px; height:32px; border-radius:4px; cursor:pointer; }
.tb-toolbar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid #ffffff20; }
.tb-tool-btn { background:#2a3852; color:#fff; border:1px solid #ffffff20; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; }
.tb-tool-btn.is-active { background:#eac54f; color:#111; border-color:#ffca68; }
.tb-svg { width:100%; height:auto; display:block; touch-action:none; user-select:none; }
.tb-puck { cursor:grab; }
.tb-puck.is-dragging { cursor:grabbing; }
.tb-svg.is-arrow-mode .tb-puck { pointer-events:none; cursor:default; }
.tb-arrow { pointer-events:none; }
.tb-arrow-preview { pointer-events:none; opacity:0.6; }
.tb-preview { display:flex; flex-direction:column; gap:8px; }
.tb-preview-btn { background:#eac54f; color:#111; font-weight:700; padding:8px 12px; border-radius:6px; border:none; cursor:pointer; }
```

Färg-referenser följer matchplanens "Midnight Pitch"-palett: bakgrund `#0b1220`, accent-guld `#eac54f`, hemma-röd `#ff6b6b`.

## 11. Success criteria (manuell verifiering i Chrome)

Efter hård-refresh på `http://localhost:7788`:

1. Sidopanelens `TacticBoard`-kort visar mini-plan med röda pucks och "Öppna taktiktavla"-knapp.
2. Klick på knappen öppnar fullscreen-lightbox.
3. Startelvan visas på rätt positioner (4-3-3).
4. Reserver (roster n >= 12) visas i bänk-bandet.
5. Drag en spelare över plan → hamnar där pointer släpps.
6. Drag en spelare under y=100 → syns i bänk-bandet, onField=false.
7. Drag en bänk-spelare upp över y=100 → tillbaka på plan.
8. "Rita pil" aktiveras → pucks slutar reagera på klick; klick-dra på tom plan ritar en gul pil.
9. Flera pilar kan ritas.
10. "Rensa pilar" tar bort alla pilar.
11. Märkning-toggle växlar alla spelare mellan nummer / initialer / nummer+namn.
12. "Återställ" sätter tillbaka alla positioner men lämnar pilarna orörda.
13. ×-knapp stänger lightboxen.
14. Escape stänger lightboxen.
15. Klick utanför lightbox-innehåll stänger lightboxen.
16. Inga JS-fel i console.
17. Inga nya dependencies i `index.html` eller någon annanstans.

## 12. CLAUDE.md-efterlevnad

- Svenska i UI-copy och kommentarer
- Inga emoji
- First-person plural där copy används
- Zero-build, inga nya paket
- Komponenter exponeras via `Object.assign(window, { ... })`
- `TacticBoardLightbox` är ett unikt namn
- `MP_COHERENCE`-ordning rörs inte
- Ingen ändring i `MP_DATA`-strukturen

## 13. Framtida versioner (ej i scope för V1)

### V2 — fördjupning
- Motståndarlag (blåa pucks)
- Fler ritverktyg: frihand, kurva, text-etikett
- Lager som går att toggla: gyllene zon, korridorer, spelytor, straffzoner
- Formation-byte (12 formationer som i `Interaktiv_Taktik_Tavla.html`)
- Undo/redo

### V3 — polering och persistens
- Timeline med frames (snapshot + spela upp som film)
- Save/load JSON per taktik
- PNG-export (SVG → canvas → dataURL, eller html2canvas)
- Mobil touch-polering + responsiv layout
- Koppla pil till spelare (följer med vid flytt)

Varje version får egen spec + plan innan implementation.
