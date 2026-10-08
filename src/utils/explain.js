const nice = (s) => String(s || '').replace(/_/g, ' ');
// Turns a REAL engine event into plain-language text.
export function explainEvent(e, rules = []) {
  if (!e) return 'Press Play or Next step to watch the AI reason.';
  const rule = rules.find((r) => r.id === e.rule);
  switch (e.type) {
    case 'FACT_FOUND': return `The Knowledge Base already knows "${nice(e.fact)}".`;
    case 'RULE_CHECKED': return `Checking ${e.rule}: are all of its IF conditions known facts?`;
    case 'RULE_NOT_SATISFIED': return `${e.rule} is NOT SATISFIED. Missing: ${e.missing.map(nice).join(', ')}.`;
    case 'RULE_MATCHED': return `${e.rule} matches because ${e.premises.map(nice).join(' and ')} ${e.premises.length > 1 ? 'are' : 'is'} known.`;
    case 'RULE_FIRED': return `${e.rule} FIRED${rule?.explain ? `. ${rule.explain}` : ''}`;
    case 'FACT_DERIVED': return `New fact derived: "${nice(e.fact)}". The system now checks whether it enables another rule.`;
    case 'GOAL_REACHED': return `Goal reached: "${nice(e.fact)}" is now known.`;
    case 'NO_MORE_INFERENCES': return `${e.reason} Nothing more can be concluded from the current facts.`;
    case 'GOAL_SELECTED': return `The current goal is "${nice(e.goal)}".`;
    case 'SEARCHING_RULES': return `Searching for rules that can conclude "${nice(e.goal)}".`;
    case 'RULE_SELECTED': return `${e.rule} can produce "${nice(e.goal)}". Therefore the system must prove ${e.premises.map(nice).join(' and ')}.`;
    case 'SUBGOAL_CREATED': return `New sub-goal: prove "${nice(e.goal)}" (needed by ${e.rule}).`;
    case 'FACT_PROVEN': return `"${nice(e.goal)}" is a known fact, so this sub-goal is satisfied.`;
    case 'SUBGOAL_PROVEN': return `Sub-goal "${nice(e.goal)}" proven${e.cached ? ' (already proven earlier)' : ''}.`;
    case 'BACKTRACK': return `Backtrack: ${e.reason}`;
    case 'GOAL_PROVEN': return `Goal proven: "${nice(e.goal)}" follows from the facts and rules.`;
    case 'GOAL_FAILED': return `Goal failed: "${nice(e.goal)}" cannot be proven. ${e.reason || ''}`;
    case 'INFERENCE_COMPLETE': return 'Inference complete.';
    default: return nice(e.type);
  }
}
export const EVENT_META = {
  FACT_FOUND: { icon: '●', label: 'Fact found' }, RULE_CHECKED: { icon: '◌', label: 'Rule checked' },
  RULE_NOT_SATISFIED: { icon: '✗', label: 'Not satisfied' }, RULE_MATCHED: { icon: '◉', label: 'Rule matched' },
  RULE_FIRED: { icon: '✓', label: 'Fired' }, FACT_DERIVED: { icon: '→', label: 'New fact' },
  GOAL_REACHED: { icon: '★', label: 'Goal reached' }, NO_MORE_INFERENCES: { icon: '■', label: 'No more inferences' },
  GOAL_SELECTED: { icon: '?', label: 'Goal selected' }, SEARCHING_RULES: { icon: '⌕', label: 'Searching rules' },
  RULE_SELECTED: { icon: '◉', label: 'Rule selected' }, SUBGOAL_CREATED: { icon: '↳', label: 'Sub-goal' },
  FACT_PROVEN: { icon: '✓', label: 'Fact found' }, SUBGOAL_PROVEN: { icon: '✓', label: 'Sub-goal proven' },
  BACKTRACK: { icon: '↩', label: 'Backtrack' }, GOAL_PROVEN: { icon: '★', label: 'Goal proven' },
  GOAL_FAILED: { icon: '✗', label: 'Goal failed' }, INFERENCE_COMPLETE: { icon: '■', label: 'Complete' },
};
