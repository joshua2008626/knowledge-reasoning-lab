import React, { useState } from 'react';
import ChallengePanel from '../components/ChallengePanel.jsx';
import ReasoningWorkbench from '../components/ReasoningWorkbench.jsx';
import { medical } from '../scenarios/index.js';

const nice = (s) => s.replace(/_/g, ' ');

export default function Medical() {
  const [sel, setSel] = useState(['fever', 'cough', 'fatigue', 'sore_throat']);
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const facts = medical.toFacts(sel);

  const simulation = () => (
    <section className="panel" aria-label="Patient">
      <h3 className="panel-title">Patient #024 (fictional case)</h3>
      <div className="patient" aria-hidden="true">🧑‍⚕️</div>
      <fieldset className="symptoms">
        <legend>Symptoms (each becomes a fact)</legend>
        {medical.symptoms.map((s) => (
          <label key={s.id} className={`toggle ${sel.includes(s.id) ? 'on' : ''}`}>
            <input type="checkbox" checked={sel.includes(s.id)} onChange={() => toggle(s.id)} />
            {sel.includes(s.id) ? '✓' : '○'} {s.label} <code>{s.id}(patient)</code>
          </label>
        ))}
      </fieldset>
      <button className="btn" onClick={() => setSel([])}>Clear symptoms</button>
      <p className="warn small">{medical.disclaimer}</p>
    </section>
  );

  const conclusion = (r, mode, goal) => {
    if (mode === 'backward') {
      return r.proven
        ? `"${nice(goal)}" is proven: every required fact was found. This is a possible condition according to this toy rule system.`
        : `"${nice(goal)}" could not be proven. ${r.tree?.reason || ''} Missing evidence prevented any supporting rule from succeeding.`;
    }
    if (r.fired.length === 0) return 'No applicable rule found. The selected symptoms do not satisfy the conditions of any rule.';
    const found = medical.conditions.filter((c) => r.derived.includes(c));
    const flags = medical.flags.filter((c) => r.derived.includes(c));
    const main = found.length ? `Possible condition according to this toy rule system: ${nice(found[0])}${found.length > 1 ? ` (also: ${found.slice(1).map(nice).join(', ')})` : ''}.` : `Derived: ${r.derived.map(nice).join(', ')}.`;
    return `${main}${flags.length ? ` Follow-up flag: ${flags.map(nice).join(', ')}.` : ''}`;
  };

  return <ReasoningWorkbench scenario={medical} facts={facts} simulation={simulation} conclusion={conclusion}>
    <ChallengePanel scenario={medical} />
  </ReasoningWorkbench>;
}
