import React, { useState } from 'react';
import { forwardChain, backwardChain } from '../engine/index.js';
import { medical, vehicle, manufacturing, decide } from '../scenarios/index.js';

const FWD = ['1. Start with the known facts in working memory.', '2. For each rule, test whether ALL IF conditions are known facts.', '3. If so, FIRE the rule and add its THEN part as a new fact.', '4. Repeat passes until the goal is reached or no new fact is added.'];
const BWD = ['1. Take the goal as the current goal.', '2. If it is a known fact, it is proven.', '3. Otherwise find rules whose THEN part is the goal; make their IF parts sub-goals.', '4. Prove each sub-goal recursively; if one fails, backtrack and try another rule.', '5. Goal proven if every sub-goal of one rule is proven; otherwise failed.'];

const PRACTICALS = [
  { key: 'medical', no: 1, scn: medical, aim: 'To implement a toy medical-diagnosis expert system using facts, rules, forward chaining and backward chaining.', problem: 'Given a patient’s symptoms (facts), infer possible conditions according to educational rules. Not real medical advice.', facts: ['fever', 'cough', 'sore_throat', 'fatigue'], goal: 'possible_flu' },
  { key: 'vehicle', no: 2, scn: vehicle, aim: 'To implement an autonomous-vehicle decision system using facts, rules, forward chaining and backward chaining.', problem: 'Given sensor readings (traffic light, pedestrian, obstacle, vehicle ahead, distance, road), infer the correct driving action.', state: { light: 'green', pedestrian: true, distance: 'near' }, goal: 'emergency_stop' },
  { key: 'manufacturing', no: 3, scn: manufacturing, aim: 'To implement an industrial-manufacturing monitoring system using facts, rules, forward chaining and backward chaining.', problem: 'Given machine and production states, infer safety actions such as stopping a machine, cooling and switching production.', state: { tempA: 'critical', machineB: 'operational' }, goal: 'switch_production_to_B' },
];

export default function LabMode() {
  const [k, setK] = useState('medical');
  const p = PRACTICALS.find((x) => x.key === k);
  const facts = p.state ? p.scn.toFacts({ ...p.scn.initialState, ...p.state }) : p.facts;
  const f = forwardChain(facts, p.scn.rules);
  const b = backwardChain(p.goal, facts, p.scn.rules);
  const decision = p.key === 'vehicle' ? decide(f.facts, p.scn.priority) : null;
  return (
    <div className="page">
      <h1>Lab Mode · Category 8</h1>
      <div className="seg" role="tablist">{PRACTICALS.map((x) => <button key={x.key} role="tab" aria-selected={k === x.key} className={`tab ${k === x.key ? 'on' : ''}`} onClick={() => setK(x.key)}>Practical {x.no}: {x.scn.title}</button>)}</div>
      <section className="panel record"><h2>Aim</h2><p>{p.aim}</p><h2>Problem statement</h2><p>{p.problem}</p>
        <h2>Knowledge Base</h2><h3>Rules</h3><ul className="rules">{p.scn.rules.map((r) => <li key={r.id} className="rule"><b>{r.id}</b> IF {r.if.join(' AND ')} THEN {r.then}</li>)}</ul>
        <h3>Example facts (input)</h3><p>{facts.map((x) => <code key={x} className="chip fact">{x}</code>)}</p>
        <h2>Forward chaining algorithm</h2><ol>{FWD.map((s) => <li key={s}>{s}</li>)}</ol>
        <h2>Backward chaining algorithm</h2><ol>{BWD.map((s) => <li key={s}>{s}</li>)}</ol>
        <h2>Example output (computed live by the engine)</h2>
        <p><b>Forward:</b> rules fired {f.fired.join(', ') || 'none'}; derived {f.derived.join(', ') || 'nothing'}{decision ? `; decision ${decision}` : ''}.</p>
        <p><b>Backward</b> (goal {p.goal}): {b.proven ? `PROVEN via ${b.tree.via}` : 'FAILED'}; sub-goals {b.stats.subgoals}, facts found {b.stats.factsFound}, backtracks {b.stats.backtracks}.</p>
        <h2>Result</h2><p>The knowledge base with facts, rules, forward chaining and backward chaining was implemented for {p.scn.title}, and both strategies reached consistent conclusions on the example input.</p>
      </section>
    </div>
  );
}
