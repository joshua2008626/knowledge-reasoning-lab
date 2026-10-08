import React from 'react';
import { useLab } from '../hooks/useLab.jsx';
import { ACHIEVEMENTS, SCENARIOS, totalChallenges } from '../utils/achievements.js';

const Bar = ({ label, pct }) => (
  <div className="barrow"><span>{label}</span><div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}><i style={{ width: `${pct}%` }} /></div><b>{pct}%</b></div>
);

export default function Progress() {
  const { state, reset } = useLab();
  const done = Object.values(state.completed);
  const pct = (n, d) => (d ? Math.round((100 * n) / d) : 0);
  const byMode = (m) => {
    const all = Object.values(SCENARIOS).flatMap((s) => s.challenges.filter((c) => (c.mode || 'forward') === m));
    return pct(all.filter((c) => state.completed[c.id]).length, all.length);
  };
  const avg = done.length ? Math.round(done.reduce((a, c) => a + c.score, 0) / done.length) : 0;
  const fin = (v) => (Number.isFinite(v) ? v : '-');
  return (
    <div className="page">
      <h1>Progress</h1>
      <div className="cards">
        <div className="card"><h2>{state.xp}</h2><p>Total XP</p></div>
        <div className="card"><h2>{done.length}/{totalChallenges()}</h2><p>Challenges completed</p></div>
        <div className="card"><h2>{avg}</h2><p>Average score</p></div>
        <div className="card"><h2>{fin(state.best.score)}</h2><p>Best score</p></div>
      </div>
      <section className="panel"><h3 className="panel-title">Knowledge mastery</h3>
        <Bar label="Forward chaining" pct={byMode('forward')} /><Bar label="Backward chaining" pct={byMode('backward')} />
        {Object.values(SCENARIOS).map((s) => <Bar key={s.id} label={s.title} pct={pct(s.challenges.filter((c) => state.completed[c.id]).length, s.challenges.length)} />)}
      </section>
      <section className="panel"><h3 className="panel-title">Personal best</h3>
        <p>Best score: <b>{fin(state.best.score)}</b> · Fastest solve: <b>{Number.isFinite(state.best.time) ? `${state.best.time}s` : '-'}</b> · Fewest mistakes: <b>{fin(state.best.mistakes)}</b></p></section>
      <section className="panel"><h3 className="panel-title">Achievements</h3>
        <ul className="achs">{ACHIEVEMENTS.map((a) => { const on = state.achievements.includes(a.id); return <li key={a.id} className={`ach-card ${on ? 'on' : ''}`}><span aria-hidden="true">{a.icon}</span><div><b>{a.name}</b> {on ? '✓ Unlocked' : '🔒 Locked'}<br /><span className="small muted">{a.desc}</span></div></li>; })}</ul></section>
      <button className="btn" onClick={() => { if (window.confirm('Reset all progress?')) reset(); }}>Reset progress</button>
    </div>
  );
}
