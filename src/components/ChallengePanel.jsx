import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { forwardChain, backwardChain, matchRule } from '../engine/index.js';
import { decide } from '../scenarios/index.js';
import { SCENARIOS } from '../utils/achievements.js';
import { useLab } from '../hooks/useLab.jsx';

const nice = (s) => String(s).replace(/_/g, ' ');
const seeded = (str) => { let h = 7; for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return () => ((h = (h * 1103515245 + 12345) >>> 0) / 4294967296); };
const shuffle = (a, rnd) => a.map((x) => [rnd(), x]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

// Builds a question whose correct answer is computed by the REAL engine.
export function buildQuestion(scn, c) {
  const facts = c.state ? scn.toFacts({ ...scn.initialState, ...c.state }) : c.facts;
  const rnd = seeded(c.id);
  let correct, pool, q, chain, hint3;
  if (scn.id === 'vehicle') {
    const r = forwardChain(facts, scn.rules);
    correct = decide(r.facts, scn.priority);
    pool = scn.priority; q = 'What will the AI decide?'; chain = r.fired; hint3 = `${r.fired.join(', ')} can fire.`;
  } else if (c.mode === 'backward') {
    const b = backwardChain(c.goal, facts, scn.rules);
    correct = b.tree?.via; pool = scn.rules.map((r) => r.id);
    q = `Prove "${nice(c.goal)}". Which rule concludes it at the top of the proof?`; chain = b.events.filter((e) => e.type === 'RULE_SELECTED').map((e) => e.rule);
    hint3 = `Look for the rule whose THEN part is ${nice(c.goal)}.`;
  } else {
    const r = forwardChain(facts, scn.rules);
    correct = c.goal; chain = r.fired;
    pool = [...new Set([...scn.goals, ...Object.values(SCENARIOS).flatMap((s) => s.goals)])].filter((g) => g === c.goal || !r.facts.includes(g));
    q = 'What will the AI derive?';
    const first = scn.rules.find((ru) => matchRule(ru, { has: (f) => facts.includes(f) }).matched);
    hint3 = first ? `Rule ${first.id} can fire first.` : 'No rule can fire yet.';
  }
  const options = shuffle([correct, ...shuffle(pool.filter((p) => p !== correct), rnd).slice(0, 3)], rnd);
  return { facts, q, options, correct, chain, hints: [`Look at the facts currently in the Knowledge Base: ${facts.map(nice).join(', ')}.`, 'Find a rule whose conditions are all satisfied.', hint3] };
}

export default function ChallengePanel({ scenario }) {
  const { state, complete } = useLab();
  const [idx, setIdx] = useState(0);
  const c = scenario.challenges[idx];
  const Q = useMemo(() => buildQuestion(scenario, c), [scenario, c]);
  const [picked, setPicked] = useState(null);
  const [wrong, setWrong] = useState(0);
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState(null);
  const t0 = useRef(Date.now());
  useEffect(() => { setPicked(null); setWrong(0); setHints(0); setResult(null); t0.current = Date.now(); }, [idx, scenario]);

  const answer = (opt) => {
    if (result) return; // ignore rapid extra clicks after completion
    setPicked(opt);
    if (opt !== Q.correct) { setWrong((w) => w + 1); return; }
    const time = Math.round((Date.now() - t0.current) / 1000);
    const score = Math.max(0, 100 + (hints === 0 ? 50 : 0) + (time <= 30 ? 50 : 0) - 20 * hints - 50 * wrong);
    const unlocked = complete(scenario.id, c, { score, time, wrong, hints, fired: Q.chain.length });
    setResult({ score, time, unlocked });
  };
  const rec = state.completed[c.id];

  return (
    <section className="panel challenge" aria-label="Reasoning challenge">
      <h3 className="panel-title">Reasoning challenge · predict what the AI concludes</h3>
      <div className="seg" role="tablist" aria-label="Challenge level">
        {scenario.challenges.map((ch, i) => (
          <button key={ch.id} role="tab" aria-selected={i === idx} className={`tab ${i === idx ? 'on' : ''}`} onClick={() => setIdx(i)}>{state.completed[ch.id] ? '✓ ' : ''}{i + 1}. {ch.level}</button>
        ))}
      </div>
      <p><b>{c.prompt}</b> <span className="muted small">({c.level}{rec ? ` · best ${rec.score}` : ''})</span></p>
      <p className="small">Facts: {Q.facts.map((f) => <code key={f} className="chip fact">{nice(f)}</code>)}</p>
      <p>{Q.q}</p>
      <div className="opts" role="group" aria-label="Answer options">
        {Q.options.map((o, i) => {
          const state2 = picked === o ? (o === Q.correct ? 'right' : 'wrongopt') : '';
          return <button key={o} className={`btn opt ${state2}`} onClick={() => answer(o)} disabled={!!result}>{String.fromCharCode(65 + i)}. {nice(o)} {state2 === 'right' ? '✓ Correct' : state2 === 'wrongopt' ? '✗ Not quite' : ''}</button>;
        })}
      </div>
      <div className="row">
        <button className="btn" disabled={hints >= 3 || !!result} onClick={() => setHints((h) => h + 1)}><Lightbulb size={16} /> Hint ({hints}/3, −20 each)</button>
        <span className="muted small">Mistakes: {wrong}</span>
      </div>
      {Q.hints.slice(0, hints).map((h, i) => <p key={i} className="hint">💡 Hint {i + 1}: {h}</p>)}
      {result && (
        <div role="status" className="feedback">
          <p><b>✓ Correct! +{result.score} points</b> in {result.time}s.</p>
          <p>Reasoning chain: {Q.chain.length ? Q.chain.join(' → ') : 'no rule needed'}.</p>
          {result.unlocked.map((a) => <p key={a.id} className="ach">{a.icon} Achievement unlocked: {a.name}</p>)}
          {idx < scenario.challenges.length - 1 && <button className="btn primary" onClick={() => setIdx(idx + 1)}>Next challenge</button>}
        </div>
      )}
    </section>
  );
}
