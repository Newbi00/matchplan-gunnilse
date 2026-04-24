// Matchplan — React components
const { useState, useRef, useEffect } = React;

/* ---------- Shared helpers ---------- */
function Eyebrow({ children, mono }) {
  return <div className={mono ? "eyebrow-mono" : "eyebrow"}>{children}</div>;
}

function EditableLine({ value, onChange, placeholder, small }) {
  return (
    <input
      className={"ed " + (small ? "ed-small" : "")}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  );
}

function EditableText({ value, onChange, placeholder }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  }, [value]);
  return (
    <textarea
      ref={ref}
      className="ed-ta"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  );
}

/* ---------- Principles (read-only pill chips) ---------- */
function Principles({ items }) {
  if (!items || !items.length) return null;
  return (
    <div className="principles-row">
      {items.map((p, i) => (
        <span key={i} className="principle-chip">{p}</span>
      ))}
    </div>
  );
}

/* ---------- Bullets list ---------- */
function Bullets({ items, onChange }) {
  const add = () => onChange([...items, ""]);
  const edit = (i, v) => onChange(items.map((it, idx) => idx === i ? v : it));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="bullets">
      {items.map((it, i) => (
        <div key={i} className="bullet-row">
          <div className="dot" />
          <EditableText value={it} onChange={v => edit(i, v)} placeholder="Lägg till rad..." />
          <button className="x" onClick={() => remove(i)} title="Ta bort">✕</button>
        </div>
      ))}
      <div className="add-row" onClick={add}>
        <span className="plus">+</span> Lägg till rad
      </div>
    </div>
  );
}

/* ---------- Pitch with drag-drop slots ---------- */
function Pitch({ assignments, onAssign, onClear, roster }) {
  const [dragOver, setDragOver] = useState(null);
  return (
    <div className="pitch">
      <div className="gold-zone" />
      <div className="line halfway" />
      <div className="circle" />
      <div className="box-top" />
      <div className="box-bot" />
      {MP_DATA.formation433.positions.map(pos => {
        const num = assignments[pos.id];
        const player = roster.find(p => p.n === num);
        const isOver = dragOver === pos.id;
        const empty = !num;
        return (
          <div
            key={pos.id}
            className={"slot " + (empty ? "empty " : "") + (isOver ? "is-drag-over" : "")}
            style={{ left: `${pos.x}%`, top: `${100 - pos.y}%` }}
            onDragOver={e => { e.preventDefault(); setDragOver(pos.id); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={e => {
              e.preventDefault();
              const n = parseInt(e.dataTransfer.getData("text/plain"), 10);
              if (!isNaN(n)) onAssign(pos.id, n);
              setDragOver(null);
            }}
            onClick={() => { if (num) onClear(pos.id); }}
            title={player ? `Klicka för att ta bort ${player.name}` : "Dra spelare hit"}
          >
            <div className="num">{num || pos.label}</div>
            <div className="lbl">{pos.label}</div>
            {player && <div className="name">{player.name}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Roster (draggable chips) ---------- */
function Roster({ roster, setRoster, used }) {
  return (
    <div>
      <div className="roster-head">
        <h3>Trupp (16)</h3>
        <span className="hint">Dra till planen →</span>
      </div>
      <div className="roster">
        {roster.map((p, i) => (
          <div
            key={p.n}
            className={"rchip " + (used.has(p.n) ? "is-used" : "")}
            draggable
            onDragStart={e => e.dataTransfer.setData("text/plain", String(p.n))}
          >
            <div className="n">{p.n}</div>
            <input
              className="nm"
              value={p.name}
              onChange={e => setRoster(roster.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
            />
            <div className="rl">{p.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

/* ---------- Tactic board lightbox (fullscreen) ---------- */
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

  function resetPlayers() {
    setPlayers(buildTacticPlayers(roster, assignments));
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

Object.assign(window, { Eyebrow, EditableLine, EditableText, Principles, Bullets, Pitch, Roster, TacticBoard, TacticBoardLightbox, SituationSVG, SituationPitch, SituationThumbs, SituationLightbox, SituationBench });
