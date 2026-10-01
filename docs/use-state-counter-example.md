# `useState` Counter Example

The first complete component-state example is intentionally small:

```ts
export const Counter: FunctionComponent = () => {
  const [count, setCount] = useState(0);

  return h(
    "button",
    { onClick: () => setCount(count + 1) },
    [`Count: ${count}`],
  );
};
```

It uses only the public API. `Counter` does not receive a count prop, keep a
module-level variable, or explicitly call `render` when the value changes. The
component instance owns the state and its setter knows how to request work from
the owning root.

## One Click Through The Whole System

After the first evaluation, the click handler closes over `count === 0`:

```text
click
  -> old handler calculates 0 + 1
  -> setCount(1)
  -> store 1 in the component instance
  -> synchronously render the retained root
  -> evaluate Counter again
  -> useState returns 1
  -> reconcile "Count: 0" with "Count: 1"
  -> update the existing Text node
```

The new evaluation creates a new click handler that closes over
`count === 1`. Event-prop reconciliation removes the old handler and installs
the new one on the same button. The next click can therefore calculate `1 + 1`.

## What Is Reused?

The example test checks both visible output and identity:

- The retained `Counter` instance is reused because its component function and
  tree position remain compatible.
- The `HTMLButtonElement` is reused because both outputs have the `button` tag.
- The Text node is reused because both children are text VNodes.
- Only the listener and the Text node's `data` value change.

This example joins the boundaries developed in earlier lessons without adding
new renderer behavior: VNode creation, component identity, state retention,
event replacement, synchronous root rendering, and DOM reconciliation all
participate in one click.
