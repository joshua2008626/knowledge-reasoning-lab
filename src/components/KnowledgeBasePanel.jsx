import React, { useState } from 'react';
import { motion } from 'framer-motion';

const nice = (s) => s.replace(/_/g, ' ');
const TABS = ['Facts', 'Rules', 'Derived', 'Query'];

// facts/derived are the engine's state AT THE CURRENT REPLAY STEP.
export default function KnowledgeBasePanel({ facts, derived, rules, firedRules = [], checking = null, notSatisfied = [], goals = [], goal, onGoal, contradictions = [] }) {
  const [tab, setTab] = useState('Facts');
  return (
    <section aria-label="Knowledge base" className="panel kb">
      <h3 className="panel-title">Knowledge Base</h3>
      <div role="tablist" className="tabs">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t}{t === 'Facts' ? ` (${facts.length})` : t === 'Derived' ? ` (${derived.length})` : t === 'Rules' ? ` (${rules.length})` : ''}
          </button>
        ))}
      </div>
      {contradictions.length > 0 && (
        <p role="alert" className="warn">⚠ The Knowledge Base currently contains conflicting facts: {contradictions.map(([a, b]) => `${nice(a)} vs ${nice(b)}`).join('; ')}.</p>
      )}
      {tab === 'Facts' && (
        <ul className="chips">{facts.length === 0 ? <li className="muted">No facts yet.</li> : facts.map((f) => <motion.li key={f} className="chip fact" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>✓ {nice(f)}</motion.li>)}</ul>
      )}
      {tab === 'Rules' && (
        <ul className="rules">
          {rules.map((r) => {
            const fired = firedRules.includes(r.id);
            const bad = notSatisfied.includes(r.id);
            return (
              <li key={r.id} className={`rule ${fired ? 'fired' : ''} ${checking === r.id ? 'checking' : ''}`}>
                <b>{r.id}</b> IF {r.if.map(nice).join(' AND ')} THEN {nice(r.then)}
                {fired && <span className="tag ok">✓ FIRED</span>}
                {!fired && bad && <span className="tag no">✗ NOT SATISFIED</span>}
              </li>
            );
          })}
        </ul>
      )}
      {tab === 'Derived' && (
        <ul className="chips">{derived.length === 0 ? <li className="muted">Nothing derived yet.</li> : derived.map((f) => <motion.li key={f} className="chip derived" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>→ {nice(f)}</motion.li>)}</ul>
      )}
      {tab === 'Query' && (
        <div className="query">
          <label>Goal / hypothesis
            <select value={goal || ''} onChange={(e) => onGoal?.(e.target.value)}>
              <option value="">Choose a goal…</option>
              {goals.map((g) => <option key={g} value={g}>{nice(g)}</option>)}
            </select>
          </label>
        </div>
      )}
    </section>
  );
}
