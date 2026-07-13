# Initial Element Mount

The first renderer step deliberately supports only one element Virtual Node:

```ts
const vnode: ElementVNode = {
  type: "element",
  tagName: "section",
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

`type: "element"` is an explicit discriminator. It is redundant while element
nodes are the only supported kind, but it will let the renderer distinguish
element nodes from text nodes later.

`tagName` remains a string because `document.createElement` accepts strings,
including custom element names. Validation is intentionally left to the browser
at this stage.

`mount` returns the created element but does not store it on the Virtual Node.
The renderer does not need a persistent Virtual-Node-to-DOM association until
reconciliation is introduced.

## Current Limitations

The renderer cannot yet represent or mount text, properties, events, or child
nodes. It also mounts every call as a new DOM node and performs no comparison
with previously rendered output.
