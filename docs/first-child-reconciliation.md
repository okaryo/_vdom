# First Child Reconciliation

The first reconciliation operation handles one intentionally narrow transition:

```text
<ul></ul>  ->  <ul><li>new child</li></ul>
```

`render` retrieves the old VNode and real root node retained for the container,
then passes them with the new VNode to `reconcile`. The reconciliation boundary
checks all of its current assumptions before mutating the DOM:

- Both roots are element VNodes with the same tag name.
- The real root is an `Element`.
- Old and new root props have the same names and values.
- The old root has no children and the new root has exactly one.

After those checks, only the new child is passed to `mount`, using the existing
root element as its container. The root itself is not recreated.

## Observable Identity

The final HTML shows that the child exists, but it cannot prove reuse because
replacing the entire root could produce identical markup. The test therefore
also compares object identity:

```ts
const firstNode = render(firstVNode, container);
const nextNode = render(nextVNode, container);

expect(nextNode).toBe(firstNode);
```

This distinction between equivalent markup and identical DOM objects is central
to reconciliation. Reusing a node preserves browser-managed state and attached
listeners, although those behaviors are not updated in this step.

## Current Limitations

The inverse transition, removing the only child, is now supported by a separate
branch. Existing children still cannot be updated, incompatible roots cannot be
replaced, and more than one new child cannot be appended. These transitions
remain explicit errors so the retained VNode never advances past DOM work that
was not actually performed.
