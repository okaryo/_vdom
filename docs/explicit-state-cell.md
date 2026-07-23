# Explicit State Cell

`createState` introduces the smallest state abstraction in this project:

```ts
const count = createState(0);

count.get(); // 0
count.set(1);
count.get(); // 1
```

The returned `StateCell` owns one current value. Its two operations deliberately
have narrow responsibilities:

- `get` reads the current value.
- `set` replaces the current value.

There is no DOM knowledge, component knowledge, notification, update queue, or
batching in the state cell.

## State Change Is Not A Render

If a component output was rendered from `count.get()`, calling `count.set(1)`
does not change the existing VNode or DOM:

```text
count.set(1)
     |
     v
StateCell: 0 -> 1       retained DOM: "Count: 0"
```

The DOM changes only after application code reads the new value, constructs a
new VNode, and passes it to `render`:

```text
count.get() -> h(Counter, { count: 1 }, []) -> render -> reconciliation
```

Reconciliation can still reuse the paragraph and Text DOM nodes. The missing
piece is not DOM patching; it is scheduling `render` when `set` is called.

## Why Keep This Step Separate?

A JavaScript value and a visible UI are different kinds of state. Joining them
immediately would hide the notification boundary that a UI state mechanism
must provide.

This cell is still application-owned rather than component-owned. It therefore
does not yet answer which component owns a state value, how that value survives
a rerender, or what happens when a component is removed. Those questions need
component identity in a later learning unit.
