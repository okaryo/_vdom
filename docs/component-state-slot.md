# One Component State Slot

In this learning step, the component instance first gained one optional state
slot containing only a value:

```ts
type ComponentInstance = {
  output: VNode | null;
  stateSlot: { value: unknown } | null;
};
```

The initial `readStateValue` helper used the evaluation context from the
previous step to find
that instance:

```ts
function readStateValue<Value>(initialValue: Value): Value {
  const instance = getCurrentComponentInstance();

  if (instance.stateSlot === null) {
    instance.stateSlot = { value: initialValue };
  }

  return instance.stateSlot.value as Value;
}
```

## The Initial Value Is Used Once

On the first evaluation, the slot does not exist, so the supplied initial value
is stored:

```text
first evaluation
readStateValue(0) -> create slot(value = 0) -> return 0
```

On a compatible evaluation, reconciliation reuses the component instance. The
existing slot wins over a newly supplied initial value:

```text
next evaluation, same instance
readStateValue(1) -> existing slot(value = 0) -> return 0
```

This is the first component-owned value. It lives on the retained instance, not
on the disposable `ComponentVNode` and not in `currentComponentInstance`.

## Why The Slot Uses An Object

`null` means that no slot has been created. The stored value itself is inside a
separate object, so `undefined` and `null` can later be valid state values
without being confused with an uninitialized slot.

## Deliberate Limits

At this step, `readStateValue` was introduced only to read the stored value. The
following `component-state-setter.md` lesson adds a setter to the same slot.
Later lessons evolve this helper into the public `useState` API:

- It cannot trigger a rerender.
- There is only one slot per component instance.
- Multiple hook calls and hook ordering are not supported.

Separating the steps keeps storage, mutation, and render scheduling visible as
different mechanisms.
