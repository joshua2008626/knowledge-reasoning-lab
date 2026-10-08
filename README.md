# Knowledge Reasoning Lab

> **Give AI the facts. Watch it reason.**

An interactive, game-like AI reasoning simulator built for **AI Course-II / AIML practical lab** (Rajalakshmi Engineering College). It turns Knowledge-Based AI into something you can operate: change facts, run a real inference engine, and watch rules fire, new facts appear, and goals get proven.

## CATEGORY 8: academic mapping

Implemented using **Facts, Rules, Forward Chaining, Backward Chaining** (one shared engine):

| Practical | Problem | Facts | Rules | Forward chaining | Backward chaining |
|---|---|---|---|---|---|
| 1 | Medical Diagnosis | symptoms | `R1`-`R7` | yes | yes |
| 2 | Autonomous Vehicle | sensor readings | `R1`-`R8` | yes | yes |
| 3 | Industrial Manufacturing | machine / production states | `R1`-`R9` | yes | yes |

The **Lab Mode** page presents each practical in record format (Aim, Problem Statement, Knowledge Base, Algorithms, Example Input/Output, Result). Its example output is computed live by the engine.

## Features

- Landing page whose hero animation replays a real forward-chaining run
- **Learn** (10 basics, interactive mini demo, forward-vs-backward comparison on identical data)
- Three scenario labs, each with the persistent 3-part layout: *Simulation | Knowledge Base + Graph | Explanation*
  - Medical: symptom toggles become facts (educational toy rules, not medical advice)
  - Vehicle: SVG road simulation, the decision comes only from the inference engine (conflict resolution by action priority)
  - Factory: SVG smart factory that reacts to derived facts (stop, cooling, production switch, halt); contradiction demo
- Forward chaining controls: Play / Pause / Next / End / Restart, 0.5x-2x speed, live counters
- Backward chaining: goal selection, animated proof tree, sub-goals, backtracks, status
- Reasoning graph (facts, rules, derived facts; animated edges), inference timeline, dynamic plain-language explanation panel
- Reasoning challenges (4 levels per scenario, predict the AI's conclusion), hints (-20 each), scoring, XP, 9 achievements, progress dashboard, personal bests
- **Knowledge Base Builder** with Rule Builder and validation, running the same generic engine on user data
- Viva Challenge (12 MCQs with explanations), Lab Mode, dark and light themes, localStorage persistence
- Accessibility: semantic HTML, keyboard navigation, focus states, ARIA labels, state never shown by colour alone (✓ FIRED / ✗ NOT SATISFIED), `prefers-reduced-motion` respected

## Tech stack

React 18, Vite, React Router (hash routing), Framer Motion, Lucide icons, plain CSS (SVG for simulations).

## Install, run, build

```bash
npm install
npm run dev        # development server
npm run build      # production build to dist/
npm run preview    # serve the build
npm run test:engine   # engine unit tests (Node, no browser)
```

## Architecture

```
src/
  engine/        FactStore, RuleMatcher, KnowledgeBase, ForwardChaining, BackwardChaining (pure JS, no React)
  scenarios/     medical.js, vehicle.js, manufacturing.js (facts, rules, goals, challenges only)
  components/    ReasoningWorkbench (generic 3-part lab), KnowledgeBasePanel, ReasoningGraph, BackwardTree,
                 InferenceTimeline, ExplanationPanel, SolverControls, ChallengePanel, ChainCompare
  pages/         Home, Learn, Medical, Vehicle, Manufacturing, KnowledgeBuilder, LabMode, Viva, Progress
  hooks/         useLab (state, XP, achievements, persistence), useReplay (event playback)
  utils/         explain (events to plain language), achievements, storage
  styles/        global.css (dark and light themes)
```

**No fake reasoning.** The engine runs first and returns a list of events. The UI only *replays* those events. Every "Rule R3 fired" or "Goal proven" shown on screen is a recorded step of the real algorithm. Challenge answers are also computed by running the engine.

## Knowledge Base design

- **Fact**: a normalised string such as `fever`, `light_red`, `machine_A_overheating`. The FactStore remembers whether each fact was *given* or *derived* (by which rule, at what depth).
- **Rule**: `{ id, if: [conditions], then: conclusion }`. Rules are validated (non-empty, no self-reference, unique id); malformed rules are rejected instead of crashing.
- **KnowledgeBase**: facts + rules + optional conflict pairs (e.g. `machine_B_operational` vs `machine_B_failed`) used to display contradictions.

## Forward chaining (data-driven)

1. Load known facts. 2. Check each rule: are *all* IF conditions known? 3. If so, fire it and add the THEN fact. 4. Repeat passes until the goal is reached or no new fact is added.

Events: `FACT_FOUND`, `RULE_CHECKED`, `RULE_NOT_SATISFIED`, `RULE_MATCHED`, `RULE_FIRED`, `FACT_DERIVED`, `GOAL_REACHED`, `NO_MORE_INFERENCES`, `INFERENCE_COMPLETE`.

## Backward chaining (goal-driven)

1. Select a goal. 2. If it is a known fact, it is proven. 3. Otherwise find rules concluding it; their conditions become sub-goals. 4. Prove sub-goals recursively; if one fails, backtrack and try another rule. Includes cycle protection and memoisation. Returns a real proof tree.

Events: `GOAL_SELECTED`, `SEARCHING_RULES`, `RULE_SELECTED`, `SUBGOAL_CREATED`, `FACT_PROVEN`, `SUBGOAL_PROVEN`, `BACKTRACK`, `GOAL_PROVEN`, `GOAL_FAILED`.

## Scenario summaries

- **Medical Diagnosis**: e.g. `fever + cough → respiratory_infection`, `respiratory_infection + sore_throat → possible_flu`. Wording is deliberately "possible condition according to this toy rule system".
- **Autonomous Vehicle**: e.g. `light_red → stop_vehicle`, `pedestrian_near → emergency_stop`, `vehicle_ahead + distance_near → slow_down`. When several rules fire, the highest-priority action wins.
- **Industrial Manufacturing**: e.g. `machine_A_overheating → stop_machine_A`, `… + temperature_high → activate_cooling`, `machine_A_stopped + machine_B_operational → switch_production_to_B`.

## Lab topics covered

Knowledge representation, facts and rules, rule matching, forward chaining, backward chaining, derived facts, goal/query, explanation and traceability of expert systems, conflict resolution, contradiction detection.

## Future improvements

Negation and variables in rules, certainty factors, rule priorities in the engine, import/export of knowledge bases as JSON, Machine C in the factory, more challenge levels.
