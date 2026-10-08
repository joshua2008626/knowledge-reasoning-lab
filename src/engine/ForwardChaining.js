import { FactStore } from './FactStore.js';
import { matchRule } from './RuleMatcher.js';

/**
 * Real forward chaining. Returns { events, facts, derived, fired, stats, goalReached }.
 * Events are produced by the actual algorithm; the UI only replays them.
 */
export function forwardChain(initialFacts, rules, goal = null) {
  const store = new FactStore(initialFacts);
  const goalFact = goal ? FactStore.normalize(goal) : null;
  const events = [];
  const fired = [];
  const stats = { rulesChecked: 0, rulesFired: 0, passes: 0, maxDepth: 0 };
  const emit = (type, data = {}) => events.push({ type, step: events.length + 1, ...data });

  store.list().forEach((f) => emit('FACT_FOUND', { fact: f }));
  if (goalFact && store.has(goalFact)) {
    emit('GOAL_REACHED', { fact: goalFact });
    emit('INFERENCE_COMPLETE', { goalReached: true });
    return finish(true);
  }

  let progress = true;
  let goalReached = false;
  while (progress && !goalReached) {
    progress = false;
    stats.passes += 1;
    for (const rule of rules) {
      if (store.has(rule.then)) continue; // conclusion already known
      stats.rulesChecked += 1;
      emit('RULE_CHECKED', { rule: rule.id, pass: stats.passes });
      const m = matchRule(rule, store);
      if (!m.matched) {
        emit('RULE_NOT_SATISFIED', { rule: rule.id, satisfied: m.satisfied, missing: m.missing });
        continue;
      }
      emit('RULE_MATCHED', { rule: rule.id, premises: rule.if });
      const depth = 1 + Math.max(...rule.if.map((c) => store.get(c)?.depth ?? 0));
      emit('RULE_FIRED', { rule: rule.id, premises: rule.if, conclusion: rule.then });
      store.add(rule.then, { origin: 'derived', by: rule.id, depth, from: [...rule.if] });
      fired.push(rule.id);
      stats.rulesFired += 1;
      stats.maxDepth = Math.max(stats.maxDepth, depth);
      emit('FACT_DERIVED', { fact: rule.then, by: rule.id, depth });
      progress = true;
      if (goalFact && rule.then === goalFact) {
        emit('GOAL_REACHED', { fact: goalFact, by: rule.id });
        goalReached = true;
        break;
      }
    }
  }
  if (!goalReached) {
    emit('NO_MORE_INFERENCES', {
      reason: stats.rulesFired === 0 ? 'No applicable rule found.' : 'No remaining rule can add a new fact.',
    });
  }
  emit('INFERENCE_COMPLETE', { goalReached });
  return finish(goalReached);

  function finish(reached) {
    return {
      events,
      facts: store.list(),
      given: store.given(),
      derived: store.derived(),
      store,
      fired,
      stats: { ...stats, factsKnown: store.list().length, factsDerived: store.derived().length },
      goalReached: reached,
    };
  }
}
