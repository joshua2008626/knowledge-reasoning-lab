const KEY = 'krl.v1';
export const DEFAULT = { theme: 'dark', xp: 0, completed: {}, best: {}, achievements: [], stats: { rulesFired: 0, hints: 0, wrong: 0 } };
export function loadState() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...DEFAULT }; }
}
export function saveState(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable: ignore */ }
}
loadState.defaults = DEFAULT;
