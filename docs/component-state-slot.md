# One Component State Slot

The component instance now owns one optional state slot:

```ts
type ComponentInstance = {
  output: VNode | null;
  stateSlot: { value: unknown } | null;
};
```

`readStateValue` uses the evaluation context from the previous step to find
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

`readStateValue` is an internal learning helper, not the final public API. It
only reads the stored value:

- There is no setter.
- It cannot trigger a rerender.
- There is only one slot per component instance.
- Multiple hook calls and hook ordering are not supported.

The next step can add a setter to this same slot without also introducing
storage and evaluation context at once.
