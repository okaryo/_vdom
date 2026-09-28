# Component Setter Rerendering

The component state setter now performs two separate operations synchronously:

```text
setCount(1)
    |
    +-> store 1 in the component state slot
    |
    +-> request the owning root to render again
```

The first operation belongs to the state slot. The second needs information the
slot does not have by itself: which rendered root contains this component?

## Passing A Render Context Down The Tree

`render` creates a small root-specific context:

```ts
type RenderContext = {
  requestRender(): void;
};
```

`mount` and `reconcile` pass that same context through host children to every
component instance in the root:

```text
render root
    |
    v
RenderContext
    |
    +-> component instance A
    +-> component instance B
    +-> nested component instance C
```

This propagation is why a deeply nested component can ask for work at the root
without knowing the root container directly.

## Requesting The Current Root

The context closes over the container. When requested, it reads the root's
currently retained VNode and DOM node from `renderedRoots`, then passes that
same VNode back through `render`:

```text
setter
  -> context.requestRender()
  -> render(currentRoot.vnode, container)
  -> evaluate components with retained instances
  -> reconcile new output with old output
  -> update DOM
```

Passing the retained root description again is enough because the component
instance already contains the newly stored state value. Evaluating that
component now produces different output.

## Why The Context Lives On The Instance

The setter closes over its state slot and the component instance. It reads
`instance.context` when invoked, so it does not depend on the temporary
`currentComponentInstance` evaluation cursor.

Compatible reconciliation refreshes the instance's context. The same setter
therefore continues to request work from the root that currently owns the
instance.

## Current Boundaries

- Rerendering is immediate and synchronous.
- Every setter call requests a complete root render.
- There is no equality bailout, update queue, or batching.
- Updating state during component evaluation is unsupported.
- Stateful updates from standalone `mount` are unsupported because there is no
  retained root to render.

State and setter preservation are documented in
`component-state-identity.md`. The behavior of consecutive setter calls is
documented in `component-state-multiple-updates.md`.
