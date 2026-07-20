# Attribute Reconciliation

Compatible elements keep their DOM identity while their string props are
compared. The `updateElementProps` boundary translates three declarative prop
changes into browser attribute operations:

| Old prop | New prop | DOM operation |
| --- | --- | --- |
| Missing | String | `setAttribute` |
| Different string | String | `setAttribute` |
| String | Missing | `removeAttribute` |
| Same string | Same string | None |

For example:

```ts
const oldProps = {
  id: "before",
  title: "remove me",
};

const newProps = {
  id: "after",
  "data-state": "ready",
};
```

This changes `id`, removes `title`, and adds `data-state` without replacing the
element.

## Prop Names Can Map To Different Attribute Names

The renderer-facing prop name and the browser attribute name do not always have
to be identical. `className` is translated to `class` before calling
`setAttribute` or `removeAttribute`:

```ts
h("section", { className: "ready" }, []);
// <section class="ready"></section>
```

This mapping applies during initial mounting, updating, and removal. Supplying
both `class` and `className` is rejected because both names would target the
same attribute and make the result depend on mutation order.

## Why Both Prop Sets Are Needed

Iterating only over new props can find additions and changed values, but it
cannot find a prop that disappeared. Removal requires checking names that
existed in the old props and are absent from the new props.

The update therefore has two mutation passes after validation:

1. Inspect old string props and remove missing names.
2. Inspect new string props and set new or changed values.

## Event Handlers Remain Separate

Function props are not attributes. Before any string attribute is mutated, the
renderer compares event handlers by function reference in their own update
boundary. A changed old function is passed to `removeEventListener` before the
new function is passed to `addEventListener`. The old reference is essential
because removing a listener requires the same function object that was
originally registered.

## Attributes Are Not General DOM Properties

Most current string props use `setAttribute` and `removeAttribute`, after the
`className`-to-`class` name mapping. The `value` prop on `input` and `textarea`
is an explicit exception: it is assigned as a live JavaScript property. Boolean
`checked` on `input` is another exception. The `style` prop is an object whose
entries are updated through the element's live `CSSStyleDeclaration`.
Attributes describe markup state, while DOM properties can represent changing
runtime state with different value types and behavior.
