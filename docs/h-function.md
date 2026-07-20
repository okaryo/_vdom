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

The current signature accepts existing Virtual Nodes, primitive child values,
empty values, and nested child arrays:

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
not numeric values.

`null`, `undefined`, and both boolean values are omitted. They create neither a
Virtual Node nor a placeholder DOM node. Treating booleans as empty makes a
conditional child such as `isVisible && vnode` convenient without rendering the
text `"false"`; treating `true` the same way keeps boolean behavior consistent.

Nested arrays are recursively flattened while preserving order. This supports
children produced by mapping or grouping without making `mount` understand
arrays. Because empty values disappear, positions in `ElementVNode.children`
are positions after normalization. That becomes important when children are
later reconciled by position.

There are still no default props or variadic children.

## Function Component Overload

`h` now also accepts an input-free `FunctionComponent`:

```ts
type FunctionComponent = () => VNode;

const Message: FunctionComponent = () => h("p", {}, ["Hello"]);
const vnode = h(Message, {}, []);
```

This overload eagerly evaluates `Message` and returns its result. It still does
not call a browser DOM API. Component props and children are rejected until
their data flow is introduced explicitly.
