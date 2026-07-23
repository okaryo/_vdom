# DOM Boundaries And Limitations

This renderer intentionally implements a narrow browser DOM model. The limits
below are design boundaries for the current learning milestone rather than
claims about what a production renderer should ignore.

## Node Removal And Listener Lifetime

Event handlers are registered directly on their element. Removing or replacing
a subtree detaches its DOM nodes, but it does not call `removeEventListener` for
every handler in that subtree.

A detached node still owns its listeners while something retains a reference to
that node:

```ts
const button = document.createElement("button");
button.addEventListener("click", handleClick);
button.remove();

button.dispatchEvent(new MouseEvent("click")); // still calls handleClick
```

If the detached node becomes unreachable, the browser can garbage-collect the
node and its listener registration. The handler function may remain if other
code still references it, but that does not keep the node alive unless the
reference graph also leads back to the node. Cycles between the node and
listener do not by themselves prevent modern garbage collection. This makes
the current behavior acceptable for element-local listeners in this learning
renderer.

A future explicit unmount phase would still be useful for deterministic
cleanup. It would be required for resources attached to longer-lived targets or
systems, including `window`, `document`, timers, observers, subscriptions, and
network connections. Removing a child element cannot release those resources
automatically.

## Renderer-Owned DOM

The renderer assumes that no other code changes its managed DOM subtree between
renders. Positional reconciliation checks some structural mismatches, but it
does not recover from arbitrary external insertion, removal, replacement, or
reordering.

The declarative `value` and `checked` rules deliberately compare against live
DOM state on every render, so user edits are restored. Most attributes and
styles instead compare the old and new VNodes. If outside code changes an
attribute or style while both VNodes retain the same value, this renderer does
not detect or restore that mutation.

The first render also appends its root to the supplied container. It does not
clear or hydrate pre-existing container content.

## HTML Namespace Only

Elements are created with `document.createElement`. The renderer does not use
`createElementNS`, so SVG and MathML namespaces are unsupported. It also has no
namespace-specific prop or attribute mappings.

## Narrow Prop Model

The current prop rules are deliberately incomplete:

- Most string props become HTML attributes.
- `className` maps to the `class` attribute.
- Only `value` on `input` and `textarea`, and `checked` on `input`, have explicit
  live DOM property behavior.
- Other boolean and object-valued props are rejected.
- `style` accepts only string values; numeric values and automatic units such as
  `px` are unsupported.
- Style-name conversion covers ordinary camelCase names and CSS custom
  properties, not every vendor-specific naming edge case.
- Event names are derived by lowercasing the text after `on`; listener options,
  event delegation, multiple handlers per prop, and synthetic events are
  unsupported.
- Custom elements receive generic string attributes, without a complete custom
  element property-assignment model.

These rules make the attribute/property/event boundaries visible without
requiring a production-sized DOM property catalog.

## Tree Shape And Identity

One `VNode` produces one root DOM node. Empty roots, fragments, portals, and
multiple root nodes are unsupported. Children are matched only by position;
there are no keys or move operations yet.

Two elements are currently compatible when their tag names match. Compatibility
does not account for namespaces or keys because those
concepts are not represented yet.

## Non-Transactional Updates

Reconciliation mutates the DOM while recursively walking the tree. It validates
each element's props before changing that element, but it does not preflight the
entire new VNode tree. An invalid prop in a later subtree can therefore throw
after an earlier subtree has already changed.

A production renderer may use broader validation, recovery boundaries, staged
work, or scheduling. This project leaves those mechanisms visible as later
design questions instead of hiding them inside the current synchronous
renderer.
