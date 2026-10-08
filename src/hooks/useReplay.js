import { useState, useEffect, useRef, useCallback } from 'react';

// Replays the REAL events produced by the engine, one at a time.
export function useReplay(events, { instant = false } = {}) {
  const [index, setIndex] = useState(0); // number of events revealed
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const total = events?.length || 0;
  const timer = useRef(null);

  useEffect(() => { setIndex(instant ? (events?.length || 0) : 0); setPlaying(false); }, [events]); // eslint-disable-line
  useEffect(() => {
    clearTimeout(timer.current);
    if (!playing) return undefined;
    if (index >= total) { setPlaying(false); return undefined; }
    timer.current = setTimeout(() => setIndex((i) => Math.min(i + 1, total)), 700 / speed);
    return () => clearTimeout(timer.current);
  }, [playing, index, total, speed]);

  const play = useCallback(() => { if (total) { setIndex((i) => (i >= total ? 0 : i)); setPlaying(true); } }, [total]);
  const pause = useCallback(() => setPlaying(false), []);
  const next = useCallback(() => { setPlaying(false); setIndex((i) => Math.min(i + 1, total)); }, [total]);
  const restart = useCallback(() => { setPlaying(false); setIndex(0); }, []);
  const finish = useCallback(() => { setPlaying(false); setIndex(total); }, [total]);
  const idx = Math.min(index, total); // never read past the current run (stale index after a mode switch)
  return { index: idx, total, playing, speed, setSpeed, play, pause, next, restart, finish,
    visible: (events || []).slice(0, idx), current: idx > 0 ? events[idx - 1] : null, done: total > 0 && idx >= total };
}
