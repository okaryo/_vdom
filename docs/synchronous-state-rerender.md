# Synchronous State Rerendering

A `StateCell` can notify application code after its value changes:

```ts
const rerender = () =>
  render(h(Counter, { count: count.get() }, []), container);

const unsubscribe = count.subscribe(rerender);
```

This connects the boundaries introduced separately in the previous steps:

```text
count.set(1)
     |
     v
store the new value
     |
     v
notify rerender
     |
     v
create a new VNode -> reconcile -> update Text.data
```

Notification is synchronous. When `set` returns, every currently subscribed
listener has run, so this example's DOM already displays the new count. The
existing paragraph and Text nodes are reused because notification ultimately
enters the same `render` and reconciliation path as an explicit render.

## Notification Is Not DOM Mutation

`StateCell` does not import the renderer or know which container should update.
It only invokes functions supplied by application code. The application
chooses to subscribe `rerender`, and that function knows how to read the state,
create the root VNode, and select the container.

`subscribe` returns an `unsubscribe` function. Removing the listener severs the
notification connection without changing the cell's current value.

## Deliberate Limits

Every `set` call notifies immediately, including when the next value is equal
to the current value. Multiple calls are not batched. A listener can also call
`set` again and cause a nested notification. Equality bailouts, update queues,
batching, and reentrancy rules remain later decisions.

The cell is still outside the component. The application must construct and
subscribe a root-level `rerender` function manually. Component-owned state
will require a retained component identity so the library can determine which
rendered work belongs to an update.
