# State-Driven Rerendering

The first state-driven example keeps state in application code rather than in
the UI library:

```ts
let count = 0;

const increment = () => {
  count += 1;
  rerender();
};

const rerender = () =>
  render(h(Counter, { count, onIncrement: increment }, []), container);
```

There are two different kinds of retained state here:

```text
application code                     renderer
count = 0, 1, 2, ...                 previous VNode and root DOM node
        |                                      |
        +---------- rerender() ----------------+
                           |
                           v
                    reconciliation
```

The application owns the current `count`. The renderer's `WeakMap` does not
store that value; it only remembers enough about the previous render to compare
the next VNode with it.

## One Synchronous Update

Clicking the button performs the complete update before the event handler
returns:

1. The handler changes `count`.
2. The handler calls `rerender` explicitly.
3. `Counter` is evaluated eagerly with the new prop.
4. `render` compares the new output with the retained old output.
5. The compatible button and Text DOM nodes are reused, while `Text.data`
   changes.

The component describes the UI for a supplied value, but it does not own that
value and cannot request a render by itself. There is no component instance,
state slot, update queue, or batching yet.

## The Next Boundary

This example exposes what an internal state mechanism will need to connect:

```text
state update -> find the owning rendered component -> produce new output
             -> reconcile it with the old output
```

The current eager component expansion loses the component boundary before
`render` receives the VNode. That is sufficient while application code calls
the root `render` function explicitly, but component-owned state will require
the library to retain more information about where the component belongs.
