/* Data — trupp, formation, koherens */
window.MP_DATA = {
  match: {
    opponent: "Lerum IS",
    venue: "Aspevallen",
    home: false,
    kickoff: "I morgon · 19:00",
    competition: "Seriematch",
  },
  formation433: {
    // normerad 0–100 på grön plan (x=bredd, y=djup, 0 = vår MV)
    positions: [
      { id: "gk", label: "MV", x: 50, y: 8 },
      { id: "lb", label: "VB", x: 15, y: 28 },
      { id: "lcb", label: "VMB", x: 37, y: 22 },
      { id: "rcb", label: "HMB", x: 63, y: 22 },
      { id: "rb", label: "HB", x: 85, y: 28 },
      { id: "dm", label: "CM-6", x: 50, y: 45 },
      { id: "lcm", label: "CM-8", x: 32, y: 55 },
      { id: "rcm", label: "CM-10", x: 68, y: 55 },
      { id: "lw", label: "VY", x: 15, y: 78 },
      { id: "st", label: "FW", x: 50, y: 82 },
      { id: "rw", label: "HY", x: 85, y: 78 },
    ],
    // Default-startelva — tidig på vänstersida (Galvan CM-8 + Benji VY + Rayan VB).
    // Haris på HY för straff/hörnor H. Ado kapten som HMB. Ali MV.
    startingXI: {
      gk: 1,    // Ali
      lb: 5,    // Rayan
      lcb: 3,   // Sabarr
      rcb: 4,   // Ado (kapten)
      rb: 2,    // Daniel
      dm: 6,    // Ahmed (CM-6)
      lcm: 8,   // Galvan (CM-8, vänsterfotad — tar hörnor V)
      rcm: 10,  // Yosef (CM-10)
      lw: 7,    // Benji (VY)
      st: 9,    // Leo (FW)
      rw: 11,   // Haris (HY — straff, hörnor H)
    },
  },
  roster: [
    { n: 1, name: "Ali", role: "MV" },
    { n: 2, name: "Daniel", role: "B" },
    { n: 3, name: "Sabarr", role: "MB" },
    { n: 4, name: "Ado", role: "MB" },
    { n: 5, name: "Rayan", role: "B" },
    { n: 6, name: "Ahmed", role: "CM" },
    { n: 7, name: "Benji", role: "Y" },
    { n: 8, name: "Galvan", role: "CM" },
    { n: 9, name: "Leo", role: "FW" },
    { n: 10, name: "Yosef", role: "CM" },
    { n: 11, name: "Haris", role: "Y" },
    { n: 12, name: "Meisam", role: "MV" },
    { n: 13, name: "Pascal", role: "MB" },
    { n: 14, name: "Måns", role: "CM" },
    { n: 15, name: "Aldin", role: "Y" },
    { n: 16, name: "Maric", role: "FW" },
  ],
  matchmal: [
    "Duellspel.",
    "Avstånd mellan linjerna.",
    "Vi vill inte ha Lerum i oss!",
  ],
};

