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

## Current Second-Render Behavior

On a second call, `render` retrieves the retained pair and passes the old VNode,
new VNode, and real root node to the reconciliation boundary. It updates the
retained pair only after reconciliation succeeds.

The current reconciliation recursively matches compatible element children by
position. It updates compatible text, appends or removes trailing children, and
replaces incompatible nodes. The retained root pair is updated after the
reconciliation call returns.

This learning renderer does not preflight the entire subtree before mutation.
If an invalid prop is discovered after an earlier sibling was already updated,
that render can be partially applied. Stronger failure handling remains a later
topic.
