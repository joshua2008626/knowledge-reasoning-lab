import React from 'react';
import { NavLink, Route, Routes, Link } from 'react-router-dom';
import { Sun, Moon, FlaskConical } from 'lucide-react';
import { LabProvider, useLab } from './hooks/useLab.jsx';
import Home from './pages/Home.jsx';
import Learn from './pages/Learn.jsx';
import KnowledgeBuilder from './pages/KnowledgeBuilder.jsx';
import LabMode from './pages/LabMode.jsx';
import Viva from './pages/Viva.jsx';
import Progress from './pages/Progress.jsx';
import Medical from './pages/Medical.jsx';
import Vehicle from './pages/Vehicle.jsx';
import Manufacturing from './pages/Manufacturing.jsx';

const NAV = [
  ['/', 'Home'], ['/learn', 'Learn'], ['/medical', 'Medical'], ['/vehicle', 'Vehicle'],
  ['/factory', 'Factory'], ['/builder', 'Builder'], ['/viva', 'Viva'], ['/lab', 'Lab Mode'], ['/progress', 'Progress'],
];

function Shell() {
  const { state, toggleTheme } = useLab();
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <header className="topbar">
        <Link to="/" className="brand"><FlaskConical size={20} aria-hidden="true" /> Knowledge Reasoning Lab</Link>
        <nav aria-label="Main">
          {NAV.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav ${isActive ? 'on' : ''}`}>{label}</NavLink>)}
        </nav>
        <span className="xp" aria-label={`${state.xp} experience points`}>{state.xp} XP</span>
        <button className="btn icon" onClick={toggleTheme} aria-label={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} theme`}>
          {state.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/medical" element={<Medical />} />
          <Route path="/vehicle" element={<Vehicle />} />
          <Route path="/factory" element={<Manufacturing />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/builder" element={<KnowledgeBuilder />} />
          <Route path="/lab" element={<LabMode />} />
          <Route path="/viva" element={<Viva />} />
          <Route path="*" element={<section className="page"><h2>Coming up</h2><p className="muted">This page is part of a later build phase.</p></section>} />
        </Routes>
      </main>
    </>
  );
}
export default function App() { return <LabProvider><Shell /></LabProvider>; }
