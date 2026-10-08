import { medical, vehicle, manufacturing } from '../scenarios/index.js';

export const SCENARIOS = { medical, vehicle, manufacturing };
const done = (s, scn) => SCENARIOS[scn].challenges.every((c) => s.completed[c.id]);
const modes = (s, m) => Object.values(s.completed).some((c) => c.mode === m);

export const ACHIEVEMENTS = [
  { id: 'first', icon: '🧠', name: 'First Inference', desc: 'Perform your first successful inference.', check: (s) => Object.keys(s.completed).length >= 1 },
  { id: 'rule_master', icon: '🔥', name: 'Rule Master', desc: 'Fire 10 rules correctly.', check: (s) => s.stats.rulesFired >= 10 },
  { id: 'forward', icon: '🔍', name: 'Forward Thinker', desc: 'Complete a forward-chaining challenge.', check: (s) => modes(s, 'forward') },
  { id: 'goal', icon: '🎯', name: 'Goal Hunter', desc: 'Complete a backward-chaining challenge.', check: (s) => modes(s, 'backward') },
  { id: 'diag', icon: '🏥', name: 'Diagnostic Reasoner', desc: 'Complete Medical Diagnosis.', check: (s) => done(s, 'medical') },
  { id: 'auto', icon: '🚗', name: 'Autonomous Mind', desc: 'Complete Autonomous Vehicle.', check: (s) => done(s, 'vehicle') },
  { id: 'factory', icon: '🏭', name: 'Factory Brain', desc: 'Complete Industrial Manufacturing.', check: (s) => done(s, 'manufacturing') },
  { id: 'architect', icon: '🏗️', name: 'Knowledge Architect', desc: 'Build your own Knowledge Base.', check: (s) => !!s.builtKB },
  { id: 'master', icon: '🏆', name: 'Reasoning Master', desc: 'Complete all scenarios.', check: (s) => ['medical', 'vehicle', 'manufacturing'].every((k) => done(s, k)) },
];
export const totalChallenges = () => Object.values(SCENARIOS).reduce((n, s) => n + s.challenges.length, 0);
