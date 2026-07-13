# AGENTS.md

This repository is a learning project for implementing Virtual DOM and small
React-style UI library internals in TypeScript. Agents should optimize for
understanding, incremental progress, and clear explanations rather than feature
volume.

## Project Intent

The project explores how declarative UI libraries connect Virtual Node trees to
the browser DOM. The core focus is Virtual Node representation, mounting,
reconciliation, DOM mutation, and element identity. Components, state, keys,
JSX, hooks, batching, and scheduling are later topics built on that foundation.

The learner is already comfortable with TypeScript and basic Web development,
so avoid spending too much time on TypeScript syntax or ordinary frontend
structure. Prefer deeper discussion of renderer boundaries and tradeoffs hidden
by React, Preact, Vue, and similar libraries.

## Working Style

- Proceed step by step.
- Treat a request to proceed to the next step as permission to advance one small
  learning unit, not to complete an entire roadmap section, unless the user
  explicitly asks for a full section.
- Before a major implementation step, clarify the specific learning objective.
- After a meaningful implementation step, summarize what was learned and what
  remains unclear.
- Keep changes small and inspectable.
- Prefer browser DOM APIs and small local implementations when they make the
  mechanism visible.
- Add dependencies only when they directly support a learning question, testing,
  or TypeScript tooling.
- Keep `TODO.md` updated as a living roadmap, not a fixed plan.
- If the learning direction changes, update the roadmap instead of forcing the
  original plan.

## Implementation Guidance

- Start with explicit Virtual Node objects and synchronous DOM mounting before
  introducing framework-style APIs.
- Keep Virtual Node creation, mounting, reconciliation, property updates, event
  updates, and child matching visible as separate boundaries when each boundary
  has a learning reason to exist.
- Store or associate real DOM nodes in a way that makes identity and reuse easy
  to inspect.
- Begin with positional child reconciliation before implementing keyed lists.
- Make text nodes, empty children, nested child arrays, and child normalization
  decisions explicit.
- Distinguish DOM properties from HTML attributes and explain any simplified
  behavior.
- Remove or replace event listeners deliberately so rerenders do not accumulate
  handlers.
- Test DOM node identity as well as serialized HTML when studying reuse.
- Do not introduce JSX, function components, state, hooks, batching, Fiber-like
  scheduling, server rendering, or hydration before the prerequisite renderer
  behavior is understood.
- When comparing with React or Preact, focus on underlying behavior rather than
  matching the entire public API.
- Do not present Virtual DOM as inherently faster than direct DOM operations;
  discuss its coordination and predictability tradeoffs as well as its costs.

## Documentation Guidance

- `README.md` should describe the project purpose and scope.
- `TODO.md` should track the current learning roadmap, progress, and open
  questions.
- Add notes to `TODO.md` when a completed step changes the next learning
  direction.
- Add topic-specific notes under `docs/` once an implementation step creates a
  useful learning artifact.
- Use `LEARNING_PROJECT.md` only as background for the reusable learning-project
  pattern; keep this file focused on `_vdom` execution guidance.
