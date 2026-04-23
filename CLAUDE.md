# Claude Code — Matchplan Lerum IS

Det här är en interaktiv matchplan byggd med React + Babel Standalone. Ingen byggkedja, ingen backend.

## Standardbeteende i detta projekt

- **Språk:** Svenska i all copy, UI och kommentarer.
- **Brand:** Matchplaner / Gunnilse IS. "Midnight Pitch" — mörk navy-bakgrund, enkel accent-guld, Inter. Se README i `matchplan/` och föräldramappens designsystem om det finns.
- **Inga emoji** i sektionsinnehåll. Undantag: ⭐ eller 📩 endast om spec tvingar.
- **Röst:** First-person plural ("vi"), deklarativt, kort. *"Vi pressar högt."* inte *"Ni ska pressa."*
- **Metaforer som återkommer:** gyllene zonen, skeden, hybridförsvar, gyllene femman (spelbarhet/avstånd/bredd/djup/övertal).

## Arkitektur

- `matchplan/index.html` — entrypoint. Laddar React, Babel, sen `data.js`, `Components.jsx`, `Sections.jsx`, `App.jsx`.
- **Ingen modulsystem.** Komponenter delas via `Object.assign(window, { ... })` i slutet av varje JSX-fil. Namnkrockar måste undvikas — ge ALLT unika namn.
- **Ingen persistens.** State återställs vid refresh (designbeslut).

## Vanliga uppgifter

- **Lägg till sektion:** skapa ny komponent i `Sections.jsx`, lägg data i `data.js`, referera i `App.jsx` på rätt ställe i båda varianterna (VariantA + VariantB).
- **Byt motståndare / tid:** ändra `MP_DATA.match` i `data.js`.
- **Byt spelare:** ändra `MP_DATA.roster` i `data.js`.
- **Byt formation:** ändra `MP_DATA.formation433.positions` — `x`/`y` är procent av planen, 0 = vår målvakts-linje.
- **Styling:** bara i `styles.css`. CSS-variabler i `:root` — ändra där om du vill byta färgspråk.

## Bygga standalone-fil

Källfilerna i `matchplan/` ska alltid vara sanningen. Standalone-HTML är en derivativ artefakt. När du ändrat source, kör motsvarigheten till `super_inline_html` för att bundla om — eller öppna `matchplan/index.html` direkt.

## Vad du INTE ska göra

- Inte lägga till nya paketberoenden / byggkedjor. Hela poängen är zero-build.
- Inte refactor till modules/imports — Babel Standalone pratar inte ES modules.
- Inte ändra `MP_COHERENCE` sektionsordning — 1–9 är matchplanens ryggrad.
- Inte introducera emoji i innehåll.
