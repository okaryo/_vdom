# Retained Render Root State

`mount` creates a DOM subtree from a VNode and appends it to a container. It is
deliberately stateless: calling it again creates another subtree.

Reconciliation needs a higher-level boundary that remembers what was rendered.
The new `render` function retains this pair for each container:

```ts
type RenderedRoot = {
  vnode: VNode;
  node: Node;
};
```

The VNode is the old declarative tree that a later call will compare against.
The DOM node is the real root whose identity should be reused or replaced.

## Why State Belongs To The Container

A container defines an independent render root. Using a `WeakMap` keyed by the
container keeps roots separate without adding private properties to browser DOM
objects. It also does not keep a container alive solely because renderer state
exists for it.

The state is stored only after `mount` succeeds, so a failed initial mount does
not leave a retained root that was never appended.

## Temporary Second-Render Behavior

`render` currently rejects a second call for the same container before touching
the DOM. Silently mounting again would duplicate the root, while overwriting the
stored pair would lose the old tree required for comparison.

This rejection is a temporary boundary, not the intended rendering API. The
next reconciliation steps can replace it incrementally with comparisons and DOM
mutations, starting with adding a new positional child.
