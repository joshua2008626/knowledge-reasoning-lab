import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { forwardChain } from '../engine/index.js';
import { medical } from '../scenarios/index.js';

// The hero animation replays a REAL forward-chaining run of the medical rules.
const DEMO = forwardChain(['fever', 'cough', 'sore_throat'], medical.rules, 'possible_flu');
const STAGES = DEMO.events.filter((e) => ['FACT_FOUND', 'RULE_FIRED', 'FACT_DERIVED', 'GOAL_REACHED'].includes(e.type));

export default function Home() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setI(STAGES.length); return undefined; }
    const t = setInterval(() => setI((x) => (x >= STAGES.length + 2 ? 0 : x + 1)), 900);
    return () => clearInterval(t);
  }, []);
  const shown = STAGES.slice(0, i);
  const scenarios = [
    ['/medical', '🏥', 'Medical Diagnosis', 'Can the Knowledge Base identify the condition?'],
    ['/vehicle', '🚗', 'Autonomous Vehicle', 'Can the AI make the correct driving decision?'],
    ['/factory', '🏭', 'Industrial Manufacturing', 'Can the factory detect problems and respond?'],
  ];
  return (
    <div className="page home">
      <section className="hero">
        <div>
          <p className="eyebrow">Interactive AI reasoning lab</p>
          <h1>Knowledge Reasoning Lab</h1>
          <p className="tagline">Give AI the facts. Watch it reason.</p>
          <p className="lead">Explore how intelligent systems use facts, rules, and inference to make decisions.</p>
          <div className="row">
            <Link className="btn primary lg" to="/medical">Enter Lab</Link>
            <Link className="btn lg" to="/learn">Learn how AI reasons</Link>
          </div>
        </div>
        <div className="demo" aria-label="Live reasoning demo" role="img">
          <p className="muted small">Live demo: a real forward-chaining run</p>
          {shown.map((e) => (
            <motion.div key={e.step} className={`demo-row ${e.type}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
              {e.type === 'FACT_FOUND' && <>FACT <b>{e.fact}</b></>}
              {e.type === 'RULE_FIRED' && <>RULE <b>{e.rule}</b> fires: {e.premises.join(' + ')}</>}
              {e.type === 'FACT_DERIVED' && <>NEW FACT <b>{e.fact}</b></>}
              {e.type === 'GOAL_REACHED' && <>CONCLUSION <b>{e.fact}</b></>}
            </motion.div>
          ))}
        </div>
      </section>
      <section className="cards" aria-label="Scenarios">
        {scenarios.map(([to, icon, title, q]) => (
          <Link key={to} to={to} className="card">
            <span className="card-icon" aria-hidden="true">{icon}</span>
            <h2>{title}</h2><p>{q}</p>
            <span className="muted small">Facts · Rules · Forward · Backward</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
