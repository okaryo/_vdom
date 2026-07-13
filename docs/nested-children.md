# Nested Children

An element Virtual Node now contains an explicit array of child Virtual Nodes:

```ts
const vnode: ElementVNode = {
  type: "element",
  tagName: "article",
  props: {},
  children: [
    {
      type: "text",
      value: "Virtual DOM is a tree.",
    },
  ],
};
```

## Why Children Are Explicit

`children` is currently a required `VNode[]`. Even an empty element uses
`children: []`. This keeps the tree representation predictable while mounting
is being studied: every child is already a valid element or text Virtual Node,
and the renderer does not perform input normalization yet.

An `h` function can later offer a more convenient API by accepting strings,
empty values, or nested arrays and converting them into this canonical tree.
That convenience belongs at the Virtual Node creation boundary rather than in
the DOM mounting algorithm.

## Recursive Mounting

Mounting an element follows a depth-first process:

1. Create the real element for the current Virtual Node.
2. Recursively mount each child into that element in array order.
3. Append the completed element subtree to its container.
4. Return the created element so its identity remains observable.

The recursion mirrors the recursive data structure. Text nodes terminate the
recursion because they cannot contain children.

The subtree is assembled while detached from the final container. This detail
is not an optimization claim; it is simply the direct consequence of mounting
children into their newly created parent before appending that parent.
