# Controlled Value Property

The `value` prop on `input` and `textarea` is the first renderer input mapped to
a live DOM property rather than an HTML attribute:

```ts
const vnode = h("input", { value: "initial" }, []);
```

Mounting produces an input whose JavaScript value is set without serializing a
`value` attribute:

```ts
expect(input.value).toBe("initial");
expect(input.hasAttribute("value")).toBe(false);
```

## Live State Can Diverge

A user edit changes the browser's current property value without changing the
old VNode retained by the renderer:

```ts
input.value = "user edit";
```

At that point the states differ:

```text
retained VNode value: "updated"
real input.value:     "user edit"
```

Rendering another VNode with `value: "updated"` must restore the DOM property
even though the old and new VNode values are equal. The update therefore
compares the declarative value with `element.value`, not only with the old prop.

```ts
if (element.value !== newValue) {
  element.value = newValue;
}
```

This is the basic controlled-input relationship: the rendered value is the
source of truth, and browser state is brought back into agreement during
rendering.

## Removing The Prop

When an element previously had a controlled `value` prop and the next VNode
omits it, this learning renderer clears the property to an empty string. If
neither VNode has the prop, the renderer leaves the live value alone.

## Current Scope

Only string `value` on `input` and `textarea` is covered by this rule. Select
elements, `selected`, numeric values, cursor selection behavior, and framework
warnings for controlled/uncontrolled transitions remain outside this step.
Boolean `checked` is now handled separately for `input` elements.
