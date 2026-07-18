# Text Node Reconciliation

Two text VNodes are compatible because one browser `Text` node can represent
any string value. A changed value therefore does not require node replacement:

```text
Text("Loading")  ->  Text("Loaded")
```

After confirming that the retained DOM node is actually a `Text` instance,
`reconcile` compares the old and new VNode values. It writes the new string to
`Text.data` only when those values differ.

```ts
if (oldVNode.value !== newVNode.value) {
  node.data = newVNode.value;
}
```

## Content Versus Identity

The text content changes, but the DOM object does not:

```ts
const firstNode = render(loadingVNode, container);
const nextNode = render(loadedVNode, container);

expect(container.textContent).toBe("Loaded");
expect(nextNode).toBe(firstNode);
```

Checking only `textContent` would not distinguish an in-place update from
creating a replacement text node. The identity assertion makes the renderer's
reuse decision observable.

## Why Use `Text.data`

The retained node already represents exactly one text VNode. Updating its
`data` property directly expresses the intended mutation without replacing the
node or rewriting the contents of a parent element.

Skipping the assignment when the value is unchanged also keeps the declarative
comparison separate from the actual DOM mutation: a render call does not imply
that a browser write is always necessary.

Positional child reconciliation now reuses this same operation for nested text
nodes as well as the retained render root.
