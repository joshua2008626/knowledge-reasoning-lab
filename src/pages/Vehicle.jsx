import React, { useState } from 'react';
import ChallengePanel from '../components/ChallengePanel.jsx';
import ReasoningWorkbench from '../components/ReasoningWorkbench.jsx';
import { vehicle, decide } from '../scenarios/index.js';

const LABEL = { emergency_stop: '🛑 EMERGENCY STOP', stop_vehicle: '🛑 STOP', prepare_to_stop: '🟡 PREPARE TO STOP', slow_down: '🐢 SLOW DOWN', move_vehicle: '🟢 MOVE', proceed: '🟢 PROCEED', no_action: '… NO RULE APPLIES' };
const SPEED = { move_vehicle: 0.5, proceed: 0.7, slow_down: 1.8 };

function Scene({ s, action }) {
  const near = s.distance === 'near';
  const stopped = !SPEED[action];
  const braking = ['emergency_stop', 'stop_vehicle', 'prepare_to_stop', 'slow_down'].includes(action);
  return (
    <svg viewBox="0 0 300 400" className="scene" role="img" aria-label={`Driving scene. Decision: ${LABEL[action]}`}>
      <rect width="300" height="400" className="grass" />
      <rect x="70" width="160" height="400" className="road" />
      <line x1="150" y1="0" x2="150" y2="400" className="lane" style={{ animationDuration: `${SPEED[action] || 1}s`, animationPlayState: stopped ? 'paused' : 'running' }} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={90 + i * 28} y="200" width="16" height="10" className="zebra" />)}
      {s.road === 'blocked' && <g><rect x="70" y="50" width="160" height="14" className="barrier" /><text x="150" y="44" textAnchor="middle" className="svgtext">ROAD BLOCKED</text></g>}
      <g transform="translate(255,40)"><rect x="-14" y="-6" width="28" height="86" rx="8" className="lightbox" />
        {['red', 'yellow', 'green'].map((c, i) => <circle key={c} cx="0" cy={14 + i * 26} r="9" className={`bulb ${c} ${s.light === c ? 'on' : ''}`} />)}</g>
      {s.pedestrian && <g transform={`translate(${near ? 105 : 190},${near ? 235 : 150})`} className="ped"><circle r="7" /><line y1="7" y2="28" /><line x1="-10" y1="14" x2="10" y2="14" /><line y1="28" x2="-8" y2="42" /><line y1="28" x2="8" y2="42" /></g>}
      {s.obstacle && <g transform={`translate(190,${near ? 270 : 120})`}><polygon points="0,-18 14,14 -14,14" className="cone" /></g>}
      {s.vehicleAhead && <g transform={`translate(150,${near ? 258 : 170})`}><rect x="-18" y="-26" width="36" height="52" rx="8" className="other" /><text y="5" textAnchor="middle" className="svgtext">AHEAD</text></g>}
      <g transform="translate(150,350)"><rect x="-20" y="-30" width="40" height="60" rx="10" className="car" /><rect x="-14" y="-6" width="28" height="12" rx="3" className="glass" />
        <rect x="-16" y="24" width="10" height="5" className={braking ? 'brake on' : 'brake'} /><rect x="6" y="24" width="10" height="5" className={braking ? 'brake on' : 'brake'} /></g>
    </svg>
  );
}

export default function Vehicle() {
  const [s, setS] = useState(vehicle.initialState);
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));
  const facts = vehicle.toFacts(s);
  const Seg = ({ k, opts }) => (
    <div className="seg" role="group" aria-label={k}>{opts.map(([v, label]) => <button key={String(v)} className={`btn ${s[k] === v ? 'primary' : ''}`} aria-pressed={s[k] === v} onClick={() => set(k, v)}>{label}</button>)}</div>
  );
  const simulation = ({ known }) => {
    const action = decide(known, vehicle.priority);
    return (
      <section className="panel" aria-label="Driving simulation">
        <h3 className="panel-title">Simulation</h3>
        <Scene s={s} action={action} />
        <p className={`decision ${action}`} role="status">DECISION: {LABEL[action]}</p>
        <ul className="sensors"><li>Traffic light → {s.light.toUpperCase()}</li><li>Pedestrian → {s.pedestrian ? 'DETECTED' : 'none'}</li><li>Obstacle → {s.obstacle ? 'DETECTED' : 'none'}</li><li>Vehicle ahead → {s.vehicleAhead ? 'YES' : 'no'}</li><li>Distance → {s.distance.toUpperCase()}</li><li>Road → {s.road.toUpperCase()}</li></ul>
        <div className="env">
          <span>Traffic light</span><Seg k="light" opts={[['red', '🔴 Red'], ['yellow', '🟡 Yellow'], ['green', '🟢 Green']]} />
          <span>Pedestrian</span><Seg k="pedestrian" opts={[[true, 'On'], [false, 'Off']]} />
          <span>Obstacle</span><Seg k="obstacle" opts={[[true, 'On'], [false, 'Off']]} />
          <span>Vehicle ahead</span><Seg k="vehicleAhead" opts={[[true, 'On'], [false, 'Off']]} />
          <span>Distance</span><Seg k="distance" opts={[['near', 'Near'], ['far', 'Far']]} />
          <span>Road</span><Seg k="road" opts={[['clear', 'Clear'], ['blocked', 'Blocked']]} />
        </div>
        <button className="btn" onClick={() => setS(vehicle.initialState)}>Reset environment</button>
      </section>
    );
  };
  const conclusion = (r, mode, goal) => {
    if (mode === 'backward') return r.proven ? `"${goal.replace(/_/g, ' ')}" is justified by the current sensor facts.` : `"${goal.replace(/_/g, ' ')}" cannot be proven from the current sensor facts.`;
    const d = decide(r.facts, vehicle.priority);
    return d === 'no_action' ? 'No applicable rule found. The current facts match none of the driving rules.' : `Final decision (highest-priority action among derived facts): ${LABEL[d]}. Derived: ${r.derived.join(', ') || 'nothing'}.`;
  };
  return <ReasoningWorkbench scenario={vehicle} facts={facts} autoRun simulation={simulation} conclusion={conclusion}>
    <ChallengePanel scenario={vehicle} />
  </ReasoningWorkbench>;
}
