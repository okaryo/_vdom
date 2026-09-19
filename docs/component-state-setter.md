# Component State Setter

The single component state slot now retains both a value and its setter:

```ts
type ComponentStateSlot = {
  value: unknown;
  set(nextValue: unknown): void;
};
```

The internal `readState` helper returns them as a pair:

```ts
const [count, setCount] = readState(0);
```

This begins to resemble the public shape of `useState`, but it is still an
internal learning API.

## The Setter Closes Over The Slot

The setter is created with the slot and writes directly to that same object:

```ts
const stateSlot = {
  value: initialValue,
  set(nextValue) {
    stateSlot.value = nextValue;
  },
};
```

It does not need `currentComponentInstance` when it is later called from an
event handler. The closure already remembers the correct slot:

```text
setCount ----closure----> Counter instance's state slot
```

Because the setter is stored in the retained slot, compatible component
evaluations receive the same setter function reference.

## Updating State Is Not Yet Rerendering

Calling the setter changes the stored value only:

```text
setCount(1)
    |
    v
stateSlot.value: 0 -> 1

DOM text: "Count: 0"
```

The DOM still describes the previous component output. If application code
explicitly renders the root again, the component reads `1`, returns a new text
VNode, and reconciliation updates the existing Text node:

```text
explicit render
    -> readState returns 1
    -> reconcile "Count: 0" with "Count: 1"
    -> update Text.data
```

The following `component-state-rerender.md` lesson connects the setter to a
root render request. Keeping that connection separate makes it visible that
storing a value and scheduling UI work are different responsibilities.
