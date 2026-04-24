// Matchplan — main App (Variant A: Flow, Variant B: Grid)
const { useState: useStateA, useMemo } = React;

function App() {
  const [variant, setVariant] = useStateA("A");

  // State for editable bits
  const [roster, setRoster] = useStateA(MP_DATA.roster);
  const [assignments, setAssignments] = useStateA(MP_DATA.formation433.startingXI || {}); // pos.id -> player.n

  const [matchmal, setMatchmal] = useStateA(MP_DATA.matchmal);
  const [forutsattningar, setForutsattningar] = useStateA(MP_COHERENCE[0].bullets);
  const [roles, setRoles] = useStateA(MP_COHERENCE[8].roles);
  const [press, setPress] = useStateA(MP_PRESS);
  const [uppbyggnad, setUppbyggnad] = useStateA(MP_UPPBYGGNAD);
  const [activeSituation, setActiveSituation] = useStateA(null);
  const [tacticBoardOpen, setTacticBoardOpen] = useStateA(false);

  const used = useMemo(() => new Set(Object.values(assignments)), [assignments]);
  const assign = (posId, num) => setAssignments(prev => {
    // remove num from any other pos first
    const next = {};
    for (const [k, v] of Object.entries(prev)) if (v !== num) next[k] = v;
    next[posId] = num;
    return next;
  });
  const clear = (posId) => setAssignments(prev => {
    const next = { ...prev }; delete next[posId]; return next;
  });

  const m = MP_DATA.match;

  return (
    <>
      <div className="app-bg" aria-hidden="true" />
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-badge">G</div>
            <div className="brand-name">Matchplaner<span className="yr">2026</span></div>
          </div>
          <div className="match-meta">
            <div>
              <div className="vs">{m.home ? "Hemma" : "Borta"} · Matchplan</div>
              <h1>Gunnilse IS <span className="muted" style={{fontWeight:500}}>vs</span> <span className="opp">{m.opponent}</span></h1>
              <div className="dots">
                <span>{m.kickoff}</span>
                <span>{m.venue}</span>
                <span>4-3-3</span>
              </div>
            </div>
          </div>
          <div className="variant-toggle">
            <button className={variant === "A" ? "is-active" : ""} onClick={() => setVariant("A")}>Flöde</button>
            <button className={variant === "B" ? "is-active" : ""} onClick={() => setVariant("B")}>Matchblad</button>
          </div>
        </div>
      </header>

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
    </>
  );
}

function VariantA(p) {
  return (
    <div className="flow">
      <div className="flow-main">
        <SecForutsattningar state={p.forutsattningar} set={p.setForutsattningar} onOpen={p.onOpen} roster={p.roster} />
        <SecIdentitet onOpen={p.onOpen} roster={p.roster} />
        <SecForsvar onOpen={p.onOpen} roster={p.roster} />
        <SecOmstAnfall onOpen={p.onOpen} roster={p.roster} />
        <SecAnfall onOpen={p.onOpen} roster={p.roster} />
        <SecOmstForsvar onOpen={p.onOpen} roster={p.roster} />
        <SecFastaForsvar onOpen={p.onOpen} roster={p.roster} />
        <SecFastaAnfall onOpen={p.onOpen} roster={p.roster} />
        <SecOvrigt state={p.roles} set={p.setRoles} onOpen={p.onOpen} roster={p.roster} />
      </div>
      <aside className="flow-side">
        <div className="card">
          <div className="card-head"><span className="num">XI</span><span className="lbl">Startelva — 4-3-3</span></div>
          <div className="card-body">
            <Pitch assignments={p.assignments} onAssign={p.assign} onClear={p.clear} roster={p.roster} />
            <div className="hint-inline">Dra spelare från truppen → klicka på en cirkel för att ta bort.</div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><span className="num">TAK</span><span className="lbl">Taktiktavla</span></div>
          <div className="card-body"><TacticBoard onOpen={p.onOpenTacticBoard} /></div>
        </div>
        <div className="card">
          <div className="card-body"><Roster roster={p.roster} setRoster={p.setRoster} used={p.used} /></div>
        </div>
        <MatchmalPanel state={p.matchmal} set={p.setMatchmal} />
        <PressPanel state={p.press} set={p.setPress} />
        <UppbyggnadPanel state={p.uppbyggnad} set={p.setUppbyggnad} />
      </aside>
    </div>
  );
}

