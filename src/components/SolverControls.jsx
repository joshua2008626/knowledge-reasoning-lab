import React from 'react';
import { Play, Pause, SkipForward, RotateCcw, FastForward } from 'lucide-react';

export default function SolverControls({ replay, stats = [] }) {
  const { playing, play, pause, next, restart, finish, speed, setSpeed, index, total } = replay;
  return (
    <section aria-label="Solver controls" className="panel">
      <div className="controls">
        <button className="btn primary" onClick={playing ? pause : play} disabled={!total} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={16} /> : <Play size={16} />} {playing ? 'Pause' : 'Play'}
        </button>
        <button className="btn" onClick={next} disabled={!total || index >= total} aria-label="Next step"><SkipForward size={16} /> Next</button>
        <button className="btn" onClick={finish} disabled={!total} aria-label="Skip to end"><FastForward size={16} /> End</button>
        <button className="btn" onClick={restart} disabled={!total} aria-label="Restart"><RotateCcw size={16} /> Restart</button>
        <label className="speed">Speed
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Playback speed">
            <option value={0.5}>0.5x</option><option value={1}>1x</option><option value={2}>2x</option>
          </select>
        </label>
      </div>
      <dl className="stats">
        <div><dt>Step</dt><dd>{index}/{total}</dd></div>
        {stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </section>
  );
}
