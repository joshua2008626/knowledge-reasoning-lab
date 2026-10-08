import React, { useEffect, useRef } from 'react';
import { EVENT_META } from '../utils/explain.js';

export default function InferenceTimeline({ events }) {
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView?.({ block: 'nearest' }); }, [events.length]);
  return (
    <section aria-label="Inference timeline" className="panel">
      <h3 className="panel-title">Inference timeline</h3>
      <ol className="timeline">
        {events.length === 0 && <li className="muted">No reasoning yet.</li>}
        {events.map((e) => {
          const m = EVENT_META[e.type] || { icon: '•', label: e.type };
          const detail = e.rule || e.fact || e.goal || '';
          return (
            <li key={e.step} className={`tl tl-${e.type}`}>
              <span className="tl-dot" aria-hidden="true">{m.icon}</span>
              <span className="tl-label">{m.label}</span>
              <span className="tl-detail">{String(detail).replace(/_/g, ' ')}</span>
            </li>
          );
        })}
        <li ref={end} aria-hidden="true" />
      </ol>
    </section>
  );
}
