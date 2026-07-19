# _vdom

`_vdom` is a learning-oriented Virtual DOM and small React-style UI library
implementation in TypeScript.

The goal of this project is not to build a production-ready replacement for
React, Preact, Vue, or other UI frameworks. The goal is to understand what sits
underneath declarative UI libraries: Virtual Nodes, DOM mounting,
reconciliation, element identity, property and event updates, components,
state-driven rendering, and the tradeoffs hidden by convenient framework APIs.

## Purpose

This project is for studying Virtual DOM and declarative UI internals step by
step.

This repository follows the learning-project approach described in
`LEARNING_PROJECT.md`: small milestones, inspectable changes, and optional
advanced topics after the core goal is met.

The project assumes that the learner is already comfortable with TypeScript and
basic Web development. Therefore, the focus is not on TypeScript syntax or
ordinary frontend project structure, but on the mechanisms connecting a
declarative tree description to mutations of the browser DOM.

## Learning Topics

This project may cover topics such as:

- Virtual Nodes: representing elements, text, properties, children, and keys as
  TypeScript data structures.
- Mounting: turning a Virtual Node tree into browser DOM nodes.
- Reconciliation: comparing old and new trees and deciding which DOM mutations
  are required.
- Element identity: node reuse, replacement, positional matching, and why keys
  matter for dynamic lists.
- DOM updates: properties, attributes, styles, event listeners, text, and child
  insertion or removal.
- Declarative rendering: deriving a UI tree from state instead of issuing DOM
  commands throughout application code.
- Components: function components, inputs, composition, and the boundary
  between component evaluation and host DOM rendering.
- State: triggering rerenders, preserving state identity, batching updates, and
  avoiding stale render assumptions.
- JSX: how JSX becomes function calls and why JSX is separate from the Virtual
  DOM mechanism itself.
- Scheduling: synchronous rendering, batched work, interruptible work, and why
  production renderers use more elaborate architectures.
- Robustness: DOM identity tests, mutation observation, diagnostics, browser
  behavior, and focused comparisons with React or Preact.

## Non-goals

The following are not the main focus of this project:

- Building a production-ready UI framework.
- Replacing React, Preact, Vue, or direct DOM APIs.
- Reproducing every React API or compatibility detail.
- Starting with JSX, hooks, concurrent rendering, server rendering, or hydration
  before the basic Virtual DOM lifecycle is visible.
- Claiming that Virtual DOM is always faster than direct DOM manipulation.
- Prioritizing API breadth or benchmark wins over implementation understanding.

Some framework-oriented topics may still be explored when they help explain how
Virtual DOM renderers behave.

## Core Milestone

The core learning milestone is not complete yet.

The first core target is to build a tiny browser renderer that can:

- Create explicit Virtual Nodes for elements and text.
- Mount a Virtual Node tree into a DOM container.
- Render a second tree by comparing it with the previous tree.
- Reuse compatible DOM nodes rather than recreating the entire subtree.
- Add, remove, and replace elements and text.
- Update basic properties and event listeners.
- Include tests or examples that make resulting DOM mutations and node identity
  visible.

Function components, state, keyed reconciliation, JSX, hooks, batching, and
scheduling should be treated as later learning steps after the basic
Virtual-Node-to-DOM lifecycle is visible.

## Approach

The preferred starting point is a deliberately tiny renderer surface:

1. Describe one DOM element as a plain Virtual Node object.
2. Mount that Virtual Node as a real browser DOM subtree.
3. Introduce an `h` function for creating element and text Virtual Nodes.
4. Render a new tree and compare it with the previous tree.
5. Update text, properties, and positional children while preserving compatible
   DOM node identity.
6. Make each DOM mutation observable through focused tests or examples.
7. Add components, state, keys, JSX, batching, hooks, and scheduling only after
   the core renderer is understandable.

The detailed learning-project operating pattern is documented in
`LEARNING_PROJECT.md`.

## Technology

- Language: TypeScript
- Package manager: pnpm
- Runtime target: browser DOM
- Type checking: TypeScript compiler
- Test runner: Vitest
- DOM test environment: jsdom

