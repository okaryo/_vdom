# The `style` Prop

The renderer accepts an object for `style` rather than an HTML style string:

```ts
const vnode = h(
  "section",
  {
    style: {
      color: "red",
      backgroundColor: "black",
    },
  },
  [],
);
```

Style names use the camelCase form familiar from DOM properties. Before calling
`CSSStyleDeclaration.setProperty`, the renderer maps `backgroundColor` to
`background-color`. CSS custom property names beginning with `--` are left
unchanged.

## Initial Mount

Mounting treats each style entry as live element state:

```ts
element.style.setProperty("color", "red");
element.style.setProperty("background-color", "black");
```

Although the browser may reflect these changes in the serialized `style`
attribute, the renderer uses the CSS Object Model rather than constructing one
attribute string.

## Reconciliation

Both the old and new style objects are required. The renderer uses two passes:

1. Remove old names that are missing from the new object.
2. Set names that are new or whose string value changed.

For example:

```ts
const oldStyle = {
  color: "red",
  backgroundColor: "black",
};

const newStyle = {
  color: "blue",
  borderColor: "white",
};
```

This removes `background-color`, changes `color`, and adds `border-color`.
Omitting the entire new `style` prop is treated like an empty object, so all
previously managed declarations are removed.

The DOM element itself remains compatible and retains its identity. Styles are
mutable state belonging to that existing element.

## Deliberate Limits

Style values are strings in this learning unit. Numeric values and framework
conveniences such as automatically appending `px` are not supported. The
renderer also supports styles only on HTML elements and does not yet attempt to
cover every browser-specific CSS naming edge case.
