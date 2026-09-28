# Component State Identity

The minimal component state mechanism is now exposed as `useState`:

```ts
const Counter: FunctionComponent = () => {
  const [count, setCount] = useState(0);

  return h("button", {}, [`Count: ${count}`]);
};
```

Its state does not belong to the `Counter` function globally. It belongs to a
particular retained `ComponentInstance` at a reconciled tree position.

## Preserving State

Component VNodes are compatible when they contain the same component function
at a position already matched by positional reconciliation:

```text
old: position 0 -> Counter -> instance A, state 1
new: position 0 -> Counter -> reuse instance A, state 1
```

New VNode objects are created on every root render, but
`reuseComponentInstance` transfers the existing instance association to the
new component VNode. Both the state slot and setter therefore survive.

The returned host and Text DOM nodes are also reused when the component's old
and new outputs remain compatible.

## Resetting State

Different component functions are incompatible:

```text
old: position 0 -> FirstCounter  -> instance A, state 1
new: position 0 -> SecondCounter -> new instance B, initial state 10
```

The renderer replaces the old component output and mounts the new component.
Its new instance has no state slot, so the first `useState(10)` call initializes
one with `10`.

The equality of the returned host tags does not preserve component state. In
this example, both components may return a `p`, but the component functions
themselves define different identities.

## Current `useState` Boundary

This project now has the smallest complete component-state path:

```text
useState initial value
    -> instance state slot
    -> stable setter
    -> synchronous root render request
    -> component re-evaluation
    -> DOM reconciliation
```

It intentionally remains much narrower than React's API:

- One state slot is supported per component instance.
- The setter accepts a value, not an updater function.
- Every setter call synchronously rerenders the complete root.
- There is no equality bailout, queue, batching, or render-phase update model.
- State identity is positional because keys are not implemented yet.

With this path visible end to end, later state work can return to the project's
normal learning-unit size.
