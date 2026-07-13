# TODO

This file is the living roadmap for the TypeScript Virtual DOM and small
React-style UI library implementation. See `LEARNING_PROJECT.md` for the
reusable learning-project pattern behind this roadmap.

## Current Learning Goal

Build a small declarative UI library in TypeScript and use it to understand the
mechanics usually hidden by React, Preact, Vue, and other Virtual DOM renderers.

Initial focus:

- Representing elements and text as Virtual Nodes.
- Mounting a Virtual Node tree into the browser DOM.
- Comparing old and new trees.
- Applying only the necessary DOM mutations.
- Preserving and observing DOM node identity.
- Updating properties and event listeners.
- Later exploration of components, state, keys, JSX, hooks, and scheduling.

## Core Milestone Status

Core milestone not complete.

The first core milestone is a synchronous browser renderer that can mount an
explicit Virtual Node tree, reconcile a second tree positionally, update basic
DOM properties and events, and demonstrate through tests or examples which real
DOM nodes were reused.

## Roadmap

Roadmap sections are learning themes, not single work units.

### 0. Project Setup

- [x] Define the project purpose.
- [x] Define the initial scope and non-goals.
- [x] Decide that the project will use TypeScript and pnpm.
- [x] Decide that the first core target is a Virtual DOM renderer rather than a
  broad React clone.
- [x] Create initial project documentation.
- [x] Select the minimal TypeScript build and test tooling.
- [x] Create the initial package layout after the first implementation unit is
  confirmed.

Tooling decision:

- Use the TypeScript compiler for strict static checking without emitting build
  output yet.
- Use Vitest as the test runner and jsdom as the browser DOM test environment.
- Defer a bundler and browser demo tooling until an executable example creates a
  concrete need for them.

First implementation milestone:

- Represent one element Virtual Node explicitly and mount it as a real DOM
  element.
- Keep reconciliation, components, state, keys, JSX, hooks, and scheduling out
  of that first unit so the Virtual-Node-to-DOM boundary is directly visible.

### 1. Virtual Node Representation

- [x] Define element and text Virtual Node types.
- [x] Represent element children as an explicit `VNode[]`.
- [x] Start element props as an explicit `Record<string, string>`.
- [x] Add a minimal `h` function.
- [x] Normalize primitive text children.
- [ ] Decide behavior for `null`, `undefined`, boolean, and nested array children.
- [x] Add focused type and behavior tests for the explicit element and text node
  kinds.

Questions to answer:

- What data is required to describe a DOM subtree?
- Should text be a distinct Virtual Node type?
- When should children be normalized?
- Which invariants should TypeScript enforce and which require runtime checks?

### 2. Initial DOM Mounting

- [x] Convert an element Virtual Node into a browser DOM element.
- [x] Create and append text nodes.
- [x] Mount nested children recursively.
- [x] Apply string-valued props as basic HTML attributes.
- [ ] Attach an event listener.
- [x] Add tests or examples that expose the current element-only mount
  lifecycle.

Completed learning unit:

- An element Virtual Node is a plain description with no DOM side effects.
- `mount` is the explicit boundary that creates and appends a browser element.
- The created DOM element is returned so tests can observe node identity without
  storing renderer state on the Virtual Node yet.
- Text has its own Virtual Node because the browser DOM also represents text as
  a node with an independent lifecycle.
- The `type` discriminator lets the renderer and TypeScript distinguish which
  fields and browser creation operation belong to each node kind.
- Required child arrays keep the renderer input canonical and make recursive
  mounting independent from future child normalization convenience.
- Mounting follows the recursive Virtual Node structure and preserves child
  array order in the resulting browser DOM.
- VNode props are renderer inputs; the initial renderer rule maps every string
  prop to `setAttribute` without claiming that attributes and DOM properties
  are interchangeable.
- `h` is a pure Virtual Node creation boundary: it constructs an element
  description without touching the DOM.
- `h` accepts string and number children as creation-time conveniences and
  normalizes them into `TextVNode` objects before the renderer sees the tree.
- Existing Virtual Nodes pass through normalization unchanged, while unsupported
  empty values and nested arrays remain excluded from `VNodeChild` for now.

Questions to answer:

- Which work belongs to Virtual Node creation versus mounting?
- What is the difference between a DOM property and an HTML attribute?
- Where should the renderer retain the real DOM node associated with a Virtual
  Node?

