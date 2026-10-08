import React, { useState } from 'react';
import { forwardChain } from '../engine/index.js';
import ChainCompare from '../components/ChainCompare.jsx';

const RULES = [
  { id: 'R1', if: ['fever', 'cough'], then: 'respiratory_infection' },
  { id: 'R2', if: ['respiratory_infection', 'fatigue'], then: 'possible_flu' },
];
const TOPICS = [
  ['What is Knowledge-Based AI?', 'A system that reasons from written-down knowledge instead of learning patterns from data. You tell it facts and rules; it works out the rest.'],
  ['What is a Knowledge Base?', 'The AI’s notebook. It holds two things: facts (what is true now) and rules (what follows from what).', 'fever(patient)  ·  IF fever AND cough THEN respiratory_infection'],
  ['Facts', 'A fact is something the AI currently knows.', 'fever(patient)'],
  ['Rules', 'A rule tells the AI what it can conclude.', 'IF fever(patient) AND cough(patient) THEN respiratory_infection(patient)'],
  ['Inference', 'Using rules to derive new knowledge from what is already known.'],
  ['Forward chaining', 'Start with the facts, fire every rule whose conditions are met, add the new facts, repeat until nothing new appears.'],
  ['Backward chaining', 'Start with a goal. Find a rule that could conclude it, then treat that rule’s conditions as smaller goals to prove.'],
  ['Rule matching', 'A rule matches when ALL of its IF conditions are already known facts. One missing condition and it does not match.'],
  ['Derived facts', 'Facts the AI created by firing rules. They can trigger further rules, which is how chains form.'],
  ['Goal / Query', 'The question you ask: “Can you prove possible_flu?” Backward chaining answers exactly that.'],
];

function MiniDemo() {
  const [on, setOn] = useState(['fever', 'cough']);
  const toggle = (f) => setOn((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));
  const r = forwardChain(on, RULES);
  return (
    <section className="panel" aria-label="Try inference">
      <h3 className="panel-title">Try it: toggle facts and watch the engine derive</h3>
      <div className="seg">{['fever', 'cough', 'fatigue'].map((f) => <label key={f} className={`toggle ${on.includes(f) ? 'on' : ''}`}><input type="checkbox" checked={on.includes(f)} onChange={() => toggle(f)} />{on.includes(f) ? '✓' : '○'} {f}</label>)}</div>
      <p>Rules fired: <b>{r.fired.join(', ') || 'none'}</b></p>
      <p>Derived facts: {r.derived.length ? r.derived.map((d) => <code key={d} className="chip derived">→ {d}</code>) : <span className="muted">nothing yet. No applicable rule found.</span>}</p>
    </section>
  );
}

export default function Learn() {
  return (
    <div className="page">
      <h1>Learn how AI reasons</h1>
      <p className="lead muted">Ten ideas, from absolute basics. No prior knowledge needed.</p>
      <ol className="topics">
        {TOPICS.map(([t, d, ex]) => (
          <li key={t} className="panel"><h2>{t}</h2><p>{d}</p>{ex && <pre className="ex">{ex}</pre>}</li>
        ))}
      </ol>
      <MiniDemo />
      <ChainCompare />
    </div>
  );
}
