# The `className` Prop

The renderer accepts `className` as a VNode prop and translates it to the HTML
attribute `class`:

```ts
const vnode = h("section", { className: "pending" }, []);
```

Mounting this VNode produces:

```html
<section class="pending"></section>
```

`className` is the renderer-facing name. `class` is the attribute name passed
to `setAttribute` and `removeAttribute`. This is a small example of why a
renderer needs a prop-processing boundary instead of assuming every prop name
maps directly to the browser operation with the same name.

## Reconciliation

The same name mapping is used for all three string-attribute transitions:

| VNode change | DOM operation |
| --- | --- |
| Add `className` | `setAttribute("class", value)` |
| Change `className` | `setAttribute("class", newValue)` |
| Remove `className` | `removeAttribute("class")` |

The compatible element itself is reused. Changing its class does not require a
new DOM node because `class` is mutable state owned by that element.

## Alias Collision

This learning renderer still accepts `class` as an ordinary string attribute,
so `class` and `className` are aliases for the same DOM target. A VNode that
supplies both is rejected rather than defining an arbitrary precedence rule:

```ts
h("section", { class: "one", className: "two" }, []); // TypeError on mount
```

This validation makes the declarative input unambiguous before any attribute is
mutated.

## Deliberate Scope

This step only introduces one prop-name mapping. It does not attempt to copy a
framework's complete HTML and SVG property catalog. Style object support is a
separate concern because it requires comparing individual CSS declarations,
including declarations removed by the next VNode.