### 3. Basic Reconciliation

- [ ] Retain the previous rendered tree for a container.
- [ ] Add a new child node.
- [ ] Remove an old child node.
- [ ] Replace incompatible node types.
- [ ] Update compatible text nodes in place.
- [ ] Reuse compatible element nodes.
- [ ] Reconcile children by position.
- [ ] Test DOM node identity, not only final HTML output.

Questions to answer:

- What makes two Virtual Nodes compatible?
- How can node reuse be observed reliably?
- Which tree changes make positional matching produce surprising results?
- When is replacing a subtree simpler or safer than patching it?

### 4. Properties, Styles, And Events

- [ ] Add, update, and remove common DOM properties.
- [x] Define the initial attribute rule: string props use `setAttribute`.
- [ ] Update class and style values.
- [ ] Replace and remove event listeners without accumulating handlers.
- [ ] Cover controlled form properties such as `value` if useful.
- [ ] Document intentionally unsupported DOM edge cases.

Questions to answer:

- Why are properties and attributes not interchangeable?
- How should old and new property sets be compared?
- Where should the active event handler be stored?
- Which DOM behaviors are browser responsibilities rather than renderer
  responsibilities?

### 5. Declarative Rendering And Components

- [ ] Add minimal function components.
- [ ] Pass component inputs as properties.
- [ ] Compose components and host elements.
- [ ] Decide how component output participates in reconciliation.
- [ ] Add a small state-driven example after component rendering is visible.

Questions to answer:

- Is a component a Virtual Node, a function evaluation, or both?
- What identity does a component have when it produces no DOM node of its own?
- Which renderer boundary does a component abstraction hide?

### 6. State And Rerendering

- [ ] Add the smallest explicit state update mechanism.
- [ ] Trigger synchronous rerendering from a state change.
- [ ] Preserve state according to component identity.
- [ ] Decide behavior when multiple updates occur together.
- [ ] Build a small counter or Todo example.

Questions to answer:

- Who owns application state and rendered state?
- Why does state preservation depend on tree position and identity?
- What problems appear when rendering is reentrant?

### 7. Keyed Child Reconciliation

- [ ] Add keys to Virtual Nodes.
- [ ] Match old and new children by key.
- [ ] Insert and remove keyed children.
- [ ] Move existing DOM nodes when order changes.
- [ ] Compare keyed behavior with positional reconciliation.
- [ ] Test state and DOM identity across list reordering.

Questions to answer:

- Why is array index often a poor key?
- What does a key identify, and within which scope?
- How should duplicate or missing keys behave?
- Which reconciliation algorithm is sufficient for this learning project?

### 8. JSX

- [ ] Inspect the JavaScript produced from a small JSX expression.
- [ ] Configure JSX to call the local Virtual Node factory.
- [ ] Define the minimal JSX TypeScript types.
- [ ] Compare handwritten `h` calls with JSX output.
- [ ] Keep JSX transformation separate from renderer behavior.

Questions to answer:

- What does JSX provide beyond syntax?
- Which JSX behaviors belong to the compiler and which belong to the runtime?
- How do fragments affect the renderer model?

### 9. Robustness And Diagnostics

- [ ] Add useful errors for invalid Virtual Nodes and containers.
- [ ] Cover empty trees and transitions between empty, text, and element nodes.
- [ ] Test nested updates and event replacement.
- [ ] Add mutation observation examples where helpful.
- [ ] Document known renderer limitations.
- [ ] Add a focused behavior comparison with React or Preact.

Questions to answer:

- Which renderer errors can be detected before touching the DOM?
- What information makes a reconciliation failure understandable?
- Which browser DOM edge cases should remain explicit non-goals?

### 10. Optional Advanced Topics

- [ ] Explore batched state updates.
- [ ] Explore effect or lifecycle semantics.
- [ ] Explore fragments and portals.
- [ ] Explore a hook call-order model.
- [ ] Explore cooperative or interruptible rendering.
- [ ] Compare the simple recursive renderer with a Fiber-like work structure.
- [ ] Explore server rendering and hydration.
- [ ] Benchmark selected operations without treating benchmark speed as the
  primary learning goal.

These topics are optional. They should be started only when a specific learning
question makes them useful and should not prevent the core milestone from being
marked complete.
