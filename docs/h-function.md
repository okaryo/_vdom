# Minimal `h` Function

The `h` function is the first Virtual Node creation API:

```ts
const vnode = h("section", { id: "introduction" }, ["Lesson ", 1]);
```

It constructs an `ElementVNode` with the `"element"` discriminator and
normalizes convenient child inputs along the way. It does not call browser APIs
or mount anything. This keeps two boundaries visible:

1. `h` creates a plain description of an element subtree.
2. `mount` interprets that description and mutates the DOM.

## Child Normalization Boundary

The current signature accepts existing Virtual Nodes plus string and number
children:

```ts
function h(
  tagName: string,
  props: ElementProps,
  children: VNodeChild[],
): ElementVNode;
```

Strings and numbers are converted into `TextVNode` objects when `h` creates the
element Virtual Node. Existing Virtual Nodes pass through unchanged. Therefore,
`ElementVNode.children` remains the canonical `VNode[]` expected by `mount`;
the renderer does not need branches for convenient child input types.

Numbers are converted with `String(child)` because DOM text nodes store text,
not numeric values. Booleans are intentionally not treated as text, matching
the roadmap decision to consider boolean and empty-child behavior separately.
There are still no default props, variadic children, nested arrays, or
`null`/`undefined` children.
