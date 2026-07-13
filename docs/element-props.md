# Element Props

Element Virtual Nodes now carry string-valued props:

```ts
const vnode: ElementVNode = {
  type: "element",
  tagName: "section",
  props: {
    id: "introduction",
    "data-topic": "virtual-dom",
  },
  children: [],
};
```

The initial representation is intentionally narrow:

```ts
type ElementProps = Record<string, string>;
```

Requiring string values keeps the first rule unambiguous. During mounting, each
entry is applied with `element.setAttribute(name, value)`.

## Renderer Input Versus DOM Properties

The name `props` means inputs attached to a Virtual Node. It does not mean that
every entry is immediately assigned as a JavaScript property on the real DOM
object. The renderer decides how each kind of prop reaches the browser.

This first rule treats every prop as an HTML attribute. That works clearly for
values such as `id`, `class`, and `data-*`, but it is not a complete DOM update
model. DOM properties and HTML attributes can differ in name, type, and current
value. Event listeners also require `addEventListener` rather than an attribute.

Later steps can widen `ElementProps` and introduce explicit branches for DOM
properties, styles, and events. Keeping those branches out of the initial rule
makes each behavior independently observable.

## Current Limitations

Props cannot yet contain booleans, numbers, objects, functions, or removal
instructions. Mounting only creates a new element, so it also does not compare
old and new prop sets.
