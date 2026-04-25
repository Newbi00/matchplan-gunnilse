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
