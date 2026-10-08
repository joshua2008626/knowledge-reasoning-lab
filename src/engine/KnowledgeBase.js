import { FactStore } from './FactStore.js';
import { sanitizeRules, validateRule } from './RuleMatcher.js';
import { forwardChain } from './ForwardChaining.js';
import { backwardChain } from './BackwardChaining.js';

// conflicts: pairs such as ['machine_operational', 'machine_failed']
export class KnowledgeBase {
  constructor({ facts = [], rules = [], conflicts = [] } = {}) {
    this.rules = sanitizeRules(rules);
    this.conflicts = conflicts;
    this.store = new FactStore(facts);
  }
  addFact(f) { return this.store.add(f); }
  removeFact(f) { this.store.facts.delete(FactStore.normalize(f)); }
  addRule(rule) {
    const errors = validateRule(rule);
    if (!errors.length && this.rules.some((r) => r.id === rule.id)) errors.push(`Rule id ${rule.id} already exists.`);
    if (errors.length) return { ok: false, errors };
    this.rules.push(...sanitizeRules([rule]));
    return { ok: true, errors: [] };
  }
  removeRule(id) { this.rules = this.rules.filter((r) => r.id !== id); }
  findContradictions() {
    return this.conflicts.filter(([a, b]) => this.store.has(a) && this.store.has(b));
  }
  forward(goal = null) { return forwardChain(this.store.given(), this.rules, goal); }
  backward(goal) { return backwardChain(goal, this.store.given(), this.rules); }
}
