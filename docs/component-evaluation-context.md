# Component Evaluation Context

Before component-owned state can be implemented, `useState` needs a way to
answer one smaller question:

> Which component instance is currently being evaluated?

The renderer now answers only that question. It wraps a component call with
`evaluateComponent`:

```ts
const previousInstance = currentComponentInstance;
currentComponentInstance = instance;

try {
  return vnode.component(vnode.props);
} finally {
  currentComponentInstance = previousInstance;
}
```

While the component function is running,
`getCurrentComponentInstance()` returns that instance. Before and after the
call, there is no current instance and the accessor throws.

## A Temporary Cursor, Not Component State

`currentComponentInstance` is a module-level variable, but it does not store a
component's state. It is only a temporary pointer used during synchronous
evaluation:

```text
evaluate component A: current -> instance A
finish component A:   current -> null
evaluate component B: current -> instance B
finish component B:   current -> null
```

The renderer evaluates one component function at a time. `finally` restores
the previous pointer even if evaluation throws.

## Why The Output Is Initially Null

The instance must exist before the component function runs, because that is
when future hooks will need to find it. Its output cannot exist until after the
function returns:

```text
create instance with output = null
        |
        v
evaluate component with that instance as current
        |
        v
store the returned VNode as instance.output
```

Reconciliation still retains the same instance when the component function and
tree position remain compatible.

This step deliberately introduced no state slot, setter, or automatic
rerender. The following `component-state-slot.md` lesson adds one stored value
using this evaluation context, while still leaving setters and rerendering for
later steps.