The project intentionally starts without a bundler or UI framework. TypeScript
performs static checking, while Vitest and jsdom make DOM behavior and node
identity observable in focused tests.

Install dependencies:

```sh
pnpm install
```

Run type checks and tests:

```sh
pnpm typecheck
pnpm test
```

## Running the Current Renderer

The current implementation can render an initial Virtual Node tree and
reconcile compatible element children by position. It reuses compatible DOM
nodes, updates text in place, appends and removes trailing children, and replaces
incompatible nodes.

```ts
import { h, render } from "./src";

const container = document.querySelector("#app")!;
const handleClick = () => console.log("list clicked");

const firstVNode = h(
  "ul",
  {
    id: "lessons",
    class: "pending",
    title: "Loading lessons",
    onClick: handleClick,
  },
  [
    h("li", {}, ["Mounting"]),
    h("li", {}, ["Reconciliation"]),
  ],
);
const nextVNode = h(
  "ul",
  {
    id: "lessons",
    class: "ready",
    "data-state": "complete",
    onClick: handleClick,
  },
  [
    h("li", {}, ["Mounting complete"]),
    h("li", {}, ["Reconciliation"]),
    h("li", {}, ["Properties"]),
  ],
);

const firstNode = render(firstVNode, container);
const firstItem = firstNode.firstChild;
const nextNode = render(nextVNode, container);

console.log(firstNode === nextNode); // true
console.log(firstItem === nextNode.firstChild); // true
```

`h` only creates a plain element description and has no DOM side effects. It
normalizes string and number children into `TextVNode` objects, so `mount`
continues to receive a canonical `VNode[]`. Nested child arrays are recursively
flattened, while `null`, `undefined`, and boolean children are omitted. Props
can contain strings or event handler functions. During mounting, string props
are applied as HTML attributes and function props named `on<Event>` are attached
with `addEventListener`. `mount` is the stateless operation that creates and
appends DOM nodes recursively. `render` uses it for the first render, then
retains the root VNode and DOM node for that container. During subsequent
renders, compatible element children at the same index are reconciled
recursively. New trailing children are mounted, surplus trailing children are
removed, and incompatible nodes are replaced. Compatible text nodes retain
their identity and update only `Text.data`. String attributes are added,
updated, or removed on reused elements. The `value` prop on `input` and
`textarea` is assigned as a live DOM property and restored from the declarative
value on later renders. Boolean `checked` on `input` follows the same rule.
Other DOM property behavior and event replacement and removal are intentionally
not supported yet.

## Project Documents

- `README.md`: project purpose, scope, and high-level learning direction.
- `AGENTS.md`: working instructions for AI agents and future contributors.
- `LEARNING_PROJECT.md`: reusable AI-assisted learning project pattern.
- `TODO.md`: living learning roadmap and progress tracker.
- `docs/initial-element-mount.md`: notes on the first
  Virtual-Node-to-DOM lifecycle.
- `docs/text-node-mount.md`: notes on text nodes and discriminated Virtual Node
  types.
- `docs/nested-children.md`: notes on explicit child arrays and recursive
  mounting.
- `docs/element-props.md`: notes on initial string props and HTML attributes.
- `docs/h-function.md`: notes on the pure Virtual Node creation boundary.
- `docs/event-mount.md`: notes on initial event listener attachment.
- `docs/render-root-state.md`: notes on container-level retained render state.
- `docs/first-child-reconciliation.md`: notes on the first incremental DOM
  update and root identity reuse.
- `docs/child-removal-reconciliation.md`: notes on removing a child while
  preserving its parent node.
- `docs/incompatible-node-replacement.md`: notes on compatibility and deliberate
  DOM identity replacement.
- `docs/text-node-reconciliation.md`: notes on updating text content without
  replacing the DOM node.
- `docs/compatible-element-reuse.md`: notes on reusing an element when no DOM
  change is required.
- `docs/positional-child-reconciliation.md`: notes on recursive index-based
  matching and its identity tradeoffs.
- `docs/attribute-reconciliation.md`: notes on string attribute addition,
  update, and removal.
- `docs/controlled-value-property.md`: notes on live form state and declarative
  `value` restoration.
- `docs/checked-property.md`: notes on boolean checked state and explicit prop
  type rules.
