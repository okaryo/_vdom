# Text Node Mount

The renderer represents text as an explicit Virtual Node:

```ts
const vnode: TextVNode = {
  type: "text",
  value: "Virtual DOM",
};
```

`VNode` is now a discriminated union:

```ts
type VNode = ElementVNode | TextVNode;
```

The literal `type` property lets TypeScript narrow the union. When the value is
`"element"`, the renderer can read `tagName`; when it is `"text"`, the renderer
can read `value`.

## Why Text Is A Node

The browser DOM represents text with `Text` nodes rather than storing it as a
special property of an element. Giving text a corresponding Virtual Node means
the renderer can later compare, replace, and update text through the same node
lifecycle used for elements.

The renderer does not accept primitive strings yet. Keeping construction
explicit makes the two node kinds visible before an `h` function introduces
child normalization and converts strings into `TextVNode` objects.

## Mount Behavior

`mount` chooses the browser operation from the discriminator:

- `ElementVNode` uses `document.createElement`.
- `TextVNode` uses `document.createTextNode`.

Both operations return a `Node`, which `mount` appends to the container and
returns for identity checks.
