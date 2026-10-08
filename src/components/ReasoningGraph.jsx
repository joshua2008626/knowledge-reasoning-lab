import React, { useMemo } from 'react';

const nice = (s) => s.replace(/_/g, ' ');
const COL = 150, ROW = 44, FW = 132, FH = 28;

// Static layout computed from the rules; live status comes from real engine events.
function layout(rules) {
  const concl = new Map();
  rules.forEach((r) => { if (!concl.has(r.then)) concl.set(r.then, []); concl.get(r.then).push(r); });
  const memo = new Map();
  const lvl = (f, stack = []) => {
    if (memo.has(f)) return memo.get(f);
    if (stack.includes(f)) return 0;
    const rs = concl.get(f) || [];
    const l = rs.length ? 1 + Math.max(...rs.map((r) => Math.max(...r.if.map((c) => lvl(c, [...stack, f]))))) : 0;
    memo.set(f, l);
    return l;
  };
  const facts = [...new Set(rules.flatMap((r) => [...r.if, r.then]))];
  const cols = new Map();
  const place = (id, col) => { if (!cols.has(col)) cols.set(col, []); cols.get(col).push(id); };
  facts.forEach((f) => place(`f:${f}`, 2 * lvl(f)));
  rules.forEach((r) => place(`r:${r.id}`, 2 * Math.max(...r.if.map((c) => lvl(c))) + 1));
  const pos = {};
  let maxRows = 1, maxCol = 0;
  cols.forEach((ids, c) => { maxCol = Math.max(maxCol, c); maxRows = Math.max(maxRows, ids.length); ids.forEach((id, i) => { pos[id] = { x: 12 + c * COL, y: 14 + i * ROW }; }); });
  return { pos, facts, width: 24 + (maxCol + 1) * COL, height: 28 + maxRows * ROW };
}

export default function ReasoningGraph({ rules, visible = [], current = null, known = [], goal = null }) {
  const L = useMemo(() => layout(rules), [rules]);
  const ev = (t) => visible.filter((e) => e.type === t);
  const fired = new Set(ev('RULE_FIRED').map((e) => e.rule));
  const selected = new Set(ev('RULE_SELECTED').map((e) => e.rule));
  const bad = new Set(ev('RULE_NOT_SATISFIED').map((e) => e.rule));
  const derived = new Set(ev('FACT_DERIVED').map((e) => e.fact));
  const proven = new Set([...ev('FACT_PROVEN'), ...ev('SUBGOAL_PROVEN'), ...ev('GOAL_PROVEN')].map((e) => e.goal));
  const failed = new Set(ev('GOAL_FAILED').map((e) => e.goal));
  const knownSet = new Set(known);
  const active = current && ['RULE_CHECKED', 'RULE_MATCHED', 'RULE_SELECTED'].includes(current.type) ? current.rule : null;

  const factState = (f) => (f === goal && proven.has(f) ? 'proven' : derived.has(f) ? 'derived' : proven.has(f) ? 'proven' : failed.has(f) ? 'failed' : knownSet.has(f) ? 'known' : f === goal ? 'goal' : 'idle');
  const ruleState = (id) => (fired.has(id) ? 'fired' : active === id ? 'active' : selected.has(id) ? 'selected' : bad.has(id) ? 'bad' : 'idle');
  const mark = { known: '✓ ', derived: '→ ', proven: '✓ ', failed: '✗ ', goal: '? ', idle: '' };

  return (
    <section className="panel" aria-label="Reasoning graph">
      <h3 className="panel-title">Reasoning graph</h3>
      <div className="graph-wrap"><svg viewBox={`0 0 ${L.width} ${L.height}`} style={{ minWidth: Math.min(L.width, 760) }} className="graph" role="img" aria-label="Graph connecting facts through rules to conclusions">
        {rules.map((r) => {
          const lit = fired.has(r.id) || selected.has(r.id);
          const outLit = fired.has(r.id) || (selected.has(r.id) && proven.has(r.then));
          const rp = L.pos[`r:${r.id}`];
          return (
            <g key={r.id}>
              {r.if.map((c) => {
                const p = L.pos[`f:${c}`];
                return <path key={c} className={`edge ${lit ? 'lit' : ''}`} d={`M${p.x + FW} ${p.y + FH / 2} C${p.x + FW + 20} ${p.y + FH / 2}, ${rp.x - 20} ${rp.y + 13}, ${rp.x} ${rp.y + 13}`} />;
              })}
              {(() => { const p = L.pos[`f:${r.then}`]; return <path className={`edge ${outLit ? 'lit' : ''}`} d={`M${rp.x + 44} ${rp.y + 13} C${rp.x + 64} ${rp.y + 13}, ${p.x - 20} ${p.y + FH / 2}, ${p.x} ${p.y + FH / 2}`} />; })()}
            </g>
          );
        })}
        {L.facts.map((f) => {
          const p = L.pos[`f:${f}`]; const s = factState(f);
          return (
            <g key={f} className={`gnode fact-${s}`} transform={`translate(${p.x},${p.y})`}>
              <rect width={FW} height={FH} rx="8" />
              <text x={FW / 2} y={FH / 2 + 4} textAnchor="middle">{mark[s]}{nice(f).slice(0, 18)}</text>
            </g>
          );
        })}
        {rules.map((r) => {
          const p = L.pos[`r:${r.id}`]; const s = ruleState(r.id);
          return (
            <g key={r.id} className={`gnode rule-${s}`} transform={`translate(${p.x},${p.y})`}>
              <rect width="44" height="26" rx="13" />
              <text x="22" y="17" textAnchor="middle">{s === 'fired' ? '✓' : s === 'bad' ? '✗' : ''}{r.id}</text>
            </g>
          );
        })}
      </svg></div>
      <p className="legend small muted">Rectangles = facts · pills = rules · ✓ known/fired · → derived · ✗ not satisfied/failed</p>
    </section>
  );
}
