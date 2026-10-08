import React, { useState } from 'react';
import ChallengePanel from '../components/ChallengePanel.jsx';
import ReasoningWorkbench from '../components/ReasoningWorkbench.jsx';
import { manufacturing as M } from '../scenarios/index.js';

const tempClass = { normal: 'ok', warm: 'warm', high: 'hot', critical: 'crit' };

function Factory({ s, known }) {
  const has = (f) => known.includes(f);
  const aStopped = has('machine_A_stopped'), bStopped = has('machine_B_stopped');
  const cooling = has('activate_cooling'), toB = has('switch_production_to_B');
  const flowing = (has('continue_production') || toB) && !has('halt_factory');
  return (
    <svg viewBox="0 0 320 300" className="scene factory" role="img" aria-label="Smart factory floor">
      <rect width="320" height="300" className="floor" />
      <g transform="translate(20,70)" className={aStopped ? 'mach stopped' : `mach ${tempClass[s.tempA]}`}>
        <rect width="100" height="80" rx="8" /><text x="50" y="30" textAnchor="middle">MACHINE A</text>
        <text x="50" y="52" textAnchor="middle">{aStopped ? '■ STOPPED' : `temp: ${s.tempA}`}</text></g>
      <g transform="translate(200,70)" className={bStopped ? 'mach stopped' : `mach b-${s.machineB} ${s.bOverheating ? 'crit' : ''}`}>
        <rect width="100" height="80" rx="8" /><text x="50" y="30" textAnchor="middle">MACHINE B</text>
        <text x="50" y="52" textAnchor="middle">{bStopped ? '■ STOPPED' : s.bOverheating ? 'OVERHEATING' : s.machineB}</text></g>
      <g transform="translate(70,30)"><circle r="16" className={cooling ? 'fan on' : 'fan'} /><text y="30" textAnchor="middle" className="svgtext">{cooling ? '❄ COOLING ACTIVE' : 'cooling idle'}</text></g>
      <rect x="20" y="200" width="280" height="14" className="belt" />
      {toB && <path d="M70 150 L70 200 M250 200 L250 150" className="route" />}
      {flowing && [0, 1, 2].map((i) => <rect key={i} y="190" width="16" height="12" className="product" style={{ animationDelay: `${i * 0.9}s` }} />)}
      <text x="160" y="245" textAnchor="middle" className="svgtext">{has('halt_factory') ? '⛔ FACTORY HALTED' : toB ? '➜ Production routed to Machine B' : flowing ? '➜ Production continuing' : 'Production idle'}</text>
      {has('call_maintenance') && <text x="160" y="270" textAnchor="middle" className="svgtext">🔧 Maintenance called</text>}
    </svg>
  );
}

export default function Manufacturing() {
  const [s, setS] = useState(M.initialState);
  const [conflict, setConflict] = useState(false);
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));
  const facts = [...M.toFacts(s), ...(conflict && s.machineB === 'operational' ? ['machine_B_failed'] : [])];
  const Seg = ({ k, opts }) => <div className="seg" role="group" aria-label={k}>{opts.map(([v, l]) => <button key={String(v)} className={`btn ${s[k] === v ? 'primary' : ''}`} aria-pressed={s[k] === v} onClick={() => set(k, v)}>{l}</button>)}</div>;
  const simulation = ({ known }) => (
    <section className="panel" aria-label="Smart factory">
      <h3 className="panel-title">Smart factory</h3>
      <Factory s={s} known={known} />
      <div className="env">
        <span>Machine A temperature</span><Seg k="tempA" opts={M.tempLevels.map((t) => [t, t])} />
        <span>Machine B</span><Seg k="machineB" opts={[['operational', 'Operational'], ['maintenance', 'Maintenance'], ['failed', 'Failed']]} />
        <span>Machine B overheating</span><Seg k="bOverheating" opts={[[true, 'Yes'], [false, 'No']]} />
        <span>Production</span><Seg k="production" opts={[['running', 'Running'], ['paused', 'Paused']]} />
      </div>
      <label className="toggle"><input type="checkbox" checked={conflict} onChange={(e) => setConflict(e.target.checked)} /> Add conflicting sensor report (machine_B_failed while operational)</label>
      <button className="btn" onClick={() => { setS(M.initialState); setConflict(false); }}>Reset factory</button>
    </section>
  );
  const conclusion = (r, mode, goal) => {
    if (mode === 'backward') return r.proven ? `"${goal.replace(/_/g, ' ')}" is proven from the current machine facts.` : `"${goal.replace(/_/g, ' ')}" cannot be proven from the current machine facts.`;
    return r.fired.length === 0 ? 'No applicable rule found. The factory is in a state where no safety or production rule applies.' : `Factory response: ${r.derived.map((d) => d.replace(/_/g, ' ')).join(' → ')}.`;
  };
  return <ReasoningWorkbench scenario={M} facts={facts} autoRun simulation={simulation} conclusion={conclusion}>
    <ChallengePanel scenario={M} />
  </ReasoningWorkbench>;
}
