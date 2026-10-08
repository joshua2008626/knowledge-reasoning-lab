import { FactStore } from './FactStore.js';

// A rule: { id, name?, if: string[], then: string, explain?: string }
export function validateRule(rule) {
  const errors = [];
  if (!rule || typeof rule !== 'object') return ['Rule is missing.'];
  if (!rule.id || !String(rule.id).trim()) errors.push('Rule needs an id.');
  const ifs = Array.isArray(rule.if) ? rule.if.map(FactStore.normalize).filter(Boolean) : [];
  if (ifs.length === 0) errors.push('Rule needs at least one IF condition.');
  const then = FactStore.normalize(rule.then);
  if (!then) errors.push('Rule needs a THEN conclusion.');
  if (then && ifs.includes(then)) errors.push('A rule cannot conclude one of its own conditions.');
  return errors;
}

export function sanitizeRules(rules) {
  const seen = new Set();
  return (rules || []).filter((r) => {
    if (validateRule(r).length || seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  }).map((r) => ({ ...r, if: r.if.map(FactStore.normalize), then: FactStore.normalize(r.then) }));
}

// Checks one rule against a FactStore.
export function matchRule(rule, store) {
  const satisfied = rule.if.filter((c) => store.has(c));
  const missing = rule.if.filter((c) => !store.has(c));
  return { matched: missing.length === 0, satisfied, missing };
}

export function rulesConcluding(goal, rules) {
  const g = FactStore.normalize(goal);
  return rules.filter((r) => r.then === g);
}
