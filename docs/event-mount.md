# Initial Event Listener Mounting

An element Virtual Node can carry a function prop using an `on<Event>` name:

```ts
const vnode = h("button", { onClick: handleClick }, ["Save"]);
```

During mounting, the renderer distinguishes the prop by its value type:

- A string value is applied with `setAttribute`.
- A function value is attached with `addEventListener`.

The event type is derived by removing `on` and lowercasing the remainder, so
`onClick` becomes `click`. A function prop without a non-empty `on` prefix is
rejected because silently treating it as either an attribute or an arbitrary
event would hide a malformed renderer input.

## Why This Is Separate From Attributes

An HTML attribute is serialized data on an element. An event listener is a
function registered with the browser's event system. Passing a function to
`setAttribute` would stringify it rather than subscribe it to an event.

The listener remains stored in the Virtual Node props as well as in the
browser's event-target listener list. Once reconciliation retains old and new
trees, the old function reference can be used with `removeEventListener` before
a changed handler is attached. Initial mounting has no old handler, so this
learning unit only performs attachment.

## Current Simplifications

The renderer does not support listener options, event-handler objects, multiple
handlers for one prop, or custom event names whose casing must be preserved.
Listener replacement and removal are intentionally deferred until update-time
prop comparison exists.
