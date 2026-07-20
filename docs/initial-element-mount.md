# Initial Element Mount

The first renderer step deliberately supports only one element Virtual Node:

```ts
const vnode: ElementVNode = {
  type: "element",
  tagName: "section",
  props: {},
  children: [],
};

mount(vnode, container);
```

## Lifecycle

1. Application code creates a plain `ElementVNode` object.
2. `mount` reads its `tagName`.
3. The browser creates an `Element` through `document.createElement`.
4. `mount` appends the real element to the supplied container.
5. `mount` returns the real element so its identity can be observed.

The Virtual Node is only a description. Creating it does not touch the DOM.
`mount` is the boundary where the renderer performs a browser side effect.

## Current Decisions

`type: "element"` is an explicit discriminator. The renderer now uses it to
distinguish element nodes from text nodes.

`tagName` remains a string because `document.createElement` accepts strings,
including custom element names. Validation is intentionally left to the browser
at this stage.

`mount` returns the created DOM node but remains stateless and does not store it
on the Virtual Node. The higher-level `render` boundary now retains the root
VNode and returned DOM node for each container, ready for reconciliation.

## Current Limitations

The renderer supports string-valued props as HTML attributes, `value` and
`checked` as selected DOM properties, and function props as event listeners,
but not general DOM property behavior. Direct `mount` calls always create a new
DOM node. `render` compares subsequent trees with retained output and can
replace or remove listeners on reused elements. Text node support is described
in `text-node-mount.md`, and recursive element children are described in
`nested-children.md`.
