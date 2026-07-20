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

Core milestone complete.

The synchronous browser renderer can mount an explicit Virtual Node tree,
reconcile a second tree positionally, update basic DOM properties and events,
and demonstrate through tests which real DOM nodes were reused. Sections 0
through 4 establish this completed foundation; components and state now build
on it as later learning stages.

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
- [x] Decide behavior for `null`, `undefined`, boolean, and nested array children.
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
- [x] Attach an event listener.
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
- Existing Virtual Nodes pass through normalization unchanged.
- `null`, `undefined`, and boolean children are omitted without creating a
  placeholder VNode; nested child arrays are recursively flattened in order.
- Child positions are therefore defined by the normalized `VNode[]`, a choice
  that will matter when positional reconciliation is introduced.
- Function props named `on<Event>` are attached with `addEventListener` during
  initial mounting instead of being serialized as HTML attributes.
- Event replacement and removal remain separate update-time behaviors; the
  initial mount only has one handler to attach and no previous handler to clean
  up.
Questions to answer:

- Which work belongs to Virtual Node creation versus mounting?
- What is the difference between a DOM property and an HTML attribute?
- Where should the renderer retain the real DOM node associated with a Virtual
  Node?

### 3. Basic Reconciliation

- [x] Retain the previous rendered tree for a container.
- [x] Add a new child node.
- [x] Remove an old child node.
- [x] Replace incompatible node types.
- [x] Update compatible text nodes in place.
- [x] Reuse compatible element nodes.
- [x] Reconcile children by position.
- [x] Test DOM node identity, not only final HTML output.

Current learning unit:

- `render` owns container-level state and retains both the root VNode and its
  mounted DOM node in a `WeakMap`, while `mount` remains a stateless subtree
  creation operation.
- Compatible element children are matched by array index. Shared positions are
  reconciled recursively, extra new children are mounted at the end, and extra
  old children are removed from the end.
- VNodes are incompatible when their kinds differ or their element tag names
  differ; reconciliation replaces the corresponding DOM node in those cases.
- Compatible text VNodes reuse the existing `Text` DOM node and update its
  `data` only when the string value changes.
- Compatible element VNodes with unchanged props retain their DOM identity while
  their nested children are reconciled.
- Positional matching does not search later positions for a reusable node, so
  inserting or removing near the front can replace nodes that keyed matching
  could move instead.

Questions to answer:

- What makes two Virtual Nodes compatible?
- How can node reuse be observed reliably?
- Which tree changes make positional matching produce surprising results?
- When is replacing a subtree simpler or safer than patching it?

### 4. Properties, Styles, And Events

- [x] Add, update, and remove string-valued HTML attributes.
- [x] Add, update, and remove selected common DOM properties (`value`,
  `checked`).
- [x] Define the initial attribute rule: string props use `setAttribute`.
- [x] Map the `className` prop to the `class` HTML attribute.
- [x] Update style object values.
- [x] Replace and remove event listeners without accumulating handlers.
- [x] Cover controlled form properties such as `value` if useful.
- [x] Document intentionally unsupported DOM edge cases.

Current learning unit:

- Element prop updates have their own `updateElementProps` boundary instead of
  being mixed into child reconciliation.
- Missing old string props use `removeAttribute`; new or changed string props
  use `setAttribute`; unchanged values produce no attribute write.
- Event props are compared by function reference. An old handler is removed
  before a different new handler is attached; an unchanged reference produces
  no listener operation.
- The retained old VNode already stores the function reference required by
  `removeEventListener`, so this implementation does not need a separate event
  handler registry.
- Adding and removing a handler are the same comparison with one side missing.
- `value` on `input` and `textarea` is assigned as a live DOM property rather
  than serialized as an attribute.
- A controlled `value` is compared with the real DOM value on every render, so
  user edits are restored even when old and new VNode values are equal.
- `checked` on `input` follows the same controlled-property rule with a boolean
  value; omitting a previously controlled prop resets it to `false`.
- Boolean props are rejected unless the renderer has an explicit DOM property
  rule for that name and element type.
- The renderer maps the VNode prop name `className` to the HTML attribute name
  `class` during mounting, updating, and removal.
- Supplying both `class` and `className` on one VNode is rejected because both
  names target the same DOM attribute and would make precedence ambiguous.
- `style` accepts an object of camelCase CSS property names and string values;
  mounting applies each entry through the element's live `style` declaration.
- Style reconciliation removes names missing from the new object, then sets
  added or changed declarations without replacing the element.
- Omitting a previously present `style` prop is equivalent to reconciling to an
  empty style object, so every previously managed declaration is removed.
- Numeric style values and automatic unit conversion remain intentionally
  unsupported.
- `docs/dom-boundaries-and-limitations.md` records the current renderer's
  deliberate boundaries around HTML namespaces, externally mutated DOM,
  element-local listener cleanup, prop coverage, and non-transactional updates.
- Removing or replacing a subtree does not traverse it to detach element-local
  listeners. An unreachable node and its listener can be garbage-collected,
  while a detached node retained by external code keeps its listener.

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