/* Koherens-sektioner (redigerbara) */
window.MP_COHERENCE = [
  {
    id: "forutsattningar",
    num: "01",
    title: "Förutsättningar",
    eyebrow: "Kontext",
    bullets: [
      "Bra trupp. Svår bortamatch.",
      "Lerum har kommit längre i sin resa — vi är underdogs.",
      "Gör en bra insats. Utgången blir vad den blir.",
    ],
  },
  {
    id: "identitet",
    num: "02",
    title: "Identitet — och varför",
    eyebrow: "Vem vi är",
    subtitle: "Första 15 sätter tonen. Om det hackar: gå tillbaka hit.",
    principles: ["Duellspel", "Andrabollsspel", "Springa i djupled"],
    bullets: [
      "Vi pressar högt och jagar åt samma håll.",
      "Vi försvarar gyllene zonen — inget skott från mitten.",
      "Vi spelar framåt så fort det är på — annars rör vi bollen tills det är på.",
    ],
    fallback: "Om det hackar: förenkla. Korta passningar. Vinn andrabollar. Bekväm press i mellanblock tills rytmen är tillbaka.",
  },
  {
    id: "forsvar",
    num: "03",
    title: "Försvarsspel",
    eyebrow: "När de har bollen",
    principles: ["Tre korridorer", "Splitta planen", "Aldrig på insidan", "Aldrig i oss"],
    bullets: [
      "Hög press på målvaktens utspel — FW stänger lång bana, Y:na på backarna.",
      "Mellanblock om de tar sig förbi — kompakt, jaga åt samma håll.",
      "Lågt block i box: hybridförsvar. Zon i boxen + två strikt man.",
    ],
  },
  {
    id: "omst-anfall",
    num: "04",
    title: "Omställning → anfall",
    eyebrow: "Vi vinner bollen",
    principles: ["Kontra först", "Annars uppbyggnad", "Fyra alternativ"],
  },
  {
    id: "anfall",
    num: "05",
    title: "Anfallsspel — den gyllene femman",
    eyebrow: "Vi har bollen",
    principles: ["Säkra kontringsläge", "Spela in", "Krossa ut", "Spring framåt", "Fyll på boxen"],
    fivePoints: [
      { k: "Spelbarhet", v: "Erbjud alltid fyra riktningar. Ingen får bli isolerad." },
      { k: "Avstånd", v: "8–12 meter mellan närmaste två. Inte för nära, inte för långt." },
      { k: "Bredd", v: "Yttre CB eller Y håller bredden — alltid någon på kanten." },
      { k: "Djup", v: "FW hotar bakom backlinjen. Ingen backlinje i fred." },
      { k: "Övertal", v: "I gyllene zonen — fem mot fyra, eller vi väntar." },
    ],
  },
  {
    id: "omst-forsvar",
    num: "06",
    title: "Omställning → försvar",
    eyebrow: "Vi tappar bollen",
    principles: ["Direkt bollåtererövring", "Indirekt bollåtererövring"],
  },
  {
    id: "fasta-forsvar",
    num: "07",
    title: "Försvar mot fasta",
    eyebrow: "Deras hörna / frispark",
    principles: ["Fyra zoner", "Övriga markering", "Diagonal utgång vid kontring"],
    note: "Adnan går igenom inför matchen. Frågor välkomna innan.",
  },
  {
    id: "fasta-anfall",
    num: "08",
    title: "Anfall från fasta",
    eyebrow: "Vår hörna / frispark",
    note: "Adnan går igenom inför matchen. Frågor välkomna innan.",
  },
  {
    id: "ovrigt",
    num: "09",
    title: "Övriga roller",
    eyebrow: "Roller & ansvar",
    roles: [
      { k: "Kapten", v: "Ado" },
      { k: "Straff", v: "Haris" },
      { k: "Frispark — inlägg", v: "Galvan" },
      { k: "Hörnor vänster", v: "Galvan" },
      { k: "Hörnor höger", v: "Haris" },
    ],
  },
];

/* Press-triggers (egna kort) */
window.MP_PRESS = [
  { trigger: "Deras vänsterback har bollen", action: "HY pressar direkt, CM-10 dubblar, VY stänger spelvänd. Vaksam — de vill anfalla på sin högerkant med ojämn symmetri." },
];

/* Speluppbyggnad */
window.MP_UPPBYGGNAD = [
  { phase: "1", who: "Skapa säkerhet", what: "Hindra deras kontringsspel." },
  { phase: "2", who: "Spela in centralt", what: "Centrera dem — flytta ur yttre korridorer." },
  { phase: "3", who: "Spelvänd", what: "Ut till yttre korridor." },
  { phase: "4", who: "Spring framåt", what: "Överlappande ytterbackar." },
  { phase: "5", who: "Fyll på boxen", what: "Spelare i straffområdet." },
];

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
};

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
