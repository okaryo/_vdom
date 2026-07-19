# Checked DOM Property

The `checked` prop on `input` is the first boolean renderer input:

```ts
const vnode = h("input", { checked: true }, []);
```

It is assigned to the live DOM property rather than serialized as an HTML
attribute:

```ts
expect(input.checked).toBe(true);
expect(input.hasAttribute("checked")).toBe(false);
```

## Controlled Boolean State

User interaction can change the real checkbox state without changing the
retained VNode. Re-rendering the same declarative boolean therefore compares
against `input.checked` and restores it when necessary.

```text
retained VNode checked: true
real input.checked:     false
next VNode checked:     true
                         ↓
real input.checked:     true
```

When a previous VNode had `checked` and the next VNode omits it, this renderer
resets the property to `false`. If neither VNode controls it, the browser's live
state is left alone.

## Why Boolean Props Need Explicit Rules

HTML boolean attributes use presence semantics: `checked="false"` still means
the attribute is present. The live `input.checked` property instead accepts the
actual booleans `true` and `false`.

The renderer therefore does not generically stringify boolean props. A boolean
is accepted only when a specific element/property rule explains how to apply
it. At this stage that rule exists only for `checked` on `input`; a boolean such
as `hidden: true` is rejected rather than silently given uncertain semantics.

## Current Scope

This step does not yet support `disabled`, `selected`, `multiple`, indeterminate
checkbox state, or framework warnings for controlled/uncontrolled transitions.