function VariantB(p) {
  return (
    <div className="grid-b">
      <div className="col">
        <div className="card">
          <div className="card-head"><span className="num">XI</span><span className="lbl">Startelva — 4-3-3</span></div>
          <div className="card-body">
            <Pitch assignments={p.assignments} onAssign={p.assign} onClear={p.clear} roster={p.roster} />
          </div>
        </div>
        <div className="card">
          <div className="card-head"><span className="num">TAK</span><span className="lbl">Taktiktavla</span></div>
          <div className="card-body"><TacticBoard onOpen={p.onOpenTacticBoard} /></div>
        </div>
        <div className="card">
          <div className="card-body"><Roster roster={p.roster} setRoster={p.setRoster} used={p.used} /></div>
        </div>
      </div>
      <div className="col">
        <MatchmalPanel state={p.matchmal} set={p.setMatchmal} />
        <CompactCard num="01" title="Förutsättningar" sectionId="forutsattningar" onOpen={p.onOpen} roster={p.roster}>
          <Bullets items={p.forutsattningar} onChange={p.setForutsattningar} />
        </CompactCard>
        <CompactCard num="02" title="Identitet" sectionId="identitet" onOpen={p.onOpen} roster={p.roster}>
          <Principles items={MP_COHERENCE[1].principles} />
        </CompactCard>
        <CompactCard num="03" title="Försvarsspel" sectionId="forsvar" onOpen={p.onOpen} roster={p.roster}>
          <Principles items={MP_COHERENCE[2].principles} />
        </CompactCard>
        <CompactCard num="05" title="Anfallsspel" sectionId="anfall" onOpen={p.onOpen} roster={p.roster}>
          <Principles items={MP_COHERENCE[4].principles} />
        </CompactCard>
      </div>
      <div className="col">
        <CompactCard num="04" title="Omst → anfall" sectionId="omst-anfall" onOpen={p.onOpen} roster={p.roster}>
          <Principles items={MP_COHERENCE[3].principles} />
        </CompactCard>
        <CompactCard num="06" title="Omst → försvar" sectionId="omst-forsvar" onOpen={p.onOpen} roster={p.roster}>
          <Principles items={MP_COHERENCE[5].principles} />
        </CompactCard>
        <CompactCard num="07" title="Fasta — försvar" sectionId="fasta-forsvar" onOpen={p.onOpen} roster={p.roster}>
          <Principles items={MP_COHERENCE[6].principles} />
          <div className="sec-note">{MP_COHERENCE[6].note}</div>
        </CompactCard>
        <CompactCard num="08" title="Fasta — anfall" sectionId="fasta-anfall" onOpen={p.onOpen} roster={p.roster}>
          <div className="sec-note">{MP_COHERENCE[7].note}</div>
        </CompactCard>
        <PressPanel state={p.press} set={p.setPress} />
        <UppbyggnadPanel state={p.uppbyggnad} set={p.setUppbyggnad} />
        <CompactCard num="09" title="Övriga roller" sectionId="ovrigt" onOpen={p.onOpen} roster={p.roster}>
          <div style={{display:"flex", flexDirection:"column", gap:6}}>
            {p.roles.map((r, i) => (
              <div key={i} className="role-row">
                <div className="k">{r.k}</div>
                <EditableLine small value={r.v}
                  onChange={v => p.setRoles(p.roles.map((x, idx) => idx === i ? { ...x, v } : x))} />
              </div>
            ))}
          </div>
        </CompactCard>
      </div>
    </div>
  );
}

function CompactCard({ num, title, children, sectionId, onOpen, roster }) {
  return (
    <div className="card">
      <div className="card-head"><span className="num">{num}</span><span className="lbl">{title}</span></div>
      <div className="card-body">
        {children}
        {sectionId && onOpen && (
          <SituationThumbs sectionId={sectionId} situations={window.MP_SITUATIONS} roster={roster} onOpen={onOpen} />
        )}
      </div>
    </div>
  );
}

Object.assign(window, { App, VariantA, VariantB, CompactCard });
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
