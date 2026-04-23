# Matchplan — Gunnilse IS vs Lerum IS (borta · Aspevallen · 19:00)

Interaktiv matchplan byggd mot Matchplaner-designsystemet. Två varianter (Flöde / Matchblad) som växlas uppe i toppnavet.

## Filer

```
matchplan/
├── index.html          ← öppna i webbläsaren för att köra
├── styles.css          ← alla stilar (dark "Midnight Pitch")
├── data.js             ← trupp, formation, koherens-sektioner, press, uppbyggnad
├── Components.jsx      ← Pitch, Roster, TacticBoard, EditableText, Bullets
├── Sections.jsx        ← de 9 koherens-sektionerna + sidopaneler
└── App.jsx             ← root, VariantA (Flöde) + VariantB (Matchblad)

Matchplan - Gunnilse vs Lerum.html   ← standalone-version (en fil, offline)
```

## Köra lokalt

Enklast: öppna `Matchplan - Gunnilse vs Lerum.html` i valfri webbläsare.
Vid utveckling: servera `matchplan/` över en lokal server (t.ex. `python3 -m http.server` i mappen) — JSX-filerna laddas separat och behöver CORS.

## Stack

- **Ingen byggkedja.** React 18 + Babel Standalone laddas från unpkg, JSX transpileras i browsern.
- **Inget backend.** Allt state i React, inget persisteras (enligt spec — "ny blank varje gång").
- **Enda extern resurs:** Google Fonts (Inter). Standalone-filen funkar ändå med fallback till system-sans.

## Bygga om standalone-filen

Ändringar görs i `matchplan/*`. När du är klar, be agenten:
> "Kompilera om matchplan till standalone"

eller kör själv i Claude Code-miljö med super_inline_html-motsvarighet.

## Designsystem

Färger, typografi, komponent-språk kommer från `../` (Matchplaner Design System) — se `../README.md` för regler, `../colors_and_type.css` för tokens, `../ui_kits/web_app/` för komponentreferenser.

## Sektioner (koherens 1–9)

1. **Förutsättningar** — kontext, motståndare, tillgänglighet
2. **Identitet** — vem vi är + "om det hackar"-fallback
3. **Försvarsspel** — hög / medel / låg
4. **Omställning → anfall** — kontra eller speluppbyggnad
5. **Anfallsspel** — gyllene femman (spelbarhet, avstånd, bredd, djup, övertal)
6. **Omställning → försvar** — direkt eller indirekt
7. **Försvar mot fasta** — hybrid (zon + man)
8. **Anfall från fasta** — hörnor, frisparkar, inkast
9. **Övriga roller** — kapten, straff, hörnor, inkast

Plus sidopaneler: startelva (drag & släpp 4-3-3), trupp (16), taktiktavla (pucks), matchmål, press-triggers, speluppbyggnad.
