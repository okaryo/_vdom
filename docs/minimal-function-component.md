# Minimal Function Components

The first component form is an input-free function that returns one existing
VNode:

```ts
type FunctionComponent = () => VNode;

const Message: FunctionComponent = () =>
  h("p", { className: "message" }, ["Hello"]);
```

It is used by passing the function itself to `h`:

```ts
const vnode = h(Message, {}, []);
render(vnode, container);
```

The resulting DOM contains only the component's output:

```html
<p class="message">Hello</p>
```

There is no component wrapper element.

## Eager Expansion

The current call flow is deliberately small:

```text
h(Message, {}, [])
  -> Message()
  -> h("p", ..., ["Hello"])
  -> ElementVNode
  -> render / mount / reconcile
```

`Message` runs while the VNode tree is being created, before `render` receives
the tree. The renderer therefore needs no new component branch: it sees only
the returned element or text VNode.

This answers the first component-boundary question with a temporary minimal
model: the component is a VNode-producing function, not a new VNode kind.

## Identity Consequence

Because the function call is not represented in the retained tree, the
component has no independent identity. Reconciliation can preserve or replace
the output DOM according to the returned VNode's existing rules, but it cannot
associate state or lifecycle work with `Message` itself.

This is enough to expose component evaluation without adding an internal
component instance or Fiber-like structure. A later state lesson may show why
retaining a component boundary becomes useful.

## Deliberate Input Boundary

Props and children are rejected in this unit:

```ts
h(Message, { id: "message" }, []); // TypeError
h(Message, {}, ["child"]);         // TypeError
```

Rejecting them prevents data from being silently discarded. The next learning
unit can define how component inputs differ from host-element props and how
they reach the function.
