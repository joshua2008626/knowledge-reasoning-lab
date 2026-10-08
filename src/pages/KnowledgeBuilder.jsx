import React, { useState } from 'react';
import ReasoningWorkbench from '../components/ReasoningWorkbench.jsx';
import { validateRule } from '../engine/index.js';
import { useLab } from '../hooks/useLab.jsx';

const VALID = /^[A-Za-z][A-Za-z0-9_ ]*$/;
const clean = (s) => s.trim().replace(/\s+/g, '_');
const SAMPLE = { facts: ['machine_overheating', 'temperature_high'], rules: [{ id: 'R1', if: ['temperature_high', 'machine_overheating'], then: 'activate_cooling' }, { id: 'R2', if: ['activate_cooling'], then: 'temperature_falling' }] };

export default function KnowledgeBuilder() {
  const { markBuilt } = useLab();
  const [facts, setFacts] = useState([]);
  const [rules, setRules] = useState([]);
  const [factIn, setFactIn] = useState('');
  const [conds, setConds] = useState(['', '']);
  const [then, setThen] = useState('');
  const [msg, setMsg] = useState('');
  const [toast, setToast] = useState('');
  const vocab = [...new Set([...facts, ...rules.flatMap((r) => [...r.if, r.then])])];

  const addFact = () => {
    if (!VALID.test(factIn.trim())) return setMsg('A fact must start with a letter and use only letters, numbers and underscores.');
    const f = clean(factIn);
    if (facts.includes(f)) return setMsg(`"${f}" is already a fact.`);
    setFacts([...facts, f]); setFactIn(''); setMsg('');
  };
  const addRule = () => {
    const ifs = conds.map(clean).filter(Boolean);
    const rule = { id: `R${rules.length + 1}`, if: ifs, then: clean(then) };
    const errs = validateRule(rule);
    if (!errs.length && [...ifs, rule.then].some((x) => !VALID.test(x.replace(/_/g, ' ')))) errs.push('Use letters, numbers and underscores only.');
    if (!errs.length && rules.some((r) => r.then === rule.then && r.if.join() === rule.if.join())) errs.push('That rule already exists.');
    if (errs.length) return setMsg(errs.join(' '));
    setRules([...rules, rule]); setConds(['', '']); setThen(''); setMsg('');
  };
  const goals = [...new Set([...rules.map((r) => r.then), ...facts])];
  const onResult = (r) => { if (r && r.fired?.length) { const u = markBuilt(); if (u.length) setToast(`${u[0].icon} Achievement unlocked: ${u[0].name}`); } };

  return (
    <div>
      <div className="page">
        <h1>Knowledge Base Builder</h1>
        <p className="muted">Write your own facts and rules, then run the same generic engine on them.</p>
        <div className="builder">
          <section className="panel" aria-label="Fact builder"><h3 className="panel-title">Facts</h3>
            <div className="row"><input aria-label="New fact" list="vocab" value={factIn} onChange={(e) => setFactIn(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addFact()} placeholder="e.g. temperature_high" /><button className="btn primary" onClick={addFact}>+ Add fact</button></div>
            <ul className="chips">{facts.map((f) => <li key={f} className="chip fact">✓ {f} <button className="x" aria-label={`Remove fact ${f}`} onClick={() => setFacts(facts.filter((x) => x !== f))}>×</button></li>)}</ul>
          </section>
          <section className="panel" aria-label="Rule builder"><h3 className="panel-title">Rule builder</h3>
            <datalist id="vocab">{vocab.map((v) => <option key={v} value={v} />)}</datalist>
            {conds.map((c, i) => <div className="row" key={i}><span className="lbl">{i === 0 ? 'IF' : 'AND'}</span><input aria-label={`Condition ${i + 1}`} list="vocab" value={c} onChange={(e) => setConds(conds.map((x, j) => (j === i ? e.target.value : x)))} /></div>)}
            <div className="row"><button className="btn" disabled={conds.length >= 4} onClick={() => setConds([...conds, ''])}>+ AND</button></div>
            <div className="row"><span className="lbl">THEN</span><input aria-label="Conclusion" list="vocab" value={then} onChange={(e) => setThen(e.target.value)} /></div>
            <div className="row"><button className="btn primary" onClick={addRule}>Add rule</button><button className="btn" onClick={() => { setFacts(SAMPLE.facts); setRules(SAMPLE.rules); setMsg(''); }}>Load sample</button><button className="btn" onClick={() => { setFacts([]); setRules([]); setMsg(''); }}>Clear all</button></div>
            <ul className="rules">{rules.map((r) => <li key={r.id} className="rule"><b>{r.id}</b> IF {r.if.join(' AND ')} THEN {r.then} <button className="x" aria-label={`Remove rule ${r.id}`} onClick={() => setRules(rules.filter((x) => x.id !== r.id))}>×</button></li>)}</ul>
          </section>
        </div>
        {msg && <p role="alert" className="warn">{msg}</p>}
        {toast && <p role="status" className="ach">{toast}</p>}
        {rules.length === 0 && <p className="muted">Add at least one rule to run the engine. No applicable rule found yet.</p>}
      </div>
      {rules.length > 0 && <ReasoningWorkbench scenario={{ rules, goals, conflicts: [] }} facts={facts} onResult={onResult} conclusion={(r, m, g) => (m === 'backward' ? (r.proven ? `"${g}" is proven.` : `"${g}" cannot be proven.`) : r.fired.length ? `Derived: ${r.derived.join(', ')}.` : 'No applicable rule found. None of your rules has all its conditions satisfied.')} />}
    </div>
  );
}
