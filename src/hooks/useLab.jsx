import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadState, saveState } from '../utils/storage.js';
import { ACHIEVEMENTS } from '../utils/achievements.js';

const Ctx = createContext(null);
export function LabProvider({ children }) {
  const [state, setState] = useState(loadState);
  useEffect(() => {
    saveState(state);
    document.documentElement.dataset.theme = state.theme;
  }, [state]);
  const update = useCallback((fn) => setState((s) => fn(s)), []);
  const toggleTheme = () => update((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
  const award = (xp) => update((s) => ({ ...s, xp: s.xp + xp }));
  // Records a finished challenge, XP, bests and achievements. Returns newly unlocked achievements.
  const complete = (scn, c, r) => {
    const prev = state.completed[c.id];
    const gained = Math.max(0, r.score - (prev?.score || 0)) + (prev ? 0 : 20);
    const rec = { score: Math.max(r.score, prev?.score || 0), time: Math.min(r.time, prev?.time ?? Infinity), wrong: Math.min(r.wrong, prev?.wrong ?? Infinity), hints: r.hints, mode: c.mode || 'forward', scn };
    const ns = { ...state, xp: state.xp + gained, completed: { ...state.completed, [c.id]: rec },
      best: { score: Math.max(state.best.score || 0, r.score), time: Math.min(state.best.time ?? Infinity, r.time), mistakes: Math.min(state.best.mistakes ?? Infinity, r.wrong) },
      stats: { rulesFired: state.stats.rulesFired + (r.fired || 0), hints: state.stats.hints + r.hints, wrong: state.stats.wrong + r.wrong } };
    const unlocked = ACHIEVEMENTS.filter((a) => !ns.achievements.includes(a.id) && a.check(ns));
    ns.achievements = [...ns.achievements, ...unlocked.map((a) => a.id)];
    ns.xp += unlocked.length * 50;
    setState(ns);
    return unlocked;
  };
  const markBuilt = () => {
    if (state.builtKB) return [];
    const ns = { ...state, builtKB: true, xp: state.xp + 60 };
    const unlocked = ACHIEVEMENTS.filter((a) => !ns.achievements.includes(a.id) && a.check(ns));
    ns.achievements = [...ns.achievements, ...unlocked.map((a) => a.id)];
    setState(ns);
    return unlocked;
  };
  const reset = () => setState((s) => ({ ...loadState.defaults, theme: s.theme }));
  return <Ctx.Provider value={{ state, update, toggleTheme, award, complete, markBuilt, reset }}>{children}</Ctx.Provider>;
}
export const useLab = () => useContext(Ctx);
