# Child Removal Reconciliation

The second reconciliation operation is the inverse of adding the first child:

```text
<ul><li>old child</li></ul>  ->  <ul></ul>
```

After confirming that the old root has exactly one VNode child and the new root
has none, `reconcile` checks that the real root also has exactly one DOM child.
It then removes that node with `removeChild`.

The DOM count check happens before mutation. If outside code changed the DOM
without updating the retained VNode, removing `firstChild` blindly could remove
a node that the renderer does not actually own.

## Removal And Identity

The root element is reused, while the removed child becomes disconnected:

```ts
const rootNode = render(firstVNode, container);
const childNode = rootNode.firstChild;
const nextRootNode = render(nextVNode, container);

expect(nextRootNode).toBe(rootNode);
expect(childNode?.parentNode).toBeNull();
```

Removing a DOM node does not turn the JavaScript object into `null`. Existing
references can still observe the detached node, but it is no longer part of the
document subtree. Event listeners and other state on that node remain attached
to the detached object until it becomes unreachable and can be garbage
collected.

## Current Limitations

Only the sole child of a compatible root element can be removed. Selecting a
child by position from a longer list is deferred until positional child
reconciliation is introduced.
