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

## Why Both Prop Sets Are Needed

Iterating only over new props can find additions and changed values, but it
cannot find a prop that disappeared. Removal requires checking names that
existed in the old props and are absent from the new props.

The update therefore has two mutation passes after validation:

1. Inspect old string props and remove missing names.
2. Inspect new string props and set new or changed values.

## Event Handlers Remain Separate

Function props are not attributes. Before any string attribute is mutated, the
update validates that every event handler still exists under the same name with
the same function reference. Adding, replacing, or removing a handler remains
an error until listener reconciliation can deliberately call
`removeEventListener` and `addEventListener`.

## Attributes Are Not General DOM Properties

This step intentionally uses `setAttribute` and `removeAttribute`. It does not
yet assign JavaScript properties such as an input element's live `value`.
Attributes describe markup state, while DOM properties can represent changing
runtime state with different value types and behavior.
