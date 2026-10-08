import assert from 'node:assert/strict';
import { KnowledgeBase, forwardChain, backwardChain } from './index.js';
import { medical, vehicle, manufacturing, decide } from '../scenarios/index.js';

const fwd = (rules, facts, goal) => forwardChain(facts, rules, goal);
let n = 0; const ok = (name, fn) => { fn(); n++; console.log('ok -', name); };

ok('medical forward: flu chain', () => {
  const r = fwd(medical.rules, ['fever', 'cough', 'fatigue', 'sore_throat']);
  assert.deepEqual(r.fired.slice(0, 2), ['R1', 'R2']);
  assert(r.derived.includes('possible_flu') && r.derived.includes('advise_rest') && r.derived.includes('throat_infection'));
  assert(r.events.some((e) => e.type === 'RULE_FIRED' && e.rule === 'R1'));
  assert(!r.derived.includes('possible_measles'));
});
ok('medical forward: no applicable rule', () => {
  const r = fwd(medical.rules, ['headache']);
  assert.equal(r.fired.length, 0);
  assert(r.events.some((e) => e.type === 'NO_MORE_INFERENCES' && e.reason === 'No applicable rule found.'));
});
ok('medical backward: proven', () => {
  const r = backwardChain('possible_flu', ['fever', 'cough', 'sore_throat'], medical.rules);
  assert(r.proven && r.tree.via === 'R2');
  assert(r.events.at(-1).type === 'GOAL_PROVEN');
});
ok('medical backward: failed + backtrack', () => {
  const r = backwardChain('possible_flu', ['fever', 'cough'], medical.rules);
  assert(!r.proven && r.stats.backtracks > 0 && r.events.at(-1).type === 'GOAL_FAILED');
});
ok('backward: empty goal and unknown goal do not crash', () => {
  assert(!backwardChain('', [], medical.rules).proven);
  assert(!backwardChain('nonsense', ['fever'], medical.rules).proven);
});
ok('vehicle decisions via engine', () => {
  for (const c of vehicle.challenges) {
    const s = { ...vehicle.initialState, ...c.state };
    const r = forwardChain(vehicle.toFacts(s), vehicle.rules);
    assert.equal(decide(r.facts, vehicle.priority), c.expect, c.id);
  }
});
ok('manufacturing chain A critical', () => {
  const s = { ...manufacturing.initialState, tempA: 'critical' };
  const r = forwardChain(manufacturing.toFacts(s), manufacturing.rules);
  for (const f of ['stop_machine_A', 'activate_cooling', 'machine_A_stopped', 'switch_production_to_B', 'continue_production'])
    assert(r.facts.includes(f), f);
});
ok('manufacturing contradiction + backward halt', () => {
  const kb = new KnowledgeBase({ facts: ['machine_B_operational', 'machine_B_failed'], rules: manufacturing.rules, conflicts: manufacturing.conflicts });
  assert.equal(kb.findContradictions().length, 1);
  const r = backwardChain('halt_factory', ['machine_A_overheating', 'machine_B_overheating'], manufacturing.rules);
  assert(r.proven);
});
ok('custom KB + cycle safety + malformed rules ignored', () => {
  const kb = new KnowledgeBase({ facts: ['a'], rules: [{ id: 'X1', if: ['b'], then: 'c' }, { id: 'X2', if: ['c'], then: 'b' }, { id: 'bad', if: [], then: '' }, null] });
  assert.equal(kb.rules.length, 2);
  assert(!kb.backward('c').proven);
  assert(!kb.addRule({ id: 'X3', if: ['a'], then: '' }).ok);
  assert(kb.addRule({ id: 'X3', if: ['a'], then: 'd' }).ok && kb.forward('d').goalReached);
});
console.log(`\n${n} tests passed`);
