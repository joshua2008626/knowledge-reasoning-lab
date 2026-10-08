// Industrial Manufacturing scenario
export const manufacturing = {
  id: 'manufacturing',
  title: 'Industrial Manufacturing',
  icon: '🏭',
  question: 'Can the factory detect problems and respond?',
  initialState: { tempA: 'normal', machineB: 'operational', bOverheating: false, production: 'running' },
  tempLevels: ['normal', 'warm', 'high', 'critical'],
  toFacts: (s) => {
    const f = [];
    if (s.tempA === 'high' || s.tempA === 'critical') f.push('temperature_high');
    if (s.tempA === 'critical') f.push('machine_A_overheating');
    f.push(`machine_B_${s.machineB}`);
    if (s.bOverheating) f.push('machine_B_overheating');
    if (s.production === 'running') f.push('production_active');
    return f;
  },
  rules: [
    { id: 'R1', if: ['machine_A_overheating'], then: 'stop_machine_A', explain: 'An overheating Machine A must be stopped.' },
    { id: 'R2', if: ['machine_A_overheating', 'temperature_high'], then: 'activate_cooling', explain: 'Overheating plus high temperature activates cooling.' },
    { id: 'R3', if: ['machine_A_stopped', 'machine_B_operational'], then: 'switch_production_to_B', explain: 'A stopped, B healthy: move production to B.' },
    { id: 'R4', if: ['production_active', 'machine_B_operational'], then: 'continue_production', explain: 'Production is active and B works: continue.' },
    { id: 'R5', if: ['machine_B_overheating'], then: 'stop_machine_B', explain: 'An overheating Machine B must be stopped.' },
    { id: 'R6', if: ['stop_machine_A'], then: 'machine_A_stopped', explain: 'Stopping Machine A makes it stopped.' },
    { id: 'R7', if: ['stop_machine_B'], then: 'machine_B_stopped', explain: 'Stopping Machine B makes it stopped.' },
    { id: 'R8', if: ['machine_A_stopped', 'machine_B_stopped'], then: 'halt_factory', explain: 'Both machines stopped: halt the factory safely.' },
    { id: 'R9', if: ['machine_B_failed'], then: 'call_maintenance', explain: 'A failed machine calls maintenance.' },
  ],
  conflicts: [['machine_B_operational', 'machine_B_failed'], ['machine_B_operational', 'machine_B_maintenance']],
  goals: ['stop_machine_A', 'activate_cooling', 'switch_production_to_B', 'continue_production', 'halt_factory'],
  challenges: [
    { id: 'man-1', level: 'Beginner', facts: ['machine_A_overheating'], goal: 'stop_machine_A', mode: 'forward', prompt: 'Machine A overheats. What happens first?' },
    { id: 'man-2', level: 'Intermediate', facts: ['machine_A_overheating', 'temperature_high'], goal: 'activate_cooling', mode: 'forward', prompt: 'Which action reduces the temperature?' },
    { id: 'man-3', level: 'Advanced', facts: ['machine_A_overheating', 'temperature_high', 'machine_B_operational', 'production_active'], goal: 'switch_production_to_B', mode: 'backward', prompt: 'Prove production switches to B.' },
    { id: 'man-4', level: 'Expert', facts: ['machine_A_overheating', 'machine_B_overheating', 'temperature_high'], goal: 'halt_factory', mode: 'backward', prompt: 'Both machines overheat. Prove the factory halts.' },
  ],
};
