import React from 'react';
import { explainEvent } from '../utils/explain.js';

export default function ExplanationPanel({ current, rules, conclusion }) {
  return (
    <section aria-label="AI explanation" aria-live="polite" className="panel explain">
      <h3 className="panel-title">Why did the AI do that?</h3>
      <p className="explain-now">{explainEvent(current, rules)}</p>
      {conclusion && <p className="conclusion"><strong>Conclusion:</strong> {conclusion}</p>}
    </section>
  );
}
