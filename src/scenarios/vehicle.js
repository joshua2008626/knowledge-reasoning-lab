// Autonomous Vehicle scenario
export const vehicle = {
  id: 'vehicle',
  title: 'Autonomous Vehicle',
  icon: '🚗',
  question: 'Can the AI make the correct driving decision?',
  initialState: { light: 'green', pedestrian: false, obstacle: false, vehicleAhead: false, distance: 'far', road: 'clear' },
  // Sensor readings -> facts. The decision itself comes ONLY from the inference engine.
  toFacts: (s) => {
    const f = [`light_${s.light}`];
    f.push(s.pedestrian && s.distance === 'near' ? 'pedestrian_near' : s.pedestrian ? 'pedestrian_far' : 'no_pedestrian');
    f.push(s.obstacle && s.distance === 'near' ? 'obstacle_near' : s.obstacle ? 'obstacle_far' : 'no_obstacle');
    if (s.vehicleAhead) f.push('vehicle_ahead');
    if (s.distance === 'near') f.push('distance_near');
    f.push(s.road === 'clear' ? 'road_clear' : 'road_blocked');
    return f;
  },
  rules: [
    { id: 'R1', if: ['light_red'], then: 'stop_vehicle', explain: 'A red light means stop.' },
    { id: 'R2', if: ['pedestrian_near'], then: 'emergency_stop', explain: 'A pedestrian that is near triggers an emergency stop.' },
    { id: 'R3', if: ['obstacle_near'], then: 'emergency_stop', explain: 'A near obstacle triggers an emergency stop.' },
    { id: 'R4', if: ['light_green', 'road_clear', 'no_pedestrian'], then: 'move_vehicle', explain: 'Green light, clear road and no pedestrian: move.' },
    { id: 'R5', if: ['vehicle_ahead', 'distance_near'], then: 'slow_down', explain: 'A vehicle too close ahead means slow down.' },
    { id: 'R6', if: ['no_obstacle', 'light_green'], then: 'proceed', explain: 'No obstacle and green light: proceed.' },
    { id: 'R7', if: ['light_yellow'], then: 'prepare_to_stop', explain: 'Yellow light: prepare to stop.' },
    { id: 'R8', if: ['road_blocked'], then: 'stop_vehicle', explain: 'A blocked road means stop.' },
  ],
  // When several rules fire the highest-priority action wins (conflict resolution)
  priority: ['emergency_stop', 'stop_vehicle', 'prepare_to_stop', 'slow_down', 'move_vehicle', 'proceed'],
  conflicts: [],
  goals: ['emergency_stop', 'stop_vehicle', 'move_vehicle', 'slow_down', 'proceed'],
  challenges: [
    { id: 'veh-1', level: 'Beginner', state: { light: 'red' }, expect: 'stop_vehicle', prompt: 'The traffic light is red.' },
    { id: 'veh-2', level: 'Beginner', state: { light: 'green', pedestrian: true, distance: 'near' }, expect: 'emergency_stop', prompt: 'A pedestrian suddenly appears.' },
    { id: 'veh-3', level: 'Intermediate', state: { light: 'green' }, expect: 'move_vehicle', prompt: 'Green light, clear road, no pedestrian.' },
    { id: 'veh-4', level: 'Intermediate', state: { light: 'green', vehicleAhead: true, distance: 'near' }, expect: 'slow_down', prompt: 'The vehicle ahead is too close.' },
    { id: 'veh-5', level: 'Advanced', state: { light: 'red', obstacle: true, distance: 'near' }, expect: 'emergency_stop', prompt: 'Red light AND a near obstacle. Which action has priority?' },
    { id: 'veh-6', level: 'Expert', state: { light: 'green', road: 'blocked', vehicleAhead: true, distance: 'near' }, expect: 'stop_vehicle', prompt: 'Green light, but the road is blocked and a car is close.' },
  ],
};
export function decide(derivedAndGiven, priority) {
  return priority.find((a) => derivedAndGiven.includes(a)) || 'no_action';
}
