import { FactStore } from './FactStore.js';
import { rulesConcluding } from './RuleMatcher.js';

/**
 * Real backward chaining (depth-first, cycle protection, memoisation).
 * Returns { proven, events, tree, stats }.
 * tree node: { goal, status: 'proven'|'failed', via: 'fact'|ruleId|null, children: [], depth }
 */
export function backwardChain(goal, initialFacts, rules) {
  const facts = new FactStore(initialFacts);
  const events = [];
  const stats = { backtracks: 0, subgoals: 0, factsFound: 0, rulesTried: 0 };
  const proven = new Map();
  const failed = new Set();
  const emit = (type, data = {}) => events.push({ type, step: events.length + 1, ...data });
  const g0 = FactStore.normalize(goal);

  if (!g0) {
    emit('GOAL_FAILED', { goal: '', reason: 'No goal selected.' });
    return { proven: false, events, tree: null, stats, error: 'No goal selected.' };
  }
  emit('GOAL_SELECTED', { goal: g0 });
  const tree = prove(g0, [], 0);
  emit(tree.status === 'proven' ? 'GOAL_PROVEN' : 'GOAL_FAILED', { goal: g0, reason: tree.reason });
  return { proven: tree.status === 'proven', events, tree, stats };

  function prove(goal, stack, depth) {
    const node = { goal, status: 'failed', via: null, children: [], depth };
    if (facts.has(goal)) {
      stats.factsFound += 1;
      emit('FACT_PROVEN', { goal, depth });
      return { ...node, status: 'proven', via: 'fact' };
    }
    if (proven.has(goal)) { emit('SUBGOAL_PROVEN', { goal, depth, cached: true }); return proven.get(goal); }
    if (failed.has(goal)) { node.reason = 'Already known to be unprovable.'; return node; }
    if (stack.includes(goal)) {
      node.reason = 'Circular dependency.';
      stats.backtracks += 1;
      emit('BACKTRACK', { goal, depth, reason: node.reason });
      return node;
    }
    emit('SEARCHING_RULES', { goal, depth });
    const candidates = rulesConcluding(goal, rules);
    if (candidates.length === 0) {
      node.reason = 'No fact or rule supports this goal.';
      stats.backtracks += 1;
      emit('BACKTRACK', { goal, depth, reason: node.reason });
      failed.add(goal);
      return node;
    }
    for (const rule of candidates) {
      stats.rulesTried += 1;
      emit('RULE_SELECTED', { goal, rule: rule.id, premises: rule.if, depth });
      const children = [];
      let ok = true;
      for (const sub of rule.if) {
        stats.subgoals += 1;
        emit('SUBGOAL_CREATED', { goal: sub, parent: goal, rule: rule.id, depth: depth + 1 });
        const child = prove(sub, [...stack, goal], depth + 1);
        children.push(child);
        if (child.status !== 'proven') {
          ok = false;
          stats.backtracks += 1;
          emit('BACKTRACK', { goal: sub, rule: rule.id, depth: depth + 1, reason: `Cannot prove ${sub}, so ${rule.id} fails.` });
          break;
        }
        emit('SUBGOAL_PROVEN', { goal: sub, depth: depth + 1 });
      }
      if (ok) {
        const done = { goal, status: 'proven', via: rule.id, children, depth };
        proven.set(goal, done);
        return done;
      }
      node.children.push(...children);
    }
    node.reason = `No rule for ${goal} could be fully proven.`;
    failed.add(goal);
    return node;
  }
}
