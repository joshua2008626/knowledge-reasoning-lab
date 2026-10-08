import React from 'react';
import { motion } from 'framer-motion';

const nice = (s) => s.replace(/_/g, ' ');

// Renders the REAL proof tree returned by backwardChain, revealed as events replay.
export default function BackwardTree({ tree, visible = [] }) {
  const seen = new Set(); const ok = new Set(); const bad = new Set();
  visible.forEach((e) => {
    if (e.type === 'GOAL_SELECTED' || e.type === 'SUBGOAL_CREATED') seen.add(e.goal);
    if (['FACT_PROVEN', 'SUBGOAL_PROVEN', 'GOAL_PROVEN'].includes(e.type)) { seen.add(e.goal); ok.add(e.goal); }
    if (e.type === 'BACKTRACK' || e.type === 'GOAL_FAILED') { seen.add(e.goal); bad.add(e.goal); }
  });
  const render = (n, key) => {
    if (!n || !seen.has(n.goal)) return null;
    const st = ok.has(n.goal) ? 'ok' : bad.has(n.goal) ? 'bad' : 'pending';
    return (
      <motion.li key={key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
        <span className={`tnode ${st}`}>
          {st === 'ok' ? '✓' : st === 'bad' ? '✗' : '…'} {nice(n.goal)}
          {n.via && n.via !== 'fact' && <em> via {n.via}</em>}
          {n.via === 'fact' && <em> (known fact)</em>}
        </span>
        {n.children?.length > 0 && <ul>{n.children.map((c, i) => render(c, `${key}-${i}`))}</ul>}
      </motion.li>
    );
  };
  return (
    <section className="panel" aria-label="Backward reasoning tree">
      <h3 className="panel-title">Reasoning tree</h3>
      {tree ? <ul className="tree">{render(tree, 'root')}</ul> : <p className="muted">Choose a goal and investigate.</p>}
    </section>
  );
}
