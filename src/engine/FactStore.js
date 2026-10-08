// FactStore: a set of known facts, remembering HOW each was learned.
export class FactStore {
  constructor(initial = []) {
    this.facts = new Map(); // fact -> { origin: 'given' | 'derived', by?: ruleId, depth }
    initial.forEach((f) => this.add(f, { origin: 'given', depth: 0 }));
  }
  static normalize(f) {
    return typeof f === 'string' ? f.trim().replace(/\s+/g, '_') : '';
  }
  has(f) { return this.facts.has(FactStore.normalize(f)); }
  add(f, meta = { origin: 'given', depth: 0 }) {
    const n = FactStore.normalize(f);
    if (!n || this.facts.has(n)) return false;
    this.facts.set(n, meta);
    return true;
  }
  get(f) { return this.facts.get(FactStore.normalize(f)); }
  list() { return [...this.facts.keys()]; }
  given() { return this.list().filter((f) => this.facts.get(f).origin === 'given'); }
  derived() { return this.list().filter((f) => this.facts.get(f).origin === 'derived'); }
  clone() {
    const c = new FactStore();
    this.facts.forEach((m, f) => c.facts.set(f, { ...m }));
    return c;
  }
}
