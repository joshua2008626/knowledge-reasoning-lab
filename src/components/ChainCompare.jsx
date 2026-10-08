import React, { useState } from 'react';
import { forwardChain, backwardChain } from '../engine/index.js';
import { explainEvent } from '../utils/explain.js';

const RULES = [
  { id: 'R1', if: ['fever', 'cough'], then: 'respiratory_infection', explain: 'Fever with cough suggests a respiratory infection.' },
  { id: 'R2', if: ['respiratory_infection', 'sore_throat'], then: 'possible_flu', explain: 'Respiratory infection plus sore throat points to possible flu.' },
];
const FACTS = ['fever', 'cough', 'sore_throat'];

// Same Knowledge Base, two strategies, real events from both algorithms.
export default function ChainCompare() {
  const [mode, setMode] = useState('forward');
  const f = forwardChain(FACTS, RULES, 'possible_flu');
  const b = backwardChain('possible_flu', FACTS, RULES);
  const events = (mode === 'forward' ? f : b).events.filter((e) => !['RULE_CHECKED', 'SEARCHING_RULES'].includes(e.type));
  return (
    <section className="panel" aria-label="Forward versus backward chaining">
      <h3 className="panel-title">Forward vs backward: same facts, same rules</h3>
      <p className="small">Facts: {FACTS.join(', ')} · R1: fever + cough → respiratory_infection · R2: respiratory_infection + sore_throat → possible_flu</p>
      <div className="seg">
        <button className={`btn ${mode === 'forward' ? 'primary' : ''}`} aria-pressed={mode === 'forward'} onClick={() => setMode('forward')}>Forward: facts → conclusion</button>
        <button className={`btn ${mode === 'backward' ? 'primary' : ''}`} aria-pressed={mode === 'backward'} onClick={() => setMode('backward')}>Backward: goal → facts</button>
      </div>
      <ol className="cmp">{events.map((e) => <li key={e.step}>{explainEvent(e, RULES)}</li>)}</ol>
      <p className="small muted">{mode === 'forward' ? 'Forward chaining starts from what is known and keeps firing rules.' : 'Backward chaining starts from the question and only visits what the goal needs.'}</p>
    </section>
  );
}
