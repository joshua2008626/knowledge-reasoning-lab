import React, { useState } from 'react';
import { useLab } from '../hooks/useLab.jsx';

const Q = [
  ['What is a fact?', ['Something the AI currently knows', 'A rule with no condition', 'A wrong guess', 'A goal'], 0, 'A fact is a statement the Knowledge Base currently holds as true, e.g. fever(patient).'],
  ['What is a rule?', ['A stored fact', 'An IF-THEN statement describing what can be concluded', 'A sensor reading', 'A user interface'], 1, 'A rule has conditions (IF) and a conclusion (THEN).'],
  ['What happens in forward chaining?', ['It starts from a goal', 'It fires rules whose conditions are met and adds new facts', 'It deletes facts', 'It guesses randomly'], 1, 'Forward chaining is data-driven: facts → rules → new facts.'],
  ['What is the starting point of backward chaining?', ['A fact', 'A rule', 'A goal / hypothesis', 'A conclusion already proven'], 2, 'It starts with the goal and works back to the facts.'],
  ['Forward vs backward chaining?', ['Forward is data-driven, backward is goal-driven', 'They are identical', 'Forward uses no rules', 'Backward uses no facts'], 0, 'Forward reasons from facts to conclusions; backward from a goal to supporting facts.'],
  ['When does a rule match?', ['When ANY condition is known', 'When ALL conditions are known facts', 'When its conclusion is false', 'Always'], 1, 'Every IF condition must be satisfied.'],
  ['What is a derived fact?', ['A fact given by the user', 'A fact created by firing a rule', 'A deleted fact', 'A contradiction'], 1, 'Derived facts are produced by inference.'],
  ['In backward chaining, what are a rule’s conditions treated as?', ['Facts', 'Sub-goals', 'Conclusions', 'Errors'], 1, 'They become sub-goals that must be proven.'],
  ['What does backtracking mean?', ['Restarting the computer', 'Abandoning a failed path and trying another rule', 'Deleting the knowledge base', 'Firing a rule twice'], 1, 'When a sub-goal cannot be proven, the engine tries another rule.'],
  ['Facts: machine_operational and machine_failed. What is this?', ['A contradiction in the Knowledge Base', 'A derived fact', 'A goal', 'A rule'], 0, 'The KB holds conflicting facts; the lab highlights it instead of resolving it.'],
  ['Which is a good use of expert systems?', ['Medical, vehicle and manufacturing decisions with explicit rules', 'Only image recognition', 'Only games', 'None'], 0, 'Rule-based systems give transparent, explainable decisions.'],
  ['Why are expert systems explainable?', ['They hide steps', 'You can trace which rules fired and why', 'They are random', 'They use no logic'], 1, 'The inference trace shows each fired rule.'],
];

export default function Viva() {
  const { award } = useLab();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [fin, setFin] = useState(false);
  const q = Q[i];
  const pick = (n) => { if (picked !== null) return; setPicked(n); if (n === q[2]) setScore((s) => s + 1); };
  const next = () => { if (i + 1 >= Q.length) { setFin(true); award(score * 5); } else { setI(i + 1); setPicked(null); } };
  const restart = () => { setI(0); setPicked(null); setScore(0); setFin(false); };
  if (fin) return <div className="page"><h1>Viva complete</h1><p className="lead">Score: {score}/{Q.length} (+{score * 5} XP)</p><button className="btn primary" onClick={restart}>Try again</button></div>;
  return (
    <div className="page">
      <h1>Viva Challenge</h1>
      <section className="panel"><p className="muted small">Question {i + 1} of {Q.length} · Score {score}</p><h2>{q[0]}</h2>
        <div className="opts" role="group">{q[1].map((o, n) => <button key={o} className={`btn opt ${picked === null ? '' : n === q[2] ? 'right' : n === picked ? 'wrongopt' : ''}`} onClick={() => pick(n)} disabled={picked !== null}>{String.fromCharCode(65 + n)}. {o}{picked !== null && n === q[2] ? ' ✓' : picked === n ? ' ✗' : ''}</button>)}</div>
        {picked !== null && <div role="status"><p><b>{picked === q[2] ? '✓ Correct.' : '✗ Not quite.'}</b> {q[3]}</p><button className="btn primary" onClick={next}>{i + 1 >= Q.length ? 'Finish' : 'Next question'}</button></div>}
      </section>
    </div>
  );
}
