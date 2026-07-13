# Minimal `h` Function

The `h` function is the first Virtual Node creation API:

```ts
const vnode = h("section", { id: "introduction" }, [
  {
    type: "text",
    value: "Virtual DOM",
  },
]);
```

It packages its three inputs into an `ElementVNode` with the `"element"`
discriminator. It does not call browser APIs or mount anything. This keeps two
boundaries visible:

1. `h` creates a plain description of an element subtree.
2. `mount` interprets that description and mutates the DOM.

## Why The Signature Is Still Explicit

The current signature requires `ElementProps` and `VNode[]`:

```ts
function h(
  tagName: string,
  props: ElementProps,
  children: VNode[],
): ElementVNode;
```

There are no default props, variadic children, or primitive text children yet.
Keeping the canonical inputs visible prevents factory convenience from being
confused with renderer behavior. Child normalization can be added next as a
separate transformation with its own decisions and tests.
