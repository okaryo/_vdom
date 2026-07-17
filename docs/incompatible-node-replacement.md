# Incompatible Node Replacement

Reconciliation can reuse a DOM node only when it can represent the new VNode.
The current compatibility rule is deliberately small:

- Two text VNodes are compatible.
- Two element VNodes are compatible when their tag names match.
- Different VNode kinds are incompatible.
- Elements with different tag names are incompatible.

For example, a text node cannot become a `<section>`, and an existing `<p>` DOM
object cannot change its tag name to `<section>`. Those transitions require a
different DOM node.

## Replacement Process

For an incompatible pair, `reconcile` performs these steps:

1. Confirm that the old DOM node still has a parent.
2. Mount the complete new VNode subtree into a detached `DocumentFragment`.
3. Replace the old node through `parent.replaceChild(newNode, oldNode)`.
4. Return the new root node so `render` can retain the new association.

Staging the new subtree in a fragment means a mounting error occurs before the
old DOM node is removed. The fragment is only a temporary parent; moving its
child into the real parent does not add an extra DOM level.

## Identity Must Change

Compatible updates try to preserve identity, but replacement deliberately
changes it:

```ts
const textNode = render(textVNode, container);
const elementNode = render(elementVNode, container);

expect(elementNode).not.toBe(textNode);
expect(textNode.parentNode).toBeNull();
```

The old JavaScript DOM object can still be observed through an existing
reference, but it is detached. The new node becomes the container's child and
the node retained for the next render.

Compatibility is therefore not simply "the markup changed." It answers whether
the existing DOM object is capable of representing the new VNode while keeping
its identity. Compatible text VNodes now demonstrate the opposite path: their
existing DOM node is retained and only its stored text data changes.
