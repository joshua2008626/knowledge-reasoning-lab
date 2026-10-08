import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { forwardChain, backwardChain, KnowledgeBase } from '../engine/index.js';
import { useReplay } from '../hooks/useReplay.js';
import KnowledgeBasePanel from './KnowledgeBasePanel.jsx';
import ReasoningGraph from './ReasoningGraph.jsx';
import BackwardTree from './BackwardTree.jsx';
import InferenceTimeline from './InferenceTimeline.jsx';
import ExplanationPanel from './ExplanationPanel.jsx';
import SolverControls from './SolverControls.jsx';

const nice = (s) => (s || '').replace(/_/g, ' ');

/**
 * Generic 3-part lab: simulation | knowledge base + graph | explanation.
 * Every scenario (and the Knowledge Base Builder) reuses this with the same engine.
 *  - scenario: { rules, goals, conflicts? }
 *  - facts: current given facts
 *  - simulation({ known, derived, result }): left panel renderer
 *  - conclusion(result, mode, goal): text shown when replay is finished
 *  - onResult(result): optional callback with the real engine result
 */
export default function ReasoningWorkbench({ scenario, facts, autoRun = false, simulation, conclusion, onResult, children }) {
  const [mode, setMode] = useState('forward');
  const [goal, setGoal] = useState('');
  const [raw, setResult] = useState(null);
  const [error, setError] = useState('');
  // Ignore a result that belongs to another mode/goal (stale for one render after a switch).
  const result = raw && raw.mode === mode && (mode === 'forward' || raw.goal === goal) ? raw : null;
  const factsKey = facts.join('|');
  const rulesKey = scenario.rules.map((r) => `${r.id}:${r.if.join('+')}>${r.then}`).join(';');

  const run = useCallback(() => {
    try {
      if (mode === 'backward') {
        if (!goal) { setError('Choose a goal to investigate first.'); setResult(null); return; }
        setError('');
        setResult({ mode, goal, ...backwardChain(goal, facts, scenario.rules) });
      } else {
        setError('');
        setResult({ mode, goal: null, ...forwardChain(facts, scenario.rules) });
      }
    } catch (e) {
      setError('The inference engine hit an unexpected problem. Please reset and try again.');
      setResult(null);
    }
  }, [mode, goal, factsKey, scenario.rules]); // eslint-disable-line

  useEffect(() => { if (autoRun) run(); else { setResult(null); setError(''); } }, [factsKey, rulesKey, mode, goal, autoRun]); // eslint-disable-line
  useEffect(() => { onResult?.(result); }, [result]); // eslint-disable-line

  const replay = useReplay(result?.events, { instant: autoRun });
  const vis = replay.visible;
  const derived = mode === 'forward' ? [...new Set(vis.filter((e) => e.type === 'FACT_DERIVED').map((e) => e.fact))] : [];
  const known = [...facts, ...derived];
  const firedRules = vis.filter((e) => e.type === 'RULE_FIRED').map((e) => e.rule);
  const notSat = vis.filter((e) => e.type === 'RULE_NOT_SATISFIED').map((e) => e.rule);
  const checking = replay.current && replay.current.type === 'RULE_CHECKED' ? replay.current.rule : null;
  const count = (t) => vis.filter((e) => e.type === t).length;
  const contradictions = useMemo(() => new KnowledgeBase({ facts: known, rules: [], conflicts: scenario.conflicts || [] }).findContradictions(), [known.join('|')]); // eslint-disable-line

  const stats = mode === 'forward'
    ? [['Rules checked', count('RULE_CHECKED')], ['Rules fired', count('RULE_FIRED')], ['Facts known', known.length], ['Facts derived', derived.length], ['Depth', Math.max(0, ...vis.filter((e) => e.type === 'FACT_DERIVED').map((e) => e.depth))]]
    : [['Goal', nice(goal) || '-'], ['Rule', [...vis].reverse().find((e) => e.type === 'RULE_SELECTED')?.rule || '-'], ['Sub-goals', count('SUBGOAL_CREATED')], ['Facts found', count('FACT_PROVEN')], ['Backtracks', count('BACKTRACK')], ['Status', replay.done ? (result?.proven ? 'PROVEN ✓' : 'FAILED ✗') : result ? 'Working…' : '-']];

  const text = replay.done && result ? conclusion?.(result, mode, goal) : null;
  const sim = simulation?.({ known, derived, result, replay });

  return (
    <div className="page">
      <div className="toolbar panel" role="group" aria-label="Reasoning mode">
        <div className="seg">
          {['forward', 'backward'].map((m) => (
            <button key={m} className={`btn ${mode === m ? 'primary' : ''}`} aria-pressed={mode === m} onClick={() => setMode(m)}>{m === 'forward' ? 'Forward chaining' : 'Backward chaining'}</button>
          ))}
        </div>
        {mode === 'backward' && (
          <label>Goal <select value={goal} onChange={(e) => setGoal(e.target.value)} aria-label="Goal to investigate">
            <option value="">Choose a hypothesis…</option>
            {scenario.goals.map((g) => <option key={g} value={g}>{nice(g)}</option>)}
          </select></label>
        )}
        {!autoRun && <button className="btn primary" onClick={() => { run(); }}>{mode === 'forward' ? 'Run forward chaining' : 'Investigate'}</button>}
        {autoRun && result && <button className="btn" onClick={() => { replay.restart(); replay.play(); }}>Watch step by step</button>}
        {error && <span role="alert" className="warn">{error}</span>}
      </div>
      {children}
      <div className="lab-grid">
        <div>{sim}</div>
        <div>
          <KnowledgeBasePanel facts={facts} derived={derived} rules={scenario.rules} firedRules={firedRules} checking={checking} notSatisfied={notSat.filter((r) => !firedRules.includes(r))} goals={scenario.goals} goal={goal} onGoal={(g) => { setGoal(g); }} contradictions={contradictions} />
          {mode === 'backward' && result?.tree !== undefined ? <BackwardTree tree={result.tree} visible={vis} /> : null}
          <ReasoningGraph rules={scenario.rules} visible={vis} current={replay.current} known={known} goal={mode === 'backward' ? goal : null} />
        </div>
        <div>
          <ExplanationPanel current={replay.current} rules={scenario.rules} conclusion={text} />
          <SolverControls replay={replay} stats={stats} />
          <InferenceTimeline events={vis} />
        </div>
      </div>
    </div>
  );
}
