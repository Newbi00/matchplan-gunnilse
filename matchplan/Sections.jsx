// Matchplan — sections (koherens 1–9 + press + uppbyggnad)
const { useState: useStateS } = React;

function SectionCard({ num, eyebrow, title, subtitle, children, dense, sectionId, onOpen, roster }) {
  return (
    <div className={"section-card " + (dense ? "dense" : "")}>
      <div className="sec-head">
        <span className="section-num">{num}</span>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h2 className="section-h">{title}</h2>
      {subtitle && <div className="sec-sub">{subtitle}</div>}
      <div className="sec-body">{children}</div>
      {sectionId && onOpen && (
        <SituationThumbs sectionId={sectionId} situations={window.MP_SITUATIONS} roster={roster} onOpen={onOpen} />
      )}
    </div>
  );
}

/* 01 Förutsättningar */
function SecForutsattningar({ state, set, onOpen, roster }) {
  return (
    <SectionCard num="01" eyebrow="Kontext" title="Förutsättningar"
      sectionId="forutsattningar" onOpen={onOpen} roster={roster}>
      <Bullets items={state} onChange={set} />
    </SectionCard>
  );
}

/* 02 Identitet */
function SecIdentitet({ onOpen, roster }) {
  return (
    <SectionCard num="02" eyebrow="Vem vi är" title="Identitet"
      sectionId="identitet" onOpen={onOpen} roster={roster}>
      <div className="ref-image"><ZonerBox /></div>
      <Principles items={MP_COHERENCE[1].principles} />
    </SectionCard>
  );
}

/* 03 Försvarsspel */
function SecForsvar({ onOpen, roster }) {
  return (
    <SectionCard num="03" eyebrow="När de har bollen" title="Försvarsspel"
      sectionId="forsvar" onOpen={onOpen} roster={roster}>
      <div className="ref-image"><Korridorer /></div>
      <Principles items={MP_COHERENCE[2].principles} />
    </SectionCard>
  );
}

/* 04 Omställning → anfall */
function SecOmstAnfall({ onOpen, roster }) {
  return (
    <SectionCard num="04" eyebrow="Vi vinner bollen" title="Omställning → anfall"
      sectionId="omst-anfall" onOpen={onOpen} roster={roster}>
      <Principles items={MP_COHERENCE[3].principles} />
    </SectionCard>
  );
}

/* 05 Anfallsspel */
function SecAnfall({ onOpen, roster }) {
  return (
    <SectionCard num="05" eyebrow="Vi har bollen" title="Anfallsspel"
      sectionId="anfall" onOpen={onOpen} roster={roster}>
      <div className="ref-image"><Spelytor /></div>
      <Principles items={MP_COHERENCE[4].principles} />
    </SectionCard>
  );
}

/* 06 Omställning → försvar */
function SecOmstForsvar({ onOpen, roster }) {
  return (
    <SectionCard num="06" eyebrow="Vi tappar bollen" title="Omställning → försvar"
      sectionId="omst-forsvar" onOpen={onOpen} roster={roster}>
      <Principles items={MP_COHERENCE[5].principles} />
    </SectionCard>
  );
}

/* 07 Fasta — försvar */
function SecFastaForsvar({ onOpen, onOpenTaktik, roster }) {
  return (
    <SectionCard num="07" eyebrow="Deras hörna / frispark" title="Försvar mot fasta"
      sectionId="fasta-forsvar" onOpen={onOpen} roster={roster}>
      <TaktikBilderThumbs sectionId="fasta-forsvar" taktik={window.MP_TAKTIK}
        roster={roster} onOpen={onOpenTaktik} />
      <Principles items={MP_COHERENCE[6].principles} />
      <div className="sec-note">{MP_COHERENCE[6].note}</div>
    </SectionCard>
  );
}

/* 08 Fasta — anfall */
function SecFastaAnfall({ onOpen, onOpenTaktik, roster }) {
  return (
    <SectionCard num="08" eyebrow="Vår hörna / frispark" title="Anfall från fasta"
      sectionId="fasta-anfall" onOpen={onOpen} roster={roster}>
      <TaktikBilderThumbs sectionId="fasta-anfall" taktik={window.MP_TAKTIK}
        roster={roster} onOpen={onOpenTaktik} />
      <div className="sec-note">{MP_COHERENCE[7].note}</div>
    </SectionCard>
  );
}

/* 09 Övriga roller */
function SecOvrigt({ state, set, onOpen, roster }) {
  return (
    <SectionCard num="09" eyebrow="Roller & ansvar" title="Övriga roller"
      sectionId="ovrigt" onOpen={onOpen} roster={roster}>
      <div className="role-grid">
        {state.map((r, i) => (
          <div key={i} className="role-row">
            <div className="k">{r.k}</div>
            <EditableLine small value={r.v}
              onChange={v => set(state.map((x, idx) => idx === i ? { ...x, v } : x))} />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* Press triggers (side panel) */
function PressPanel({ state, set }) {
  const add = () => set([...state, { trigger: "", action: "" }]);
  return (
    <div className="card">
      <div className="card-head"><span className="num">TRG</span><span className="lbl">Press-triggers</span></div>
      <div className="card-body">
        {state.map((t, i) => (
          <div key={i} className="trigger">
            <EditableText value={t.trigger} onChange={v => set(state.map((x, idx) => idx === i ? { ...x, trigger: v } : x))} placeholder="Trigger..." />
            <EditableText value={t.action} onChange={v => set(state.map((x, idx) => idx === i ? { ...x, action: v } : x))} placeholder="Vad vi gör..." />
          </div>
        ))}
        <div className="add-row" onClick={add}><span className="plus">+</span> Lägg till trigger</div>
      </div>
    </div>
  );
}

/* Uppbyggnad */
function UppbyggnadPanel({ state, set }) {
  return (
    <div className="card">
      <div className="card-head"><span className="num">SPU</span><span className="lbl">Speluppbyggnad</span></div>
      <div className="card-body">
        <div className="stacklist">
          {state.map((r, i) => (
            <div key={i} className="item">
              <div className="k">{r.phase}</div>
              <div className="v">
                <div style={{fontWeight:700, color:"var(--fg)", marginBottom:2}}>{r.who}</div>
                <EditableText value={r.what} onChange={v => set(state.map((x, idx) => idx === i ? { ...x, what: v } : x))} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Matchmål */
function MatchmalPanel({ state, set }) {
  return (
    <div className="card">
      <div className="card-head"><span className="num">MÅL</span><span className="lbl">Nyckelpunkter & matchmål</span></div>
      <div className="card-body">
        <Bullets items={state} onChange={set} />
      </div>
    </div>
  );
}

Object.assign(window, {
  SectionCard, SecForutsattningar, SecIdentitet, SecForsvar, SecOmstAnfall,
  SecAnfall, SecOmstForsvar, SecFastaForsvar, SecFastaAnfall, SecOvrigt,
  PressPanel, UppbyggnadPanel, MatchmalPanel
});
