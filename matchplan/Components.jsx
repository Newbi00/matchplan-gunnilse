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

/* ---------- Tactic board with draggable pucks ---------- */
function TacticBoard() {
  const initial = [
    ...[1,2,3,4,5,6,7,8,9,10,11].map((n, i) => ({
      id: "u"+n, kind: "us", label: n,
      x: 15 + (i % 4) * 8, y: 20 + Math.floor(i / 4) * 20
    })),
    ...[1,2,3,4,5,6,7,8,9,10,11].map((n, i) => ({
      id: "t"+n, kind: "them", label: n,
      x: 60 + (i % 4) * 8, y: 20 + Math.floor(i / 4) * 20
    })),
    { id: "ball", kind: "ball", label: "", x: 50, y: 50 },
  ];
  const [pucks, setPucks] = useState(initial);
  const boardRef = useRef(null);

  const startDrag = (e, id) => {
    e.preventDefault();
    const board = boardRef.current.getBoundingClientRect();
    const move = (ev) => {
      const cx = (ev.touches ? ev.touches[0].clientX : ev.clientX);
      const cy = (ev.touches ? ev.touches[0].clientY : ev.clientY);
      const x = Math.max(2, Math.min(98, ((cx - board.left) / board.width) * 100));
      const y = Math.max(2, Math.min(98, ((cy - board.top) / board.height) * 100));
      setPucks(ps => ps.map(p => p.id === id ? { ...p, x, y } : p));
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", up);
  };

  return (
    <div>
      <div className="board" ref={boardRef}>
        <div className="bline bmid" />
        <div className="bcircle" />
        <div className="bbox-l" />
        <div className="bbox-r" />
        {pucks.map(p => (
          <div
            key={p.id}
            className={"puck " + p.kind}
            style={{ left: p.x + "%", top: p.y + "%" }}
            onMouseDown={e => startDrag(e, p.id)}
            onTouchStart={e => startDrag(e, p.id)}
          >
            {p.label}
          </div>
        ))}
      </div>
      <div className="board-tools">
        <button onClick={() => setPucks(initial)}>Återställ</button>
        <span className="muted" style={{alignSelf:"center", fontSize:11}}>Dra pjäser för att rita upp spelet</span>
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

Object.assign(window, { Eyebrow, EditableLine, EditableText, Principles, Bullets, Pitch, Roster, TacticBoard, SituationSVG, SituationPitch, SituationThumbs, SituationLightbox, SituationBench });
