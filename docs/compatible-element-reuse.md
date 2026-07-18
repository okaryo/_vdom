# Compatible Element Reuse

Two separately created element VNodes can describe the same required DOM state:

```ts
const oldVNode = h("section", { id: "introduction" }, []);
const newVNode = h("section", { id: "introduction" }, []);
```

The VNode objects are different, but they have the same tag name, equal prop
entries, and no children. The existing `<section>` can already represent the new
description, so reconciliation returns it without a DOM mutation.

## Declarative Input Does Not Imply A DOM Write

Calling `render` provides a new desired tree. It does not mean every described
node must be recreated or written to. Reconciliation first decides whether the
browser DOM already satisfies that description.

```ts
const firstNode = render(oldVNode, container);
const nextNode = render(newVNode, container);

expect(nextNode).toBe(firstNode);
```

Serialized HTML alone cannot prove reuse because replacing the element could
produce identical markup. Object identity makes the no-replacement decision
observable.

## Child Reconciliation

The tag name establishes element compatibility, while the prop comparison
prevents the renderer from silently accepting an update it cannot apply yet.
Empty elements still take the no-mutation path, and elements with children now
reconcile those children recursively by position.

Changed props still need their own update boundary for attributes and event
listeners.
