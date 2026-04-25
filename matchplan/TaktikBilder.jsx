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
function TaktikLightbox() { return null; }

Object.assign(window, {
  ZonerBox, Korridorer, Spelytor,
  TaktikHalv, TaktikBilderThumbs, TaktikLightbox,
});
